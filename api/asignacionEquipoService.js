import api from './index';

/**
 * Obtener todas las asignaciones equipo-aeronave (Solo Admin)
 */
export const obtenerTodasLasAsignaciones = async () => {
  try {
    const response = await api.get('/AsignacionEquipo');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerTodasLasAsignaciones:', error);
    throw error;
  }
};

/**
 * Obtener asignaciones por aeronave (Solo Admin)
 * @param {string} matricula - Matrícula de la aeronave
 */
export const obtenerAsignacionesPorAeronave = async (matricula) => {
  try {
    const response = await api.get(`/AsignacionEquipo/aeronave/${encodeURIComponent(matricula)}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerAsignacionesPorAeronave:', error);
    throw error;
  }
};

/**
 * Obtener asignaciones por equipo (Solo Admin)
 * @param {number} id - ID del equipo
 */
export const obtenerAsignacionesPorEquipo = async (id) => {
  try {
    const response = await api.get(`/AsignacionEquipo/equipo/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerAsignacionesPorEquipo:', error);
    throw error;
  }
};

/**
 * Asignar equipo a aeronave (Solo Admin)
 * @param {Object} asignacionData - Datos de la asignación
 * @param {number} asignacionData.idEquipo - ID del equipo
 * @param {string} asignacionData.matricula - Matrícula de la aeronave
 * @param {string} asignacionData.observaciones - Observaciones (opcional)
 */
export const asignarEquipoAAeronave = async (asignacionData) => {
  try {
    const response = await api.post('/AsignacionEquipo/asignar', asignacionData);
    return response.data;
  } catch (error) {
    console.error('Error en asignarEquipoAAeronave:', error);
    throw error;
  }
};

/**
 * Desasignar equipo de aeronave (Solo Admin)
 * @param {Object} desasignacionData - Datos para desasignar
 * @param {number} desasignacionData.idAsignacion - ID de la asignación
 * @param {string} desasignacionData.matricula - Matrícula de la aeronave (opcional)
 */
export const desasignarEquipo = async (desasignacionData) => {
  try {
    const response = await api.post('/AsignacionEquipo/desasignar', desasignacionData);
    return response.data;
  } catch (error) {
    console.error('Error en desasignarEquipo:', error);
    throw error;
  }
};

/**
 * Obtener resumen/estadísticas de asignaciones (Solo Admin)
 */
export const obtenerResumenAsignaciones = async () => {
  try {
    const response = await api.get('/AsignacionEquipo/resumen');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerResumenAsignaciones:', error);
    throw error;
  }
};

/**
 * Obtener aeronaves sin equipo asignado (Solo Admin)
 */
export const obtenerAeronavesSinEquipo = async () => {
  try {
    const response = await api.get('/AsignacionEquipo/aeronaves-sin-equipo');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerAeronavesSinEquipo:', error);
    throw error;
  }
};

/**
 * Obtener equipos sin asignación a aeronave (Solo Admin)
 */
export const obtenerEquiposSinAsignacion = async () => {
  try {
    const response = await api.get('/AsignacionEquipo/equipos-sin-asignacion');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerEquiposSinAsignacion:', error);
    throw error;
  }
};
