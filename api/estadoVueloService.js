import api from './index';

/**
 * Obtener estado actual de un vuelo
 * @param {number} idVuelo - ID del vuelo
 */
export const obtenerEstadoVuelo = async (idVuelo) => {
  try {
    const response = await api.get(`/estadovuelo/${idVuelo}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerEstadoVuelo:', error);
    throw error;
  }
};

/**
 * Actualizar estado de un vuelo
 * Requiere: Authorization Bearer Token
 * Roles permitidos: Admin, Operador
 * @param {number} idVuelo - ID del vuelo
 * @param {Object} estadoData - Datos del estado
 * @param {string} estadoData.estado - Estado del vuelo ("Programado", "En Vuelo", "Aterrizado", "Cancelado", "Retrasado")
 * @param {string} estadoData.horaSalida - Hora de salida real (formato ISO 8601)
 * @param {string} estadoData.horaLlegada - Hora de llegada real (formato ISO 8601)
 * @param {string} estadoData.puerta - Puerta de embarque
 * @param {string} estadoData.observaciones - Observaciones
 */
export const actualizarEstadoVuelo = async (idVuelo, estadoData) => {
  try {
    const response = await api.put(`/estadovuelo/${idVuelo}`, estadoData);
    return response.data;
  } catch (error) {
    console.error('Error en actualizarEstadoVuelo:', error);
    throw error;
  }
};
