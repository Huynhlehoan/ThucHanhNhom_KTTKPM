/**
 * Product Worker — Async Persistence for Products
 */
const { dequeue, size } = require('../shared/productQueue');
const { asyncWrite }    = require('../shared/dataWriter');

console.log('\n🔧 [Product Worker] Started — listening to queue:products\n');

const run = async () => {
  while (true) {
    try {
      const product = await dequeue();
      if (!product) continue;

      console.log(`⚙️  [Product Worker] Persisting product ${product.id}...`);
      asyncWrite('products', product);

      const remaining = await size();
      if (remaining > 0) console.log(`   Remaining in queue: ${remaining}`);
    } catch (err) {
      console.error('[Product Worker] Error:', err.message);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

run();
