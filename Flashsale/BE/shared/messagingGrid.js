/**
 * Messaging Grid — Redis Pub/Sub
 * Thành phần giao tiếp async giữa các Processing Units
 * 
 * Channels:
 *   order.created    → PU4 lắng nghe để giảm stock
 *   stock.updated    → PU1 lắng nghe để invalidate local cache
 *   cart.cleared     → log / audit
 */
const Redis = require('ioredis');

// Publisher dùng connection riêng (Redis không cho pub/sub trên cùng connection)
const publisher  = new Redis({ host: process.env.REDIS_HOST || '127.0.0.1', port: parseInt(process.env.REDIS_PORT || '6379') });
const subscriber = new Redis({ host: process.env.REDIS_HOST || '127.0.0.1', port: parseInt(process.env.REDIS_PORT || '6379') });

const publish = async (channel, payload) => {
  const msg = JSON.stringify({ channel, payload, ts: Date.now() });
  await publisher.publish(channel, msg);
  console.log(`📨 [Messaging Grid] Published → ${channel}`);
};

const subscribe = (channel, handler) => {
  subscriber.subscribe(channel, (err) => {
    if (err) console.error(`❌ [Messaging Grid] Subscribe error on ${channel}:`, err.message);
    else console.log(`📬 [Messaging Grid] Subscribed ← ${channel}`);
  });
  subscriber.on('message', (ch, raw) => {
    if (ch !== channel) return;
    try {
      const { payload } = JSON.parse(raw);
      handler(payload);
    } catch (e) {
      console.error('[Messaging Grid] Parse error:', e.message);
    }
  });
};

module.exports = { publish, subscribe };
