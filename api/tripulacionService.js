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
