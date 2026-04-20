/**
 * Inventory Queue
 */
const createQueue = require('./baseQueue');

const inventoryQueue = createQueue('inventory');

module.exports = inventoryQueue;
