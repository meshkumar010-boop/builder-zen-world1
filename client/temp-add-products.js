// Immediate execution to add sample products
import { addAllSampleProducts } from './utils/sampleProducts.js';

console.log('🚀 Adding 20 sample products to S2 Wear store...');

addAllSampleProducts()
  .then(() => {
    console.log('✅ All sample products added successfully!');
  })
  .catch((error) => {
    console.error('❌ Error adding sample products:', error);
  });
