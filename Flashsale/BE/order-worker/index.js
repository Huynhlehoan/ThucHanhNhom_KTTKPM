/**
 * Order Worker — Async Queue Consumer
 * 
 * Xử lý các tác vụ sau khi order được tạo:
 * - Ghi log analytics
 * - Simulate gửi email xác nhận
 * - Cập nhật báo cáo doanh thu
 * 
 * Chạy độc lập: node order-worker/index.js
 * KHÔNG block PU3 — PU3 trả kết quả ngay, worker xử lý sau
 */

const { dequeue, size } = require('../shared/orderQueue');
const { asyncWrite }    = require('../shared/dataWriter');

console.log('\n🔧 [Order Worker] Started — listening to queue:orders\n');

// Simulate gửi email
const sendConfirmationEmail = (order) => {
  console.log(`📧 [Worker] Email xác nhận → ${order.customer.email} | Order: ${order.orderId}`);
};

// Simulate analytics
const recordAnalytics = (order) => {
  console.log(`📊 [Worker] Analytics: ${order.orderId} | Total: $${order.total} | Items: ${order.items.length}`);
};

// Main worker loop
const run = async () => {
  while (true) {
    try {
      const order = await dequeue(); // blocking pop, chờ tối đa 5s
      if (!order) continue;

      console.log(`\n⚙️  [Worker] Processing order ${order.orderId}...`);

      // Xử lý async các tác vụ
      sendConfirmationEmail(order);
      recordAnalytics(order);
      asyncWrite('orders', order); // persist to DB

      const remaining = await size();
      console.log(`✅ [Worker] Done | Queue còn: ${remaining} orders\n`);
    } catch (err) {
      console.error('[Worker] Error:', err.message);
      await new Promise(r => setTimeout(r, 1000)); // retry sau 1s
    }
  }
};

run();
