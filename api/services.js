/**
 * Archivo central de exportación de todos los servicios de la API
 * 
 * Uso:
 * import { vueloService, aeropuertoService, authService } from '@/api/services';
 * 
 * O importar servicios específicos:
 * import { buscarVuelos, obtenerAeropuertos } from '@/api/services';
 */

// Autenticación
export * from './authService';
export { authService } from './authService';

// Vuelos
export * as vueloService from './vueloService';
export { buscarVuelos, obtenerVueloPorId } from './vueloService';

// Aeropuertos
export * as aeropuertoService from './aeropuertoService';
export { obtenerAeropuertos, obtenerAeropuertoPorCodigo } from './aeropuertoService';

// Clientes
export * as clienteService from './clienteService';
export {
  listarClientes,
  obtenerClientePorId,
  obtenerClienteConReservas,
  obtenerClientePorUserId,
  obtenerClientePorEmail,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from './clienteService';

// Reservas
export * as reservaService from './reservaService';
export {
  crearReserva,
  obtenerReservaPorCodigo,
  obtenerReservasCliente,
  modificarReserva,
  cancelarReserva
} from './reservaService';

// Pasajeros
export * as pasajeroService from './pasajeroService';
export {
  listarPasajeros,
  obtenerPasajeroPorId,
  crearPasajero,
  actualizarPasajero,
  eliminarPasajero
} from './pasajeroService';

// Facturas
export * as facturaService from './facturaService';
export {
  obtenerFacturaPorCodigo,
  obtenerFacturaPorReserva,
  procesarPago
} from './facturaService';

// Equipaje
export * as equipajeService from './equipajeService';
export {
  obtenerEquipajesPasajero,
  registrarEquipaje
} from './equipajeService';

// Estado de Vuelo
export * as estadoVueloService from './estadoVueloService';
export {
  obtenerEstadoVuelo,
  actualizarEstadoVuelo
} from './estadoVueloService';

// Notificaciones
export * as notificacionService from './notificacionService';
export {
  obtenerNotificacionesCliente,
  marcarNotificacionLeida
} from './notificacionService';

// Tickets de Soporte
export * as ticketSoporteService from './ticketSoporteService';
export {
  obtenerTicketsCliente,
  crearTicketSoporte,
  cerrarTicket
} from './ticketSoporteService';

// Utilidades de sesión
export * from './sessionUtils';
