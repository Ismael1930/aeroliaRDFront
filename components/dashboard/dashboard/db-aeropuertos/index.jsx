'use client'

import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import { obtenerAeropuertos, obtenerCapacidadAeropuerto } from "@/api/aeropuertoService";

const GestionAeropuertos = () => {
  const [aeropuertos, setAeropuertos] = useState([]);
  const [capacidadAeropuertos, setCapacidadAeropuertos] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCapacidad, setLoadingCapacidad] = useState({});
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [aeropuertoSeleccionado, setAeropuertoSeleccionado] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null); // Nuevo estado para día seleccionado
  const [fechaInicio, setFechaInicio] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => {
    const treintaDias = new Date();
    treintaDias.setDate(treintaDias.getDate() + 30);
    return treintaDias.toISOString().split('T')[0];
  });

  useEffect(() => {
    cargarAeropuertos();
  }, []);

  const cargarAeropuertos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await obtenerAeropuertos();
      const aeropuertosData = Array.isArray(response) ? response : (response.data || []);
      setAeropuertos(aeropuertosData);
    } catch (error) {
      console.error('Error al cargar aeropuertos:', error);
      setError('Error al cargar los aeropuertos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const cargarCapacidadAeropuerto = async (codigo, forzarRecarga = false) => {
    if (capacidadAeropuertos[codigo] && !forzarRecarga) {
      setAeropuertoSeleccionado(codigo);
      setDiaSeleccionado(null); // Limpiar día seleccionado
      return;
    }

    try {
      setLoadingCapacidad(prev => ({ ...prev, [codigo]: true }));
      
      const response = await obtenerCapacidadAeropuerto(codigo, fechaInicio, fechaFin);
      
      if (response.success && response.data) {
        setCapacidadAeropuertos(prev => ({
          ...prev,
          [codigo]: response.data
        }));
      }
      
      setAeropuertoSeleccionado(codigo);
      setDiaSeleccionado(null); // Limpiar día seleccionado
    } catch (error) {
      console.error(`Error al cargar capacidad de ${codigo}:`, error);
      setError(`Error al cargar capacidad del aeropuerto ${codigo}`);
    } finally {
      setLoadingCapacidad(prev => ({ ...prev, [codigo]: false }));
    }
  };

  // Recargar cuando cambien las fechas
  const handleBuscarPorFechas = () => {
    if (aeropuertoSeleccionado) {
      // Limpiar caché para forzar recarga
      setCapacidadAeropuertos(prev => {
        const nuevo = { ...prev };
        delete nuevo[aeropuertoSeleccionado];
        return nuevo;
      });
      setDiaSeleccionado(null);
      cargarCapacidadAeropuerto(aeropuertoSeleccionado, true);
    }
  };

  // Filtrar aeropuertos
  const aeropuertosFiltrados = aeropuertos.filter(a =>
    a.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    a.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
    a.ciudad?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Obtener color según nivel de alerta
  const getColorNivelAlerta = (nivelAlerta) => {
    switch (nivelAlerta?.toUpperCase()) {
      case 'CRITICO':
        return { bg: '#ffebee', color: '#c62828', border: '#ef5350' };
      case 'ALTO':
        return { bg: '#fff3e0', color: '#e65100', border: '#ff9800' };
      case 'MEDIO':
        return { bg: '#fffde7', color: '#f57f17', border: '#ffeb3b' };
      case 'BAJO':
      default:
        return { bg: '#e8f5e9', color: '#2e7d32', border: '#4caf50' };
    }
  };

  // Obtener color según porcentaje de uso por hora
  const getColorPorcentajeHora = (porcentaje, sobreCapacidad) => {
    if (sobreCapacidad || porcentaje >= 100) return { bg: '#ffebee', color: '#c62828', border: '#ef5350' };
    if (porcentaje >= 80) return { bg: '#fff3e0', color: '#e65100', border: '#ff9800' };
    if (porcentaje >= 60) return { bg: '#fffde7', color: '#f57f17', border: '#ffeb3b' };
    return { bg: '#e8f5e9', color: '#2e7d32', border: '#4caf50' };
  };

  // Obtener icono según nivel de alerta
  const getIconoAlerta = (nivelAlerta) => {
    switch (nivelAlerta?.toUpperCase()) {
      case 'CRITICO': return '🔴';
      case 'ALTO': return '🟠';
      case 'MEDIO': return '🟡';
      case 'BAJO':
      default: return '🟢';
    }
  };

  // Datos del aeropuerto seleccionado
  const datosCapacidad = aeropuertoSeleccionado ? capacidadAeropuertos[aeropuertoSeleccionado] : null;

  return (
    <>
      <div className="header-margin"></div>
      <Header />

      <div className="dashboard">
        <div className="dashboard__sidebar bg-white scroll-bar-1">
          <Sidebar />
        </div>

        <div className="dashboard__main">
          <div className="dashboard__content bg-light-2">
            <div className="row y-gap-20 justify-between items-end pb-30">
              <div className="col-auto">
                <h1 className="text-30 lh-14 fw-600">Capacidad de Aeropuertos</h1>
                <div className="text-15 text-light-1">
                  Monitoreo de vuelos programados por día
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="py-30 px-30 rounded-4 bg-white shadow-3 mb-30">
              <div className="row y-gap-20">
                <div className="col-md-4">
                  <label className="text-14 fw-500 mb-10 d-block">Buscar Aeropuerto</label>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, código o ciudad"
                    className="form-control"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="text-14 fw-500 mb-10 d-block">Fecha Inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="text-14 fw-500 mb-10 d-block">Fecha Fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    min={fechaInicio}
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div className="col-md-2 d-flex items-end">
                  <button 
                    className="button h-50 px-24 -dark-1 bg-blue-1 text-white w-100"
                    onClick={handleBuscarPorFechas}
                    disabled={!aeropuertoSeleccionado}
                  >
                    <i className="icon-search text-16 mr-10"></i>
                    Buscar
                  </button>
                </div>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="py-20 px-30 rounded-4 bg-red-1-05 mb-30">
                <div className="d-flex items-center">
                  <i className="icon-alert-circle text-24 text-red-1 mr-10"></i>
                  <div className="text-15 text-red-1">{error}</div>
                </div>
              </div>
            )}

            <div className="row y-gap-30" style={{ alignItems: 'stretch' }}>
              {/* Lista de Aeropuertos */}
              <div className="col-xl-4 col-lg-5 d-flex">
                <div className="py-30 px-30 rounded-4 bg-white shadow-3 w-100" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                  <h3 className="text-18 fw-600 mb-20">Aeropuertos</h3>
                  
                  {loading ? (
                    <div className="text-center py-40">
                      <div className="spinner-border text-blue-1"></div>
                    </div>
                  ) : (
                    <div className="overflow-scroll scroll-bar-1" style={{ flex: 1, overflowY: 'auto' }}>
                      {aeropuertosFiltrados.map((aeropuerto, index) => (
                        <div 
                          key={aeropuerto.codigo || `aeropuerto-${index}`}
                          className={`py-15 px-15 rounded-4 mb-10 ${
                            aeropuertoSeleccionado === aeropuerto.codigo 
                              ? 'bg-blue-1 text-white' 
                              : 'bg-light-2'
                          }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => cargarCapacidadAeropuerto(aeropuerto.codigo)}
                        >
                          <div className="d-flex justify-between items-center">
                            <div>
                              <div className="fw-600">{aeropuerto.codigo}</div>
                              <div className={`text-14 ${aeropuertoSeleccionado === aeropuerto.codigo ? 'text-white' : 'text-light-1'}`}>
                                {aeropuerto.nombre}
                              </div>
                              <div className={`text-12 ${aeropuertoSeleccionado === aeropuerto.codigo ? 'text-white' : 'text-light-1'}`}>
                                {aeropuerto.ciudad}, {aeropuerto.pais}
                              </div>
                            </div>
                            {loadingCapacidad[aeropuerto.codigo] && (
                              <div className="spinner-border spinner-border-sm text-blue-1"></div>
                            )}
                          </div>
                        </div>
                      ))}

                      {aeropuertosFiltrados.length === 0 && (
                        <div className="text-center py-20 text-light-1">
                          No se encontraron aeropuertos
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Detalle de Capacidad */}
              <div className="col-xl-8 col-lg-7 d-flex">
                {datosCapacidad ? (
                  <div className="py-30 px-30 rounded-4 bg-white shadow-3 w-100 overflow-scroll scroll-bar-1" style={{ height: '600px' }}>
                    {/* Header */}
                    <div className="d-flex justify-between items-center mb-30">
                      <div>
                        <h3 className="text-22 fw-600">
                          {datosCapacidad.codigo} - {datosCapacidad.nombre}
                        </h3>
                        <div className="text-14 text-light-1">
                          {datosCapacidad.ciudad}, {datosCapacidad.pais}
                        </div>
                        <div className="d-flex gap-20 mt-10">
                          <div className="text-13">
                            <span className="text-light-1">Capacidad/hora:</span>
                            <span className="fw-600 text-blue-1 ml-5">{datosCapacidad.capacidadPorHora || 35}</span>
                            <span className="text-light-1 ml-5">vuelos</span>
                          </div>
                          <div className="text-13" style={{ borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
                            <span className="text-light-1">Capacidad/día:</span>
                            <span className="fw-600 text-blue-1 ml-5">{datosCapacidad.capacidadDiaria || 0}</span>
                            <span className="text-light-1 ml-5">vuelos</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-14 text-light-1">Días con vuelos</div>
                        <div className="text-30 fw-600 text-blue-1">{datosCapacidad.totalDiasConVuelos || 0}</div>
                      </div>
                    </div>

                    {/* Estadísticas Generales */}
                    <div className="row y-gap-10 mb-30">
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 bg-blue-1-05 text-center">
                          <div className="text-26 fw-600 text-blue-1">{datosCapacidad.totalVuelos || 0}</div>
                          <div className="text-12 text-light-1">Total Vuelos</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 text-center" style={{ backgroundColor: '#e8f5e9' }}>
                          <div className="text-26 fw-600 text-green-2">{datosCapacidad.totalVuelosSalida || 0}</div>
                          <div className="text-12 text-light-1">Salidas</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 text-center" style={{ backgroundColor: '#fff3e0' }}>
                          <div className="text-26 fw-600" style={{ color: '#e65100' }}>{datosCapacidad.totalVuelosLlegada || 0}</div>
                          <div className="text-12 text-light-1">Llegadas</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 text-center" style={{ backgroundColor: datosCapacidad.diasSobreCapacidad > 0 ? '#ffebee' : '#e3f2fd' }}>
                          <div className="text-26 fw-600" style={{ color: datosCapacidad.diasSobreCapacidad > 0 ? '#c62828' : '#1565c0' }}>
                            {datosCapacidad.diasSobreCapacidad || 0}
                          </div>
                          <div className="text-12 text-light-1">Días Saturados</div>
                        </div>
                      </div>
                    </div>

                    {/* Info de uso promedio */}
                    <div className="d-flex gap-30 mb-20 py-15 px-20 rounded-4 bg-light-2">
                      <div>
                        <span className="text-light-1">Uso promedio:</span>
                        <span className="fw-600 text-dark-1 ml-5">{datosCapacidad.porcentajeUsoPromedio?.toFixed(1) || 0}%</span>
                      </div>
                      <div style={{ borderLeft: '1px solid #ccc', paddingLeft: '30px' }}>
                        <span className="text-light-1">Período:</span>
                        <span className="fw-600 text-dark-1 ml-5">{fechaInicio} al {fechaFin}</span>
                      </div>
                    </div>

                    {/* Cuadrícula de Días con Vuelos */}
                    <div className="d-flex justify-between items-center mb-15">
                      <div className="text-16 fw-600">Calendario de Vuelos Programados</div>
                      {diaSeleccionado && (
                        <button 
                          className="button -blue-1 text-blue-1 text-14"
                          onClick={() => setDiaSeleccionado(null)}
                        >
                          <i className="icon-arrow-left mr-5"></i>
                          Volver al calendario
                        </button>
                      )}
                    </div>
                    
                    {/* Vista de Detalle por Hora (cuando se selecciona un día) */}
                    {diaSeleccionado ? (
                      <div>
                        {/* Encabezado del día seleccionado */}
                        <div className="py-20 px-25 rounded-4 mb-20" style={{ 
                          backgroundColor: getColorNivelAlerta(diaSeleccionado.nivelAlerta).bg,
                          border: `2px solid ${getColorNivelAlerta(diaSeleccionado.nivelAlerta).border}`
                        }}>
                          <div className="row items-center">
                            {/* Fecha y día */}
                            <div className="col-md-4">
                              <div className="text-18 fw-600" style={{ color: getColorNivelAlerta(diaSeleccionado.nivelAlerta).color }}>
                                {diaSeleccionado.nombreDiaSemana?.charAt(0).toUpperCase() + diaSeleccionado.nombreDiaSemana?.slice(1)}
                              </div>
                              <div className="text-13 text-light-1">{diaSeleccionado.fechaFormato}</div>
                              <div className="mt-10">
                                <span 
                                  className="text-11 fw-600 px-10 py-4 rounded-100"
                                  style={{ backgroundColor: getColorNivelAlerta(diaSeleccionado.nivelAlerta).border, color: 'white' }}
                                >
                                  {diaSeleccionado.nivelAlerta || 'BAJO'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Estadísticas del día */}
                            <div className="col-md-8">
                              <div className="row text-center">
                                <div className="col-3">
                                  <div className="text-22 fw-700" style={{ color: getColorNivelAlerta(diaSeleccionado.nivelAlerta).color }}>
                                    {diaSeleccionado.totalVuelos}
                                  </div>
                                  <div className="text-11 text-light-1">Total Vuelos</div>
                                </div>
                                <div className="col-3">
                                  <div className="text-22 fw-600 text-green-2">{diaSeleccionado.vuelosSalida}</div>
                                  <div className="text-11 text-light-1">Salidas</div>
                                </div>
                                <div className="col-3">
                                  <div className="text-22 fw-600" style={{ color: '#e65100' }}>{diaSeleccionado.vuelosLlegada}</div>
                                  <div className="text-11 text-light-1">Llegadas</div>
                                </div>
                                <div className="col-3">
                                  <div className="text-22 fw-600 text-blue-1">{diaSeleccionado.porcentajeUso?.toFixed(1) || 0}%</div>
                                  <div className="text-11 text-light-1">Uso del día</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tabla de uso por hora */}
                        <div className="text-14 fw-600 mb-10">Desglose por Hora</div>
                        {diaSeleccionado.usoPorHora && diaSeleccionado.usoPorHora.length > 0 ? (
                          <div className="overflow-scroll scroll-bar-1">
                            <table className="table-3 -border-bottom col-12">
                              <thead className="bg-light-2">
                                <tr>
                                  <th>Hora</th>
                                  <th>Salidas</th>
                                  <th>Llegadas</th>
                                  <th>Total</th>
                                  <th>Capacidad</th>
                                  <th>% Uso</th>
                                  <th>Estado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {diaSeleccionado.usoPorHora.map((hora, index) => {
                                  const coloresHora = getColorPorcentajeHora(hora.porcentajeUsoHora, hora.sobreCapacidadHora);
                                  return (
                                    <tr key={`hora-${hora.hora}-${index}`}>
                                      <td className="fw-500">{hora.horaFormato || `${hora.hora.toString().padStart(2, '0')}:00 - ${hora.hora.toString().padStart(2, '0')}:59`}</td>
                                      <td>
                                        <span className="fw-500 text-green-2">{hora.vuelosSalida}</span>
                                      </td>
                                      <td>
                                        <span className="fw-500" style={{ color: '#e65100' }}>{hora.vuelosLlegada}</span>
                                      </td>
                                      <td>
                                        <span className="fw-600">{hora.totalVuelos}</span>
                                      </td>
                                      <td>
                                        <span className="text-light-1">{hora.capacidadDisponibleHora || 0} / {hora.capacidadPorHora || 35}</span>
                                      </td>
                                      <td>
                                        <div className="d-flex items-center gap-10">
                                          <div className="rounded-4" style={{ width: '50px', height: '8px', backgroundColor: '#eee', overflow: 'hidden' }}>
                                            <div style={{ 
                                              width: `${Math.min(hora.porcentajeUsoHora || 0, 100)}%`, 
                                              height: '100%', 
                                              backgroundColor: coloresHora.border 
                                            }}></div>
                                          </div>
                                          <span className="text-13 fw-500" style={{ color: coloresHora.color }}>
                                            {hora.porcentajeUsoHora?.toFixed(1) || 0}%
                                          </span>
                                        </div>
                                      </td>
                                      <td>
                                        {hora.sobreCapacidadHora ? (
                                          <span className="rounded-100 py-4 px-10 text-center text-11 fw-600" style={{ backgroundColor: '#c62828', color: 'white' }}>
                                            ⚠️ SATURADO
                                          </span>
                                        ) : (
                                          <span 
                                            className="rounded-100 py-4 px-10 text-center text-11 fw-500"
                                            style={{ backgroundColor: coloresHora.bg, color: coloresHora.color, border: `1px solid ${coloresHora.border}` }}
                                          >
                                            {hora.porcentajeUsoHora >= 80 ? 'Alto' : hora.porcentajeUsoHora >= 60 ? 'Medio' : 'Bajo'}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-30 rounded-4 bg-light-2">
                            <div className="text-14 text-light-1">No hay desglose por hora disponible</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Vista de Calendario (cuadrícula de días) */
                      datosCapacidad.diasConVuelos && datosCapacidad.diasConVuelos.length > 0 ? (
                        <div className="row y-gap-15" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                          {datosCapacidad.diasConVuelos.map((dia, index) => {
                            const colores = getColorNivelAlerta(dia.nivelAlerta);
                            const horasConVuelos = dia.usoPorHora?.length || 0;
                            // Obtener horas de salida y llegada
                            const horasSalida = dia.usoPorHora?.filter(h => h.vuelosSalida > 0).map(h => `${h.hora.toString().padStart(2, '0')}:00`) || [];
                            const horasLlegada = dia.usoPorHora?.filter(h => h.vuelosLlegada > 0).map(h => `${h.hora.toString().padStart(2, '0')}:00`) || [];
                            return (
                              <div 
                                key={`dia-${dia.fecha}-${index}`}
                                className="rounded-4"
                                style={{ 
                                  backgroundColor: colores.bg, 
                                  border: `2px solid ${colores.border}`,
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}
                                onClick={() => setDiaSeleccionado(dia)}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-4px)';
                                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                }}
                              >
                                {/* Header con nivel de alerta */}
                                <div className="d-flex justify-between items-center px-15 py-10" style={{ borderBottom: `1px solid ${colores.border}40` }}>
                                  <div>
                                    <div className="text-15 fw-600" style={{ color: colores.color }}>
                                      {dia.nombreDiaSemana?.charAt(0).toUpperCase() + dia.nombreDiaSemana?.slice(1) || dia.fechaFormato?.split(',')[0]}
                                    </div>
                                    <div className="text-12 text-light-1">
                                      {dia.fechaFormato || new Date(dia.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                  </div>
                                  <span 
                                    className="text-10 fw-600 px-10 py-4 rounded-100"
                                    style={{ backgroundColor: colores.border, color: 'white' }}
                                  >
                                    {dia.nivelAlerta || 'BAJO'}
                                  </span>
                                </div>
                                
                                {/* Contenido */}
                                <div className="px-15 py-15">
                                  {/* Total de vuelos */}
                                  <div className="text-center mb-15">
                                    <div className="text-30 fw-700" style={{ color: colores.color }}>{dia.totalVuelos}</div>
                                    <div className="text-11 text-light-1">vuelos programados</div>
                                  </div>
                                  
                                  {/* Detalle salidas/llegadas */}
                                  <div className="d-flex justify-between mb-15 py-10 px-10 rounded-4" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
                                    <div className="text-center" style={{ flex: 1 }}>
                                      <div className="text-20 fw-600 text-green-2">{dia.vuelosSalida}</div>
                                      <div className="text-10 text-light-1">Salidas</div>
                                      {horasSalida.length > 0 && (
                                        <div className="text-10 text-light-1 mt-5">{horasSalida.join(', ')}</div>
                                      )}
                                    </div>
                                    <div style={{ width: '1px', backgroundColor: '#ddd' }}></div>
                                    <div className="text-center" style={{ flex: 1 }}>
                                      <div className="text-20 fw-600" style={{ color: '#e65100' }}>{dia.vuelosLlegada}</div>
                                      <div className="text-10 text-light-1">Llegadas</div>
                                      {horasLlegada.length > 0 && (
                                        <div className="text-10 text-light-1 mt-5">{horasLlegada.join(', ')}</div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Barra de progreso con porcentaje */}
                                  <div className="mb-10">
                                    <div className="d-flex justify-between items-center mb-5">
                                      <span className="text-11 text-light-1">Uso de capacidad</span>
                                      <span className="text-12 fw-600" style={{ color: colores.color }}>
                                        {dia.porcentajeUso?.toFixed(1) || 0}%
                                      </span>
                                    </div>
                                    <div className="rounded-100" style={{ height: '8px', backgroundColor: 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                      <div style={{ 
                                        width: `${Math.min(dia.porcentajeUso || 0, 100)}%`, 
                                        height: '100%', 
                                        backgroundColor: colores.border,
                                        transition: 'width 0.3s ease'
                                      }}></div>
                                    </div>
                                  </div>
                                  
                                  {/* Información adicional */}
                                  <div className="d-flex justify-between items-center pt-10" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                                    <span className="text-10 text-light-1">
                                      <i className="icon-clock mr-5"></i>
                                      {horasConVuelos} {horasConVuelos === 1 ? 'hora' : 'horas'} con vuelos
                                    </span>
                                    <span className="text-10 text-blue-1 fw-500">
                                      Ver detalle →
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Indicador de sobre capacidad */}
                                {dia.sobreCapacidad && (
                                  <div className="text-center py-8 rounded-4" style={{ backgroundColor: '#c62828', color: 'white', borderRadius: '0 0 4px 4px' }}>
                                    <span className="text-11 fw-600">⚠️ SOBRE CAPACIDAD</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-40 rounded-4 bg-light-2">
                          <i className="icon-calendar text-40 text-light-1 mb-15"></i>
                          <div className="text-16 text-light-1">No hay vuelos programados en este período</div>
                          <div className="text-14 text-light-1 mt-5">Selecciona otras fechas para buscar</div>
                        </div>
                      )
                    )}

                    {/* Leyenda */}
                    <div className="d-flex flex-wrap gap-20 mt-20 pt-20 border-top-light">
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#4caf50' }}></div>
                        <span className="text-12 text-light-1">Bajo (0-60%)</span>
                      </div>
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#ffeb3b' }}></div>
                        <span className="text-12 text-light-1">Medio (61-85%)</span>
                      </div>
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#ff9800' }}></div>
                        <span className="text-12 text-light-1">Alto (86-100%)</span>
                      </div>
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#f44336' }}></div>
                        <span className="text-12 text-light-1">Crítico (&gt;100%)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-30 px-30 rounded-4 bg-white shadow-3 w-100" style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="text-center">
                      <i className="icon-location text-60 text-light-1 mb-20"></i>
                      <h3 className="text-18 fw-500 text-light-1">
                        Selecciona un aeropuerto
                      </h3>
                      <p className="text-14 text-light-1 mt-10">
                        Haz clic en un aeropuerto para ver sus vuelos programados por día
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default GestionAeropuertos;
