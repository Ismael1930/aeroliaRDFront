import api from './index';

/**
 * Crear una nueva aeronave (Solo Admin)
 * @param {Object} aeronaveData - Datos de la aeronave
 */
export const crearAeronave = async (aeronaveData) => {
  try {
    const response = await api.post('/aeronave', aeronaveData);
    return response.data;
  } catch (error) {
    console.error('Error en crearAeronave:', error);
    throw error;
  }
};

/**
 * Obtener aeronaves disponibles (Solo Admin)
 */
export const obtenerAeronavesDisponibles = async () => {
  try {
    const response = await api.get('/aeronave/disponibles');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerAeronavesDisponibles:', error);
    throw error;
  }
};
