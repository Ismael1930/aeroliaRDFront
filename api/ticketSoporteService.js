import api from './index';

/**
 * Obtener tickets de soporte de un cliente
 * @param {number} idCliente - ID del cliente
 */
export const obtenerTicketsCliente = async (idCliente) => {
  try {
    const response = await api.get(`/ticketsoporte/cliente/${idCliente}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerTicketsCliente:', error);
    throw error;
  }
};

/**
 * Crear un nuevo ticket de soporte
 * @param {Object} ticketData - Datos del ticket
 * @param {number} ticketData.idCliente - ID del cliente
 * @param {string} ticketData.asunto - Asunto del ticket
 * @param {string} ticketData.descripcion - Descripción del problema
 * @param {string} ticketData.prioridad - Prioridad ("Baja", "Media", "Alta")
 */
export const crearTicketSoporte = async (ticketData) => {
  try {
    const response = await api.post('/ticketsoporte', ticketData);
    return response.data;
  } catch (error) {
    console.error('Error en crearTicketSoporte:', error);
    throw error;
  }
};

/**
 * Cerrar un ticket
 * Requiere: Authorization Bearer Token
 * Roles permitidos: Admin, Operador
 * @param {number} id - ID del ticket
 */
export const cerrarTicket = async (id) => {
  try {
    const response = await api.put(`/ticketsoporte/${id}/cerrar`);
    return response.data;
  } catch (error) {
    console.error('Error en cerrarTicket:', error);
    throw error;
  }
};
