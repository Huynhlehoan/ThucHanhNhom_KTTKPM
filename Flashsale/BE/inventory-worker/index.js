/**
 * Inventory Worker — Async Persistence for Stock
 */
const { dequeue, size } = require('../shared/inventoryQueue');
const { asyncWrite, readDb } = require('../shared/dataWriter');

console.log('\n🔧 [Inventory Worker] Started — listening to queue:inventory\n');

const run = async () => {
  while (true) {
    try {
      const data = await dequeue();
      if (!data) continue;

      const { productId, newStock } = data;
      console.log(`⚙️  [Inventory Worker] Persisting stock for ${productId}: ${newStock}`);

      // Lấy data hiện tại để merge (vì asyncWrite thay thế cả record)
      const products = readDb('products');
      const product = products.find(p => p.id === productId);
      
      if (product) {
        product.stock = newStock;
        asyncWrite('products', product);
      } else {
        // Nếu không tìm thấy trong DB (có thể là sản phẩm mới chưa kịp persist)
        asyncWrite('products', { id: productId, stock: newStock });
      }

      const remaining = await size();
      if (remaining > 0) console.log(`   Remaining in queue: ${remaining}`);
    } catch (err) {
      console.error('[Inventory Worker] Error:', err.message);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

run();
