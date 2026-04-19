// Mock API for development - simulates backend endpoints using localStorage

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to encode/decode simple mock JWT tokens
const encodeToken = (user) => btoa(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 86400000 }));
const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token));
  } catch (e) {
    return null;
  }
};

// Database helpers
const getUsers = () => JSON.parse(localStorage.getItem('megasale_users') || '[]');
const saveUsers = (users) => localStorage.setItem('megasale_users', JSON.stringify(users));

const getOrders = () => JSON.parse(localStorage.getItem('megasale_orders') || '[]');
const saveOrders = (orders) => localStorage.setItem('megasale_orders', JSON.stringify(orders));

const getBackendCart = () => JSON.parse(localStorage.getItem('megasale_backend_cart') || '[]');
const saveBackendCart = (cart) => localStorage.setItem('megasale_backend_cart', JSON.stringify(cart));

// Mock Product Data
const mockProducts = [
  {
    id: 'p1',
    name: 'ProVision X1 Smartwatch',
    price: 299.99,
    originalPrice: 299.99,
    flashPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
    description: 'Advanced smartwatch with health tracking, built-in GPS, and a stunning AMOLED display for crystal clear visibility in any light condition.',
    category: 'Wearables',
    rating: 4.8,
    reviews: 245,
    discount: 33,
    stock: 45,
    tags: ['smartwatch', 'fitness', 'tech'],
    features: ['Heart rate monitor', 'Built-in GPS', 'Water resistant 50m', '7-day battery life'],
    saleEndTime: new Date(Date.now() + 86400000).toISOString()
  },
  {
    id: 'p2',
    name: 'SonicNoise Cancelling Headphones',
    price: 349.99,
    originalPrice: 349.99,
    flashPrice: 249.99,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
    description: 'Industry-leading active noise cancellation, exceptional high-fidelity sound quality, and up to 30 hours of continuous battery life.',
    category: 'Audio',
    rating: 4.9,
    reviews: 892,
    discount: 28,
    stock: 120,
    tags: ['headphones', 'audio', 'wireless'],
    features: ['Active Noise Cancellation', '30-hour battery', 'Touch controls', 'Voice assistant integrated'],
    saleEndTime: new Date(Date.now() + 172800000).toISOString()
  },
  {
    id: 'p3',
    name: 'AeroBook Pro 14"',
    price: 1299.99,
    originalPrice: 1299.99,
    flashPrice: 1099.99,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    description: 'Ultra-thin, lightweight laptop featuring a powerful next-gen processor, stunning Retina display, and all-day battery life.',
    category: 'Computers',
    rating: 4.7,
    reviews: 156,
    discount: 15,
    stock: 15,
    tags: ['laptop', 'computer', 'work'],
    features: ['16GB Unified Memory', '512GB SSD', 'Retina Display', 'Backlit Keyboard'],
    saleEndTime: new Date(Date.now() + 43200000).toISOString()
  },
  {
    id: 'p4',
    name: 'NexusPhone 12 5G',
    price: 899.99,
    originalPrice: 899.99,
    flashPrice: 749.99,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800',
    description: 'Experience lightning-fast 5G speeds, a revolutionary triple-lens camera system, and the toughest glass ever in a smartphone.',
    category: 'Mobile',
    rating: 4.8,
    reviews: 1204,
    discount: 16,
    stock: 85,
    tags: ['smartphone', 'mobile', '5g'],
    features: ['6.1" OLED Display', 'A15 Bionic Chip', 'Triple 12MP Cameras', 'Face Unlock'],
    saleEndTime: new Date(Date.now() + 259200000).toISOString()
  },
  {
    id: 'p5',
    name: 'AirPods True Wireless',
    price: 159.99,
    originalPrice: 159.99,
    flashPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1572569533902-4c28ad0234c2?auto=format&fit=crop&q=80&w=800',
    description: 'Seamless pairing, rich high-quality audio, and voice-activated controls wrapped in a compact, portable wireless charging case.',
    category: 'Audio',
    rating: 4.6,
    reviews: 3450,
    discount: 25,
    stock: 200,
    tags: ['earbuds', 'audio', 'wireless'],
    features: ['Spatial Audio', 'Water Resistant', '24h Total Battery', 'Quick Charge'],
    saleEndTime: new Date(Date.now() + 90000000).toISOString()
  },
  {
    id: 'p6',
    name: 'UltraView 32" 4K Monitor',
    price: 499.99,
    originalPrice: 499.99,
    flashPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
    description: 'Expand your workspace with this stunning 32-inch 4K UHD monitor. Features HDR10 support and exceptional color accuracy for creative work.',
    category: 'Displays',
    rating: 4.7,
    reviews: 89,
    discount: 20,
    stock: 30,
    tags: ['monitor', 'display', '4k'],
    features: ['4K UHD Resolution', 'HDR10 Support', 'IPS Panel', 'USB-C Connectivity'],
    saleEndTime: new Date(Date.now() + 300000000).toISOString()
  },
  {
    id: 'p7',
    name: 'MechPro Wireless Keyboard',
    price: 129.99,
    originalPrice: 129.99,
    flashPrice: 89.99,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
    description: 'Tactile mechanical switches, customizable RGB backlighting, and low-latency wireless connectivity for the ultimate typing experience.',
    category: 'Accessories',
    rating: 4.9,
    reviews: 412,
    discount: 31,
    stock: 65,
    tags: ['keyboard', 'mechanical', 'gaming'],
    features: ['Brown Tactile Switches', 'RGB Backlight', 'Bluetooth 5.0', 'Hot-swappable'],
    saleEndTime: new Date(Date.now() + 150000000).toISOString()
  },
  {
    id: 'p8',
    name: 'ErgoMaster Wireless Mouse',
    price: 79.99,
    originalPrice: 79.99,
    flashPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800',
    description: 'Designed for all-day comfort with advanced ergonomic support, hyper-fast scrolling, and precise tracking on any surface.',
    category: 'Accessories',
    rating: 4.8,
    reviews: 533,
    discount: 25,
    stock: 110,
    tags: ['mouse', 'ergonomic', 'wireless'],
    features: ['Ergonomic Design', '4000 DPI Sensor', 'Multi-device Sync', '70-day Battery'],
    saleEndTime: new Date(Date.now() + 120000000).toISOString()
  }
];

// --- Product Endpoints ---

export const getProducts = async () => {
  await delay(500);
  return { success: true, data: mockProducts };
};

export const getProductById = async (id) => {
  await delay(300);
  const product = mockProducts.find(p => p.id === id);
  if (!product) {
    return { success: false, error: 'Product not found' };
  }
  return { success: true, data: product };
};

export const getRelatedProducts = async (productId, categoryOrLimit = 4) => {
  await delay(400);
  const product = mockProducts.find(p => p.id === productId);
  
  let related = [];
  if (product) {
    // Filter by same category, excluding the product itself
    related = mockProducts.filter(p => p.category === product.category && p.id !== productId);
  }
  
  // If not enough in category, fill with random other products
  if (related.length < 4) {
    const others = mockProducts.filter(p => p.id !== productId && p.category !== product?.category);
    related = [...related, ...others];
  }

  // Handle limit if passed as number
  const limit = typeof categoryOrLimit === 'number' ? categoryOrLimit : 4;
  return { success: true, data: related.slice(0, limit) };
};

// --- Cart Endpoints ---

export const addToCart = async (productId, quantity) => {
  await delay(200);
  const cart = getBackendCart();
  const product = mockProducts.find(p => p.id === productId);
  
  if (!product) return { success: false, error: 'Product not found' };

  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity, product });
  }

  saveBackendCart(cart);
  return { success: true, data: cart };
};

export const removeFromCart = async (productId) => {
  await delay(200);
  let cart = getBackendCart();
  cart = cart.filter(item => item.productId !== productId);
  saveBackendCart(cart);
  return { success: true, data: cart };
};

export const getCart = async () => {
  await delay(300);
  return { success: true, data: getBackendCart() };
};

// --- Order Endpoints ---

export const createOrder = async (orderData) => {
  await delay(1000);
  
  // Simulate occasional payment failure for realism
  if (Math.random() < 0.05) {
    return { success: false, error: 'Payment processing failed. Please check your details and try again.' };
  }

  const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 14);

  const order = {
    id: orderId,
    orderId,
    ...orderData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    estimatedDelivery: estimatedDelivery.toISOString()
  };

  // Automatically save to user orders if user is authenticated (simulated)
  const token = localStorage.getItem('megasale_token');
  if (token) {
    const decoded = decodeToken(token);
    if (decoded) {
      const orders = getOrders();
      orders.push({ ...order, userId: decoded.id });
      saveOrders(orders);
    }
  }

  return {
    success: true,
    data: { orderId, estimatedDelivery: estimatedDelivery.toISOString(), order }
  };
};

export const saveOrder = async (tokenOrData, data) => {
  await delay(600);
  
  // Handle both saveOrder(orderData) and saveOrder(token, orderData) signatures
  const orderData = data || tokenOrData;
  const token = data ? tokenOrData : localStorage.getItem('megasale_token');

  // Simulate 80% success rate
  if (Math.random() > 0.8) {
    return { success: false, message: 'Order creation failed' };
  }

  const orderId = orderData.orderId || `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  
  const order = {
    id: orderId,
    orderId,
    ...orderData,
    status: orderData.status || 'pending',
    createdAt: orderData.createdAt || new Date().toISOString()
  };

  // Attach user ID if token is available
  if (token) {
    const decoded = decodeToken(token);
    if (decoded) {
      order.userId = decoded.id;
    }
  }

  // Save to mock database
  const orders = getOrders();
  // Prevent duplicate saves if createOrder already saved it
  if (!orders.find(o => o.orderId === orderId)) {
    orders.push(order);
    saveOrders(orders);
  }

  // Clear the cart after successful order creation
  saveBackendCart([]);

  return {
    success: true,
    orderId,
    message: 'Order created successfully'
  };
};

export const getUserOrders = async (userId) => {
  await delay(600);
  const orders = getOrders();
  const userOrders = orders
    .filter(order => order.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return { success: true, data: { orders: userOrders } };
};

// --- Auth Endpoints ---

export const signup = async (arg1, arg2, arg3) => {
  await delay(800);
  const users = getUsers();
  
  // Handle both (userDataObject) and (email, password, name) signatures
  let email, password, fullName;
  if (typeof arg1 === 'object') {
    email = arg1.email;
    password = arg1.password;
    fullName = arg1.fullName || arg1.name;
  } else {
    email = arg1;
    password = arg2;
    fullName = arg3;
  }
  
  if (users.find(u => u.email === email)) {
    return { success: false, error: 'Email already registered' };
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: fullName,
    email: email,
    password: btoa(password), // Mock hashing
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  const { password: _, ...userWithoutPassword } = newUser;
  const token = encodeToken(userWithoutPassword);

  return {
    success: true,
    data: { token, user: userWithoutPassword }
  };
};

export const signin = async (email, password) => {
  await delay(800);
  const users = getUsers();
  const encodedPassword = btoa(password);

  const user = users.find(u => u.email === email && u.password === encodedPassword);
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const { password: _, ...userWithoutPassword } = user;
  const token = encodeToken(userWithoutPassword);

  return {
    success: true,
    data: { token, user: userWithoutPassword }
  };
};

// Alias login to signin to support existing context implementations seamlessly
export const login = signin;

export const logout = async () => {
  await delay(200);
  // In a real app, might invalidate session on server
  return { success: true };
};

export const resetPassword = async (email) => {
  await delay(800);
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    // Return success anyway to prevent email enumeration
    return { success: true, message: 'If an account exists, a reset link has been sent.' };
  }

  return { success: true, message: 'Password reset link sent to your email.' };
};

export const getUserProfile = async (token) => {
  await delay(300);
  if (!token) return { success: false, error: 'No token provided' };

  const decoded = decodeToken(token);
  if (!decoded || decoded.exp < Date.now()) {
    return { success: false, error: 'Token expired or invalid' };
  }

  const users = getUsers();
  const user = users.find(u => u.id === decoded.id);

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const { password: _, ...userWithoutPassword } = user;
  return { success: true, data: { user: userWithoutPassword } };
};

// Alias getCurrentUser to getUserProfile for backward compatibility
export const getCurrentUser = getUserProfile;

export const updateUserProfile = async (userId, profileData) => {
  await delay(800);
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  // Handle password update separately if provided
  let updatedPassword = users[userIndex].password;
  if (profileData.newPassword) {
    if (btoa(profileData.currentPassword) !== users[userIndex].password) {
      return { success: false, error: 'Current password is incorrect' };
    }
    updatedPassword = btoa(profileData.newPassword);
  }

  users[userIndex] = {
    ...users[userIndex],
    ...profileData,
    id: userId, // Prevent ID change
    email: users[userIndex].email, // Prevent email change in this mock
    password: updatedPassword
  };

  saveUsers(users);
  const { password: _, ...userWithoutPassword } = users[userIndex];

  return { success: true, data: { user: userWithoutPassword } };
};

// Alias updateProfile to updateUserProfile
export const updateProfile = updateUserProfile;