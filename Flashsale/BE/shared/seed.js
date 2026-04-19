/**
 * Data Grid Seed
 * Nạp sản phẩm + stock vào Redis (Data Grid) và db/ (Data Writer backup)
 */
const Redis = require('ioredis');
const fs    = require('fs');
const path  = require('path');

const redis = new Redis({ host: process.env.REDIS_HOST || '127.0.0.1', port: 6379 });

const products = [
  {
    id: 'p1', name: 'ProVision X1 Smartwatch',
    price: 299.99, flashPrice: 199.99, originalPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
    description: 'Advanced smartwatch with health tracking, built-in GPS, and AMOLED display.',
    category: 'Wearables', rating: 4.8, reviews: 245, discount: 33, stock: 45,
    features: ['Heart rate monitor', 'Built-in GPS', 'Water resistant 50m', '7-day battery life'],
    saleEndTime: new Date(Date.now() + 86400000).toISOString()
  },
  {
    id: 'p2', name: 'SonicNoise Cancelling Headphones',
    price: 349.99, flashPrice: 249.99, originalPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
    description: 'Industry-leading ANC, 30-hour battery, exceptional sound quality.',
    category: 'Audio', rating: 4.9, reviews: 892, discount: 28, stock: 120,
    features: ['Active Noise Cancellation', '30-hour battery', 'Touch controls', 'Voice assistant'],
    saleEndTime: new Date(Date.now() + 172800000).toISOString()
  },
  {
    id: 'p3', name: 'AeroBook Pro 14"',
    price: 1299.99, flashPrice: 1099.99, originalPrice: 1299.99,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    description: 'Ultra-thin laptop with next-gen processor and Retina display.',
    category: 'Computers', rating: 4.7, reviews: 156, discount: 15, stock: 15,
    features: ['16GB Unified Memory', '512GB SSD', 'Retina Display', 'Backlit Keyboard'],
    saleEndTime: new Date(Date.now() + 43200000).toISOString()
  },
  {
    id: 'p4', name: 'NexusPhone 12 5G',
    price: 899.99, flashPrice: 749.99, originalPrice: 899.99,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800',
    description: 'Lightning-fast 5G, triple-lens camera, toughest glass ever.',
    category: 'Mobile', rating: 4.8, reviews: 1204, discount: 16, stock: 85,
    features: ['6.1" OLED Display', 'A15 Bionic Chip', 'Triple 12MP Cameras', 'Face Unlock'],
    saleEndTime: new Date(Date.now() + 259200000).toISOString()
  },
  {
    id: 'p5', name: 'AirPods True Wireless',
    price: 159.99, flashPrice: 119.99, originalPrice: 159.99,
    image: 'https://images.unsplash.com/photo-1572569533902-4c28ad0234c2?auto=format&fit=crop&q=80&w=800',
    description: 'Seamless pairing, rich audio, wireless charging case.',
    category: 'Audio', rating: 4.6, reviews: 3450, discount: 25, stock: 200,
    features: ['Spatial Audio', 'Water Resistant', '24h Total Battery', 'Quick Charge'],
    saleEndTime: new Date(Date.now() + 90000000).toISOString()
  },
  {
    id: 'p6', name: 'UltraView 32" 4K Monitor',
    price: 499.99, flashPrice: 399.99, originalPrice: 499.99,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
    description: '32-inch 4K UHD, HDR10, exceptional color accuracy.',
    category: 'Displays', rating: 4.7, reviews: 89, discount: 20, stock: 30,
    features: ['4K UHD Resolution', 'HDR10 Support', 'IPS Panel', 'USB-C Connectivity'],
    saleEndTime: new Date(Date.now() + 300000000).toISOString()
  },
  {
    id: 'p7', name: 'MechPro Wireless Keyboard',
    price: 129.99, flashPrice: 89.99, originalPrice: 129.99,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
    description: 'Tactile mechanical switches, RGB, low-latency wireless.',
    category: 'Accessories', rating: 4.9, reviews: 412, discount: 31, stock: 65,
    features: ['Brown Tactile Switches', 'RGB Backlight', 'Bluetooth 5.0', 'Hot-swappable'],
    saleEndTime: new Date(Date.now() + 150000000).toISOString()
  },
  {
    id: 'p8', name: 'ErgoMaster Wireless Mouse',
    price: 79.99, flashPrice: 59.99, originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800',
    description: 'Ergonomic design, hyper-fast scrolling, precise tracking.',
    category: 'Accessories', rating: 4.8, reviews: 533, discount: 25, stock: 110,
    features: ['Ergonomic Design', '4000 DPI Sensor', 'Multi-device Sync', '70-day Battery'],
    saleEndTime: new Date(Date.now() + 120000000).toISOString()
  }
];

async function seed() {
  console.log('🌱 [Seed] Loading data into Data Grid (Redis)...');

  // Xoá data cũ
  await redis.del('products');
  const oldStockKeys = await redis.keys('stock:*');
  if (oldStockKeys.length) await redis.del(...oldStockKeys);

  const pipeline = redis.pipeline();
  for (const p of products) {
    pipeline.hset('products', p.id, JSON.stringify(p));
    pipeline.set(`stock:${p.id}`, p.stock);
  }
  await pipeline.exec();

  // Backup vào db/ (Data Writer)
  const dbDir = path.join(__dirname, '../db');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  fs.writeFileSync(path.join(dbDir, 'products.json'), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(dbDir, 'orders.json'), JSON.stringify([], null, 2));

  console.log(`✅ [Seed] ${products.length} products → Data Grid`);
  console.log(`✅ [Seed] db/products.json, db/orders.json created`);
  redis.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
