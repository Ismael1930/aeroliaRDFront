'use client'

import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import ErrorAlert, { SuccessAlert } from "@/components/common/ErrorAlert";
import { 
  obtenerTodasLasAeronaves, 
  crearAeronave, 
  actualizarAeronave, 
  eliminarAeronave,
  obtenerDisponibilidadAeronave 
} from "@/api/aeronaveService";

const GestionAeronaves = () => {
  const [aeronaves, setAeronaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [aeronaveSeleccionada, setAeronaveSeleccionada] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
  const [filtro, setFiltro] = useState('');  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [modalError, setModalError] = useState(null);

  const [formulario, setFormulario] = useState({
    modelo: '',
    matricula: '',
    capacidad: '',
    estado: 'Disponible'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await obtenerTodasLasAeronaves();
      const aeronavesData = Array.isArray(response) ? response : (response.data || response.aeronaves || []);
      setAeronaves(aeronavesData);
    } catch (err) {
      console.error('Error al cargar aeronaves:', err);
      if (err.response?.status === 403) {
        setError('No tienes permisos para ver las aeronaves. Contacta al administrador.');
      } else {
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const seleccionarAeronave = async (matricula) => {
    setAeronaveSeleccionada(matricula);
    setLoadingDisponibilidad(true);
    
    try {
      const response = await obtenerDisponibilidadAeronave(matricula);
      let data = response.success && response.data ? response.data : (response.data || response);
      
      // Procesar y calcular los datos de disponibilidad
      const disponibilidadProcesada = procesarDisponibilidad(data);
      setDisponibilidad(disponibilidadProcesada);
    } catch (err) {
      console.error('Error al cargar disponibilidad:', err);
      setDisponibilidad(null);
    } finally {
      setLoadingDisponibilidad(false);
    }
  };

  // Función para procesar y calcular la disponibilidad correctamente
  const procesarDisponibilidad = (data) => {
    if (!data) return null;

    console.log('Datos recibidos del backend:', JSON.stringify(data, null, 2));

    // Obtener datos base de asientos (puede venir en diferentes estructuras)
    const asientos = data.disponibilidadAsientos || data.asientos || data;
    
    // Datos por clase - Primera (buscar en múltiples posibles nombres)
    const primeraTotal = asientos.primeraTotal || asientos.asientosPrimera || asientos.primeraClaseTotal || 
                         data.asientosPrimera || data.primeraClaseTotal || data.capacidadPrimera || 0;
    const primeraReservados = asientos.primeraReservados || asientos.reservadosPrimera || asientos.primeraClaseReservados ||
                              data.reservadosPrimera || data.primeraClaseReservados || 0;
    const primeraDisponibles = Math.max(0, primeraTotal - primeraReservados);
    const primeraPorcentajeOcupacion = primeraTotal > 0 ? (primeraReservados / primeraTotal) * 100 : 0;

    // Datos por clase - Ejecutiva
    const ejecutivaTotal = asientos.ejecutivaTotal || asientos.asientosEjecutiva || asientos.ejecutivaClaseTotal ||
                           data.asientosEjecutiva || data.ejecutivaClaseTotal || data.capacidadEjecutiva || 0;
    const ejecutivaReservados = asientos.ejecutivaReservados || asientos.reservadosEjecutiva || asientos.ejecutivaClaseReservados ||
                                data.reservadosEjecutiva || data.ejecutivaClaseReservados || 0;
    const ejecutivaDisponibles = Math.max(0, ejecutivaTotal - ejecutivaReservados);
    const ejecutivaPorcentajeOcupacion = ejecutivaTotal > 0 ? (ejecutivaReservados / ejecutivaTotal) * 100 : 0;

    // Datos por clase - Económica
    const economicaTotal = asientos.economicaTotal || asientos.asientosEconomica || asientos.economicaClaseTotal ||
                           data.asientosEconomica || data.economicaClaseTotal || data.capacidadEconomica || 0;
    const economicaReservados = asientos.economicaReservados || asientos.reservadosEconomica || asientos.economicaClaseReservados ||
                                data.reservadosEconomica || data.economicaClaseReservados || 0;
    const economicaDisponibles = Math.max(0, economicaTotal - economicaReservados);
    const economicaPorcentajeOcupacion = economicaTotal > 0 ? (economicaReservados / economicaTotal) * 100 : 0;

    // Totales generales
    const totalAsientos = data.totalAsientos || data.capacidad || (primeraTotal + ejecutivaTotal + economicaTotal);
    const totalReservados = asientos.totalReservados || data.totalReservados || (primeraReservados + ejecutivaReservados + economicaReservados);
    const totalDisponibles = totalAsientos - totalReservados;
    const porcentajeOcupacionTotal = totalAsientos > 0 ? (totalReservados / totalAsientos) * 100 : 0;

    return {
      ...data,
      totalAsientos,
      disponibilidadAsientos: {
        totalReservados,
        totalDisponibles,
        porcentajeOcupacionTotal,
        // Primera Clase
        primeraTotal,
        primeraReservados,
        primeraDisponibles,
        primeraPorcentajeOcupacion,
        // Ejecutiva
        ejecutivaTotal,
        ejecutivaReservados,
        ejecutivaDisponibles,
        ejecutivaPorcentajeOcupacion,
        // Económica
        economicaTotal,
        economicaReservados,
        economicaDisponibles,
        economicaPorcentajeOcupacion,
      }
    };
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setFormulario({
      modelo: '',
      matricula: '',
      capacidad: '',
      estado: 'Disponible'
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (aeronave, e) => {
    e.stopPropagation();
    setModoEdicion(true);
    setFormulario({
      matricula: aeronave.matricula,
      modelo: aeronave.modelo,
      capacidad: aeronave.capacidad,
      estado: aeronave.estado || 'Disponible'
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    
    try {
      const datosAeronave = {
        matricula: formulario.matricula,
        modelo: formulario.modelo,
        capacidad: parseInt(formulario.capacidad),
        estado: formulario.estado
      };

      if (modoEdicion) {
        await actualizarAeronave(datosAeronave);
        setSuccessMsg('Aeronave actualizada exitosamente');
      } else {
        await crearAeronave(datosAeronave);
        setSuccessMsg('Aeronave creada exitosamente');
      }
      setMostrarModal(false);
      setModalError(null);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar aeronave:', error);
      // Extraer error del backend
      const errorData = error.response?.data || error;
      setModalError(errorData);
    }
  };

  const handleEliminar = async (matricula, e) => {
    e.stopPropagation();
    if (!confirm('¿Está seguro de eliminar esta aeronave?')) return;
    
    try {
      await eliminarAeronave(matricula);
      setSuccessMsg('Aeronave eliminada exitosamente');
      if (aeronaveSeleccionada === matricula) {
        setAeronaveSeleccionada(null);
        setDisponibilidad(null);
      }
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar aeronave:', error);
      const errorData = error.response?.data || error;
      setError(errorData);
    }
  };

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
                <h1 className="text-30 lh-14 fw-600">Gestión de Aeronaves</h1>
                <div className="text-15 text-light-1">
                  Administrar aeronaves y ver disponibilidad
                </div>
              </div>
              <div className="col-auto">
                <button 
                  className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
                  onClick={abrirModalNuevo}
                >
                  <i className="icon-plus text-20 mr-10"></i>
                  Nueva Aeronave
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

            {/* Mensaje de éxito */}
            <SuccessAlert 
              message={successMsg} 
              onClose={() => setSuccessMsg(null)} 
            />

            {/* Mensaje de error */}
            <ErrorAlert 
              error={error} 
              onClose={() => setError(null)} 
            />

            <div className="row y-gap-30" style={{ alignItems: 'stretch' }}>
              {/* Lista de Aeronaves */}
              <div className="col-xl-4 col-lg-5 d-flex">
                <div className="py-30 px-30 rounded-4 bg-white shadow-3 w-100" style={{ height: '650px', display: 'flex', flexDirection: 'column' }}>
                  <h3 className="text-18 fw-600 mb-20">Aeronaves ({aeronavesFiltradas.length})</h3>
                  
                  {loading ? (
                    <div className="text-center py-40">
                      <div className="spinner-border text-blue-1"></div>
                    </div>
                  ) : (
                    <div className="overflow-scroll scroll-bar-1" style={{ flex: 1, overflowY: 'auto' }}>
                      {aeronavesFiltradas.map((aeronave, index) => (
                        <div 
                          key={aeronave.matricula || `aeronave-${index}`}
                          className={`py-15 px-15 rounded-4 mb-10 ${
                            aeronaveSeleccionada === aeronave.matricula 
                              ? 'bg-blue-1 text-white' 
                              : 'bg-light-2'
                          }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => seleccionarAeronave(aeronave.matricula)}
                        >
                          <div className="d-flex justify-between items-center">
                            <div>
                              <div className="fw-600">{aeronave.matricula}</div>
                              <div className={`text-14 ${aeronaveSeleccionada === aeronave.matricula ? 'text-white' : 'text-light-1'}`}>
                                {aeronave.modelo}
                              </div>
                              <div className={`text-12 ${aeronaveSeleccionada === aeronave.matricula ? 'text-white' : 'text-light-1'}`}>
                                {aeronave.capacidad} pasajeros
                              </div>
                            </div>
                            <div className="d-flex flex-column items-end gap-5">
                              <span 
                                className="rounded-100 py-2 px-8 text-10 fw-500"
                                style={{ 
                                  backgroundColor: aeronaveSeleccionada === aeronave.matricula ? 'rgba(255,255,255,0.2)' :
                                    aeronave.estado === 'Disponible' || aeronave.estado === 'Operativa' ? '#e8f5e9' :
                                    aeronave.estado === 'Mantenimiento' ? '#fff3e0' : '#ffebee',
                                  color: aeronaveSeleccionada === aeronave.matricula ? 'white' :
                                    aeronave.estado === 'Disponible' || aeronave.estado === 'Operativa' ? '#2e7d32' :
                                    aeronave.estado === 'Mantenimiento' ? '#e65100' : '#c62828'
                                }}
                              >
                                {aeronave.estado}
                              </span>
                              <div className="d-flex gap-5">
                                <button
                                  className="flex-center rounded-4 size-25"
                                  style={{ backgroundColor: aeronaveSeleccionada === aeronave.matricula ? 'rgba(255,255,255,0.2)' : '#e3f2fd' }}
                                  onClick={(e) => abrirModalEditar(aeronave, e)}
                                  title="Editar"
                                >
                                  <i className={`icon-edit text-12 ${aeronaveSeleccionada === aeronave.matricula ? 'text-white' : 'text-blue-1'}`}></i>
                                </button>
                                <button
                                  className="flex-center rounded-4 size-25"
                                  style={{ backgroundColor: aeronaveSeleccionada === aeronave.matricula ? 'rgba(255,255,255,0.2)' : '#ffebee' }}
                                  onClick={(e) => handleEliminar(aeronave.matricula, e)}
                                  title="Eliminar"
                                >
                                  <i className={`icon-trash-2 text-12 ${aeronaveSeleccionada === aeronave.matricula ? 'text-white' : 'text-red-1'}`}></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

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
                {loadingDisponibilidad ? (
                  <div className="py-30 px-30 rounded-4 bg-white shadow-3 w-100" style={{ height: '650px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-border text-blue-1"></div>
                  </div>
                ) : disponibilidad ? (
                  <div className="py-30 px-30 rounded-4 bg-white shadow-3 w-100 overflow-scroll scroll-bar-1" style={{ height: '650px' }}>
                    {/* Header */}
                    <div className="d-flex justify-between items-center mb-30">
                      <div>
                        <h3 className="text-22 fw-600">
                          {disponibilidad.matricula}
                        </h3>
                        <div className="text-16 text-dark-1">{disponibilidad.modelo}</div>
                        <div className="text-14 text-light-1">
                          Estado: <span className={`fw-500 ${disponibilidad.estado === 'Operativa' || disponibilidad.estado === 'Disponible' ? 'text-green-2' : 'text-red-1'}`}>
                            {disponibilidad.estado}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-14 text-light-1">Ocupación Total</div>
                        <div className="text-40 fw-600" style={{ color: getColorOcupacion(disponibilidad.disponibilidadAsientos?.porcentajeOcupacionTotal || 0).color }}>
                          {disponibilidad.disponibilidadAsientos?.porcentajeOcupacionTotal?.toFixed(1) || 0}%
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas Generales */}
                    <div className="row y-gap-10 mb-30">
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 bg-blue-1-05 text-center">
                          <div className="text-26 fw-600 text-blue-1">{disponibilidad.totalAsientos || disponibilidad.capacidad || 0}</div>
                          <div className="text-12 text-light-1">Total Asientos</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 text-center" style={{ backgroundColor: '#ffebee' }}>
                          <div className="text-26 fw-600" style={{ color: '#c62828' }}>{disponibilidad.disponibilidadAsientos?.totalReservados || 0}</div>
                          <div className="text-12 text-light-1">Reservados</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 text-center" style={{ backgroundColor: '#e8f5e9' }}>
                          <div className="text-26 fw-600 text-green-2">{disponibilidad.disponibilidadAsientos?.totalDisponibles || 0}</div>
                          <div className="text-12 text-light-1">Disponibles</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="py-20 px-15 rounded-4 text-center" style={{ backgroundColor: '#e3f2fd' }}>
                          <div className="text-26 fw-600 text-blue-1">{disponibilidad.totalVuelosProgramados || 0}</div>
                          <div className="text-12 text-light-1">Vuelos Prog.</div>
                        </div>
                      </div>
                    </div>

                    {/* Info adicional */}
                    <div className="d-flex gap-30 mb-30 py-15 px-20 rounded-4 bg-light-2">
                      <div>
                        <span className="text-light-1">Vuelos hoy: </span>
                        <span className="fw-600 text-dark-1">{disponibilidad.vuelosHoy || 0}</span>
                      </div>
                      {disponibilidad.tiempoPreparacionMinutos && (
                        <div>
                          <span className="text-light-1">Tiempo preparación: </span>
                          <span className="fw-600 text-dark-1">{disponibilidad.tiempoPreparacionMinutos} min</span>
                        </div>
                      )}
                    </div>

                    {/* Disponibilidad por Clase */}
                    <div className="d-flex justify-between items-center mb-15">
                      <div className="text-16 fw-600">Disponibilidad por Clase</div>
                      <div className="text-14 text-light-1">
                        Total: {(disponibilidad.disponibilidadAsientos?.primeraTotal || 0) + 
                               (disponibilidad.disponibilidadAsientos?.ejecutivaTotal || 0) + 
                               (disponibilidad.disponibilidadAsientos?.economicaTotal || 0)} asientos
                      </div>
                    </div>
                    
                    {/* Primera Clase */}
                    <div className="py-20 px-20 rounded-4 mb-15" style={{ backgroundColor: '#fef3e2', border: '1px solid #f0c14b' }}>
                      <div className="d-flex justify-between items-center mb-10">
                        <div className="d-flex items-center gap-10">
                          <i className="icon-star text-20" style={{ color: '#b8860b' }}></i>
                          <span className="fw-600 text-16">Primera Clase</span>
                          <span className="text-14 text-light-1">({disponibilidad.disponibilidadAsientos?.primeraTotal || 0} asientos)</span>
                        </div>
                        <span className="fw-600" style={{ color: getColorOcupacion(disponibilidad.disponibilidadAsientos?.primeraPorcentajeOcupacion || 0).color }}>
                          {disponibilidad.disponibilidadAsientos?.primeraPorcentajeOcupacion?.toFixed(1) || 0}% ocupado
                        </span>
                      </div>
                      <div className="row y-gap-10">
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-dark-1">{disponibilidad.disponibilidadAsientos?.primeraTotal || 0}</div>
                          <div className="text-12 text-light-1">Total</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600" style={{ color: '#c62828' }}>{disponibilidad.disponibilidadAsientos?.primeraReservados || 0}</div>
                          <div className="text-12 text-light-1">Reservados</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-green-2">{disponibilidad.disponibilidadAsientos?.primeraDisponibles || 0}</div>
                          <div className="text-12 text-light-1">Disponibles</div>
                        </div>
                      </div>
                      <div className="mt-10">
                        <div className="rounded-4" style={{ height: '8px', backgroundColor: '#ddd', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${disponibilidad.disponibilidadAsientos?.primeraPorcentajeOcupacion || 0}%`, 
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
                          <span className="text-14 text-light-1">({disponibilidad.disponibilidadAsientos?.ejecutivaTotal || 0} asientos)</span>
                        </div>
                        <span className="fw-600" style={{ color: getColorOcupacion(disponibilidad.disponibilidadAsientos?.ejecutivaPorcentajeOcupacion || 0).color }}>
                          {disponibilidad.disponibilidadAsientos?.ejecutivaPorcentajeOcupacion?.toFixed(1) || 0}% ocupado
                        </span>
                      </div>
                      <div className="row y-gap-10">
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-dark-1">{disponibilidad.disponibilidadAsientos?.ejecutivaTotal || 0}</div>
                          <div className="text-12 text-light-1">Total</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600" style={{ color: '#c62828' }}>{disponibilidad.disponibilidadAsientos?.ejecutivaReservados || 0}</div>
                          <div className="text-12 text-light-1">Reservados</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-green-2">{disponibilidad.disponibilidadAsientos?.ejecutivaDisponibles || 0}</div>
                          <div className="text-12 text-light-1">Disponibles</div>
                        </div>
                      </div>
                      <div className="mt-10">
                        <div className="rounded-4" style={{ height: '8px', backgroundColor: '#ddd', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${disponibilidad.disponibilidadAsientos?.ejecutivaPorcentajeOcupacion || 0}%`, 
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
                          <span className="text-14 text-light-1">({disponibilidad.disponibilidadAsientos?.economicaTotal || 0} asientos)</span>
                        </div>
                        <span className="fw-600" style={{ color: getColorOcupacion(disponibilidad.disponibilidadAsientos?.economicaPorcentajeOcupacion || 0).color }}>
                          {disponibilidad.disponibilidadAsientos?.economicaPorcentajeOcupacion?.toFixed(1) || 0}% ocupado
                        </span>
                      </div>
                      <div className="row y-gap-10">
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-dark-1">{disponibilidad.disponibilidadAsientos?.economicaTotal || 0}</div>
                          <div className="text-12 text-light-1">Total</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600" style={{ color: '#c62828' }}>{disponibilidad.disponibilidadAsientos?.economicaReservados || 0}</div>
                          <div className="text-12 text-light-1">Reservados</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="text-22 fw-600 text-green-2">{disponibilidad.disponibilidadAsientos?.economicaDisponibles || 0}</div>
                          <div className="text-12 text-light-1">Disponibles</div>
                        </div>
                      </div>
                      <div className="mt-10">
                        <div className="rounded-4" style={{ height: '8px', backgroundColor: '#ddd', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${disponibilidad.disponibilidadAsientos?.economicaPorcentajeOcupacion || 0}%`, 
                            height: '100%', 
                            backgroundColor: '#00897b' 
                          }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Leyenda */}
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

      {/* Modal */}
      {mostrarModal && (
        <div 
          className="modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setMostrarModal(false)}
        >
          <div 
            className="modal-content bg-white rounded-4"
            style={{
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '40px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-22 fw-600 mb-30">
              {modoEdicion ? 'Editar Aeronave' : 'Nueva Aeronave'}
            </h3>

            {/* Error en el modal */}
            <ErrorAlert 
              error={modalError} 
              onClose={() => setModalError(null)} 
            />

            <form onSubmit={handleSubmit}>
              <div className="row y-gap-20">
                <div className="col-12">
                  <div className="form-input">
                    <input
                      type="text"
                      value={formulario.matricula}
                      onChange={(e) => setFormulario({...formulario, matricula: e.target.value})}
                      required
                      disabled={modoEdicion}
                    />
                    <label className="lh-1 text-14 text-light-1">Matrícula</label>
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-input">
                    <input
                      type="text"
                      value={formulario.modelo}
                      onChange={(e) => setFormulario({...formulario, modelo: e.target.value})}
                      required
                    />
                    <label className="lh-1 text-14 text-light-1">Modelo</label>
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-input">
                    <input
                      type="number"
                      value={formulario.capacidad}
                      onChange={(e) => setFormulario({...formulario, capacidad: e.target.value})}
                      required
                      min="1"
                    />
                    <label className="lh-1 text-14 text-light-1">Capacidad de Pasajeros</label>
                  </div>
                </div>

                <div className="col-12">
                  <label className="text-14 fw-500 mb-10 d-block">Estado</label>
                  <select
                    className="form-select"
                    value={formulario.estado}
                    onChange={(e) => setFormulario({...formulario, estado: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Operativa">Operativa</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="FueraDeServicio">Fuera de Servicio</option>
                  </select>
                </div>
              </div>

              <div className="d-flex items-center pt-30 gap-20">
                <button
                  type="button"
                  className="button h-50 px-24 -outline-blue-1 text-blue-1"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
                >
                  {modoEdicion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default GestionAeronaves;
