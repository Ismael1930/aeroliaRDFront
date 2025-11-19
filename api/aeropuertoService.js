import api from './index';

/**
 * Obtener todos los aeropuertos
 */
export const obtenerAeropuertos = async () => {
  try {
    const response = await api.get('/aeropuerto');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerAeropuertos:', error);
    throw error;
  }
};

/**
 * Obtener aeropuerto por código
 * @param {string} codigo - Código del aeropuerto (ej: "SDQ")
 */
export const obtenerAeropuertoPorCodigo = async (codigo) => {
  try {
    const response = await api.get(`/aeropuerto/${codigo}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerAeropuertoPorCodigo:', error);
    throw error;
  }
};
