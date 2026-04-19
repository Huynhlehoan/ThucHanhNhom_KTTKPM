/**
 * Data Grid — Redis Client
 * Shared memory space cho tất cả Processing Units
 * Đây là trái tim của Space-Based Architecture
 */
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on('connect', () => console.log('✅ [Data Grid] Connected to Redis'));
redis.on('error',   (e) => console.error('❌ [Data Grid] Error:', e.message));

module.exports = redis;
