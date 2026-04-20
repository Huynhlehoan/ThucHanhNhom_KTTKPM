/**
 * Base Queue Factory — Redis List làm Message Queue cho các service
 */
const redis = require('./redis');

const createQueue = (queueName) => {
  const QUEUE_KEY = `queue:${queueName}`;

  return {
    // Đẩy dữ liệu vào queue (non-blocking)
    enqueue: async (data) => {
      await redis.lpush(QUEUE_KEY, JSON.stringify(data));
      console.log(`📥 [Queue:${queueName}] Enqueued | size: ${await redis.llen(QUEUE_KEY)}`);
    },

    // Lấy dữ liệu ra khỏi queue (blocking pop, timeout 5s)
    dequeue: async (timeout = 5) => {
      const result = await redis.brpop(QUEUE_KEY, timeout);
      if (!result) return null;
      return JSON.parse(result[1]);
    },

    // Xem số lượng trong queue
    size: async () => redis.llen(QUEUE_KEY),
    
    key: QUEUE_KEY
  };
};

module.exports = createQueue;
