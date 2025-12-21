'use client'

import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import { obtenerDisponibilidadAeronaves } from "@/api/aeronaveService";

const DisponibilidadAeronaves = () => {
  const [aeronaves, setAeronaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [aeronaveSeleccionada, setAeronaveSeleccionada] = useState(null);

  useEffect(() => {
    cargarDisponibilidad();
  }, []);

  const cargarDisponibilidad = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await obtenerDisponibilidadAeronaves();
      
      if (response.success && response.data) {
        setAeronaves(response.data);
      } else {
        setAeronaves(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      setError('Error al cargar la disponibilidad de aeronaves. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar aeronaves
  const aeronavesFiltradas = aeronaves.filter(a =>
    a.modelo?.toLowerCase().includes(filtro.toLowerCase()) ||
    a.matricula?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Obtener color según porcentaje de ocupación
  const getColorOcupacion = (porcentaje) => {
    if (porcentaje >= 90) return { bg: '#ffebee', color: '#c62828', label: 'Crítico' };
    if (porcentaje >= 75) return { bg: '#fff3e0', color: '#e65100', label: 'Alto' };
    if (porcentaje >= 50) return { bg: '#e3f2fd', color: '#1565c0', label: 'Medio' };
    return { bg: '#e8f5e9', color: '#2e7d32', label: 'Bajo' };
  };

  // Datos de la aeronave seleccionada
  const datosAeronave = aeronaveSeleccionada 
    ? aeronaves.find(a => a.matricula === aeronaveSeleccionada) 
    : null;

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
                <h1 className="text-30 lh-14 fw-600">Disponibilidad de Aeronaves</h1>
                <div className="text-15 text-light-1">
                  Monitoreo de ocupación de asientos por clase
                </div>
              </div>
              <div className="col-auto">
                <button 
                  className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
                  onClick={cargarDisponibilidad}
                >
                  <i className="icon-refresh text-16 mr-10"></i>
                  Actualizar
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="py-30 px-30 rounded-4 bg-white shadow-3 mb-30">
              <div className="row y-gap-20">
                <div className="col-12">
                  <label className="text-14 fw-500 mb-10 d-block">Buscar Aeronave</label>
                  <input
                    type="text"
                    placeholder="Buscar por modelo o matrícula"
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
              {/* Lista de Aeronaves */}
              <div className="col-xl-4 col-lg-5 d-flex">
                <div className="py-30 px-30 rounded-4 bg-white shadow-3 w-100" style={{ height: '650px', display: 'flex', flexDirection: 'column' }}>
                  <h3 className="text-18 fw-600 mb-20">Aeronaves</h3>
                  
                  {loading ? (
                    <div className="text-center py-40">
                      <div className="spinner-border text-blue-1"></div>
                    </div>
                  ) : (
                    <div className="overflow-scroll scroll-bar-1" style={{ flex: 1, overflowY: 'auto' }}>
                      {aeronavesFiltradas.map((aeronave, index) => {
                        const ocupacion = aeronave.disponibilidadAsientos?.porcentajeOcupacionTotal || 0;
                        const colorInfo = getColorOcupacion(ocupacion);
                        
                        return (
                          <div 
                            key={aeronave.matricula || `aeronave-${index}`}
                            className={`py-15 px-15 rounded-4 mb-10 ${
                              aeronaveSeleccionada === aeronave.matricula 
                                ? 'bg-blue-1 text-white' 
                                : 'bg-light-2'
                            }`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setAeronaveSeleccionada(aeronave.matricula)}
                          >
                            <div className="d-flex justify-between items-center">
                              <div>
                                <div className="fw-600">{aeronave.matricula}</div>
                                <div className={`text-14 ${aeronaveSeleccionada === aeronave.matricula ? 'text-white' : 'text-light-1'}`}>
                                  {aeronave.modelo}
                                </div>
                                <div className={`text-12 ${aeronaveSeleccionada === aeronave.matricula ? 'text-white' : 'text-light-1'}`}>
                                  {aeronave.vuelosHoy} vuelos hoy
                                </div>
                              </div>
                              <div className="text-right">
                                <div 
                                  className="rounded-100 py-4 px-10 text-12 fw-500"
                                  style={{ 
                                    backgroundColor: aeronaveSeleccionada === aeronave.matricula ? 'rgba(255,255,255,0.2)' : colorInfo.bg,
                                    color: aeronaveSeleccionada === aeronave.matricula ? 'white' : colorInfo.color
                                  }}
                                >
                                  {ocupacion.toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {aeronavesFiltradas.length === 0 && (
                        <div className="text-center py-20 text-light-1">
                          No se encontraron aeronaves
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Detalle de Disponibilidad */}
              <div className="col-xl-8 col-lg-7 d-flex">
                {datosAeronave ? (
                  <div className="py-30 px-30 rounded-4 bg-white shadow-3 w-100 overflow-scroll scroll-bar-1" style={{ height: '650px' }}>
                    {/* Header */}
                    <div className="d-flex justify-between items-center mb-30">
                      <div>
                        <h3 className="text-22 fw-600">
                          {datosAeronave.matricula}
                        </h3>
                        <div className="text-16 text-dark-1">{datosAeronave.modelo}</div>
                        <div className="text-14 text-light-1">
                          Estado: <span className={`fw-500 ${datosAeronave.estado === 'Operativa' ? 'text-green-2' : 'text-red-1'}`}>
                            {datosAeronave.estado}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-14 text-light-1">Ocupación Total</div>
                        <div className="text-40 fw-600" style={{ color: getColorOcupacion(datosAeronave.disponibilidadAsientos?.porcentajeOcupacionTotal || 0).color }}>
                          {datosAeronave.disponibilidadAsientos?.porcentajeOcupacionTotal?.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas Generales */}
                    <div className="row y-gap-10 mb-30">
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 bg-blue-1-05 text-center">
                          <div className="text-26 fw-600 text-blue-1">{datosAeronave.totalAsientos}</div>
                          <div className="text-12 text-light-1">Total Asientos</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 text-center" style={{ backgroundColor: '#ffebee' }}>
                          <div className="text-26 fw-600" style={{ color: '#c62828' }}>{datosAeronave.disponibilidadAsientos?.totalReservados || 0}</div>
                          <div className="text-12 text-light-1">Reservados</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 text-center" style={{ backgroundColor: '#e8f5e9' }}>
                          <div className="text-26 fw-600 text-green-2">{datosAeronave.disponibilidadAsientos?.totalDisponibles || 0}</div>
                          <div className="text-12 text-light-1">Disponibles</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 text-center" style={{ backgroundColor: '#e3f2fd' }}>
                          <div className="text-26 fw-600 text-blue-1">{datosAeronave.totalVuelosProgramados}</div>
                          <div className="text-12 text-light-1">Vuelos Prog.</div>
                        </div>
                      </div>
                    </div>

                    {/* Disponibilidad por Clase */}
                    <div className="text-16 fw-600 mb-15">Disponibilidad por Clase</div>
                    
                    {/* Primera Clase */}
                    <div className="py-20 px-20 rounded-4 mb-15" style={{ backgroundColor: '#fef3e2', border: '1px solid #f0c14b' }}>
                      <div className="d-flex justify-between items-center mb-10">
                        <div className="d-flex items-center gap-10">
                          <i className="icon-star text-20" style={{ color: '#b8860b' }}></i>
                          <span className="fw-600 text-16">Primera Clase</span>
                        </div>
                        <span className="fw-600" style={{ color: getColorOcupacion(datosAeronave.disponibilidadAsientos?.primeraPorcentajeOcupacion || 0).color }}>
                          {datosAeronave.disponibilidadAsientos?.primeraPorcentajeOcupacion?.toFixed(1)}% ocupado
                        </span>
                      </div>
                      <div className="row y-gap-10">
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-dark-1">{datosAeronave.disponibilidadAsientos?.primeraTotal || 0}</div>
                          <div className="text-12 text-light-1">Total</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600" style={{ color: '#c62828' }}>{datosAeronave.disponibilidadAsientos?.primeraReservados || 0}</div>
                          <div className="text-12 text-light-1">Reservados</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-green-2">{datosAeronave.disponibilidadAsientos?.primeraDisponibles || 0}</div>
                          <div className="text-12 text-light-1">Disponibles</div>
                        </div>
                      </div>
                      <div className="mt-10">
                        <div className="rounded-4" style={{ height: '8px', backgroundColor: '#ddd', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${datosAeronave.disponibilidadAsientos?.primeraPorcentajeOcupacion || 0}%`, 
                            height: '100%', 
                            backgroundColor: '#b8860b' 
                          }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Ejecutiva */}
                    <div className="py-20 px-20 rounded-4 mb-15" style={{ backgroundColor: '#e8eaf6', border: '1px solid #7986cb' }}>
                      <div className="d-flex justify-between items-center mb-10">
                        <div className="d-flex items-center gap-10">
                          <i className="icon-briefcase text-20" style={{ color: '#3f51b5' }}></i>
                          <span className="fw-600 text-16">Clase Ejecutiva</span>
                        </div>
                        <span className="fw-600" style={{ color: getColorOcupacion(datosAeronave.disponibilidadAsientos?.ejecutivaPorcentajeOcupacion || 0).color }}>
                          {datosAeronave.disponibilidadAsientos?.ejecutivaPorcentajeOcupacion?.toFixed(1)}% ocupado
                        </span>
                      </div>
                      <div className="row y-gap-10">
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-dark-1">{datosAeronave.disponibilidadAsientos?.ejecutivaTotal || 0}</div>
                          <div className="text-12 text-light-1">Total</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600" style={{ color: '#c62828' }}>{datosAeronave.disponibilidadAsientos?.ejecutivaReservados || 0}</div>
                          <div className="text-12 text-light-1">Reservados</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-green-2">{datosAeronave.disponibilidadAsientos?.ejecutivaDisponibles || 0}</div>
                          <div className="text-12 text-light-1">Disponibles</div>
                        </div>
                      </div>
                      <div className="mt-10">
                        <div className="rounded-4" style={{ height: '8px', backgroundColor: '#ddd', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${datosAeronave.disponibilidadAsientos?.ejecutivaPorcentajeOcupacion || 0}%`, 
                            height: '100%', 
                            backgroundColor: '#3f51b5' 
                          }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Económica */}
                    <div className="py-20 px-20 rounded-4 mb-15" style={{ backgroundColor: '#e0f2f1', border: '1px solid #4db6ac' }}>
                      <div className="d-flex justify-between items-center mb-10">
                        <div className="d-flex items-center gap-10">
                          <i className="icon-users text-20" style={{ color: '#00897b' }}></i>
                          <span className="fw-600 text-16">Clase Económica</span>
                        </div>
                        <span className="fw-600" style={{ color: getColorOcupacion(datosAeronave.disponibilidadAsientos?.economicaPorcentajeOcupacion || 0).color }}>
                          {datosAeronave.disponibilidadAsientos?.economicaPorcentajeOcupacion?.toFixed(1)}% ocupado
                        </span>
                      </div>
                      <div className="row y-gap-10">
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-dark-1">{datosAeronave.disponibilidadAsientos?.economicaTotal || 0}</div>
                          <div className="text-12 text-light-1">Total</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600" style={{ color: '#c62828' }}>{datosAeronave.disponibilidadAsientos?.economicaReservados || 0}</div>
                          <div className="text-12 text-light-1">Reservados</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-green-2">{datosAeronave.disponibilidadAsientos?.economicaDisponibles || 0}</div>
                          <div className="text-12 text-light-1">Disponibles</div>
                        </div>
                      </div>
                      <div className="mt-10">
                        <div className="rounded-4" style={{ height: '8px', backgroundColor: '#ddd', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${datosAeronave.disponibilidadAsientos?.economicaPorcentajeOcupacion || 0}%`, 
                            height: '100%', 
                            backgroundColor: '#00897b' 
                          }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="d-flex gap-20 mt-20 pt-20 border-top-light">
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#2e7d32' }}></div>
                        <span className="text-12 text-light-1">Bajo (&lt;50%)</span>
                      </div>
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#1565c0' }}></div>
                        <span className="text-12 text-light-1">Medio (50-74%)</span>
                      </div>
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#e65100' }}></div>
                        <span className="text-12 text-light-1">Alto (75-89%)</span>
                      </div>
                      <div className="d-flex items-center gap-5">
                        <div className="size-12 rounded-full" style={{ backgroundColor: '#c62828' }}></div>
                        <span className="text-12 text-light-1">Crítico (≥90%)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-30 px-30 rounded-4 bg-white shadow-3 w-100" style={{ height: '650px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="text-center">
                      <i className="icon-airplane text-60 text-light-1 mb-20"></i>
                      <h3 className="text-18 fw-500 text-light-1">
                        Selecciona una aeronave
                      </h3>
                      <p className="text-14 text-light-1 mt-10">
                        Haz clic en una aeronave para ver su disponibilidad de asientos
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

export default DisponibilidadAeronaves;
