/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  PU3 — Order Processing Unit  :8083                 ║
 * ║                                                      ║
 * ║  Luồng checkout (Space-Based):                      ║
 * ║  1. Lấy cart từ Data Grid                           ║
 * ║  2. Kiểm tra + giảm stock trên Data Grid (atomic)   ║
 * ║  3. Tạo order → lưu Data Grid                      ║
 * ║  4. Publish "order.created" → Messaging Grid        ║
 * ║  5. Xoá cart khỏi Data Grid                        ║
 * ║  6. Trả kết quả NGAY — không chờ DB                ║
 * ║  7. Data Writer ghi DB async (fire & forget)        ║
 * ╚══════════════════════════════════════════════════════╝
 */

const express    = require('express');
const cors       = require('cors');
const { v4: uuidv4 } = require('uuid');
const redis      = require('../shared/redis');
const { publish }   = require('../shared/messagingGrid');
const { asyncWrite } = require('../shared/dataWriter');

const app  = express();
const PORT = process.env.PU3_PORT || 8083;

app.use(cors());
app.use(express.json());

// ── POST /checkout ────────────────────────────────────────────────────────────
app.post('/checkout', async (req, res) => {
  const { userId = 'guest', customer, shipping, paymentMethod, items: bodyItems } = req.body;

  if (!customer?.name || !customer?.email) {
    return res.status(400).json({ error: 'customer name and email are required' });
  }
  if (!shipping?.address || !shipping?.city) {
    return res.status(400).json({ error: 'shipping address and city are required' });
  }

  try {
    // ── Step 1: Lấy cart từ Data Grid ────────────────────────────────────────
    const cartRaw   = await redis.hgetall(`cart:${userId}`);
    const cartItems = cartRaw && Object.keys(cartRaw).length > 0
      ? Object.values(cartRaw).map(v => JSON.parse(v))
      : (bodyItems || []);

    if (!cartItems.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // ── Step 2: Kiểm tra stock + giảm atomic trên Data Grid ──────────────────
    // Dùng Redis pipeline để đảm bảo atomic
    const stockChecks = await Promise.all(
      cartItems.map(async item => {
        const pid   = item.productId || item.id;
        const stock = parseInt(await redis.get(`stock:${pid}`) || '0');
        return { pid, qty: item.quantity, stock, name: item.name };
      })
    );

    const insufficient = stockChecks.filter(s => s.stock < s.qty);
    if (insufficient.length > 0) {
      return res.status(409).json({
        error: 'Insufficient stock',
        details: insufficient.map(s => `${s.name}: only ${s.stock} left`)
      });
    }

    // Giảm stock atomic bằng pipeline
    const stockPipeline = redis.pipeline();
    stockChecks.forEach(({ pid, qty }) => stockPipeline.decrby(`stock:${pid}`, qty));
    await stockPipeline.exec();

    // ── Step 3: Tạo order + lưu vào Data Grid ────────────────────────────────
    const orderId  = `ORD-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;
    const subtotal = cartItems.reduce((s, i) => s + ((i.flashPrice || i.price) * i.quantity), 0);
    const shippingFee = subtotal >= 50 ? 0 : 9.99;
    const total    = parseFloat((subtotal + shippingFee).toFixed(2));

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 14);

    const order = {
      orderId, userId, customer, shipping,
      paymentMethod: paymentMethod || 'credit-card',
      items: cartItems.map(i => ({
        productId: i.productId || i.id,
        name: i.name, quantity: i.quantity,
        price: i.flashPrice || i.price,
      })),
      subtotal: parseFloat(subtotal.toFixed(2)),
      shippingFee, total,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
    };

    // Lưu order vào Data Grid (TTL 7 ngày)
    await redis.set(`order:${orderId}`, JSON.stringify(order), 'EX', 604800);
    await redis.lpush(`orders:${userId}`, orderId);

    // ── Step 4: Publish event → Messaging Grid ────────────────────────────────
    await publish('order.created', {
      orderId, userId,
      items: order.items,
      total,
    });

    // Publish stock.updated cho từng sản phẩm → PU1 invalidate cache
    for (const { pid } of stockChecks) {
      await publish('stock.updated', { productId: pid });
    }

    // ── Step 5: Xoá cart khỏi Data Grid ──────────────────────────────────────
    await redis.del(`cart:${userId}`);

    // ── Step 6: Trả kết quả NGAY ─────────────────────────────────────────────
    console.log(`[PU3] ✅ Order ${orderId} confirmed for user ${userId}`);
    res.json({ orderId, estimatedDelivery: order.estimatedDelivery, total, status: 'confirmed' });

    // ── Step 7: Data Writer ghi DB async (không block response) ──────────────
    asyncWrite('orders', order);

  } catch (err) {
    console.error('[PU3] POST /checkout error:', err.message);
    res.status(500).json({ error: 'Order processing failed' });
  }
});

// ── GET /orders/:userId ───────────────────────────────────────────────────────
app.get('/orders/:userId', async (req, res) => {
  try {
    const orderIds = await redis.lrange(`orders:${req.params.userId}`, 0, -1);
    const orders   = await Promise.all(
      orderIds.map(async id => {
        const raw = await redis.get(`order:${id}`);
        return raw ? JSON.parse(raw) : null;
      })
    );
    res.json(orders.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [PU3 - Order Processing Unit] port ${PORT}`);
  console.log(`   Publishes: order.created, stock.updated`);
});
