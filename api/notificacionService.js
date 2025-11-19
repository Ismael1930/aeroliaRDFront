import api from './index';

/**
 * Obtener notificaciones de un cliente
 * @param {number} idCliente - ID del cliente
 */
export const obtenerNotificacionesCliente = async (idCliente) => {
  try {
    const response = await api.get(`/notificacion/cliente/${idCliente}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerNotificacionesCliente:', error);
    throw error;
  }
};

/**
 * Marcar notificación como leída
 * @param {number} id - ID de la notificación
 */
export const marcarNotificacionLeida = async (id) => {
  try {
    const response = await api.put(`/notificacion/${id}/marcar-leida`);
    return response.data;
  } catch (error) {
    console.error('Error en marcarNotificacionLeida:', error);
    throw error;
  }
};
