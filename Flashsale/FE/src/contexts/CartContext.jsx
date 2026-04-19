import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as remoteApi from '@/lib/api.js';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

// ─── Fallback helpers (localStorage) khi PU2 chưa online ────────────────────
const LS_KEY = 'megasale_cart';
const lsGet  = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } };
const lsSave = (c) => { try { localStorage.setItem(LS_KEY, JSON.stringify(c)); } catch {} };

export const CartProvider = ({ children }) => {
  const [cart, setCart]       = useState([]);
  const [backendUp, setBackendUp] = useState(false); // true khi PU2 phản hồi

  // ── Load cart khi mount ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const data = await remoteApi.getCart();
        // PU2 trả về { items: [...] } hoặc mảng trực tiếp
        const items = Array.isArray(data) ? data : (data.items || data.data || []);
        setCart(items);
        setBackendUp(true);
      } catch {
        // PU2 chưa online → dùng localStorage
        setCart(lsGet());
        setBackendUp(false);
      }
    };
    load();
  }, []);

  // ── Sync localStorage khi offline ───────────────────────────────────────
  useEffect(() => {
    if (!backendUp) lsSave(cart);
  }, [cart, backendUp]);

  // ── addToCart ────────────────────────────────────────────────────────────
  const addToCart = useCallback(async (product, quantity = 1) => {
    if (backendUp) {
      try {
        const data = await remoteApi.addToCart(product.id, quantity);
        const items = Array.isArray(data) ? data : (data.items || data.data || []);
        setCart(items);
        return;
      } catch {
        setBackendUp(false);
      }
    }
    // Fallback local
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      return existing
        ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
        : [...prev, { ...product, quantity }];
    });
  }, [backendUp]);

  // ── removeFromCart ───────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (productId) => {
    if (backendUp) {
      try {
        const data = await remoteApi.removeFromCart(productId);
        const items = Array.isArray(data) ? data : (data.items || data.data || []);
        setCart(items);
        return;
      } catch {
        setBackendUp(false);
      }
    }
    setCart(prev => prev.filter(i => i.id !== productId));
  }, [backendUp]);

  // ── updateQuantity ───────────────────────────────────────────────────────
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
  }, [removeFromCart]);

  // ── clearCart ────────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    if (backendUp) {
      try { await remoteApi.clearCart(); } catch { setBackendUp(false); }
    }
    setCart([]);
    lsSave([]);
  }, [backendUp]);

  const getCartTotal = () =>
    cart.reduce((sum, item) => sum + ((item.flashPrice ?? item.price ?? 0) * item.quantity), 0);

  const getCartCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, backendUp,
      addToCart, removeFromCart, updateQuantity, clearCart,
      getCartTotal, getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};
