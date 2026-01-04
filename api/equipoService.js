import api from './index';

/**
 * Obtener todos los equipos (Solo Admin)
 */
export const obtenerTodosLosEquipos = async () => {
  try {
    const response = await api.get('/Equipo');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerTodosLosEquipos:', error);
    throw error;
  }
};

/**
 * Obtener equipo por ID con detalle (Solo Admin)
 * @param {number} id - ID del equipo
 */
export const obtenerEquipoPorId = async (id) => {
  try {
    const response = await api.get(`/Equipo/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerEquipoPorId:', error);
    throw error;
  }
};

/**
 * Obtener equipos disponibles (Solo Admin)
 */
export const obtenerEquiposDisponibles = async () => {
  try {
    const response = await api.get('/Equipo/disponibles');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerEquiposDisponibles:', error);
    throw error;
  }
};

/**
 * Crear equipo (Solo Admin)
 * @param {Object} equipoData - Datos del equipo
 * @param {string} equipoData.nombre - Nombre del equipo
 * @param {string} equipoData.codigo - Código único del equipo
 * @param {number[]} equipoData.idsPersonal - Array de IDs del personal a asignar
 */
export const crearEquipo = async (equipoData) => {
  try {
    const response = await api.post('/Equipo', equipoData);
    return response.data;
  } catch (error) {
    console.error('Error en crearEquipo:', error);
    throw error;
  }
};

/**
 * Actualizar equipo (Solo Admin)
 * @param {Object} equipoData - Datos del equipo a actualizar (debe incluir idEquipo)
 */
export const actualizarEquipo = async (equipoData) => {
  try {
    const response = await api.put('/Equipo', equipoData);
    return response.data;
  } catch (error) {
    console.error('Error en actualizarEquipo:', error);
    throw error;
  }
};

/**
 * Eliminar equipo (Solo Admin)
 * @param {number} id - ID del equipo a eliminar
 */
export const eliminarEquipo = async (id) => {
  try {
    const response = await api.delete(`/Equipo/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en eliminarEquipo:', error);
    throw error;
  }
};

/**
 * Validar composición del equipo (Solo Admin)
 * @param {Object} equipoData - Datos del equipo a validar
 */
export const validarEquipo = async (equipoData) => {
  try {
    const response = await api.post('/Equipo/validar', equipoData);
    return response.data;
  } catch (error) {
    console.error('Error en validarEquipo:', error);
    throw error;
  }
};

/**
 * Marcar equipo en servicio (Solo Admin)
 * @param {number} id - ID del equipo
 */
export const marcarEquipoEnServicio = async (id) => {
  try {
    const response = await api.post(`/Equipo/${id}/en-servicio`);
    return response.data;
  } catch (error) {
    console.error('Error en marcarEquipoEnServicio:', error);
    throw error;
  }
};

/**
 * Marcar equipo en descanso (Solo Admin)
 * @param {number} id - ID del equipo
 * @param {string} fechaHoraDescanso - Fecha y hora de inicio de descanso (ISO format)
 */
export const marcarEquipoEnDescanso = async (id, fechaHoraDescanso) => {
  try {
    const response = await api.post(`/Equipo/${id}/descanso`, JSON.stringify(fechaHoraDescanso), {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error en marcarEquipoEnDescanso:', error);
    throw error;
  }
};

/**
 * Actualizar estados de equipos automáticamente (Solo Admin)
 */
export const actualizarEstadosEquipos = async () => {
  try {
    const response = await api.post('/Equipo/actualizar-estados');
    return response.data;
  } catch (error) {
    console.error('Error en actualizarEstadosEquipos:', error);
    throw error;
  }
};

// Constantes para estados de equipo
export const ESTADOS_EQUIPO = {
  DISPONIBLE: 'Disponible',
  EN_SERVICIO: 'En Servicio',
  DESCANSO: 'Descanso',
  INCOMPLETO: 'Incompleto'
};
