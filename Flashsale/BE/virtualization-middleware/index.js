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
const PU = {
  PU1: { name: 'Product',   host: 'localhost', port: parseInt(process.env.PU1_PORT) || 8081 },
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
    processingUnits: Object.entries(PU).map(([id, pu]) => ({
      id, name: pu.name, endpoint: `http://${pu.host}:${pu.port}`
    })),
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

// ── Route table ───────────────────────────────────────────────────────────────
app.use('/products', proxyTo(PU.PU1));   // PU1 — Product
app.use('/cart',     proxyTo(PU.PU2));   // PU2 — Cart
app.use('/checkout', proxyTo(PU.PU3));   // PU3 — Order
app.use('/orders',   proxyTo(PU.PU3));   // PU3 — Order history
app.use('/stock',    proxyTo(PU.PU4));   // PU4 — Inventory

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found in Virtualization Middleware' });
});

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║   Virtualization Middleware  :${PORT}           ║`);
  console.log(`╠══════════════════════════════════════════════╣`);
  Object.entries(PU).forEach(([id, pu]) => {
    console.log(`║  ${id} → ${pu.name.padEnd(10)} :${pu.port}                  ║`);
  });
  console.log(`╚══════════════════════════════════════════════╝\n`);
});
