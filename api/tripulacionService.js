/**
 * @deprecated Este archivo está obsoleto. Usar los nuevos servicios:
 * - personalService.js para gestión de personal
 * - equipoService.js para gestión de equipos
 * - asignacionEquipoService.js para asignaciones equipo-aeronave
 */

// Re-exportar desde los nuevos servicios para compatibilidad temporal
export {
  obtenerTodoElPersonal as obtenerTodaLaTripulacion,
  crearPersonal as crearTripulacion,
  actualizarPersonal as actualizarTripulacion,
  eliminarPersonal as eliminarTripulacion,
  obtenerPersonalPorId as obtenerDetalleTripulacion,
  obtenerPersonalPorRol as obtenerTripulacionPorRol
} from './personalService';

export {
  obtenerTodosLosEquipos,
  obtenerEquipoPorId,
  obtenerEquiposDisponibles,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
  validarEquipo,
  marcarEquipoEnServicio,
  marcarEquipoEnDescanso,
  actualizarEstadosEquipos,
  ESTADOS_EQUIPO
} from './equipoService';

export {
  obtenerTodasLasAsignaciones,
  obtenerAsignacionesPorAeronave,
  obtenerAsignacionesPorEquipo,
  asignarEquipoAAeronave,
  desasignarEquipo,
  obtenerResumenAsignaciones,
  obtenerAeronavesSinEquipo,
  obtenerEquiposSinAsignacion
} from './asignacionEquipoService';

export {
  ROLES_PERSONAL,
  ESTADOS_PERSONAL
} from './personalService';
