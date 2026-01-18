'use client'

import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import ErrorAlert, { SuccessAlert } from "@/components/common/ErrorAlert";
import EstadosInfo from "../common/EstadosInfo";
import { 
  obtenerTodosLosVuelos, 
  crearVuelo, 
  actualizarVuelo, 
  eliminarVuelo 
} from "@/api/vueloAdminService";
import { obtenerAeropuertos, obtenerDuracionEntreAeropuertos } from "@/api/aeropuertoService";
import { obtenerTodasLasAeronaves, obtenerAeronavesDisponiblesPorHorario } from "@/api/aeronaveService";

// Función para formatear hora a formato 24h (HH:mm)
const formatearHora = (hora) => {
  if (!hora) return '-';
  // Si viene como "HH:mm:ss", retornar "HH:mm"
  if (typeof hora === 'string' && hora.includes(':')) {
    const partes = hora.split(':');
    if (partes.length >= 2) {
      return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
    }
  }
  return hora;
};

// Función para convertir hora 24h (HH:mm) a formato 12h (hh:mm AM/PM)
const formatearHora12h = (hora24) => {
  if (!hora24) return '-';
  const partes = hora24.split(':');
  if (partes.length < 2) return hora24;
  
  let horas = parseInt(partes[0], 10);
  const minutos = partes[1].padStart(2, '0');
  const periodo = horas >= 12 ? 'PM' : 'AM';
  
  // Convertir a formato 12h
  if (horas === 0) {
    horas = 12;
  } else if (horas > 12) {
    horas = horas - 12;
  }
  
  return `${horas}:${minutos} ${periodo}`;
};

// Formatea la duración (minutos o string) a formato "Xh Ym"
const formatearDuracion = (duracion) => {
  if (duracion === null || duracion === undefined || duracion === '') return '-';
  // Si viene como número (minutos)
  if (typeof duracion === 'number') {
    const horas = Math.floor(duracion / 60);
    const minutos = duracion % 60;
    return `${horas}h ${minutos}m`;
  }
  // Si viene como string que representa minutos
  if (!isNaN(Number(duracion))) {
    const d = Number(duracion);
    const horas = Math.floor(d / 60);
    const minutos = d % 60;
    return `${horas}h ${minutos}m`;
  }
  // Si ya viene formateado, devolver tal cual
  return duracion;
};

// Calcula hora de llegada (HH:mm) a partir de horaSalida (HH:mm) y duracion (minutos)
const calcularHoraLlegadaDesdeDuracion = (horaSalida, duracion) => {
  if (!horaSalida || duracion === null || duracion === undefined || duracion === '') return '';
  const minutosDuracion = Number(duracion);
  if (isNaN(minutosDuracion)) return '';
  const [hs, ms] = horaSalida.split(':').map(Number);
  if (isNaN(hs) || isNaN(ms)) return '';
  const totalMin = hs * 60 + ms + minutosDuracion;
  const horaLleg = Math.floor((totalMin % (24 * 60)) / 60).toString().padStart(2, '0');
  const minLleg = (totalMin % 60).toString().padStart(2, '0');
  return `${horaLleg}:${minLleg}`;
};

// Función para verificar si la fecha del vuelo ya pasó (considerando fecha y hora)
const vueloFechaPasada = (vuelo) => {
  if (!vuelo.fecha) return false;
  
  const ahora = new Date();
  const fechaVuelo = new Date(vuelo.fecha);
  
  // Verificar fecha de salida con hora
  let fechaSalidaPasada = false;
  if (vuelo.horaSalida) {
    const [horas, minutos] = vuelo.horaSalida.split(':');
    fechaVuelo.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0, 0);
    fechaSalidaPasada = fechaVuelo < ahora;
  } else {
    // Si no hay hora, comparar solo fechas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaVuelo.setHours(0, 0, 0, 0);
    fechaSalidaPasada = fechaVuelo < hoy;
  }
  
  // Si es ida y vuelta, verificar AMBAS fechas
  if (vuelo.tipoVuelo === 'IdaYVuelta' && vuelo.fechaRegreso) {
    const fechaRegresoVuelo = new Date(vuelo.fechaRegreso);
    let fechaRegresoPasada = false;
    
    if (vuelo.horaSalida) {
      const [horas, minutos] = vuelo.horaSalida.split(':');
      fechaRegresoVuelo.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0, 0);
      fechaRegresoPasada = fechaRegresoVuelo < ahora;
    } else {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaRegresoVuelo.setHours(0, 0, 0, 0);
      fechaRegresoPasada = fechaRegresoVuelo < hoy;
    }
    
    // Retornar true solo si AMBAS fechas han pasado
    return fechaSalidaPasada && fechaRegresoPasada;
  }
  
  // Para solo ida, retornar si la fecha de salida pasó
  return fechaSalidaPasada;
};

const GestionVuelos = () => {
  const [vuelos, setVuelos] = useState([]);
  const [aeropuertos, setAeropuertos] = useState([]);
  const [aeronaves, setAeronaves] = useState([]);
  const [aeronavesDisponibles, setAeronavesDisponibles] = useState([]);
  const [aeronavesNoDisponibles, setAeronavesNoDisponibles] = useState([]);
  const [cargandoAeronaves, setCargandoAeronaves] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [vueloSeleccionado, setVueloSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  const [formulario, setFormulario] = useState({
    numeroVuelo: '',
    matricula: '',
    origenCodigo: '',
    destinoCodigo: '',
    fecha: '',
    fechaRegreso: '',
    horaSalida: '',
    horaLlegada: '',
    duracion: '',
    precioBase: '',
    tipoVuelo: 'IdaYVuelta',
    estado: 'Programado'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar datos con manejo individual de errores
      let vuelosData = [];
      let aeropuertosData = [];
      let aeronavesData = [];

      try {
        const response = await obtenerTodosLosVuelos();
        console.log('Respuesta vuelos:', response);
        // El backend devuelve {success, data: [...]}
        if (response.success && response.data) {
          vuelosData = response.data;
        } else if (Array.isArray(response)) {
          vuelosData = response;
        } else {
          vuelosData = response.data || [];
        }
      } catch (err) {
        console.error('Error al cargar vuelos:', err);
        if (err.response?.status === 403) {
          setError('No tienes permisos para ver los vuelos. Contacta al administrador.');
        }
      }

      try {
        const response = await obtenerAeropuertos();
        console.log('Respuesta aeropuertos:', response);
        aeropuertosData = Array.isArray(response) ? response : (response.data || response.aeropuertos || []);
      } catch (err) {
        console.error('Error al cargar aeropuertos:', err);
      }

      try {
        const response = await obtenerTodasLasAeronaves();
        console.log('Respuesta aeronaves:', response);
        aeronavesData = Array.isArray(response) ? response : (response.data || response.aeronaves || []);
      } catch (err) {
        console.error('Error al cargar aeronaves:', err);
        // No es crítico si no hay aeronaves
      }

      setVuelos(Array.isArray(vuelosData) ? vuelosData : []);
      setAeropuertos(Array.isArray(aeropuertosData) ? aeropuertosData : []);
      setAeronaves(Array.isArray(aeronavesData) ? aeronavesData : []);
    } catch (error) {
      console.error('Error general al cargar datos:', error);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const calcularDuracionDisplay = () => {
    if (!formulario.horaSalida || !formulario.horaLlegada) return '';
    try {
      const [horaS, minS] = formulario.horaSalida.split(':').map(Number);
      const [horaL, minL] = formulario.horaLlegada.split(':').map(Number);
      const minutosS = horaS * 60 + minS;
      const minutosL = horaL * 60 + minL;
      let minutoDif = minutosL - minutosS;
      if (minutoDif < 0) minutoDif += 24 * 60; // Si llega al día siguiente
      const horas = Math.floor(minutoDif / 60);
      const minutos = minutoDif % 60;
      return `${horas}h ${minutos}m`;
    } catch (e) {
      return '';
    }
  };

  const calcularDuracionMinutos = () => {
    if (!formulario.horaSalida || !formulario.horaLlegada) return null;
    try {
      const [horaS, minS] = formulario.horaSalida.split(':').map(Number);
      const [horaL, minL] = formulario.horaLlegada.split(':').map(Number);
      const minutosS = horaS * 60 + minS;
      const minutosL = horaL * 60 + minL;
      let minutoDif = minutosL - minutosS;
      if (minutoDif < 0) minutoDif += 24 * 60; // Si llega al día siguiente
      return minutoDif;
    } catch (e) {
      return null;
    }
  };

  // Cargar aeronaves disponibles según fecha y horario
  const cargarAeronavesDisponibles = async (fecha, horaSalida, horaLlegada, vueloId = null) => {
    if (!fecha || !horaSalida || !horaLlegada) {
      setAeronavesDisponibles([]);
      setAeronavesNoDisponibles([]);
      return;
    }

    try {
      setCargandoAeronaves(true);
      const response = await obtenerAeronavesDisponiblesPorHorario(
        fecha, 
        horaSalida, 
        horaLlegada,
        vueloId
      );
      
      if (response.success && response.data) {
        setAeronavesDisponibles(response.data.disponibles || []);
        setAeronavesNoDisponibles(response.data.noDisponibles || []);
      } else {
        // Fallback a todas las aeronaves si el endpoint falla
        setAeronavesDisponibles(aeronaves);
        setAeronavesNoDisponibles([]);
      }
    } catch (err) {
      console.error('Error al cargar aeronaves disponibles:', err);
      // Fallback a todas las aeronaves
      setAeronavesDisponibles(aeronaves);
      setAeronavesNoDisponibles([]);
    } finally {
      setCargandoAeronaves(false);
    }
  };

  // Efecto para cargar aeronaves cuando cambian fecha/horarios en el formulario
  useEffect(() => {
    if (mostrarModal && formulario.fecha && formulario.horaSalida && formulario.horaLlegada) {
      const vueloId = modoEdicion ? formulario.id : null;
      cargarAeronavesDisponibles(formulario.fecha, formulario.horaSalida, formulario.horaLlegada, vueloId);
    }
  }, [mostrarModal, formulario.fecha, formulario.horaSalida, formulario.horaLlegada]);

  // Generar número de vuelo automático basado en el último vuelo
  const generarNumeroVuelo = () => {
    const prefijo = 'RD';
    let ultimoNumero = 1000; // Número inicial por defecto

    if (vuelos.length > 0) {
      // Buscar el número más alto entre todos los vuelos con formato RDxxxx
      vuelos.forEach(vuelo => {
        if (vuelo.numeroVuelo && vuelo.numeroVuelo.startsWith(prefijo)) {
          const numero = parseInt(vuelo.numeroVuelo.substring(prefijo.length), 10);
          if (!isNaN(numero) && numero >= ultimoNumero) {
            ultimoNumero = numero + 1;
          }
        }
      });
    }

    // Formatear con ceros a la izquierda si es necesario (4 dígitos mínimo)
    const numeroFormateado = ultimoNumero.toString().padStart(4, '0');
    return `${prefijo}${numeroFormateado}`;
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    const nuevoNumeroVuelo = generarNumeroVuelo();
    setFormulario({
      numeroVuelo: nuevoNumeroVuelo,
      matricula: '',
      origenCodigo: '',
      destinoCodigo: '',
      fecha: '',
      fechaRegreso: '',
      horaSalida: '',
      horaLlegada: '',
      duracion: '',
      precioBase: '',
      tipoVuelo: 'IdaYVuelta',
      estado: 'Programado' // Solo Programado al crear nuevos vuelos
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (vuelo) => {
    // Verificar si el vuelo tiene fecha pasada
    if (vueloFechaPasada(vuelo)) {
      alert('⚠️ ADVERTENCIA: Este vuelo tiene una fecha que ya pasó.\n\nPor favor, actualice la fecha y hora del vuelo antes de realizar cualquier modificación.');
    }
    
    setModoEdicion(true);
    setVueloSeleccionado(vuelo);
    
    // Obtener la matrícula de la aeronave (puede venir directamente o del objeto aeronave)
    const matriculaValue = vuelo.matricula || vuelo.aeronave?.matricula || '';
    
    // Normalizar horas a formato HH:mm para el input type="time"
    const normalizarHora = (hora) => {
      if (!hora) return '';
      const partes = hora.split(':');
      if (partes.length >= 2) {
        return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
      }
      return hora;
    };
    
    setFormulario({
      id: vuelo.id,
      numeroVuelo: vuelo.numeroVuelo,
      matricula: matriculaValue,
      origenCodigo: vuelo.origenCodigo,
      destinoCodigo: vuelo.destinoCodigo,
      fecha: vuelo.fecha?.split('T')[0] || '',
      fechaRegreso: vuelo.fechaRegreso?.split('T')[0] || '',
      horaSalida: normalizarHora(vuelo.horaSalida),
      horaLlegada: normalizarHora(vuelo.horaLlegada),
      duracion: vuelo.duracion || '',
      precioBase: vuelo.precioBase,
      tipoVuelo: vuelo.tipoVuelo || 'IdaYVuelta',
      estado: vuelo.estado || 'Programado'
    });
    setMostrarModal(true);
  };

  // Función de validación del formulario
  const validarFormulario = () => {
    // Validar que el precio base no sea negativo
    const precioBase = parseFloat(formulario.precioBase);
    if (isNaN(precioBase) || precioBase < 0) {
      setModalError('El precio base no puede ser negativo');
      return false;
    }

    // Validar que origen y destino sean diferentes
    if (formulario.origenCodigo && formulario.destinoCodigo && 
        formulario.origenCodigo === formulario.destinoCodigo) {
      setModalError('El origen y el destino no pueden ser iguales');
      return false;
    }

    // Validar que la fecha no sea pasada (solo para nuevos vuelos o si se cambia la fecha)
    if (formulario.fecha) {
      const fechaVuelo = new Date(formulario.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
      fechaVuelo.setHours(0, 0, 0, 0);
      
      if (fechaVuelo < hoy) {
        setModalError('No se puede seleccionar una fecha que ya haya pasado');
        return false;
      }
    }

    // Validar que haya al menos 30 minutos de diferencia entre salida y llegada
    if (formulario.horaSalida && formulario.horaLlegada) {
      const duracion = calcularDuracionMinutos();
      if (duracion !== null && duracion < 30) {
        setModalError('La diferencia entre la hora de salida y llegada debe ser de al menos 30 minutos');
        return false;
      }
    }

    // Validar fecha de regreso si es vuelo de ida y vuelta
    if (formulario.tipoVuelo === 'IdaYVuelta') {
      if (!formulario.fechaRegreso) {
        setModalError('Debe seleccionar una fecha de regreso para vuelos de ida y vuelta');
        return false;
      }
      
      const fechaIda = new Date(formulario.fecha);
      const fechaRegreso = new Date(formulario.fechaRegreso);
      
      if (fechaRegreso <= fechaIda) {
        setModalError('La fecha de regreso debe ser posterior a la fecha de ida');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    
    // Validar formulario antes de enviar
    if (!validarFormulario()) {
      return;
    }
    
    try {
      // Calcular duración en minutos automáticamente
      const duracionMinutos = calcularDuracionMinutos();
      
      // Convertir y preparar los datos para el backend
      const datosVuelo = {
        ...formulario,
        duracion: duracionMinutos, // Enviar duración en minutos como número
        // Matrícula ya viene del formulario, enviar null si está vacío
        matricula: formulario.matricula || null,
        // Convertir precio base a número
        precioBase: parseFloat(formulario.precioBase),
        // Convertir horas al formato TimeSpan de .NET (HH:mm:ss)
        horaSalida: formulario.horaSalida.length === 5 
          ? `${formulario.horaSalida}:00` 
          : formulario.horaSalida,
        horaLlegada: formulario.horaLlegada.length === 5 
          ? `${formulario.horaLlegada}:00` 
          : formulario.horaLlegada,
        // Fecha de regreso solo si es ida y vuelta
        fechaRegreso: formulario.tipoVuelo === 'IdaYVuelta' ? formulario.fechaRegreso : null,
      };

      // Si es edición, asegurar que el ID sea un número
      if (modoEdicion && datosVuelo.id) {
        datosVuelo.id = parseInt(datosVuelo.id);
      }

      console.log('Datos enviados al backend:', datosVuelo);

      if (modoEdicion) {
        await actualizarVuelo(datosVuelo);
        setSuccessMsg('Vuelo actualizado exitosamente');
      } else {
        await crearVuelo(datosVuelo);
        setSuccessMsg('Vuelo creado exitosamente');
      }
      setMostrarModal(false);
      setModalError(null);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar vuelo:', error);
      
      // Extraer mensaje de error del backend
      let mensajeError = 'Error al guardar el vuelo';
      
      if (error.response?.data?.errors?.[0]?.mensaje) {
        // Si hay errores de validación del backend
        mensajeError = error.response.data.errors[0].mensaje;
      } else if (error.response?.data?.message) {
        // Si hay un mensaje general del backend
        mensajeError = error.response.data.message;
      } else if (error.message) {
        // Si hay un mensaje de error de Axios
        mensajeError = error.message;
      }
      
      setModalError(mensajeError);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar este vuelo?')) return;
    
    try {
      await eliminarVuelo(id);
      setSuccessMsg('Vuelo eliminado exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar vuelo:', error);
      
      // Extraer mensaje de error del backend
      let mensajeError = 'Error al eliminar el vuelo';
      
      if (error.response?.data?.errors?.[0]?.mensaje) {
        mensajeError = error.response.data.errors[0].mensaje;
      } else if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      setError(mensajeError);
    }
  };

  const vuelosFiltrados = vuelos.filter(v =>
    v.numeroVuelo?.toLowerCase().includes(filtro.toLowerCase()) ||
    v.origen?.toLowerCase().includes(filtro.toLowerCase()) ||
    v.destino?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Cálculos de paginación
  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const vuelosActuales = vuelosFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(vuelosFiltrados.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
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
                <h1 className="text-30 lh-14 fw-600">Gestión de Vuelos</h1>
                <div className="text-15 text-light-1">
                  Administrar todos los vuelos del sistema
                </div>
              </div>
              <div className="col-auto">
                <button 
                  className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
                  onClick={abrirModalNuevo}
                >
                  <i className="icon-plus text-20 mr-10"></i>
                  Nuevo Vuelo
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="py-30 px-30 rounded-4 bg-white shadow-3 mb-30">
              <EstadosInfo />
              <div className="row y-gap-20">
                <div className="col-12">
                  <input
                    type="text"
                    placeholder="Buscar por número de vuelo"
                    className="form-control"
                    value={filtro}
                    onChange={(e) => {
                      setFiltro(e.target.value);
                      setPaginaActual(1);
                    }}
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

            {/* Tabla de Vuelos */}
            <div className="py-30 px-30 rounded-4 bg-white shadow-3">
              {loading ? (
                <div className="text-center py-40">
                  <div className="spinner-border text-blue-1"></div>
                </div>
              ) : (
                <div className="overflow-scroll scroll-bar-1">
                  <table className="table-3 -border-bottom col-12">
                    <thead className="bg-light-2">
                      <tr>
                        <th>Número de Vuelo</th>
                        <th>Tipo de Vuelo</th>
                        <th>Aeronave</th>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Fecha Salida</th>
                        <th>Fecha Regreso</th>
                        <th>Salida</th>
                        <th>Llegada</th>
                        <th>Duración</th>
                        <th>Precio Base</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vuelosActuales.map((vuelo, index) => {
                        const fechaPasada = vueloFechaPasada(vuelo);
                        return (
                        <tr 
                          key={vuelo.id || `vuelo-${index}`}
                          style={fechaPasada ? {
                            backgroundColor: '#f5f5f5',
                            opacity: '0.8'
                          } : {}}
                        >
                          <td className="fw-500">{vuelo.numeroVuelo}</td>
                          <td>
                            <span className={`rounded-100 py-4 px-10 text-center text-14 fw-500 ${
                              vuelo.tipoVuelo === 'IdaYVuelta' ? 'bg-blue-1-05 text-blue-1' : 'bg-yellow-4 text-yellow-3'
                            }`}>
                              {vuelo.tipoVuelo === 'IdaYVuelta' ? 'Ida y Vuelta' : 'Solo Ida'}
                            </span>
                          </td>
                          <td>
                            <div className="fw-500">{vuelo.aeronave?.modelo || 'Sin asignar'}</div>
                            <div className="text-14 text-light-1">{vuelo.aeronave?.matricula || '-'}</div>
                          </td>
                          <td>
                            <div className="fw-500">{vuelo.origenCodigo}</div>
                            <div className="text-14 text-light-1">{vuelo.origenNombre}</div>
                          </td>
                          <td>
                            <div className="fw-500">{vuelo.destinoCodigo}</div>
                            <div className="text-14 text-light-1">{vuelo.destinoNombre}</div>
                          </td>
                          <td>
                            {fechaPasada && (
                              <div className="text-12 text-red-2 fw-500 mb-5">
                                ⚠️ Vencido - Actualizar o eliminar
                              </div>
                            )}
                            {fechaPasada && (
                              <i 
                                className="icon-alert-circle text-16 mr-5" 
                                style={{ color: '#ffc107', cursor: 'pointer' }} 
                                title="Fecha vencida - Clic para más información"
                                onClick={() => alert('⚠️ ADVERTENCIA: Este vuelo tiene una fecha que ya pasó.\n\nPor favor, actualice la fecha y hora del vuelo.')}
                              ></i>
                            )}
                            {new Date(vuelo.fecha).toLocaleDateString('es-ES')}
                          </td>
                          <td>
                            {vuelo.tipoVuelo === 'IdaYVuelta' && vuelo.fechaRegreso ? (
                              <span>{new Date(vuelo.fechaRegreso).toLocaleDateString('es-ES')}</span>
                            ) : (
                              <span className="text-14 text-light-1">-</span>
                            )}
                          </td>
                          <td>{vuelo.horaSalidaFormato || formatearHora(vuelo.horaSalida)}</td>
                          <td>{vuelo.horaLlegadaFormato || formatearHora(vuelo.horaLlegada)}</td>
                          <td>{formatearDuracion(vuelo.duracion)}</td>
                          <td className="fw-500">US${vuelo.precioBase?.toFixed(2) || '0.00'}</td>
                          <td>
                            <span className={`rounded-100 py-4 px-10 text-center text-14 fw-500 ${
                              vuelo.estado === 'Programado' ? 'bg-blue-1-05 text-blue-1' :
                              vuelo.estado === 'En Vuelo' ? 'bg-yellow-4 text-yellow-3' :
                              vuelo.estado === 'Aterrizado' ? 'bg-purple-1-05 text-purple-1' :
                              vuelo.estado === 'Completado' ? 'bg-green-2 text-white' :
                              vuelo.estado === 'Cancelado' ? 'bg-red-3 text-red-2' :
                              'bg-light-2 text-light-1'
                            }`}>
                              {vuelo.estado}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex items-center gap-10">
                              <button
                                className={`flex-center rounded-4 size-35 ${
                                  vuelo.estado === 'En Vuelo' ? 'bg-light-3 cursor-not-allowed' : 'bg-light-2'
                                }`}
                                onClick={() => vuelo.estado !== 'En Vuelo' && abrirModalEditar(vuelo)}
                                disabled={vuelo.estado === 'En Vuelo'}
                                title={vuelo.estado === 'En Vuelo' ? 'No se puede editar un vuelo en curso' : 'Editar'}
                                style={{ opacity: vuelo.estado === 'En Vuelo' ? 0.5 : 1 }}
                              >
                                <i className="icon-edit text-16 text-light-1"></i>
                              </button>
                              <button
                                className={`flex-center rounded-4 size-35 ${
                                  vuelo.estado === 'En Vuelo' ? 'bg-light-3 cursor-not-allowed' : 'bg-red-3'
                                }`}
                                onClick={() => vuelo.estado !== 'En Vuelo' && handleEliminar(vuelo.id)}
                                disabled={vuelo.estado === 'En Vuelo'}
                                title={vuelo.estado === 'En Vuelo' ? 'No se puede eliminar un vuelo en curso' : 'Eliminar'}
                                style={{ opacity: vuelo.estado === 'En Vuelo' ? 0.5 : 1 }}
                              >
                                <i className={`icon-trash-2 text-16 ${
                                  vuelo.estado === 'En Vuelo' ? 'text-light-1' : 'text-red-2'
                                }`}></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {vuelosFiltrados.length === 0 && (
                    <div className="text-center py-40 text-light-1">
                      No se encontraron vuelos
                    </div>
                  )}
                </div>
              )}

              {/* Paginación */}
              {!loading && vuelosFiltrados.length > 0 && (
                <div className="pt-30 border-top-light">
                  <div className="row x-gap-10 y-gap-20 justify-between items-center">
                    <div className="col-auto">
                      <div className="text-14 text-light-1">
                        Mostrando {indexPrimero + 1} a {Math.min(indexUltimo, vuelosFiltrados.length)} de {vuelosFiltrados.length} vuelos
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="row x-gap-10 y-gap-10 items-center">
                        <div className="col-auto">
                          <button
                            className="button -blue-1 size-40 rounded-full border-light"
                            onClick={() => cambiarPagina(paginaActual - 1)}
                            disabled={paginaActual === 1}
                            style={{ opacity: paginaActual === 1 ? 0.5 : 1 }}
                          >
                            <i className="icon-chevron-left text-12"></i>
                          </button>
                        </div>
                        {[...Array(totalPaginas)].map((_, index) => {
                          const numeroPagina = index + 1;
                          // Mostrar solo páginas cercanas a la actual
                          if (
                            numeroPagina === 1 ||
                            numeroPagina === totalPaginas ||
                            (numeroPagina >= paginaActual - 1 && numeroPagina <= paginaActual + 1)
                          ) {
                            return (
                              <div className="col-auto" key={numeroPagina}>
                                <button
                                  className={`button size-40 rounded-full ${
                                    paginaActual === numeroPagina
                                      ? 'bg-dark-1 text-white'
                                      : 'border-light bg-white text-dark-1'
                                  }`}
                                  onClick={() => cambiarPagina(numeroPagina)}
                                >
                                  {numeroPagina}
                                </button>
                              </div>
                            );
                          } else if (
                            numeroPagina === paginaActual - 2 ||
                            numeroPagina === paginaActual + 2
                          ) {
                            return (
                              <div className="col-auto" key={numeroPagina}>
                                <div className="text-14 text-light-1">...</div>
                              </div>
                            );
                          }
                          return null;
                        })}
                        <div className="col-auto">
                          <button
                            className="button -blue-1 size-40 rounded-full border-light"
                            onClick={() => cambiarPagina(paginaActual + 1)}
                            disabled={paginaActual === totalPaginas}
                            style={{ opacity: paginaActual === totalPaginas ? 0.5 : 1 }}
                          >
                            <i className="icon-chevron-right text-12"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              maxWidth: '750px',
              width: '95%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div 
              style={{ 
                padding: '24px 30px', 
                borderBottom: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #3554d1 0%, #1a3a8f 100%)',
                borderRadius: '4px 4px 0 0'
              }}
            >
              <div className="d-flex justify-between items-center">
                <div>
                  <h3 className="text-22 fw-600 text-white mb-5">
                    {modoEdicion ? 'Editar Vuelo' : 'Nuevo Vuelo'}
                  </h3>
                  {formulario.numeroVuelo && (
                    <div className="d-flex items-center gap-10">
                      <span 
                        className="text-14 fw-500"
                        style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          padding: '4px 12px', 
                          borderRadius: '20px',
                          color: '#fff'
                        }}
                      >
                        ✈️ {formulario.numeroVuelo}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '20px'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div style={{ padding: '24px 30px' }}>
              {/* Error en el modal */}
              <ErrorAlert 
                error={modalError} 
                onClose={() => setModalError(null)} 
              />

              <form onSubmit={handleSubmit}>
                {/* SECCIÓN 1: Ruta del Vuelo */}
                <div 
                  style={{ 
                    background: '#f8fafc', 
                    borderRadius: '12px', 
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div className="d-flex items-center gap-10 mb-20">
                    <div style={{ 
                      background: '#3554d1', 
                      borderRadius: '8px', 
                      width: '32px', 
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="icon-location-2 text-white text-16"></i>
                    </div>
                    <h5 className="text-16 fw-600">Ruta del Vuelo</h5>
                  </div>
                  
                  <div className="row y-gap-20">
                    <div className="col-md-6">
                      <label className="text-13 fw-500 mb-10 d-block text-dark-1">Origen *</label>
                      <select
                        className="form-select"
                        value={formulario.origenCodigo}
                        onChange={async (e) => {
                          const origenNuevo = e.target.value;
                          if (origenNuevo && formulario.destinoCodigo) {
                            try {
                              const resp = await obtenerDuracionEntreAeropuertos(origenNuevo, formulario.destinoCodigo, formulario.horaSalida);
                              if (!resp) {
                                setFormulario({...formulario, origenCodigo: origenNuevo});
                              } else if (resp.success === true && resp.duracion !== undefined) {
                                const nuevoFormulario = { 
                                  ...formulario, 
                                  origenCodigo: origenNuevo, 
                                  duracion: resp.duracion 
                                };
                                // Usar horaLlegadaCalculada (24h) para enviar al backend
                                if (resp.horaLlegadaCalculada && formulario.horaSalida) {
                                  nuevoFormulario.horaLlegada = resp.horaLlegadaCalculada.substring(0, 5);
                                } else if (formulario.horaSalida) {
                                  nuevoFormulario.horaLlegada = calcularHoraLlegadaDesdeDuracion(formulario.horaSalida, resp.duracion);
                                }
                                if (resp.precioSugerido) {
                                  nuevoFormulario.precioBase = resp.precioSugerido;
                                }
                                setFormulario(nuevoFormulario);
                                return;
                              } else if (resp.success === false) {
                                setModalError(resp.message || 'Error al obtener información de la ruta');
                                setFormulario({ ...formulario, origenCodigo: origenNuevo });
                                return;
                              }
                            } catch (err) {
                              console.debug('No se pudo obtener información de ruta (origen):', err?.message || err);
                              setFormulario({...formulario, origenCodigo: origenNuevo});
                            }
                          } else {
                            setFormulario({...formulario, origenCodigo: origenNuevo});
                          }
                        }}
                        required
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: '#fff'
                        }}
                      >
                        <option value="">Seleccione origen</option>
                        {aeropuertos.map((a) => (
                          <option key={a.codigo} value={a.codigo}>
                            {a.codigo} - {a.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="text-13 fw-500 mb-10 d-block text-dark-1">Destino *</label>
                      <select
                        className="form-select"
                        value={formulario.destinoCodigo}
                        onChange={async (e) => {
                          const destinoNuevo = e.target.value;
                          if (formulario.origenCodigo && destinoNuevo) {
                            try {
                              const resp = await obtenerDuracionEntreAeropuertos(formulario.origenCodigo, destinoNuevo, formulario.horaSalida);
                              if (!resp) {
                                if (formulario.horaSalida && formulario.duracion) {
                                  const nuevaHoraLlegada = calcularHoraLlegadaDesdeDuracion(formulario.horaSalida, formulario.duracion);
                                  setFormulario({ ...formulario, destinoCodigo: destinoNuevo, horaLlegada: nuevaHoraLlegada });
                                } else {
                                  setFormulario({ ...formulario, destinoCodigo: destinoNuevo });
                                }
                              } else if (resp.success === true && resp.duracion !== undefined) {
                                const nuevoFormulario = { 
                                  ...formulario, 
                                  destinoCodigo: destinoNuevo, 
                                  duracion: resp.duracion 
                                };
                                // Usar horaLlegadaCalculada (24h) para enviar al backend
                                if (resp.horaLlegadaCalculada && formulario.horaSalida) {
                                  nuevoFormulario.horaLlegada = resp.horaLlegadaCalculada.substring(0, 5);
                                } else if (formulario.horaSalida) {
                                  nuevoFormulario.horaLlegada = calcularHoraLlegadaDesdeDuracion(formulario.horaSalida, resp.duracion);
                                }
                                if (resp.precioSugerido) {
                                  nuevoFormulario.precioBase = resp.precioSugerido;
                                }
                                setFormulario(nuevoFormulario);
                                return;
                              } else if (resp.success === false) {
                                setModalError(resp.message || 'Error al obtener información de la ruta');
                                setFormulario({ ...formulario, destinoCodigo: destinoNuevo });
                                return;
                              }
                            } catch (err) {
                              console.debug('No se pudo obtener información de ruta (destino):', err?.message || err);
                            }
                          }
                          if (formulario.horaSalida && formulario.duracion) {
                            const nuevaHoraLlegada = calcularHoraLlegadaDesdeDuracion(formulario.horaSalida, formulario.duracion);
                            setFormulario({ ...formulario, destinoCodigo: destinoNuevo, horaLlegada: nuevaHoraLlegada });
                          } else {
                            setFormulario({ ...formulario, destinoCodigo: destinoNuevo });
                          }
                        }}
                        required
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px',
                          border: formulario.origenCodigo && formulario.destinoCodigo && formulario.origenCodigo === formulario.destinoCodigo 
                            ? '2px solid #dc3545' 
                            : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: '#fff'
                        }}
                      >
                        <option value="">Seleccione destino</option>
                        {aeropuertos.map((a) => (
                          <option key={`destino-${a.codigo}`} value={a.codigo}>
                            {a.codigo} - {a.nombre}
                          </option>
                        ))}
                      </select>
                      {formulario.origenCodigo && formulario.destinoCodigo && formulario.origenCodigo === formulario.destinoCodigo && (
                        <small className="text-danger d-block mt-5">El destino no puede ser igual al origen</small>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: Fecha y Horarios */}
                <div 
                  style={{ 
                    background: '#f8fafc', 
                    borderRadius: '12px', 
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div className="d-flex items-center gap-10 mb-20">
                    <div style={{ 
                      background: '#f59e0b', 
                      borderRadius: '8px', 
                      width: '32px', 
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="icon-calendar text-white text-16"></i>
                    </div>
                    <h5 className="text-16 fw-600">Fecha y Horarios</h5>
                  </div>
                  
                  <div className="row y-gap-20">
                    <div className="col-md-6">
                      <label className="text-13 fw-500 mb-10 d-block text-dark-1">Fecha de Salida *</label>
                      <input
                        type="date"
                        value={formulario.fecha}
                        onChange={(e) => setFormulario({...formulario, fecha: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px',
                          border: formulario.fecha && new Date(formulario.fecha) < new Date(new Date().toISOString().split('T')[0])
                            ? '2px solid #dc3545'
                            : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: '#fff'
                        }}
                      />
                      {formulario.fecha && new Date(formulario.fecha) < new Date(new Date().toISOString().split('T')[0]) && (
                        <small className="text-danger d-block mt-5">No se puede seleccionar una fecha pasada</small>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="text-13 fw-500 mb-10 d-block text-dark-1">Hora de Salida *</label>
                      <input
                        type="time"
                        value={formulario.horaSalida}
                        onChange={async (e) => {
                          const hora = e.target.value;
                          if (formulario.origenCodigo && formulario.destinoCodigo && hora) {
                            try {
                              const resp = await obtenerDuracionEntreAeropuertos(
                                formulario.origenCodigo, 
                                formulario.destinoCodigo, 
                                hora
                              );
                              if (resp?.success && resp.horaLlegadaCalculada) {
                                // Usar formato 24h para enviar al backend
                                const horaLlegada = resp.horaLlegadaCalculada.substring(0, 5);
                                const nuevoFormulario = { 
                                  ...formulario, 
                                  horaSalida: hora, 
                                  horaLlegada,
                                  duracion: resp.duracion || formulario.duracion
                                };
                                if (resp.precioSugerido) {
                                  nuevoFormulario.precioBase = resp.precioSugerido;
                                }
                                setFormulario(nuevoFormulario);
                                return;
                              }
                            } catch (err) {
                              console.debug('No se pudo obtener hora de llegada del backend:', err?.message || err);
                            }
                          }
                          if (formulario.duracion) {
                            const nuevaHoraLlegada = calcularHoraLlegadaDesdeDuracion(hora, formulario.duracion);
                            setFormulario({ ...formulario, horaSalida: hora, horaLlegada: nuevaHoraLlegada });
                          } else {
                            setFormulario({ ...formulario, horaSalida: hora });
                          }
                        }}
                        required
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: '#fff'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 3: Aeronave */}
                <div 
                  style={{ 
                    background: '#f8fafc', 
                    borderRadius: '12px', 
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div className="d-flex items-center justify-between mb-10">
                    <div className="d-flex items-center gap-10">
                      <div style={{ 
                        background: '#8b5cf6', 
                        borderRadius: '8px', 
                        width: '32px', 
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="icon-airplane text-white text-16"></i>
                      </div>
                      <h5 className="text-16 fw-600">Aeronave</h5>
                    </div>
                    {cargandoAeronaves && (
                      <span className="text-12 text-light-1">
                        <i className="icon-loading animate-spin mr-5"></i>
                        Verificando disponibilidad...
                      </span>
                    )}
                  </div>
                  
                  {/* Mensaje de requisitos */}
                  {(!formulario.fecha || !formulario.horaSalida || !formulario.horaLlegada) ? (
                    <div 
                      style={{ 
                        background: '#fef3c7', 
                        border: '1px solid #fcd34d',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '15px'
                      }}
                    >
                      <p className="text-13 text-dark-1 mb-0">
                        <i className="icon-info text-14 mr-10" style={{ color: '#d97706' }}></i>
                        Complete la <strong>fecha</strong> y <strong>hora de salida</strong> para ver las aeronaves disponibles en ese horario.
                      </p>
                    </div>
                  ) : (
                    <p className="text-13 text-light-1 mb-15">
                      Mostrando aeronaves disponibles para el {formulario.fecha} de {formatearHora12h(formulario.horaSalida)} a {formatearHora12h(formulario.horaLlegada)}
                    </p>
                  )}
                  
                  <div className="row y-gap-20">
                    <div className="col-12">
                      <label className="text-13 fw-500 mb-10 d-block text-dark-1">
                        Seleccionar Aeronave *
                        {aeronavesDisponibles.length > 0 && (
                          <span className="text-green-2 ml-10">
                            ({aeronavesDisponibles.length} disponible{aeronavesDisponibles.length !== 1 ? 's' : ''})
                          </span>
                        )}
                      </label>
                      
                      {/* Select de aeronaves disponibles */}
                      {formulario.fecha && formulario.horaSalida && formulario.horaLlegada ? (
                        <>
                          <select
                            className="form-select"
                            value={formulario.matricula}
                            onChange={(e) => setFormulario({...formulario, matricula: e.target.value})}
                            required
                            disabled={cargandoAeronaves}
                            style={{
                              width: '100%',
                              height: '48px',
                              padding: '0 16px',
                              border: aeronavesDisponibles.length === 0 && !cargandoAeronaves 
                                ? '2px solid #dc3545' 
                                : '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              background: cargandoAeronaves ? '#f3f4f6' : '#fff'
                            }}
                          >
                            <option value="">
                              {cargandoAeronaves 
                                ? 'Cargando aeronaves...' 
                                : aeronavesDisponibles.length === 0 
                                  ? 'No hay aeronaves disponibles' 
                                  : 'Seleccione aeronave'}
                            </option>
                            {aeronavesDisponibles.map((a) => (
                              <option key={a.matricula} value={a.matricula}>
                                {a.modelo} - {a.matricula} ({a.capacidad} asientos)
                                {a.vuelosDelDia > 0 ? ` • ${a.vuelosDelDia} vuelo(s) hoy` : ''}
                              </option>
                            ))}
                          </select>

                          {/* Información de la aeronave seleccionada */}
                          {formulario.matricula && aeronavesDisponibles.find(a => a.matricula === formulario.matricula) && (
                            <div 
                              style={{ 
                                marginTop: '12px',
                                padding: '12px 16px',
                                background: '#f0fdf4',
                                border: '1px solid #86efac',
                                borderRadius: '8px'
                              }}
                            >
                              {(() => {
                                const aeronaveSeleccionada = aeronavesDisponibles.find(a => a.matricula === formulario.matricula);
                                return (
                                  <div className="row y-gap-10">
                                    <div className="col-md-6">
                                      <div className="text-12 text-light-1">Aeronave</div>
                                      <div className="text-14 fw-500">{aeronaveSeleccionada.modelo}</div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="text-12 text-light-1">Capacidad</div>
                                      <div className="text-14 fw-500">{aeronaveSeleccionada.capacidad} pasajeros</div>
                                    </div>
                                    {aeronaveSeleccionada.equipoAsignado && (
                                      <div className="col-md-6">
                                        <div className="text-12 text-light-1">Equipo Asignado</div>
                                        <div className="text-14 fw-500">
                                          {aeronaveSeleccionada.equipoAsignado.nombre}
                                          <span 
                                            className="ml-10 text-12"
                                            style={{
                                              background: aeronaveSeleccionada.equipoAsignado.estado === 'Disponible' ? '#dcfce7' : '#fef3c7',
                                              color: aeronaveSeleccionada.equipoAsignado.estado === 'Disponible' ? '#166534' : '#92400e',
                                              padding: '2px 8px',
                                              borderRadius: '12px'
                                            }}
                                          >
                                            {aeronaveSeleccionada.equipoAsignado.estado}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {aeronaveSeleccionada.proximoVuelo && (
                                      <div className="col-md-6">
                                        <div className="text-12 text-light-1">Próximo Vuelo</div>
                                        <div className="text-14 fw-500">
                                          {aeronaveSeleccionada.proximoVuelo.numeroVuelo} • {aeronaveSeleccionada.proximoVuelo.ruta}
                                        </div>
                                        <div className="text-12 text-light-1">
                                          {aeronaveSeleccionada.proximoVuelo.horaSalida} - {aeronaveSeleccionada.proximoVuelo.horaLlegada}
                                        </div>
                                      </div>
                                    )}
                                    {aeronaveSeleccionada.asientosPorClase && (
                                      <div className="col-12">
                                        <div className="text-12 text-light-1 mb-5">Distribución de asientos</div>
                                        <div className="d-flex gap-15">
                                          <span className="text-12">
                                            <strong>Primera:</strong> {aeronaveSeleccionada.asientosPorClase.primera || 0}
                                          </span>
                                          <span className="text-12">
                                            <strong>Ejecutiva:</strong> {aeronaveSeleccionada.asientosPorClase.ejecutiva || 0}
                                          </span>
                                          <span className="text-12">
                                            <strong>Económica:</strong> {aeronaveSeleccionada.asientosPorClase.economica || 0}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* Aeronaves no disponibles (colapsable) */}
                          {aeronavesNoDisponibles.length > 0 && (
                            <details style={{ marginTop: '15px' }}>
                              <summary 
                                style={{ 
                                  cursor: 'pointer', 
                                  color: '#6b7280',
                                  fontSize: '13px',
                                  userSelect: 'none'
                                }}
                              >
                                Ver {aeronavesNoDisponibles.length} aeronave(s) no disponible(s)
                              </summary>
                              <div 
                                style={{ 
                                  marginTop: '10px',
                                  maxHeight: '200px',
                                  overflowY: 'auto'
                                }}
                              >
                                {aeronavesNoDisponibles.map((a) => (
                                  <div 
                                    key={a.matricula}
                                    style={{
                                      padding: '10px 14px',
                                      background: '#fef2f2',
                                      border: '1px solid #fecaca',
                                      borderRadius: '6px',
                                      marginBottom: '8px'
                                    }}
                                  >
                                    <div className="d-flex justify-between items-start">
                                      <div>
                                        <div className="text-14 fw-500">{a.modelo} - {a.matricula}</div>
                                        <div className="text-12 text-red-1 mt-5">{a.razon}</div>
                                        {a.disponibleDesde && (
                                          <div className="text-12 text-light-1 mt-5">
                                            Disponible desde: <strong>{a.disponibleDesde}</strong>
                                          </div>
                                        )}
                                      </div>
                                      <span 
                                        style={{
                                          background: a.codigoRazon === 'NO_OPERATIVA' ? '#fef2f2' : 
                                                     a.codigoRazon === 'SIN_EQUIPO' ? '#fffbeb' : '#fef2f2',
                                          color: a.codigoRazon === 'NO_OPERATIVA' ? '#991b1b' : 
                                                 a.codigoRazon === 'SIN_EQUIPO' ? '#92400e' : '#991b1b',
                                          padding: '2px 8px',
                                          borderRadius: '4px',
                                          fontSize: '11px',
                                          fontWeight: '500'
                                        }}
                                      >
                                        {a.codigoRazon === 'NO_OPERATIVA' ? 'Mantenimiento' : 
                                         a.codigoRazon === 'SIN_EQUIPO' ? 'Sin Tripulación' : 'Conflicto'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </>
                      ) : (
                        /* Fallback: Select con todas las aeronaves si no hay horario */
                        <select
                          className="form-select"
                          value={formulario.matricula}
                          onChange={(e) => setFormulario({...formulario, matricula: e.target.value})}
                          required
                          style={{
                            width: '100%',
                            height: '48px',
                            padding: '0 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: '#fff'
                          }}
                        >
                          <option value="">Seleccione aeronave</option>
                          {aeronaves.map((a, index) => (
                            <option key={a.matricula || `aeronave-${index}`} value={a.matricula}>
                              {a.modelo} - {a.matricula}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 4: Campos Calculados */}
                <div 
                  style={{ 
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', 
                    borderRadius: '12px', 
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid #a7f3d0'
                  }}
                >
                  <div className="d-flex items-center gap-10 mb-10">
                    <div style={{ 
                      background: '#10b981', 
                      borderRadius: '8px', 
                      width: '32px', 
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="icon-check text-white text-16"></i>
                    </div>
                    <h5 className="text-16 fw-600 text-green-2">Campos Calculados</h5>
                  </div>
                  <p className="text-13 text-light-1 mb-20">
                    Estos valores se calculan automáticamente según la ruta seleccionada
                  </p>
                  
                  <div className="row y-gap-15">
                    <div className="col-md-4">
                      <label className="text-12 fw-500 mb-8 d-block text-dark-1">Hora de Llegada</label>
                      <div 
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px',
                          border: '1px solid #a7f3d0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          color: formulario.horaLlegada ? '#1f2937' : '#9ca3af'
                        }}
                      >
                        {formulario.horaLlegada ? formatearHora12h(formulario.horaLlegada) : '--:--'}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="text-12 fw-500 mb-8 d-block text-dark-1">Duración</label>
                      <div 
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px',
                          border: '1px solid #a7f3d0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          color: formulario.duracion ? '#1f2937' : '#9ca3af'
                        }}
                      >
                        {(formulario.duracion !== '' && formulario.duracion !== null)
                          ? formatearDuracion(formulario.duracion)
                          : '--'}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="text-12 fw-500 mb-8 d-block text-dark-1">Precio Base</label>
                      <div 
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px',
                          border: '1px solid #a7f3d0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          fontWeight: '600',
                          color: formulario.precioBase ? '#059669' : '#9ca3af'
                        }}
                      >
                        {formulario.precioBase ? `$${parseFloat(formulario.precioBase).toFixed(2)} USD` : '--'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 5: Tipo de Vuelo */}
                <div 
                  style={{ 
                    background: '#f8fafc', 
                    borderRadius: '12px', 
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div className="d-flex items-center gap-10 mb-20">
                    <div style={{ 
                      background: '#ec4899', 
                      borderRadius: '8px', 
                      width: '32px', 
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="icon-route text-white text-16"></i>
                    </div>
                    <h5 className="text-16 fw-600">Tipo de Vuelo</h5>
                  </div>
                  
                  <div className="row y-gap-20">
                    <div className="col-md-6">
                      <label className="text-13 fw-500 mb-10 d-block text-dark-1">Tipo</label>
                      <select
                        className="form-select"
                        value={formulario.tipoVuelo}
                        onChange={(e) => setFormulario({...formulario, tipoVuelo: e.target.value, fechaRegreso: e.target.value === 'SoloIda' ? '' : formulario.fechaRegreso})}
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: '#fff'
                        }}
                      >
                        <option value="IdaYVuelta">Ida y Vuelta</option>
                        <option value="SoloIda">Solo Ida</option>
                      </select>
                    </div>

                    {formulario.tipoVuelo === 'IdaYVuelta' && (
                      <div className="col-md-6">
                        <label className="text-13 fw-500 mb-10 d-block text-dark-1">Fecha de Regreso *</label>
                        <input
                          type="date"
                          value={formulario.fechaRegreso}
                          onChange={(e) => setFormulario({...formulario, fechaRegreso: e.target.value})}
                          min={formulario.fecha ? new Date(new Date(formulario.fecha).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                          required
                          style={{
                            width: '100%',
                            height: '48px',
                            padding: '0 16px',
                            border: formulario.fechaRegreso && formulario.fecha && new Date(formulario.fechaRegreso) <= new Date(formulario.fecha)
                              ? '2px solid #dc3545'
                              : '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: '#fff'
                          }}
                        />
                        {formulario.fechaRegreso && formulario.fecha && new Date(formulario.fechaRegreso) <= new Date(formulario.fecha) && (
                          <small className="text-danger d-block mt-5">La fecha de regreso debe ser posterior a la fecha de ida</small>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="d-flex gap-15 justify-end pt-20" style={{ borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    className="button h-50 px-30 -outline-dark-1 text-dark-1"
                    onClick={() => setMostrarModal(false)}
                    style={{ borderRadius: '8px' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="button h-50 px-30 -dark-1 bg-blue-1 text-white"
                    style={{ borderRadius: '8px' }}
                  >
                    {modoEdicion ? 'Actualizar' : 'Crear'} Vuelo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GestionVuelos;
