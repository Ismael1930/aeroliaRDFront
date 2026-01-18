import api from './index';

/**
 * Obtener todos los aeropuertos
 */
export const obtenerAeropuertos = async () => {
  try {
    const response = await api.get('/aeropuerto');
    return response.data;
  } catch (error) {
    console.error('Error en obtenerAeropuertos:', error);
    throw error;
  }
};

/**
 * Obtener aeropuerto por código
 * @param {string} codigo - Código del aeropuerto (ej: "SDQ")
 */
export const obtenerAeropuertoPorCodigo = async (codigo) => {
  try {
    const response = await api.get(`/aeropuerto/${codigo}`);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerAeropuertoPorCodigo:', error);
    throw error;
  }
};

/**
 * Obtener capacidad de un aeropuerto por código
 * @param {string} codigo - Código del aeropuerto (ej: "SDQ")
 * @param {string} fechaInicio - Fecha inicio del período (opcional, formato YYYY-MM-DD)
 * @param {string} fechaFin - Fecha fin del período (opcional, formato YYYY-MM-DD)
 */
export const obtenerCapacidadAeropuerto = async (codigo, fechaInicio = null, fechaFin = null) => {
  try {
    let url = `/aeropuerto/${codigo}/capacidad`;
    const params = new URLSearchParams();
    
    if (fechaInicio) {
      params.append('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params.append('fechaFin', fechaFin);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error en obtenerCapacidadAeropuerto:', error);
    throw error;
  }
};

/**
 * Obtener información completa de la ruta entre dos aeropuertos
 * Usa el endpoint de Ruta: GET /ruta/duracion?origen=XXX&destino=YYY
 * Incluye duración, hora de llegada calculada y precios sugeridos
 * @param {string} origen - Código del aeropuerto de origen (ej: "SDQ")
 * @param {string} destino - Código del aeropuerto de destino (ej: "JFK")
 * @param {string} horaSalida - Hora de salida opcional para calcular llegada (formato "HH:mm")
 * @returns {Promise<Object>} Información completa de la ruta incluyendo duración, hora llegada y precios
 */
export const obtenerDuracionEntreAeropuertos = async (origen, destino, horaSalida = null) => {
  try {
    // Usar el endpoint de Ruta
    const params = { origen, destino };
    if (horaSalida) {
      params.horaSalida = horaSalida;
    }
    const response = await api.get('/ruta/duracion', { params });
    const data = response.data;
    
    // Adaptar respuesta del nuevo formato al formato esperado por el componente
    if (data.success && data.data?.rutaEncontrada) {
      return {
        success: true,
        duracion: data.data.duracionMinutos,
        duracionFormato: data.data.duracionFormato,
        // Campos de hora - usar horaLlegadaFormato para formato 12h (ej: "12:33 AM")
        horaLlegadaCalculada: data.data.horaLlegadaCalculada, // Formato 24h - "00:33:00"
        horaLlegadaFormato: data.data.horaLlegadaFormato,     // Formato 12h - "12:33 AM"
        precioSugerido: data.data.precioSugerido,
        precioFormato: data.data.precioFormato,
        preciosPorClase: data.data.preciosPorClase,
        distanciaKm: data.data.distanciaKm,
        tipoRuta: data.data.tipoRuta,
        mensaje: data.data.mensaje
      };
    } else if (data.success && !data.data?.rutaEncontrada) {
      // Ruta no encontrada pero sin error
      return null;
    }
    
    // Retornar respuesta original si tiene otro formato
    return data;
  } catch (error) {
    // Si el recurso no existe en backend (404), retornar null en lugar de lanzar
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error en obtenerDuracionEntreAeropuertos:', error);
    throw error;
  }
};
