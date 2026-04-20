/**
 * Cart Worker — Async Processing for Carts
 */
const { dequeue, size } = require('../shared/cartQueue');
const { asyncWrite }    = require('../shared/dataWriter');

console.log('\n🔧 [Cart Worker] Started — listening to queue:carts\n');

const run = async () => {
  while (true) {
    try {
      const data = await dequeue();
      if (!data) continue;

      console.log(`⚙️  [Cart Worker] Processing cart for ${data.userId}...`);
      
      // Persistence (Optional)
      asyncWrite(`cart_${data.userId}`, data.items);

      const remaining = await size();
      if (remaining > 0) console.log(`   Remaining in queue: ${remaining}`);
    } catch (err) {
      console.error('[Cart Worker] Error:', err.message);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

run();
