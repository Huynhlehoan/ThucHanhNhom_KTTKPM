/**
 * Local Cache — Processing Unit in-memory cache
 * Mỗi PU có cache riêng để giảm số lần hit Data Grid
 * Đây là "local memory" của từng Processing Unit trong Space-Based Architecture
 */

class LocalCache {
  constructor(ttlMs = 30000) {
    this.store  = new Map();
    this.ttlMs  = ttlMs; // default 30s
  }

  set(key, value, ttlMs) {
    const expiry = Date.now() + (ttlMs || this.ttlMs);
    this.store.set(key, { value, expiry });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  del(key) {
    this.store.delete(key);
  }

  flush() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

module.exports = LocalCache;
