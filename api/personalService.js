import api from './index';

/**
 * Obtener todo el personal (Solo Admin)
 */
export const obtenerTodoElPersonal = async () => {
  try {
    const response = await api.get('/Personal');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerTodoElPersonal:', error);
    throw error;
  }
};

/**
 * Obtener personal por ID (Solo Admin)
 * @param {number} id - ID del personal
 */
export const obtenerPersonalPorId = async (id) => {
  try {
    const response = await api.get(`/Personal/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerPersonalPorId:', error);
    throw error;
  }
};

/**
 * Obtener personal por rol (Solo Admin)
 * @param {string} rol - Rol del personal (Piloto/Copiloto/Sobrecargo Jefe/Sobrecargo)
 */
export const obtenerPersonalPorRol = async (rol) => {
  try {
    const response = await api.get(`/Personal/rol/${encodeURIComponent(rol)}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerPersonalPorRol:', error);
    throw error;
  }
};

/**
 * Obtener personal disponible (Solo Admin)
 */
export const obtenerPersonalDisponible = async () => {
  try {
    const response = await api.get('/Personal/disponibles');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerPersonalDisponible:', error);
    throw error;
  }
};

/**
 * Crear personal (Solo Admin)
 * @param {Object} personalData - Datos del personal
 * @param {string} personalData.nombre - Nombre
 * @param {string} personalData.apellido - Apellido
 * @param {string} personalData.rol - Rol (Piloto/Copiloto/Sobrecargo Jefe/Sobrecargo)
 * @param {string} personalData.licencia - Número de licencia
 * @param {string} personalData.certificacionesAeronave - Certificaciones CSV (ej: "Boeing 737,Boeing 787")
 * @param {number} personalData.tiempoDescansoMinutos - Tiempo de descanso en minutos
 */
export const crearPersonal = async (personalData) => {
  try {
    const response = await api.post('/Personal', personalData);
    return response.data;
  } catch (error) {
    console.error('Error en crearPersonal:', error);
    throw error;
  }
};

/**
 * Actualizar personal (Solo Admin)
 * @param {Object} personalData - Datos del personal a actualizar (debe incluir idPersonal)
 */
export const actualizarPersonal = async (personalData) => {
  try {
    const response = await api.put('/Personal', personalData);
    return response.data;
  } catch (error) {
    console.error('Error en actualizarPersonal:', error);
    throw error;
  }
};

/**
 * Eliminar personal (Solo Admin)
 * @param {number} id - ID del personal a eliminar
 */
export const eliminarPersonal = async (id) => {
  try {
    const response = await api.delete(`/Personal/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en eliminarPersonal:', error);
    throw error;
  }
};

// Constantes para roles
export const ROLES_PERSONAL = {
  PILOTO: 'Piloto',
  COPILOTO: 'Copiloto',
  SOBRECARGO_JEFE: 'Sobrecargo Jefe',
  SOBRECARGO: 'Sobrecargo'
};

// Constantes para estados
export const ESTADOS_PERSONAL = {
  DISPONIBLE: 'Disponible',
  EN_SERVICIO: 'En Servicio',
  DESCANSO: 'Descanso',
  INCAPACITADO: 'Incapacitado'
};
