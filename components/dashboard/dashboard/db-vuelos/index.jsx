'use client'

import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import ErrorAlert, { SuccessAlert } from "@/components/common/ErrorAlert";
import { 
  obtenerTodosLosVuelos, 
  crearVuelo, 
  actualizarVuelo, 
  eliminarVuelo 
} from "@/api/vueloAdminService";
import { obtenerAeropuertos } from "@/api/aeropuertoService";
import { obtenerTodasLasAeronaves } from "@/api/aeronaveService";

// Función para formatear hora a formato 12h con AM/PM
const formatearHora12h = (hora) => {
  if (!hora) return '-';
  const partes = hora.split(':');
  if (partes.length >= 2) {
    let horas = parseInt(partes[0], 10);
    const minutos = partes[1].padStart(2, '0');
    const periodo = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    if (horas === 0) horas = 12;
    return `${horas}:${minutos} ${periodo}`;
  }
  return hora;
};

const GestionVuelos = () => {
  const [vuelos, setVuelos] = useState([]);
  const [aeropuertos, setAeropuertos] = useState([]);
  const [aeronaves, setAeronaves] = useState([]);
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
      clase: 'Economica',
      estado: 'Programado'
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (vuelo) => {
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
      clase: vuelo.clase || 'Economica',
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
      // Pasar el AxiosError completo para que ErrorAlert extraiga response.data.errors[0].mensaje
      setModalError(error);
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
      const errorData = error.response?.data || error;
      setError(errorData);
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
              <div className="row y-gap-20">
                <div className="col-12">
                  <input
                    type="text"
                    placeholder="Buscar por número de vuelo"
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
                        <th>Aeronave</th>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Fecha</th>
                        <th>Salida</th>
                        <th>Llegada</th>
                        <th>Precio Base</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vuelosActuales.map((vuelo, index) => (
                        <tr key={vuelo.id || `vuelo-${index}`}>
                          <td className="fw-500">{vuelo.numeroVuelo}</td>
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
                          <td>{new Date(vuelo.fecha).toLocaleDateString('es-ES')}</td>
                          <td>{formatearHora12h(vuelo.horaSalida)}</td>
                          <td>{formatearHora12h(vuelo.horaLlegada)}</td>
                          <td className="fw-500">US${vuelo.precioBase?.toFixed(2) || '0.00'}</td>
                          <td>
                            <span className={`rounded-100 py-4 px-10 text-center text-14 fw-500 ${
                              vuelo.estado === 'Programado' ? 'bg-blue-1-05 text-blue-1' :
                              vuelo.estado === 'En Vuelo' ? 'bg-yellow-4 text-yellow-3' :
                              vuelo.estado === 'Completado' ? 'bg-green-1 text-white' :
                              'bg-red-3 text-red-2'
                            }`}>
                              {vuelo.estado}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex items-center gap-10">
                              <button
                                className="flex-center bg-light-2 rounded-4 size-35"
                                onClick={() => abrirModalEditar(vuelo)}
                                title="Editar"
                              >
                                <i className="icon-edit text-16 text-light-1"></i>
                              </button>
                              <button
                                className="flex-center bg-red-3 rounded-4 size-35"
                                onClick={() => handleEliminar(vuelo.id)}
                                title="Eliminar"
                              >
                                <i className="icon-trash-2 text-16 text-red-2"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '40px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-22 fw-600 mb-30">
              {modoEdicion ? 'Editar Vuelo' : 'Nuevo Vuelo'}
            </h3>

            {/* Error en el modal */}
            <ErrorAlert 
              error={modalError} 
              onClose={() => setModalError(null)} 
            />

            <form onSubmit={handleSubmit}>
              <div className="row y-gap-20">
                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="text"
                      value={formulario.numeroVuelo}
                      readOnly
                      disabled
                      style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                    />
                    <label className="lh-1 text-14 text-light-1">
                      Número de Vuelo (Automático)
                    </label>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="text-14 fw-500 mb-10 d-block">Aeronave</label>
                  <select
                    className="form-select"
                    value={formulario.matricula}
                    onChange={(e) => setFormulario({...formulario, matricula: e.target.value})}
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Seleccione aeronave</option>
                    {aeronaves.map((a, index) => (
                      <option key={a.matricula || `aeronave-${index}`} value={a.matricula}>
                        {a.modelo} - {a.matricula}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-14 fw-500 mb-10 d-block">Origen</label>
                  <select
                    className="form-select"
                    value={formulario.origenCodigo}
                    onChange={(e) => setFormulario({...formulario, origenCodigo: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Seleccione origen</option>
                    {aeropuertos.map((a) => (
                      <option key={`origen-${a.codigo}`} value={a.codigo}>
                        {a.codigo} - {a.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-14 fw-500 mb-10 d-block">Destino</label>
                  <select
                    className="form-select"
                    value={formulario.destinoCodigo}
                    onChange={(e) => setFormulario({...formulario, destinoCodigo: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: formulario.origenCodigo && formulario.destinoCodigo && formulario.origenCodigo === formulario.destinoCodigo 
                        ? '2px solid #dc3545' 
                        : '1px solid #ddd',
                      borderRadius: '4px'
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

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="date"
                      value={formulario.fecha}
                      onChange={(e) => setFormulario({...formulario, fecha: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      style={{
                        border: formulario.fecha && new Date(formulario.fecha) < new Date(new Date().toISOString().split('T')[0])
                          ? '2px solid #dc3545'
                          : undefined
                      }}
                    />
                    <label className="lh-1 text-14 text-light-1">Fecha</label>
                  </div>
                  {formulario.fecha && new Date(formulario.fecha) < new Date(new Date().toISOString().split('T')[0]) && (
                    <small className="text-danger d-block mt-5">No se puede seleccionar una fecha pasada</small>
                  )}
                </div>

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="time"
                      value={formulario.horaSalida}
                      onChange={(e) => setFormulario({...formulario, horaSalida: e.target.value})}
                      required
                    />
                    <label className="lh-1 text-14 text-light-1">Hora de Salida</label>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="time"
                      value={formulario.horaLlegada}
                      onChange={(e) => setFormulario({...formulario, horaLlegada: e.target.value})}
                      required
                      style={{
                        border: formulario.horaSalida && formulario.horaLlegada && calcularDuracionMinutos() !== null && calcularDuracionMinutos() < 30
                          ? '2px solid #dc3545'
                          : undefined
                      }}
                    />
                    <label className="lh-1 text-14 text-light-1">Hora de Llegada</label>
                  </div>
                  {formulario.horaSalida && formulario.horaLlegada && calcularDuracionMinutos() !== null && calcularDuracionMinutos() < 30 && (
                    <small className="text-danger d-block mt-5">La duración del vuelo debe ser de al menos 30 minutos</small>
                  )}
                </div>

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="text"
                      value={calcularDuracionDisplay()}
                      readOnly
                      placeholder="Calculada automáticamente"
                    />
                    <label className="lh-1 text-14 text-light-1">Duración (Automática)</label>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formulario.precioBase}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || parseFloat(value) >= 0) {
                          setFormulario({...formulario, precioBase: value});
                        }
                      }}
                      required
                      style={{
                        border: formulario.precioBase !== '' && parseFloat(formulario.precioBase) < 0
                          ? '2px solid #dc3545'
                          : undefined
                      }}
                    />
                    <label className="lh-1 text-14 text-light-1">Precio Base (USD)</label>
                  </div>
                  {formulario.precioBase !== '' && parseFloat(formulario.precioBase) < 0 && (
                    <small className="text-danger d-block mt-5">El precio no puede ser negativo</small>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="text-14 fw-500 mb-10 d-block">Tipo de Vuelo</label>
                  <select
                    className="form-select"
                    value={formulario.tipoVuelo}
                    onChange={(e) => setFormulario({...formulario, tipoVuelo: e.target.value, fechaRegreso: e.target.value === 'SoloIda' ? '' : formulario.fechaRegreso})}
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="IdaYVuelta">Ida y Vuelta</option>
                    <option value="SoloIda">Solo Ida</option>
                  </select>
                </div>

                {/* Campo de Fecha de Regreso - Solo visible para vuelos de Ida y Vuelta */}
                {formulario.tipoVuelo === 'IdaYVuelta' && (
                  <div className="col-md-6">
                    <div className="form-input">
                      <input
                        type="date"
                        value={formulario.fechaRegreso}
                        onChange={(e) => setFormulario({...formulario, fechaRegreso: e.target.value})}
                        min={formulario.fecha ? new Date(new Date(formulario.fecha).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        required
                        style={{
                          border: formulario.fechaRegreso && formulario.fecha && new Date(formulario.fechaRegreso) <= new Date(formulario.fecha)
                            ? '2px solid #dc3545'
                            : undefined
                        }}
                      />
                      <label className="lh-1 text-14 text-light-1">Fecha de Regreso</label>
                    </div>
                    {formulario.fechaRegreso && formulario.fecha && new Date(formulario.fechaRegreso) <= new Date(formulario.fecha) && (
                      <small className="text-danger d-block mt-5">La fecha de regreso debe ser posterior a la fecha de ida</small>
                    )}
                  </div>
                )}

                <div className="col-md-6">
                  <label className="text-14 fw-500 mb-10 d-block">Clase</label>
                  <select
                    className="form-select"
                    value={formulario.clase}
                    onChange={(e) => setFormulario({...formulario, clase: e.target.value})}
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="Economica">Económica</option>
                    <option value="Ejecutiva">Ejecutiva</option>
                    <option value="Primera">Primera</option>
                  </select>
                </div>

                <div className="col-12 mt-20">
                  <div className="d-flex gap-10 justify-end">
                    <button
                      type="button"
                      className="button h-50 px-24 -outline-blue-1"
                      onClick={() => setMostrarModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
                    >
                      {modoEdicion ? 'Actualizar' : 'Crear'} Vuelo
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default GestionVuelos;
