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
 * Obtener todas las aeronaves (Solo Admin)
 */
export const obtenerTodasLasAeronaves = async () => {
  try {
    const response = await api.get('/aeronave');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerTodasLasAeronaves:', error);
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

/**
 * Obtener detalle de una aeronave por matrícula (Solo Admin)
 * @param {string} matricula - Matrícula de la aeronave
 */
export const obtenerDetalleAeronave = async (matricula) => {
  try {
    const response = await api.get(`/aeronave/${matricula}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerDetalleAeronave:', error);
    throw error;
  }
};

/**
 * Actualizar una aeronave (Solo Admin)
 * @param {Object} aeronaveData - Datos de la aeronave a actualizar (debe incluir matricula)
 */
export const actualizarAeronave = async (aeronaveData) => {
  try {
    const response = await api.put('/aeronave', aeronaveData);
    return response.data;
  } catch (error) {
    console.error('Error en actualizarAeronave:', error);
    throw error;
  }
};

/**
 * Eliminar una aeronave por matrícula (Solo Admin)
 * @param {string} matricula - Matrícula de la aeronave a eliminar
 */
export const eliminarAeronave = async (matricula) => {
  try {
    const response = await api.delete(`/aeronave/${matricula}`);
    return response.data;
  } catch (error) {
    console.error('Error en eliminarAeronave:', error);
    throw error;
  }
};
