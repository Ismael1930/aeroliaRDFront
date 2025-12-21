'use client'

import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import { 
  obtenerTodosLosVuelos, 
  crearVuelo, 
  actualizarVuelo, 
  eliminarVuelo 
} from "@/api/vueloAdminService";
import { obtenerAeropuertos } from "@/api/aeropuertoService";
import { obtenerAeronavesDisponibles } from "@/api/aeronaveService";

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
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  const [formulario, setFormulario] = useState({
    numeroVuelo: '',
    idAeronave: '',
    origenCodigo: '',
    destinoCodigo: '',
    fecha: '',
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
        // El backend puede devolver {data: [...]} o directamente [...]
        vuelosData = Array.isArray(response) ? response : (response.data || response.vuelos || []);
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
        const response = await obtenerAeronavesDisponibles();
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
      idAeronave: '',
      origenCodigo: '',
      destinoCodigo: '',
      fecha: '',
      horaSalida: '',
      horaLlegada: '',
      duracion: '',
      precioBase: '',
      tipoVuelo: 'IdaYVuelta',
      estado: 'Programado'
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (vuelo) => {
    setModoEdicion(true);
    setVueloSeleccionado(vuelo);
    setFormulario({
      id: vuelo.id,
      numeroVuelo: vuelo.numeroVuelo,
      idAeronave: vuelo.idAeronave || '',
      origenCodigo: vuelo.origenCodigo,
      destinoCodigo: vuelo.destinoCodigo,
      fecha: vuelo.fecha?.split('T')[0] || '',
      horaSalida: vuelo.horaSalida,
      horaLlegada: vuelo.horaLlegada,
      duracion: vuelo.duracion || '',
      precioBase: vuelo.precioBase,
      tipoVuelo: vuelo.tipoVuelo || 'IdaYVuelta',
      estado: vuelo.estado || 'Programado'
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calcular duración en minutos automáticamente
      const duracionMinutos = calcularDuracionMinutos();
      
      // Convertir y preparar los datos para el backend
      const datosVuelo = {
        ...formulario,
        duracion: duracionMinutos, // Enviar duración en minutos como número
        // Convertir ID de aeronave a número (o null si está vacío)
        idAeronave: formulario.idAeronave ? parseInt(formulario.idAeronave) : null,
        // Convertir precio base a número
        precioBase: parseFloat(formulario.precioBase),
        // Convertir horas al formato TimeSpan de .NET (HH:mm:ss)
        horaSalida: formulario.horaSalida.length === 5 
          ? `${formulario.horaSalida}:00` 
          : formulario.horaSalida,
        horaLlegada: formulario.horaLlegada.length === 5 
          ? `${formulario.horaLlegada}:00` 
          : formulario.horaLlegada,
      };

      // Si es edición, asegurar que el ID sea un número
      if (modoEdicion && datosVuelo.id) {
        datosVuelo.id = parseInt(datosVuelo.id);
      }

      console.log('Datos enviados al backend:', datosVuelo);

      if (modoEdicion) {
        await actualizarVuelo(datosVuelo);
        alert('Vuelo actualizado exitosamente');
      } else {
        await crearVuelo(datosVuelo);
        alert('Vuelo creado exitosamente');
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar vuelo:', error);
      alert('Error al guardar el vuelo');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar este vuelo?')) return;
    
    try {
      await eliminarVuelo(id);
      alert('Vuelo eliminado exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar vuelo:', error);
      alert('Error al eliminar el vuelo');
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

            {/* Mensaje de error */}
            {error && (
              <div className="py-20 px-30 rounded-4 bg-red-1-05 mb-30">
                <div className="d-flex items-center">
                  <i className="icon-alert-circle text-24 text-red-1 mr-10"></i>
                  <div className="text-15 text-red-1">{error}</div>
                </div>
              </div>
            )}

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
                            <div>{vuelo.origenCodigo}</div>
                            <div className="text-14 text-light-1">{vuelo.origen}</div>
                          </td>
                          <td>
                            <div>{vuelo.destinoCodigo}</div>
                            <div className="text-14 text-light-1">{vuelo.destino}</div>
                          </td>
                          <td>{new Date(vuelo.fecha).toLocaleDateString('es-ES')}</td>
                          <td>{vuelo.horaSalida}</td>
                          <td>{vuelo.horaLlegada}</td>
                          <td className="fw-500">US${vuelo.precioBase}</td>
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

            <form onSubmit={handleSubmit}>
              <div className="row y-gap-20">
                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="text"
                      value={formulario.numeroVuelo}
                      onChange={(e) => setFormulario({...formulario, numeroVuelo: e.target.value})}
                      required
                      readOnly={!modoEdicion}
                      style={!modoEdicion ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                    />
                    <label className="lh-1 text-14 text-light-1">
                      Número de Vuelo {!modoEdicion && '(Automático)'}
                    </label>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="text-14 fw-500 mb-10 d-block">Aeronave</label>
                  <select
                    className="form-select"
                    value={formulario.idAeronave}
                    onChange={(e) => setFormulario({...formulario, idAeronave: e.target.value})}
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Seleccione aeronave</option>
                    {aeronaves.map((a) => (
                      <option key={a.id} value={a.id}>
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
                      border: '1px solid #ddd',
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
                </div>

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="date"
                      value={formulario.fecha}
                      onChange={(e) => setFormulario({...formulario, fecha: e.target.value})}
                      required
                    />
                    <label className="lh-1 text-14 text-light-1">Fecha</label>
                  </div>
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
                    />
                    <label className="lh-1 text-14 text-light-1">Hora de Llegada</label>
                  </div>
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
                      value={formulario.precioBase}
                      onChange={(e) => setFormulario({...formulario, precioBase: e.target.value})}
                      required
                    />
                    <label className="lh-1 text-14 text-light-1">Precio Base (USD)</label>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="text-14 fw-500 mb-10 d-block">Tipo de Vuelo</label>
                  <select
                    className="form-select"
                    value={formulario.tipoVuelo}
                    onChange={(e) => setFormulario({...formulario, tipoVuelo: e.target.value})}
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
