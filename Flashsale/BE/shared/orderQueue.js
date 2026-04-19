/**
 * Order Queue — Redis List làm Message Queue
 * 
 * Space-Based Architecture: sau khi PU3 xác nhận order,
 * đẩy vào queue để worker xử lý async (email, analytics, v.v.)
 * 
 * Producer: PU3 gọi enqueue()
 * Consumer: worker chạy riêng, poll queue liên tục
 */
const redis = require('./redis');

const QUEUE_KEY = 'queue:orders';

// Đẩy order vào queue (non-blocking)
const enqueue = async (order) => {
  await redis.lpush(QUEUE_KEY, JSON.stringify(order));
  console.log(`📥 [Queue] Enqueued order ${order.orderId} | queue size: ${await redis.llen(QUEUE_KEY)}`);
};

// Lấy order ra khỏi queue (blocking pop, timeout 5s)
const dequeue = async () => {
  const result = await redis.brpop(QUEUE_KEY, 5);
  if (!result) return null;
  return JSON.parse(result[1]);
};

// Xem số lượng trong queue
const size = async () => redis.llen(QUEUE_KEY);

module.exports = { enqueue, dequeue, size };
