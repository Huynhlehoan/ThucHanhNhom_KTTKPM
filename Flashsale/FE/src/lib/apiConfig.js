/**
 * Space-Based Architecture — API Config
 * FE chỉ gọi vào 1 điểm duy nhất: Virtualization Middleware (:8080)
 * Middleware sẽ route đến đúng Processing Unit
 */

const MW = import.meta.env.VITE_MW_URL || 'http://localhost:8080';

export const API = {
  // PU1 — Product
  products:    `${MW}/products`,
  productById: (id) => `${MW}/products/${id}`,

  // PU2 — Cart
  cartGet:    `${MW}/cart`,
  cartAdd:    `${MW}/cart/add`,
  cartRemove: (productId) => `${MW}/cart/${productId}`,
  cartClear:  `${MW}/cart/clear`,

  // PU3 — Order
  checkout: `${MW}/checkout`,
  orders:   (userId) => `${MW}/orders/${userId}`,

  // PU4 — Inventory
  stock:    (productId) => `${MW}/stock/${productId}`,
  stockAll: `${MW}/stock`,

  // Health check
  health: `${MW}/health`,
};

export default API;
