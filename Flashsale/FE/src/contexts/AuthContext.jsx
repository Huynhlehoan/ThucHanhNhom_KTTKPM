import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as apiLogin, 
  signup as apiSignup, 
  getCurrentUser as apiGetCurrentUser, 
  updateProfile as apiUpdateProfile,
  resetPassword as apiResetPassword
} from '@/lib/mockApi.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('megasale_token');
      
      if (storedToken) {
        try {
          const response = await apiGetCurrentUser(storedToken);
          if (response.success) {
            setToken(storedToken);
            setCurrentUser(response.data.user);
          } else {
            localStorage.removeItem('megasale_token');
          }
        } catch (error) {
          console.error('Auto-login failed:', error);
          localStorage.removeItem('megasale_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const signup = async (fullName, email, password) => {
    try {
      const response = await apiSignup({ fullName, email, password });
      if (response.success) {
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await apiLogin(email, password);
      if (response.success) {
        const { token: authToken, user: userData } = response.data;
        setToken(authToken);
        setCurrentUser(userData);
        localStorage.setItem('megasale_token', authToken);
        if (rememberMe) {
          localStorage.setItem('megasale_remember_email', email);
        } else {
          localStorage.removeItem('megasale_remember_email');
        }
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('megasale_token');
  };

  const resetPassword = async (email) => {
    try {
      const response = await apiResetPassword(email);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to send reset link.' };
    }
  };

  const updateProfile = async (profileData) => {
    if (!currentUser?.id) return { success: false, error: 'Not authenticated' };

    try {
      const response = await apiUpdateProfile(currentUser.id, profileData);
      if (response.success) {
        setCurrentUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};