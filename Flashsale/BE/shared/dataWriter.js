/**
 * Data Writer — Async persistence layer
 * Ghi dữ liệu xuống "DB" (file JSON) SAU KHI đã xử lý xong trong Data Grid
 * KHÔNG block Processing Unit — fire and forget
 * 
 * Trong Space-Based Architecture, DB chỉ là backup storage,
 * không phải primary data source. Primary = Data Grid (Redis)
 */
const fs   = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../db');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const dbFile = (name) => path.join(DB_DIR, `${name}.json`);

const readDb = (name) => {
  try {
    const raw = fs.readFileSync(dbFile(name), 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeDb = (name, data) => {
  fs.writeFileSync(dbFile(name), JSON.stringify(data, null, 2));
};

// Async write — không block caller
const asyncWrite = (name, record) => {
  setImmediate(() => {
    try {
      const existing = readDb(name);
      // Upsert by id/orderId
      const key = record.id || record.orderId || record.productId;
      const idx  = existing.findIndex(r => (r.id || r.orderId || r.productId) === key);
      if (idx >= 0) existing[idx] = record;
      else existing.push(record);
      writeDb(name, existing);
      console.log(`💾 [Data Writer] Persisted → db/${name}.json`);
    } catch (e) {
      console.error(`❌ [Data Writer] Write error (${name}):`, e.message);
    }
  });
};

module.exports = { asyncWrite, readDb };
