/**
 * Space-Based Architecture — FE API Layer
 * Gọi trực tiếp vào các Processing Units (PU1–PU4)
 * Không đọc DB, dữ liệu nằm trong Data Grid (Redis)
 */

import { API } from './apiConfig.js';

// Helper: lấy userId từ token lưu trong localStorage
const getUserId = () => {
  try {
    const token = localStorage.getItem('megasale_token');
    if (!token) return 'guest';
    return JSON.parse(atob(token)).id || 'guest';
  } catch {
    return 'guest';
  }
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
};

// ─── PU1: Product ────────────────────────────────────────────────────────────

export const getProducts = async () => {
  const res = await fetch(API.products);
  return handleResponse(res);
};

export const getProductById = async (id) => {
  const res = await fetch(API.productById(id));
  return handleResponse(res);
};

// ─── PU2: Cart ───────────────────────────────────────────────────────────────

export const addToCart = async (productId, quantity = 1) => {
  const res = await fetch(API.cartAdd, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: getUserId(), productId, quantity }),
  });
  return handleResponse(res);
};

export const getCart = async () => {
  const userId = getUserId();
  const res = await fetch(`${API.cartGet}?userId=${userId}`);
  return handleResponse(res);
};

export const removeFromCart = async (productId) => {
  const res = await fetch(API.cartRemove(productId), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: getUserId() }),
  });
  return handleResponse(res);
};

export const clearCart = async () => {
  const res = await fetch(API.cartClear, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: getUserId() }),
  });
  return handleResponse(res);
};

// ─── PU3: Order ──────────────────────────────────────────────────────────────

export const checkout = async (orderData) => {
  const res = await fetch(API.checkout, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: getUserId(), ...orderData }),
  });
  return handleResponse(res);
};

// ─── PU4: Inventory ──────────────────────────────────────────────────────────

export const getStock = async (productId) => {
  const res = await fetch(API.stock(productId));
  return handleResponse(res);
};
