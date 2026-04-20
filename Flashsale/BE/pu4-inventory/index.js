/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  PU4 — Inventory Processing Unit  :8084             ║
 * ║                                                      ║
 * ║  - Local Cache: stock per product 5s               ║
 * ║  - Data Grid:   Redis key "stock:{productId}"       ║
 * ║  - Messaging:   subscribe "order.created"           ║
 * ║                 → log stock changes                 ║
 * ║  - Locking:     SETNX để tránh oversell            ║
 * ╚══════════════════════════════════════════════════════╝
 */

const express    = require('express');
const cors       = require('cors');
const redis      = require('../shared/redis');
const LocalCache = require('../shared/localCache');
const { subscribe, publish } = require('../shared/messagingGrid');
const inventoryQueue = require('../shared/inventoryQueue');

const app   = express();
const PORT  = process.env.PU4_PORT || 8084;
const cache = new LocalCache(5000); // 5s TTL — stock cần fresh

app.use(cors());
app.use(express.json());

// ── Messaging Grid: lắng nghe order.created để log ───────────────────────────
subscribe('order.created', ({ orderId, items }) => {
  console.log(`[PU4] 📦 Order ${orderId} — stock consumed:`);
  items.forEach(i => console.log(`       ${i.productId}: -${i.quantity}`));
});

// ── GET /stock/:productId ─────────────────────────────────────────────────────
app.get('/stock/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    // Local cache
    const cached = cache.get(`stock:${productId}`);
    if (cached !== null) {
      return res.json({ productId, stock: cached, source: 'local-cache' });
    }

    // Data Grid
    const val = await redis.get(`stock:${productId}`);
    if (val === null) return res.status(404).json({ error: 'Product not found' });

    const stock = parseInt(val);
    cache.set(`stock:${productId}`, stock);
    res.json({ productId, stock, source: 'data-grid' });
  } catch (err) {
    console.error('[PU4] GET /stock error:', err.message);
    res.status(500).json({ error: 'Failed to get stock' });
  }
});

// ── GET /stock — tất cả stock ─────────────────────────────────────────────────
app.get('/stock', async (_req, res) => {
  try {
    const products = await redis.hgetall('products');
    if (!products) return res.json([]);
    const ids    = Object.keys(products);
    const pipeline = redis.pipeline();
    ids.forEach(id => pipeline.get(`stock:${id}`));
    const results = await pipeline.exec();
    res.json(ids.map((id, i) => ({
      productId: id,
      stock: results[i][1] !== null ? parseInt(results[i][1]) : 0,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to get all stocks' });
  }
});

// ── POST /stock/decrease — giảm stock với SETNX lock ─────────────────────────
app.post('/stock/decrease', async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required' });

  const lockKey = `lock:stock:${productId}`;
  try {
    // SETNX lock — tránh race condition
    const locked = await redis.set(lockKey, '1', 'NX', 'EX', 5);
    if (!locked) {
      return res.status(429).json({ error: 'Stock update in progress, retry shortly' });
    }

    try {
      const current = parseInt(await redis.get(`stock:${productId}`) || '0');
      if (current < quantity) {
        return res.status(409).json({ error: 'Insufficient stock', available: current });
      }
      const newStock = await redis.decrby(`stock:${productId}`, quantity);
      cache.del(`stock:${productId}`);

      // Publish stock.updated → PU1 invalidate cache
      await publish('stock.updated', { productId, newStock, decreased: quantity });

      // Push stock update to MQ for persistence
      inventoryQueue.enqueue({ productId, newStock, timestamp: new Date().toISOString() });

      console.log(`[PU4] Stock ${productId}: ${newStock}`);
      res.json({ productId, stock: newStock, decreased: quantity });
    } finally {
      await redis.del(lockKey);
    }
  } catch (err) {
    console.error('[PU4] POST /stock/decrease error:', err.message);
    res.status(500).json({ error: 'Failed to decrease stock' });
  }
});

// ── POST /stock/increase — restock ───────────────────────────────────────────
app.post('/stock/increase', async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required' });
  try {
    const newStock = await redis.incrby(`stock:${productId}`, quantity);
    cache.del(`stock:${productId}`);
    await publish('stock.updated', { productId, newStock, increased: quantity });
    // Push stock update to MQ for persistence
    inventoryQueue.enqueue({ productId, newStock, timestamp: new Date().toISOString() });
    res.json({ productId, stock: newStock, increased: quantity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increase stock' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [PU4 - Inventory Processing Unit] port ${PORT}`);
  console.log(`   Local Cache TTL: 5s`);
  console.log(`   Subscribed: order.created`);
});
