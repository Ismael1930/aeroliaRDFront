import api from './index';

/**
 * Buscar vuelos con filtros
 * @param {Object} filtros - Filtros de búsqueda
 * @param {string} filtros.origen - Código del aeropuerto de origen (ej: "SDQ")
 * @param {string} filtros.destino - Código del aeropuerto de destino (ej: "POP")
 * @param {string} filtros.fechaSalida - Fecha de salida (formato: YYYY-MM-DD)
 * @param {string} filtros.fechaRegreso - Fecha de regreso (formato: YYYY-MM-DD)
 * @param {number} filtros.adultos - Número de adultos (default: 2)
 * @param {number} filtros.ninos - Número de niños (default: 1)
 * @param {string} filtros.clase - Clase ("Economica", "Primera")
 */
export const buscarVuelos = async (filtros = {}) => {
  try {
    const params = {};
    if (filtros.origen) params.origen = filtros.origen;
    if (filtros.destino) params.destino = filtros.destino;
    if (filtros.fechaSalida) params.fechaSalida = filtros.fechaSalida;
    if (filtros.fechaRegreso) params.fechaRegreso = filtros.fechaRegreso;
    if (filtros.adultos) params.adultos = filtros.adultos;
    if (filtros.ninos) params.ninos = filtros.ninos;
    if (filtros.clase) params.clase = filtros.clase;

    const response = await api.get('/vuelo/buscar', { params });
    return response.data;
  } catch (error) {
    console.error('Error en buscarVuelos:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      params: error.config?.params
    });
    throw error;
  }
};

/**
 * Obtener detalles de un vuelo específico por ID
 * @param {number} id - ID del vuelo
 */
export const obtenerVueloPorId = async (id) => {
  try {
    const response = await api.get(`/vuelo/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerVueloPorId:', error);
    throw error;
  }
};
