/**
 * Cart Queue
 */
const createQueue = require('./baseQueue');

const cartQueue = createQueue('carts');

module.exports = cartQueue;
