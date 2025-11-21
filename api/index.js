import axios from "axios";
import { getToken } from "./sessionUtils";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log('=== Interceptor Request ===');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('BaseURL:', config.baseURL);
    console.log('Params:', config.params);
    
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Config final:', {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
      params: config.params,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Error en interceptor request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores comunes
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // Token inválido o expirado
        console.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        // Aquí podrías redirigir al login o limpiar la sesión
      } else if (status === 403) {
        console.error('No tienes permisos para realizar esta acción.');
      } else if (status === 404) {
        console.error('Recurso no encontrado.');
      } else if (status === 500) {
        console.error('Error del servidor. Por favor, intenta más tarde.');
      }
    } else if (error.request) {
      console.error('No se pudo conectar con el servidor. Verifica tu conexión.');
    }
    
    return Promise.reject(error);
  }
);

export default api;

