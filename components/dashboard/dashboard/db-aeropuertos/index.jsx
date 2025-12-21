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

  const cargarCapacidadAeropuerto = async (codigo) => {
    if (capacidadAeropuertos[codigo]) {
      setAeropuertoSeleccionado(codigo);
      return;
    }

    try {
      setLoadingCapacidad(prev => ({ ...prev, [codigo]: true }));
      
      const response = await obtenerCapacidadAeropuerto(codigo);
      
      if (response.success && response.data) {
        setCapacidadAeropuertos(prev => ({
          ...prev,
          [codigo]: response.data
        }));
      }
      
      setAeropuertoSeleccionado(codigo);
    } catch (error) {
      console.error(`Error al cargar capacidad de ${codigo}:`, error);
      setError(`Error al cargar capacidad del aeropuerto ${codigo}`);
    } finally {
      setLoadingCapacidad(prev => ({ ...prev, [codigo]: false }));
    }
  };

  // Filtrar aeropuertos
  const aeropuertosFiltrados = aeropuertos.filter(a =>
    a.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    a.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
    a.ciudad?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Obtener color según porcentaje de uso
  const getColorOcupacion = (porcentaje, sobreCapacidad) => {
    if (sobreCapacidad || porcentaje >= 100) return 'bg-red-3 text-dark-1';
    if (porcentaje >= 80) return 'bg-yellow-4 text-dark-1';
    if (porcentaje >= 50) return 'bg-blue-1-05 text-dark-1';
    return 'bg-green-1 text-dark-1';
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
                  Monitoreo de slots y capacidad por hora
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="py-30 px-30 rounded-4 bg-white shadow-3 mb-30">
              <div className="row y-gap-20">
                <div className="col-12">
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
                          Capacidad: {datosCapacidad.capacidadPorHora} vuelos/hora
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas Generales */}
                    <div className="row y-gap-10 mb-30">
                      <div className="col-md-4">
                        <div className="py-20 px-20 rounded-4 bg-blue-1-05 text-center">
                          <div className="text-30 fw-600 text-blue-1">{datosCapacidad.totalVuelos}</div>
                          <div className="text-14 text-light-1">Total Vuelos</div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="py-20 px-20 rounded-4 text-center" style={{ backgroundColor: '#e8f5e9' }}>
                          <div className="text-30 fw-600 text-green-2">{datosCapacidad.totalVuelosSalida}</div>
                          <div className="text-14 text-light-1">Salidas</div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="py-20 px-20 rounded-4 text-center" style={{ backgroundColor: '#fff3e0' }}>
                          <div className="text-30 fw-600" style={{ color: '#e65100' }}>{datosCapacidad.totalVuelosLlegada}</div>
                          <div className="text-14 text-light-1">Llegadas</div>
                        </div>
                      </div>
                    </div>

                    {/* Tabla de Uso por Hora */}
                    <div className="text-16 fw-600 mb-15">Uso por Hora</div>
                    <div className="overflow-scroll scroll-bar-1">
                      <table className="table-3 -border-bottom col-12">
                        <thead className="bg-light-2">
                          <tr>
                            <th>Hora</th>
                            <th>Salidas</th>
                            <th>Llegadas</th>
                            <th>% Uso Salidas</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datosCapacidad.usoPorHora?.map((hora, index) => (
                            <tr key={`hora-${hora.hora}-${index}`}>
                              <td className="fw-500">
                                {hora.hora.toString().padStart(2, '0')}:00 - {hora.hora.toString().padStart(2, '0')}:59
                              </td>
                              <td>
                                <span className="fw-500">{hora.vuelosSalida}</span>
                                <span className="text-light-1"> / {datosCapacidad.capacidadPorHora}</span>
                              </td>
                              <td>
                                <span className="fw-500">{hora.vuelosLlegada}</span>
                                <span className="text-light-1"> / {datosCapacidad.capacidadPorHora}</span>
                              </td>
                              <td>
                                <div className="d-flex items-center gap-10">
                                  <div 
                                    className="rounded-4" 
                                    style={{ 
                                      width: '60px', 
                                      height: '8px', 
                                      backgroundColor: '#eee',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <div 
                                      style={{ 
                                        width: `${Math.min(hora.porcentajeUsoSalida, 100)}%`, 
                                        height: '100%',
                                        backgroundColor: hora.sobreCapacidadSalida ? '#f44336' : 
                                          hora.porcentajeUsoSalida >= 80 ? '#ff9800' : 
                                          hora.porcentajeUsoSalida >= 50 ? '#2196f3' : '#4caf50'
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-14">{hora.porcentajeUsoSalida?.toFixed(0)}%</span>
                                </div>
                              </td>
                              <td>
                                <span className={`rounded-100 py-4 px-10 text-center text-12 fw-500 ${
                                  getColorOcupacion(hora.porcentajeUsoSalida, hora.sobreCapacidadSalida)
                                }`}>
                                  {hora.sobreCapacidadSalida ? '⚠️ Saturado' : 
                                   hora.porcentajeUsoSalida >= 80 ? 'Alto' :
                                   hora.porcentajeUsoSalida >= 50 ? 'Medio' : 'Bajo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {(!datosCapacidad.usoPorHora || datosCapacidad.usoPorHora.length === 0) && (
                        <div className="text-center py-20 text-light-1">
                          No hay datos de uso por hora
                        </div>
                      )}
                    </div>

                    {/* Leyenda */}
                    <div className="d-flex gap-20 mt-20 pt-20 border-top-light">
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#4caf50' }}></div>
                        <span className="text-12 text-light-1">Bajo (&lt;50%)</span>
                      </div>
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#2196f3' }}></div>
                        <span className="text-12 text-light-1">Medio (50-79%)</span>
                      </div>
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#ff9800' }}></div>
                        <span className="text-12 text-light-1">Alto (80-99%)</span>
                      </div>
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#f44336' }}></div>
                        <span className="text-12 text-light-1">Saturado (≥100%)</span>
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
                        Haz clic en un aeropuerto de la lista para ver su capacidad y uso por hora
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
