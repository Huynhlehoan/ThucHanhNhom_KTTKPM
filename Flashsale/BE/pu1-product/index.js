/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  PU1 — Product Processing Unit  :8081               ║
 * ║                                                      ║
 * ║  - Local Cache: cache product list 30s              ║
 * ║  - Data Grid:   Redis Hash "products"               ║
 * ║  - Messaging:   subscribe "stock.updated"           ║
 * ║                 → invalidate local cache            ║
 * ║  - Data Reader: fallback db/products.json           ║
 * ╚══════════════════════════════════════════════════════╝
 */

const express    = require('express');
const cors       = require('cors');
const redis      = require('../shared/redis');
const LocalCache = require('../shared/localCache');
const { subscribe } = require('../shared/messagingGrid');
const productQueue = require('../shared/productQueue');

const app   = express();
const PORT  = process.env.PU1_PORT || 8081;
const cache = new LocalCache(30000); // 30s TTL

app.use(cors());
app.use(express.json());

// ── Messaging Grid: khi stock thay đổi → xoá cache để lấy stock mới ──────────
subscribe('stock.updated', ({ productId }) => {
  cache.del(`product:${productId}`);
  cache.del('products:all');
  console.log(`[PU1] Cache invalidated for product ${productId}`);
});

// ── GET /products ─────────────────────────────────────────────────────────────
app.get('/products', async (_req, res) => {
  try {
    // 1. Check local cache trước
    const cached = cache.get('products:all');
    if (cached) {
      console.log('[PU1] Cache HIT → products:all');
      return res.json(cached);
    }

    // 2. Lấy từ Data Grid (Redis)
    const raw = await redis.hgetall('products');
    let products;

    if (raw && Object.keys(raw).length > 0) {
      products = Object.values(raw).map(v => JSON.parse(v));
      // Gắn stock real-time từ Data Grid
      const stockPipeline = redis.pipeline();
      products.forEach(p => stockPipeline.get(`stock:${p.id}`));
      const stocks = await stockPipeline.exec();
      products.forEach((p, i) => {
        const s = stocks[i][1];
        p.stock = s !== null ? parseInt(s) : p.stock;
      });
      console.log('[PU1] Data Grid HIT → products');
    } else {
      // 3. Fallback: Data Grid is empty
      products = [];
      console.log('[PU1] Data Grid EMPTY');
    }

    // Lưu vào local cache
    cache.set('products:all', products);
    res.json(products);
  } catch (err) {
    console.error('[PU1] GET /products error:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ── GET /products/:id ─────────────────────────────────────────────────────────
app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Local cache
    const cached = cache.get(`product:${id}`);
    if (cached) {
      console.log(`[PU1] Cache HIT → product:${id}`);
      return res.json(cached);
    }

    // 2. Data Grid
    const raw = await redis.hget('products', id);
    if (!raw) return res.status(404).json({ error: 'Product not found' });

    const product = JSON.parse(raw);
    // Stock real-time từ Data Grid
    const stock = await redis.get(`stock:${id}`);
    product.stock = stock !== null ? parseInt(stock) : product.stock;

    cache.set(`product:${id}`, product, 15000); // 15s TTL cho detail
    res.json(product);
  } catch (err) {
    console.error('[PU1] GET /products/:id error:', err.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ── POST /products ───────────────────────────────────────────────────────────
app.post('/products', async (req, res) => {
  const product = req.body;
  if (!product.id || !product.name) {
    return res.status(400).json({ error: 'id and name are required' });
  }

  try {
    // 1. Lưu vào Data Grid (Redis)
    await redis.hset('products', product.id, JSON.stringify(product));
    await redis.set(`stock:${product.id}`, product.stock || 0);

    // 2. Push to MQ for async persistence
    await productQueue.enqueue(product);

    // 3. Invalidate local cache
    cache.del('products:all');
    cache.del(`product:${product.id}`);

    console.log(`[PU1] ✅ Product ${product.id} created & enqueued`);
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error('[PU1] POST /products error:', err.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [PU1 - Product Processing Unit] port ${PORT}`);
  console.log(`   Local Cache TTL: 30s`);
  console.log(`   Subscribed: stock.updated`);
});
