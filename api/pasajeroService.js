import api from './index';

/**
 * Listar todos los pasajeros
 */
export const listarPasajeros = async () => {
  try {
    const response = await api.get('/pasajero');
    return response.data;
  } catch (error) {
    console.error('Error en listarPasajeros:', error);
    throw error;
  }
};

/**
 * Obtener pasajero por ID
 * @param {number} id - ID del pasajero
 */
export const obtenerPasajeroPorId = async (id) => {
  try {
    const response = await api.get(`/pasajero/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerPasajeroPorId:', error);
    throw error;
  }
};

/**
 * Crear un nuevo pasajero
 * @param {Object} pasajeroData - Datos del pasajero
 * @param {string} pasajeroData.nombre - Nombre del pasajero
 * @param {string} pasajeroData.apellido - Apellido del pasajero
 * @param {string} pasajeroData.pasaporte - Número de pasaporte
 */
export const crearPasajero = async (pasajeroData) => {
  try {
    const response = await api.post('/pasajero', pasajeroData);
    return response.data;
  } catch (error) {
    console.error('Error en crearPasajero:', error);
    throw error;
  }
};

/**
 * Actualizar un pasajero
 * @param {number} id - ID del pasajero
 * @param {Object} pasajeroData - Datos a actualizar
 */
export const actualizarPasajero = async (id, pasajeroData) => {
  try {
    const response = await api.put(`/pasajero/${id}`, pasajeroData);
    return response.data;
  } catch (error) {
    console.error('Error en actualizarPasajero:', error);
    throw error;
  }
};

/**
 * Eliminar un pasajero
 * @param {number} id - ID del pasajero
 */
export const eliminarPasajero = async (id) => {
  try {
    const response = await api.delete(`/pasajero/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en eliminarPasajero:', error);
    throw error;
  }
};
