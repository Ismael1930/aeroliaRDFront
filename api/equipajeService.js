import api from './index';

/**
 * Obtener equipajes de un pasajero
 * @param {number} idPasajero - ID del pasajero
 */
export const obtenerEquipajesPasajero = async (idPasajero) => {
  try {
    const response = await api.get(`/equipaje/pasajero/${idPasajero}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerEquipajesPasajero:', error);
    throw error;
  }
};

/**
 * Registrar un nuevo equipaje
 * @param {Object} equipajeData - Datos del equipaje
 * @param {number} equipajeData.idPasajero - ID del pasajero
 * @param {number} equipajeData.peso - Peso del equipaje en kg
 * @param {string} equipajeData.tipo - Tipo de equipaje (ej: "Maleta")
 */
export const registrarEquipaje = async (equipajeData) => {
  try {
    const response = await api.post('/equipaje', equipajeData);
    return response.data;
  } catch (error) {
    console.error('Error en registrarEquipaje:', error);
    throw error;
  }
};
