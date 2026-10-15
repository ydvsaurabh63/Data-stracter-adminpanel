import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem('restaurant_admin');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('restaurant_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.data) {
            setAdmin(res.data);
            localStorage.setItem('restaurant_admin', JSON.stringify(res.data));
            const targetClientId = res.data?.clientId || (res.data?.role === 'client' ? res.data?._id : null);
            if (targetClientId) {
              localStorage.setItem('active_client_id', targetClientId);
            }
          } else if (!res.success) {
            logout();
          }
        } catch (err) {
          console.error('Auth verification error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (adminData, authToken) => {
    setAdmin(adminData);
    setToken(authToken);
    localStorage.setItem('restaurant_token', authToken);
    localStorage.setItem('restaurant_admin', JSON.stringify(adminData));
    const targetClientId = adminData?.clientId || (adminData?.role === 'client' ? adminData?._id : null);
    if (targetClientId) {
      localStorage.setItem('active_client_id', targetClientId);
    } else {
      localStorage.removeItem('active_client_id');
    }
  };

  const updateUser = (updatedData, newToken) => {
    setAdmin((prev) => ({ ...prev, ...updatedData }));
    localStorage.setItem('restaurant_admin', JSON.stringify({ ...admin, ...updatedData }));
    if (newToken) {
      setToken(newToken);
      localStorage.setItem('restaurant_token', newToken);
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('restaurant_token');
    localStorage.removeItem('restaurant_admin');
    localStorage.removeItem('active_client_id');
    localStorage.removeItem('app_view_mode');
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, updateUser, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
