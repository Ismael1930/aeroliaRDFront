'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/api/authService';
import { getUser, isAuthenticated } from '@/api/sessionUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (isAuthenticated()) {
        // Obtener datos guardados en localStorage
        const userData = getUser();
        setUser(userData);
        setIsAuth(true);
        
        // Verificar token con el backend (sin bloquear si falla)
        try {
          await authService.verifyToken();
        } catch (error) {
          console.log('Token verification failed, but using cached user data');
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      
      // Usar los datos del usuario que vienen en la respuesta del login
      const userData = data.user || { email, rol: 'Cliente' };
      
      setUser(userData);
      setIsAuth(true);
      return { ...data, user: userData };
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      const data = await authService.register(email, password);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuth(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        loading,
        login,
        register,
        logout,
        updateUser,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
