import axios from "axios";
import { getToken } from "./sessionUtils";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

