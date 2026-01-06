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
