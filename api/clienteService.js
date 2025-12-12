import api from './index';

/**
 * Listar todos los clientes
 * Requiere: Authorization Bearer Token
 * Roles permitidos: Admin, Operador
 */
export const listarClientes = async () => {
  try {
    const response = await api.get('/cliente');
    return response.data;
  } catch (error) {
    console.error('Error en listarClientes:', error);
    throw error;
  }
};

/**
 * Obtener cliente por ID
 * @param {number} id - ID del cliente
 */
export const obtenerClientePorId = async (id) => {
  try {
    const response = await api.get(`/cliente/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerClientePorId:', error);
    throw error;
  }
};

/**
 * Obtener cliente con sus reservas
 * @param {number} id - ID del cliente
 */
export const obtenerClienteConReservas = async (id) => {
  try {
    const response = await api.get(`/cliente/${id}/reservas`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerClienteConReservas:', error);
    throw error;
  }
};

/**
 * Obtener cliente por UserId
 * @param {string} userId - ID del usuario
 */
export const obtenerClientePorUserId = async (userId) => {
  try {
    const response = await api.get(`/Cliente/user/${userId}`);
    // Normalizar respuesta: si el backend envuelve el objeto en { success, data: {...} }
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Error en obtenerClientePorUserId:', error);
    throw error;
  }
};

/**
 * Obtener cliente por email
 * @param {string} email - Email del cliente
 */
export const obtenerClientePorEmail = async (email) => {
  try {
    const response = await api.get(`/cliente/email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerClientePorEmail:', error);
    throw error;
  }
};

/**
 * Crear un nuevo cliente
 * @param {Object} clienteData - Datos del cliente
 * @param {string} clienteData.nombre - Nombre del cliente
 * @param {string} clienteData.email - Email del cliente
 * @param {string} clienteData.telefono - Teléfono del cliente
 * @param {string} clienteData.userId - ID del usuario asociado
 */
export const crearCliente = async (clienteData) => {
  try {
    const response = await api.post('/cliente', clienteData);
    return response.data;
  } catch (error) {
    console.error('Error en crearCliente:', error);
    throw error;
  }
};

/**
 * Actualizar un cliente
 * @param {number} id - ID del cliente
 * @param {Object} clienteData - Datos a actualizar
 */
export const actualizarCliente = async (id, clienteData) => {
  try {
    const response = await api.put(`/cliente/${id}`, clienteData);
    return response.data;
  } catch (error) {
    console.error('Error en actualizarCliente:', error);
    throw error;
  }
};

/**
 * Eliminar un cliente
 * Requiere: Authorization Bearer Token
 * Roles permitidos: Admin
 * @param {number} id - ID del cliente
 */
export const eliminarCliente = async (id) => {
  try {
    const response = await api.delete(`/cliente/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en eliminarCliente:', error);
    throw error;
  }
};
