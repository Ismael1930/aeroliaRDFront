import api from './index';

/**
 * Obtener factura por código
 * @param {string} codigo - Código de la factura (ej: "FAC123456")
 */
export const obtenerFacturaPorCodigo = async (codigo) => {
  try {
    const response = await api.get(`/factura/${codigo}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerFacturaPorCodigo:', error);
    throw error;
  }
};

/**
 * Obtener factura por código de reserva
 * @param {string} codigoReserva - Código de la reserva (ej: "RES123456")
 */
export const obtenerFacturaPorReserva = async (codigoReserva) => {
  try {
    const response = await api.get(`/factura/reserva/${codigoReserva}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerFacturaPorReserva:', error);
    throw error;
  }
};

/**
 * Procesar pago de una factura
 * @param {Object} pagoData - Datos del pago
 * @param {string} pagoData.codigoFactura - Código de la factura
 * @param {string} pagoData.metodoPago - Método de pago
 */
export const procesarPago = async (pagoData) => {
  try {
    const response = await api.post('/factura/pagar', pagoData);
    return response.data;
  } catch (error) {
    console.error('Error en procesarPago:', error);
    throw error;
  }
};

/**
 * Obtener todas las facturas
 */
export const getAll = async () => {
  try {
    const response = await api.get('/factura');
    return response.data;
  } catch (error) {
    console.error('Error en getAll facturas:', error);
    throw error;
  }
};

// Export default para compatibilidad con imports por defecto
export default {
  getAll,
  obtenerFacturaPorCodigo,
  obtenerFacturaPorReserva,
  procesarPago,
};
