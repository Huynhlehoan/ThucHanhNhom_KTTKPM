/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  PU2 — Cart Processing Unit  :8082                  ║
 * ║                                                      ║
 * ║  - Local Cache: cache cart per user 60s             ║
 * ║  - Data Grid:   Redis Hash "cart:{userId}"          ║
 * ║  - Validate stock trước khi add (từ Data Grid)      ║
 * ╚══════════════════════════════════════════════════════╝
 */

const express    = require('express');
const cors       = require('cors');
const redis      = require('../shared/redis');
const LocalCache = require('../shared/localCache');
const cartQueue  = require('../shared/cartQueue');

const app   = express();
const PORT  = process.env.PU2_PORT || 8082;
const cache = new LocalCache(60000); // 60s TTL

app.use(cors());
app.use(express.json());

// ── Helper: lấy cart từ Data Grid ────────────────────────────────────────────
const fetchCartFromGrid = async (userId) => {
  const raw = await redis.hgetall(`cart:${userId}`);
  if (!raw) return [];
  return Object.values(raw).map(v => JSON.parse(v));
};

// ── GET /cart?userId=xxx ──────────────────────────────────────────────────────
app.get('/cart', async (req, res) => {
  const userId = req.query.userId || 'guest';
  try {
    // Local cache
    const cached = cache.get(`cart:${userId}`);
    if (cached) {
      console.log(`[PU2] Cache HIT → cart:${userId}`);
      return res.json({ userId, items: cached });
    }

    // Data Grid
    const items = await fetchCartFromGrid(userId);
    cache.set(`cart:${userId}`, items);
    res.json({ userId, items });
  } catch (err) {
    console.error('[PU2] GET /cart error:', err.message);
    res.status(500).json({ error: 'Failed to get cart' });
  }
});

// ── POST /cart/add ────────────────────────────────────────────────────────────
app.post('/cart/add', async (req, res) => {
  const { userId = 'guest', productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required' });

  try {
    // Lấy product từ Data Grid
    const rawProduct = await redis.hget('products', productId);
    if (!rawProduct) return res.status(404).json({ error: 'Product not found' });
    const product = JSON.parse(rawProduct);

    // Kiểm tra stock real-time từ Data Grid
    const stockRaw = await redis.get(`stock:${productId}`);
    const stock    = stockRaw !== null ? parseInt(stockRaw) : 0;
    if (stock <= 0) return res.status(400).json({ error: 'Product out of stock' });

    // Tính quantity mới
    const existingRaw = await redis.hget(`cart:${userId}`, productId);
    const existing    = existingRaw ? JSON.parse(existingRaw) : null;
    const newQty      = (existing ? existing.quantity : 0) + quantity;

    if (newQty > stock) {
      return res.status(400).json({ error: `Only ${stock} items available` });
    }

    const cartItem = {
      id: product.id, productId: product.id,
      name: product.name, image: product.image,
      price: product.price, flashPrice: product.flashPrice,
      originalPrice: product.originalPrice,
      quantity: newQty, stock,
    };

    // Lưu vào Data Grid (TTL 24h)
    await redis.hset(`cart:${userId}`, productId, JSON.stringify(cartItem));
    await redis.expire(`cart:${userId}`, 86400);

    // Push to MQ for background processing/persistence
    const currentCart = await fetchCartFromGrid(userId);
    cartQueue.enqueue({ userId, items: currentCart, timestamp: new Date().toISOString() });

    // Invalidate local cache
    cache.del(`cart:${userId}`);

    const items = await fetchCartFromGrid(userId);
    cache.set(`cart:${userId}`, items);
    res.json({ userId, items });
  } catch (err) {
    console.error('[PU2] POST /cart/add error:', err.message);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// ── DELETE /cart/clear ────────────────────────────────────────────────────────
// Phải đặt TRƯỚC /:productId để không bị match nhầm
app.delete('/cart/clear', async (req, res) => {
  const userId = req.body?.userId || req.query.userId || 'guest';
  try {
    await redis.del(`cart:${userId}`);
    cache.del(`cart:${userId}`);
    
    // Push to MQ
    cartQueue.enqueue({ userId, items: [], action: 'clear', timestamp: new Date().toISOString() });

    res.json({ userId, items: [] });
  } catch (err) {
    console.error('[PU2] DELETE /cart/clear error:', err.message);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// ── DELETE /cart/:productId ───────────────────────────────────────────────────
app.delete('/cart/:productId', async (req, res) => {
  const userId    = req.body?.userId || req.query.userId || 'guest';
  const { productId } = req.params;
  try {
    await redis.hdel(`cart:${userId}`, productId);
    cache.del(`cart:${userId}`);
    const items = await fetchCartFromGrid(userId);
    cache.set(`cart:${userId}`, items);
    res.json({ userId, items });
  } catch (err) {
    console.error('[PU2] DELETE /cart/:productId error:', err.message);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [PU2 - Cart Processing Unit] port ${PORT}`);
  console.log(`   Local Cache TTL: 60s`);
});
