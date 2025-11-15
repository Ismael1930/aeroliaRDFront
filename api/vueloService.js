import api from './index';

/**
 * Buscar vuelos con filtros
 */
export const buscarVuelos = async (filtros) => {
  const response = await api.post('/Vuelo/buscar', filtros);
  return response.data;
};

/**
 * Obtener lista de aeropuertos disponibles
 */
export const obtenerAeropuertos = async () => {
  const response = await api.get('/Vuelo/aeropuertos');
  return response.data;
};

/**
 * Obtener detalles de un vuelo específico
 */
export const obtenerVueloPorId = async (id) => {
  const response = await api.get(`/Vuelo/${id}`);
  return response.data;
};
