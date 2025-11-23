import api from './index';

/**
 * Crear una nueva reserva
 * @param {Object} reservaData - Datos de la reserva
 * @param {number} reservaData.idPasajero - ID del pasajero
 * @param {number} reservaData.idVuelo - ID del vuelo
 * @param {number} reservaData.idCliente - ID del cliente
 * @param {string} reservaData.numAsiento - Número de asiento (ej: "12A")
 * @param {string} reservaData.metodoPago - Método de pago
 */
export const crearReserva = async (reservaData) => {
  try {
    const response = await api.post('/reserva', reservaData);
    return response.data;
  } catch (error) {
    console.error('Error en crearReserva:', error);
    throw error;
  }
};

/**
 * Obtener reserva por código
 * @param {string} codigo - Código de la reserva (ej: "RES123456")
 */
export const obtenerReservaPorCodigo = async (codigo) => {
  try {
    const response = await api.get(`/reserva/${codigo}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerReservaPorCodigo:', error);
    throw error;
  }
};

/**
 * Obtener todas las reservas de un cliente
 * @param {number} idCliente - ID del cliente
 */
export const obtenerReservasCliente = async (idCliente) => {
  try {
    const response = await api.get(`/reserva/cliente/${idCliente}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerReservasCliente:', error);
    throw error;
  }
};

/**
 * Modificar una reserva
 * @param {string} codigo - Código de la reserva
 * @param {Object} modificacion - Datos de modificación
 * @param {string} modificacion.codigoReserva - Código de la reserva
 * @param {number} modificacion.nuevoIdVuelo - Nuevo ID del vuelo
 * @param {string} modificacion.nuevoNumAsiento - Nuevo número de asiento
 */
export const modificarReserva = async (codigo, modificacion) => {
  try {
    const response = await api.put(`/reserva/${codigo}/modificar`, modificacion);
    return response.data;
  } catch (error) {
    console.error('Error en modificarReserva:', error);
    throw error;
  }
};

/**
 * Cancelar una reserva
 * @param {string} codigo - Código de la reserva
 */
export const cancelarReserva = async (codigo) => {
  try {
    const response = await api.delete(`/reserva/${codigo}/cancelar`);
    return response.data;
  } catch (error) {
    console.error('Error en cancelarReserva:', error);
    throw error;
  }
};

/**
 * Obtener todas las reservas
 */
export const getAll = async () => {
  try {
    // Endpoint proporcionado por el backend: GET /api/Reserva
    const response = await api.get('/Reserva');
    // API responde: { success: true, data: [ ... ], count: N }
    const body = response.data || {};
    const items = Array.isArray(body.data) ? body.data : (body.data || []);
    const count = typeof body.count === 'number' ? body.count : (Array.isArray(body.data) ? body.data.length : 0);
    return { items, count, raw: body };
  } catch (error) {
    console.error('Error en getAll reservas:', error);
    throw error;
  }
};

// Export default para compatibilidad con imports por defecto
export default {
  getAll,
  crearReserva,
  obtenerReservaPorCodigo,
  obtenerReservasCliente,
  modificarReserva,
  cancelarReserva,
};
