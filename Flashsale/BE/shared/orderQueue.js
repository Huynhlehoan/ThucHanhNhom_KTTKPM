/**
 * Order Queue — Sử dụng baseQueue
 */
const createQueue = require('./baseQueue');

const orderQueue = createQueue('orders');

module.exports = orderQueue;
