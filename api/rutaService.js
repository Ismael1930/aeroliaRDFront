import api from './index';

/**
 * Obtener todas las rutas disponibles
 */
export const obtenerRutas = async () => {
  try {
    const response = await api.get('/ruta');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerRutas:', error);
    throw error;
  }
};

/**
 * Obtener información completa de la ruta entre dos aeropuertos (endpoint principal para el frontend)
 * Incluye duración, hora de llegada calculada y precios sugeridos
 * @param {string} origen - Código del aeropuerto de origen (ej: "SDQ")
 * @param {string} destino - Código del aeropuerto de destino (ej: "JFK")
 * @param {string} horaSalida - Hora de salida opcional para calcular hora de llegada (formato "HH:mm")
 * @returns {Promise<Object>} Información completa de la ruta
 * 
 * Ejemplo de respuesta exitosa:
 * {
 *   success: true,
 *   data: {
 *     origenCodigo: "SDQ",
 *     destinoCodigo: "JFK",
 *     duracionMinutos: 255,
 *     duracionFormato: "4h 15m",
 *     duracion: "04:15:00",
 *     rutaEncontrada: true,
 *     mensaje: "Duración: 4h 15m | Llegada: 2:45 PM",
 *     horaLlegadaCalculada: "14:45:00",
 *     horaLlegadaFormato: "2:45 PM",
 *     precioSugerido: 435.00,
 *     precioFormato: "$435.00",
 *     preciosPorClase: {
 *       economica: 435.00,
 *       ejecutiva: 535.00,
 *       primera: 635.00,
 *       economicaFormato: "$435.00",
 *       ejecutivaFormato: "$535.00",
 *       primeraFormato: "$635.00"
 *     },
 *     distanciaKm: 2540,
 *     tipoRuta: "Internacional"
 *   }
 * }
 */
export const obtenerDuracionRuta = async (origen, destino, horaSalida = null) => {
  try {
    const params = { origen, destino };
    if (horaSalida) {
      params.horaSalida = horaSalida;
    }
    const response = await api.get('/ruta/duracion', { params });
    return response.data;
  } catch (error) {
    // Si el recurso no existe en backend (404), retornar objeto indicando que no se encontró
    if (error.response && error.response.status === 404) {
      return {
        success: false,
        data: {
          rutaEncontrada: false,
          duracionMinutos: null,
          duracionFormato: null,
          horaLlegadaCalculada: null,
          precioSugerido: null,
          preciosPorClase: null
        }
      };
    }
    console.error('Error en obtenerDuracionRuta:', error);
    throw error;
  }
};

/**
 * Obtener horas disponibles para una ruta en una fecha específica
 * @param {string} origen - Código del aeropuerto de origen (ej: "SDQ")
 * @param {string} destino - Código del aeropuerto de destino (ej: "JFK")
 * @param {string} fecha - Fecha del vuelo (formato "YYYY-MM-DD")
 * @returns {Promise<Object>} Horas disponibles y ocupadas
 * 
 * Ejemplo de respuesta:
 * {
 *   success: true,
 *   data: {
 *     origenCodigo: "TEST",
 *     destinoCodigo: "SDQ",
 *     fecha: "2026-01-19",
 *     fechaFormato: "lunes, 19 de enero de 2026",
 *     capacidadPorHora: 1,
 *     origenNombre: "Aeropuerto de Prueba",
 *     horasDisponibles: [
 *       { hora: "05:00", horaFormato: "5:00 AM", valor: "05:00", horaLlegadaFormato: "5:30 AM", espaciosDisponibles: 1 }
 *     ],
 *     horasOcupadas: [
 *       { hora: "10:00", horaFormato: "10:00 AM", vuelosProgramados: 1, saturada: true, vuelosEnHora: ["TEST-1000"] }
 *     ],
 *     infoRuta: { duracionMinutos: 30, precioSugerido: 100 }
 *   }
 * }
 */
export const obtenerHorasDisponibles = async (origen, destino, fecha) => {
  try {
    const params = { origen, destino, fecha };
    const response = await api.get('/ruta/horas-disponibles', { params });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return {
        success: false,
        data: {
          horasDisponibles: [],
          horasOcupadas: [],
          infoRuta: null
        }
      };
    }
    console.error('Error en obtenerHorasDisponibles:', error);
    throw error;
  }
};

/**
 * Obtener rutas desde un aeropuerto de origen
 * @param {string} origen - Código del aeropuerto de origen (ej: "SDQ")
 */
export const obtenerRutasDesde = async (origen) => {
  try {
    const response = await api.get(`/ruta/desde/${origen}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerRutasDesde:', error);
    throw error;
  }
};

/**
 * Obtener rutas hacia un aeropuerto de destino
 * @param {string} destino - Código del aeropuerto de destino (ej: "JFK")
 */
export const obtenerRutasHacia = async (destino) => {
  try {
    const response = await api.get(`/ruta/hacia/${destino}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerRutasHacia:', error);
    throw error;
  }
};

/**
 * Obtener una ruta por ID
 * @param {number} id - ID de la ruta
 */
export const obtenerRutaPorId = async (id) => {
  try {
    const response = await api.get(`/ruta/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerRutaPorId:', error);
    throw error;
  }
};

/**
 * Crear una nueva ruta (Solo Admin)
 * @param {Object} rutaData - Datos de la ruta a crear
 */
export const crearRuta = async (rutaData) => {
  try {
    const response = await api.post('/ruta', rutaData);
    return response.data;
  } catch (error) {
    console.error('Error en crearRuta:', error);
    throw error;
  }
};

/**
 * Actualizar una ruta existente (Solo Admin)
 * @param {number} id - ID de la ruta
 * @param {Object} rutaData - Datos actualizados de la ruta
 */
export const actualizarRuta = async (id, rutaData) => {
  try {
    const response = await api.put(`/ruta/${id}`, rutaData);
    return response.data;
  } catch (error) {
    console.error('Error en actualizarRuta:', error);
    throw error;
  }
};

/**
 * Eliminar una ruta (Solo Admin)
 * @param {number} id - ID de la ruta
 */
export const eliminarRuta = async (id) => {
  try {
    const response = await api.delete(`/ruta/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en eliminarRuta:', error);
    throw error;
  }
};
