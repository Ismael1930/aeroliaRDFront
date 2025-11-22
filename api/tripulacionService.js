import api from './index';

/**
 * Crear un miembro de tripulación (Solo Admin)
 * @param {Object} tripulacionData - Datos del miembro de tripulación
 */
export const crearTripulacion = async (tripulacionData) => {
  try {
    const response = await api.post('/tripulacion', tripulacionData);
    return response.data;
  } catch (error) {
    console.error('Error en crearTripulacion:', error);
    throw error;
  }
};

/**
 * Obtener toda la tripulación (Solo Admin)
 */
export const obtenerTodaLaTripulacion = async () => {
  try {
    const response = await api.get('/tripulacion');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerTodaLaTripulacion:', error);
    throw error;
  }
};

/**
 * Obtener tripulación por rol (Solo Admin)
 * @param {string} rol - Rol de la tripulación (ej: "Piloto", "Copiloto", "Azafata")
 */
export const obtenerTripulacionPorRol = async (rol) => {
  try {
    const response = await api.get(`/tripulacion/rol/${rol}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerTripulacionPorRol:', error);
    throw error;
  }
};

/**
 * Obtener detalle de un miembro de tripulación (Solo Admin)
 * @param {number} id - ID del miembro
 */
export const obtenerDetalleTripulacion = async (id) => {
  try {
    const response = await api.get(`/tripulacion/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerDetalleTripulacion:', error);
    throw error;
  }
};

/**
 * Actualizar un miembro de tripulación (Solo Admin)
 * @param {Object} tripulacionData - Datos del miembro a actualizar
 */
export const actualizarTripulacion = async (tripulacionData) => {
  try {
    const response = await api.put('/tripulacion', tripulacionData);
    return response.data;
  } catch (error) {
    console.error('Error en actualizarTripulacion:', error);
    throw error;
  }
};

/**
 * Eliminar un miembro de tripulación (Solo Admin)
 * @param {number} id - ID del miembro a eliminar
 */
export const eliminarTripulacion = async (id) => {
  try {
    const response = await api.delete(`/tripulacion/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en eliminarTripulacion:', error);
    throw error;
  }
};
