import api from './index';

/**
 * Crear un nuevo vuelo (Solo Admin)
 * @param {Object} vueloData - Datos del vuelo a crear
 */
export const crearVuelo = async (vueloData) => {
  try {
    const response = await api.post('/vueloadmin', vueloData);
    return response.data;
  } catch (error) {
    console.error('Error en crearVuelo:', error);
    throw error;
  }
};

/**
 * Obtener todos los vuelos (Solo Admin)
 */
export const obtenerTodosLosVuelos = async () => {
  try {
    const response = await api.get('/vueloadmin');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerTodosLosVuelos:', error);
    throw error;
  }
};

/**
 * Obtener detalle de un vuelo (Solo Admin)
 * @param {number} id - ID del vuelo
 */
export const obtenerDetalleVuelo = async (id) => {
  try {
    const response = await api.get(`/vueloadmin/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerDetalleVuelo:', error);
    throw error;
  }
};

/**
 * Actualizar un vuelo (Solo Admin)
 * @param {Object} vueloData - Datos del vuelo a actualizar (debe incluir id)
 */
export const actualizarVuelo = async (vueloData) => {
  try {
    const response = await api.put('/vueloadmin', vueloData);
    return response.data;
  } catch (error) {
    console.error('Error en actualizarVuelo:', error);
    throw error;
  }
};

/**
 * Eliminar un vuelo (Solo Admin)
 * @param {number} id - ID del vuelo a eliminar
 */
export const eliminarVuelo = async (id) => {
  try {
    const response = await api.delete(`/vueloadmin/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en eliminarVuelo:', error);
    throw error;
  }
};
