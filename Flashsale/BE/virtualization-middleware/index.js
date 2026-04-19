/**
 * ╔══════════════════════════════════════════════════════╗
 * ║     VIRTUALIZATION MIDDLEWARE — Port 8080            ║
 * ║                                                      ║
 * ║  Thành phần trung tâm của Space-Based Architecture   ║
 * ║  - Single entry point cho Frontend (port 3000)       ║
 * ║  - Route request đến đúng Processing Unit            ║
 * ║  - Health check                                      ║
 * ║  - Request logging                                   ║
 * ╚══════════════════════════════════════════════════════╝
 */

const express = require('express');
const cors    = require('cors');
const http    = require('http');

const app  = express();
const PORT = process.env.MW_PORT || 8080;

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Processing Unit registry ──────────────────────────────────────────────────
// Hỗ trợ scale: PU1 có thể chạy nhiều instance (round-robin)
const PU1_INSTANCES = process.env.SCALE_MODE
  ? [
      { host: 'localhost', port: parseInt(process.env.PU1_PORT)  || 8081 },
      { host: 'localhost', port: 8091 }, // clone PU1
    ]
  : [{ host: 'localhost', port: parseInt(process.env.PU1_PORT) || 8081 }];

let pu1RoundRobin = 0;
const getNextPU1 = () => {
  const target = PU1_INSTANCES[pu1RoundRobin % PU1_INSTANCES.length];
  pu1RoundRobin++;
  return target;
};

const PU = {
  PU2: { name: 'Cart',      host: 'localhost', port: parseInt(process.env.PU2_PORT) || 8082 },
  PU3: { name: 'Order',     host: 'localhost', port: parseInt(process.env.PU3_PORT) || 8083 },
  PU4: { name: 'Inventory', host: 'localhost', port: parseInt(process.env.PU4_PORT) || 8084 },
};

// ── Request logger ────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[MW] ${req.method} ${req.path}`);
  next();
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    component: 'Virtualization Middleware',
    architecture: 'Space-Based Architecture',
    scaleMode: !!process.env.SCALE_MODE,
    processingUnits: [
      ...PU1_INSTANCES.map((pu, i) => ({
        id: i === 0 ? 'PU1-A' : 'PU1-B',
        name: 'Product',
        endpoint: `http://${pu.host}:${pu.port}`,
        role: i === 0 ? 'primary' : 'clone',
      })),
      ...Object.entries(PU).map(([id, pu]) => ({
        id, name: pu.name, endpoint: `http://${pu.host}:${pu.port}`
      })),
    ],
    timestamp: new Date().toISOString(),
  });
});

// ── Generic proxy function ────────────────────────────────────────────────────
const proxyTo = (target) => (req, res) => {
  const options = {
    hostname: target.host,
    port:     target.port,
    path:     req.originalUrl,
    method:   req.method,
    headers:  { ...req.headers, host: `${target.host}:${target.port}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[MW] Proxy error → ${target.name}:`, err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: `${target.name} Processing Unit unavailable` });
    }
  });

  req.pipe(proxyReq, { end: true });
};

// ── Route → PU1 (Product) — Round-Robin Load Balancing ───────────────────────
app.use('/products', (req, res) => {
  const target = getNextPU1();
  console.log(`[MW] → PU1 :${target.port} (round-robin)`);
  proxyTo(target)(req, res);
});
// ── Route table (các PU còn lại) ──────────────────────────────────────────────
app.use('/cart',     proxyTo(PU.PU2));
app.use('/checkout', proxyTo(PU.PU3));
app.use('/orders',   proxyTo(PU.PU3));
app.use('/stock',    proxyTo(PU.PU4));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found in Virtualization Middleware' });
});

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║   Virtualization Middleware  :${PORT}           ║`);
  console.log(`╠══════════════════════════════════════════════╣`);
  PU1_INSTANCES.forEach((pu, i) => {
    const label = i === 0 ? 'PU1-A Product (primary)' : 'PU1-B Product (clone) ';
    console.log(`║  ${label} :${pu.port}          ║`);
  });
  Object.entries(PU).forEach(([id, pu]) => {
    console.log(`║  ${id}  → ${pu.name.padEnd(10)} :${pu.port}                  ║`);
  });
  if (process.env.SCALE_MODE) {
    console.log(`╠══════════════════════════════════════════════╣`);
    console.log(`║  ⚡ SCALE MODE: Round-Robin PU1-A / PU1-B   ║`);
  }
  console.log(`╚══════════════════════════════════════════════╝\n`);
});
