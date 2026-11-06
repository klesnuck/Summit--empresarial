import React, { createContext, useContext, useState, useEffect } from 'react';
import { SummitAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('summit_sesion_usuario');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('summit_sesion_usuario', JSON.stringify(user));
    } else {
      localStorage.removeItem('summit_sesion_usuario');
    }
  }, [user]);

  const login = async (correo, password) => {
    setLoading(true);
    const result = await SummitAPI.login({ correo, password });
    setLoading(false);
    if (result.success) {
      setUser(result.usuario);
    }
    return result;
  };

  const registerAndBuy = async (data) => {
    setLoading(true);
    const result = await SummitAPI.registerAndBuy(data);
    setLoading(false);
    if (result.success) {
      setUser(result.usuario);
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('summit_sesion_usuario');
  };

  return (
    <AuthContext.Provider value={{ user, login, registerAndBuy, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

