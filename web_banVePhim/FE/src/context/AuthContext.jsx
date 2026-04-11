import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('pvr_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const mockUser = {
      id: 1,
      email: email,
      name: email.split('@')[0],
      joinedDate: new Date().toISOString()
    };
    setUser(mockUser);
    localStorage.setItem('pvr_user', JSON.stringify(mockUser));
    return { success: true, user: mockUser };
  };

  const register = (email, password, name) => {
    const mockUser = {
      id: Date.now(),
      email: email,
      name: name || email.split('@')[0],
      joinedDate: new Date().toISOString()
    };
    setUser(mockUser);
    localStorage.setItem('pvr_user', JSON.stringify(mockUser));
    return { success: true, user: mockUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pvr_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};