'use client'

import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import ErrorAlert, { SuccessAlert } from "@/components/common/ErrorAlert";
import { 
  obtenerTodaLaTripulacion, 
  crearTripulacion, 
  actualizarTripulacion, 
  eliminarTripulacion 
} from "@/api/tripulacionService";
import { obtenerTodosLosVuelos } from "@/api/vueloAdminService";

const GestionTripulacion = () => {
  // Tab activo
  const [tabActivo, setTabActivo] = useState('personal');
  
  // Estados para Personal
  const [tripulacion, setTripulacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  // Estados para Equipos
  const [equipos, setEquipos] = useState([]);
  const [mostrarModalEquipo, setMostrarModalEquipo] = useState(false);
  const [modoEdicionEquipo, setModoEdicionEquipo] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [filtroEquipo, setFiltroEquipo] = useState('');

  // Estados para Asignaciones
  const [vuelos, setVuelos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [mostrarModalAsignacion, setMostrarModalAsignacion] = useState(false);
  const [vueloParaAsignar, setVueloParaAsignar] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    rol: 'Piloto',
    licencia: '',
    estado: 'Disponible'
  });

  const [formularioEquipo, setFormularioEquipo] = useState({
    nombre: '',
    descripcion: '',
    miembrosIds: [],
    estado: 'Activo'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar tripulación
      try {
        const response = await obtenerTodaLaTripulacion();
        console.log('Respuesta tripulación:', response);
        const tripulacionData = response.data || response.tripulacion || (Array.isArray(response) ? response : []);
        setTripulacion(Array.isArray(tripulacionData) ? tripulacionData : []);
      } catch (err) {
        console.error('Error al cargar tripulación:', err);
        if (err.response?.status === 403) {
          setError('No tienes permisos para ver la tripulación. Contacta al administrador.');
        }
      }

      // Cargar vuelos para asignaciones
      try {
        const response = await obtenerTodosLosVuelos();
        const vuelosData = response.data || (Array.isArray(response) ? response : []);
        setVuelos(Array.isArray(vuelosData) ? vuelosData : []);
      } catch (err) {
        console.error('Error al cargar vuelos:', err);
      }

      // Cargar equipos del localStorage (temporal hasta tener backend)
      const equiposGuardados = localStorage.getItem('equiposTripulacion');
      if (equiposGuardados) {
        setEquipos(JSON.parse(equiposGuardados));
      }

      // Cargar asignaciones del localStorage (temporal hasta tener backend)
      const asignacionesGuardadas = localStorage.getItem('asignacionesTripulacion');
      if (asignacionesGuardadas) {
        setAsignaciones(JSON.parse(asignacionesGuardadas));
      }

    } catch (error) {
      console.error('Error general al cargar datos:', error);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Guardar equipos en localStorage
  const guardarEquipos = (nuevosEquipos) => {
    localStorage.setItem('equiposTripulacion', JSON.stringify(nuevosEquipos));
    setEquipos(nuevosEquipos);
  };

  // Guardar asignaciones en localStorage
  const guardarAsignaciones = (nuevasAsignaciones) => {
    localStorage.setItem('asignacionesTripulacion', JSON.stringify(nuevasAsignaciones));
    setAsignaciones(nuevasAsignaciones);
  };

  // ===================== FUNCIONES PERSONAL =====================
  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setModalError(null);
    setFormulario({
      nombre: '',
      apellido: '',
      rol: 'Piloto',
      licencia: '',
      estado: 'Disponible'
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (miembro) => {
    setModoEdicion(true);
    setMiembroSeleccionado(miembro);
    setModalError(null);
    setFormulario({
      id: miembro.id,
      nombre: miembro.nombre,
      apellido: miembro.apellido,
      rol: miembro.rol,
      licencia: miembro.licencia,
      estado: miembro.estado || 'Disponible'
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    
    try {
      const datosMiembro = {
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        rol: formulario.rol,
        licencia: formulario.licencia
      };

      if (modoEdicion && formulario.id) {
        datosMiembro.id = parseInt(formulario.id);
      }

      if (modoEdicion) {
        await actualizarTripulacion(datosMiembro);
        setSuccessMsg('Miembro actualizado exitosamente');
      } else {
        await crearTripulacion(datosMiembro);
        setSuccessMsg('Miembro creado exitosamente');
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar miembro:', error);
      setModalError(error);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar este miembro?')) return;
    
    try {
      await eliminarTripulacion(id);
      setSuccessMsg('Miembro eliminado exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      setError(error);
    }
  };

  // ===================== FUNCIONES EQUIPOS =====================
  const abrirModalNuevoEquipo = () => {
    setModoEdicionEquipo(false);
    setModalError(null);
    setFormularioEquipo({
      nombre: '',
      descripcion: '',
      miembrosIds: [],
      estado: 'Activo'
    });
    setMostrarModalEquipo(true);
  };

  const abrirModalEditarEquipo = (equipo) => {
    setModoEdicionEquipo(true);
    setEquipoSeleccionado(equipo);
    setModalError(null);
    setFormularioEquipo({
      id: equipo.id,
      nombre: equipo.nombre,
      descripcion: equipo.descripcion || '',
      miembrosIds: equipo.miembrosIds || [],
      estado: equipo.estado || 'Activo'
    });
    setMostrarModalEquipo(true);
  };

  const handleSubmitEquipo = (e) => {
    e.preventDefault();
    setModalError(null);

    // Validaciones
    if (!formularioEquipo.nombre.trim()) {
      setModalError('El nombre del equipo es requerido');
      return;
    }

    if (formularioEquipo.miembrosIds.length === 0) {
      setModalError('Debe seleccionar al menos un miembro para el equipo');
      return;
    }

    // Validar que tenga al menos un piloto
    const miembrosSeleccionados = tripulacion.filter(t => formularioEquipo.miembrosIds.includes(t.id));
    const tienePiloto = miembrosSeleccionados.some(m => m.rol === 'Piloto' || m.rol === 'Copiloto');
    if (!tienePiloto) {
      setModalError('El equipo debe tener al menos un Piloto o Copiloto');
      return;
    }

    const nuevoEquipo = {
      id: modoEdicionEquipo ? formularioEquipo.id : Date.now(),
      nombre: formularioEquipo.nombre,
      descripcion: formularioEquipo.descripcion,
      miembrosIds: formularioEquipo.miembrosIds,
      estado: formularioEquipo.estado
    };

    let nuevosEquipos;
    if (modoEdicionEquipo) {
      nuevosEquipos = equipos.map(e => e.id === nuevoEquipo.id ? nuevoEquipo : e);
      setSuccessMsg('Equipo actualizado exitosamente');
    } else {
      nuevosEquipos = [...equipos, nuevoEquipo];
      setSuccessMsg('Equipo creado exitosamente');
    }

    guardarEquipos(nuevosEquipos);
    setMostrarModalEquipo(false);
  };

  const handleEliminarEquipo = (id) => {
    if (!confirm('¿Está seguro de eliminar este equipo?')) return;
    
    // Verificar si el equipo está asignado a algún vuelo
    const asignado = asignaciones.find(a => a.equipoId === id);
    if (asignado) {
      alert('No se puede eliminar el equipo porque está asignado a un vuelo. Primero quite la asignación.');
      return;
    }

    const nuevosEquipos = equipos.filter(e => e.id !== id);
    guardarEquipos(nuevosEquipos);
    setSuccessMsg('Equipo eliminado exitosamente');
  };

  const toggleMiembroEnEquipo = (miembroId) => {
    const miembrosActuales = [...formularioEquipo.miembrosIds];
    const index = miembrosActuales.indexOf(miembroId);
    
    if (index > -1) {
      miembrosActuales.splice(index, 1);
    } else {
      miembrosActuales.push(miembroId);
    }
    
    setFormularioEquipo({...formularioEquipo, miembrosIds: miembrosActuales});
  };

  // ===================== FUNCIONES ASIGNACIONES =====================
  const abrirModalAsignacion = (vuelo) => {
    setVueloParaAsignar(vuelo);
    setModalError(null);
    setMostrarModalAsignacion(true);
  };

  const asignarEquipoAVuelo = (equipoId) => {
    if (!vueloParaAsignar) return;

    // Verificar si el equipo ya está asignado a otro vuelo en la misma fecha
    const equipoOcupado = asignaciones.find(a => 
      a.equipoId === equipoId && 
      a.vueloId !== vueloParaAsignar.id &&
      a.fecha === vueloParaAsignar.fecha?.split('T')[0]
    );

    if (equipoOcupado) {
      setModalError('Este equipo ya está asignado a otro vuelo en la misma fecha');
      return;
    }

    const nuevaAsignacion = {
      id: Date.now(),
      vueloId: vueloParaAsignar.id,
      numeroVuelo: vueloParaAsignar.numeroVuelo,
      equipoId: equipoId,
      fecha: vueloParaAsignar.fecha?.split('T')[0],
      asignadoEn: new Date().toISOString()
    };

    // Quitar asignación anterior si existe
    const asignacionesFiltradas = asignaciones.filter(a => a.vueloId !== vueloParaAsignar.id);
    const nuevasAsignaciones = [...asignacionesFiltradas, nuevaAsignacion];
    
    guardarAsignaciones(nuevasAsignaciones);
    setSuccessMsg(`Equipo asignado al vuelo ${vueloParaAsignar.numeroVuelo}`);
    setMostrarModalAsignacion(false);
  };

  const quitarAsignacion = (vueloId) => {
    if (!confirm('¿Está seguro de quitar la asignación de tripulación de este vuelo?')) return;
    
    const nuevasAsignaciones = asignaciones.filter(a => a.vueloId !== vueloId);
    guardarAsignaciones(nuevasAsignaciones);
    setSuccessMsg('Asignación eliminada exitosamente');
  };

  // ===================== FILTROS Y PAGINACIÓN =====================
  const tripulacionFiltrada = tripulacion.filter(t =>
    (t.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    t.apellido?.toLowerCase().includes(filtro.toLowerCase()) ||
    t.licencia?.toLowerCase().includes(filtro.toLowerCase())) &&
    (filtroRol === '' || t.rol === filtroRol)
  );

  const equiposFiltrados = equipos.filter(e =>
    e.nombre?.toLowerCase().includes(filtroEquipo.toLowerCase())
  );

  // Cálculos de paginación
  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const tripulacionActual = tripulacionFiltrada.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(tripulacionFiltrada.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  // Helpers
  const obtenerMiembrosEquipo = (miembrosIds) => {
    return tripulacion.filter(t => miembrosIds.includes(t.id));
  };

  const obtenerEquipoPorId = (equipoId) => {
    return equipos.find(e => e.id === equipoId);
  };

  const obtenerAsignacionVuelo = (vueloId) => {
    return asignaciones.find(a => a.vueloId === vueloId);
  };

  const contarPorRol = (miembrosIds, rol) => {
    return tripulacion.filter(t => miembrosIds.includes(t.id) && t.rol === rol).length;
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
                <h1 className="text-30 lh-14 fw-600">Gestión de Tripulación</h1>
                <div className="text-15 text-light-1">
                  Administrar personal, equipos y asignaciones de vuelos
                </div>
              </div>
            </div>

            {/* Mensajes de éxito/error globales */}
            {successMsg && (
              <SuccessAlert message={successMsg} onClose={() => setSuccessMsg(null)} />
            )}
            {error && (
              <ErrorAlert error={error} onClose={() => setError(null)} />
            )}

            {/* Tabs de navegación */}
            <div className="tabs -underline-2 js-tabs mb-30">
              <div className="tabs__controls row x-gap-40 y-gap-10 lg:x-gap-20">
                <div className="col-auto">
                  <button
                    className={`tabs__button text-18 lg:text-16 fw-500 pb-10 ${tabActivo === 'personal' ? 'is-tab-el-active text-blue-1' : 'text-light-1'}`}
                    onClick={() => setTabActivo('personal')}
                    style={{ 
                      borderBottom: tabActivo === 'personal' ? '2px solid #3554D1' : 'none',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="icon-user-2 text-20 mr-10"></i>
                    Personal ({tripulacion.length})
                  </button>
                </div>
                <div className="col-auto">
                  <button
                    className={`tabs__button text-18 lg:text-16 fw-500 pb-10 ${tabActivo === 'equipos' ? 'is-tab-el-active text-blue-1' : 'text-light-1'}`}
                    onClick={() => setTabActivo('equipos')}
                    style={{ 
                      borderBottom: tabActivo === 'equipos' ? '2px solid #3554D1' : 'none',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="icon-users text-20 mr-10"></i>
                    Equipos ({equipos.length})
                  </button>
                </div>
                <div className="col-auto">
                  <button
                    className={`tabs__button text-18 lg:text-16 fw-500 pb-10 ${tabActivo === 'asignaciones' ? 'is-tab-el-active text-blue-1' : 'text-light-1'}`}
                    onClick={() => setTabActivo('asignaciones')}
                    style={{ 
                      borderBottom: tabActivo === 'asignaciones' ? '2px solid #3554D1' : 'none',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="icon-calendar text-20 mr-10"></i>
                    Asignaciones ({asignaciones.length})
                  </button>
                </div>
              </div>
            </div>

            {/* ==================== TAB PERSONAL ==================== */}
            {tabActivo === 'personal' && (
              <>
                <div className="row y-gap-20 justify-between items-center pb-20">
                  <div className="col-auto"></div>
                  <div className="col-auto">
                    <button 
                      className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
                      onClick={abrirModalNuevo}
                    >
                      <i className="icon-plus text-20 mr-10"></i>
                      Nuevo Miembro
                    </button>
                  </div>
                </div>

                {/* Filtros */}
                <div className="py-30 px-30 rounded-4 bg-white shadow-3 mb-30">
                  <div className="row y-gap-20">
                    <div className="col-md-8">
                      <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o licencia..."
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
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={filtroRol}
                        onChange={(e) => setFiltroRol(e.target.value)}
                        style={{
                          width: '100%',
                          height: '50px',
                          padding: '0 20px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="">Todos los roles</option>
                        <option value="Piloto">Piloto</option>
                        <option value="Copiloto">Copiloto</option>
                        <option value="Azafata">Azafata</option>
                        <option value="Ingeniero">Ingeniero de Vuelo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tabla de Personal */}
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
                            <th>Nombre</th>
                            <th>Rol</th>
                            <th>Licencia</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tripulacionActual.map((miembro) => {
                            // Verificar si está en algún equipo
                            const enEquipo = equipos.find(e => e.miembrosIds.includes(miembro.id));
                            return (
                              <tr key={miembro.id}>
                                <td className="fw-500">
                                  {miembro.nombre} {miembro.apellido}
                                </td>
                                <td>
                                  <span className={`rounded-100 py-4 px-10 text-center text-14 fw-500 ${
                                    miembro.rol === 'Piloto' ? 'bg-blue-1-05 text-blue-1' :
                                    miembro.rol === 'Copiloto' ? 'bg-purple-1 text-white' :
                                    miembro.rol === 'Azafata' ? 'bg-pink-1 text-white' :
                                    'bg-yellow-4 text-yellow-3'
                                  }`}>
                                    {miembro.rol}
                                  </span>
                                </td>
                                <td className="text-blue-1">{miembro.licencia}</td>
                                <td>
                                  {enEquipo ? (
                                    <span className="rounded-100 py-4 px-10 text-center text-14 fw-500 bg-green-1 text-white">
                                      En equipo: {enEquipo.nombre}
                                    </span>
                                  ) : (
                                    <span className="rounded-100 py-4 px-10 text-center text-14 fw-500 bg-light-2 text-light-1">
                                      Sin asignar
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <div className="d-flex items-center gap-10">
                                    <button
                                      className="flex-center bg-light-2 rounded-4 size-35"
                                      onClick={() => abrirModalEditar(miembro)}
                                      title="Editar"
                                    >
                                      <i className="icon-edit text-16 text-light-1"></i>
                                    </button>
                                    <button
                                      className="flex-center bg-red-3 rounded-4 size-35"
                                      onClick={() => handleEliminar(miembro.id)}
                                      title="Eliminar"
                                    >
                                      <i className="icon-trash-2 text-16 text-red-2"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {tripulacionFiltrada.length === 0 && (
                        <div className="text-center py-40 text-light-1">
                          No se encontraron miembros de tripulación
                        </div>
                      )}
                    </div>
                  )}

                  {/* Paginación */}
                  {!loading && tripulacionFiltrada.length > 0 && (
                    <div className="pt-30 border-top-light">
                      <div className="row x-gap-10 y-gap-20 justify-between items-center">
                        <div className="col-auto">
                          <div className="text-14 text-light-1">
                            Mostrando {indexPrimero + 1} a {Math.min(indexUltimo, tripulacionFiltrada.length)} de {tripulacionFiltrada.length} miembros
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
              </>
            )}

            {/* ==================== TAB EQUIPOS ==================== */}
            {tabActivo === 'equipos' && (
              <>
                <div className="row y-gap-20 justify-between items-center pb-20">
                  <div className="col-auto"></div>
                  <div className="col-auto">
                    <button 
                      className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
                      onClick={abrirModalNuevoEquipo}
                      disabled={tripulacion.length === 0}
                    >
                      <i className="icon-plus text-20 mr-10"></i>
                      Nuevo Equipo
                    </button>
                  </div>
                </div>

                {tripulacion.length === 0 && (
                  <div className="py-20 px-30 rounded-4 bg-yellow-4 mb-30">
                    <div className="d-flex items-center">
                      <i className="icon-alert-circle text-24 text-yellow-3 mr-10"></i>
                      <div className="text-15 text-yellow-3">
                        Primero debes agregar miembros de personal para poder crear equipos.
                      </div>
                    </div>
                  </div>
                )}

                {/* Filtro */}
                <div className="py-30 px-30 rounded-4 bg-white shadow-3 mb-30">
                  <input
                    type="text"
                    placeholder="Buscar equipo por nombre..."
                    className="form-control"
                    value={filtroEquipo}
                    onChange={(e) => setFiltroEquipo(e.target.value)}
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                {/* Lista de Equipos */}
                <div className="row y-gap-30">
                  {equiposFiltrados.length === 0 ? (
                    <div className="col-12">
                      <div className="py-40 px-30 rounded-4 bg-white shadow-3 text-center">
                        <i className="icon-users text-60 text-light-1 mb-20"></i>
                        <div className="text-18 text-light-1">
                          No hay equipos creados
                        </div>
                        <div className="text-14 text-light-1 mt-10">
                          Crea tu primer equipo para asignarlo a vuelos
                        </div>
                      </div>
                    </div>
                  ) : (
                    equiposFiltrados.map((equipo) => {
                      const miembros = obtenerMiembrosEquipo(equipo.miembrosIds);
                      const asignacion = asignaciones.find(a => a.equipoId === equipo.id);
                      
                      return (
                        <div className="col-lg-6 col-md-6" key={equipo.id}>
                          <div className="py-30 px-30 rounded-4 bg-white shadow-3">
                            <div className="d-flex justify-between items-start mb-20">
                              <div>
                                <h4 className="text-18 fw-600">{equipo.nombre}</h4>
                                {equipo.descripcion && (
                                  <p className="text-14 text-light-1 mt-5">{equipo.descripcion}</p>
                                )}
                              </div>
                              <div className="d-flex gap-10">
                                <button
                                  className="flex-center bg-light-2 rounded-4 size-35"
                                  onClick={() => abrirModalEditarEquipo(equipo)}
                                  title="Editar"
                                >
                                  <i className="icon-edit text-16 text-light-1"></i>
                                </button>
                                <button
                                  className="flex-center bg-red-3 rounded-4 size-35"
                                  onClick={() => handleEliminarEquipo(equipo.id)}
                                  title="Eliminar"
                                >
                                  <i className="icon-trash-2 text-16 text-red-2"></i>
                                </button>
                              </div>
                            </div>

                            {/* Estadísticas del equipo */}
                            <div className="d-flex gap-15 mb-20">
                              <div className="text-center">
                                <div className="text-20 fw-600 text-blue-1">{contarPorRol(equipo.miembrosIds, 'Piloto')}</div>
                                <div className="text-12 text-light-1">Pilotos</div>
                              </div>
                              <div className="text-center">
                                <div className="text-20 fw-600 text-purple-1">{contarPorRol(equipo.miembrosIds, 'Copiloto')}</div>
                                <div className="text-12 text-light-1">Copilotos</div>
                              </div>
                              <div className="text-center">
                                <div className="text-20 fw-600 text-pink-1">{contarPorRol(equipo.miembrosIds, 'Azafata')}</div>
                                <div className="text-12 text-light-1">Azafatas</div>
                              </div>
                              <div className="text-center">
                                <div className="text-20 fw-600 text-yellow-3">{contarPorRol(equipo.miembrosIds, 'Ingeniero')}</div>
                                <div className="text-12 text-light-1">Ingenieros</div>
                              </div>
                            </div>

                            {/* Miembros */}
                            <div className="border-top-light pt-15">
                              <div className="text-14 fw-500 mb-10">Miembros ({miembros.length}):</div>
                              <div className="d-flex flex-wrap gap-10">
                                {miembros.map(m => (
                                  <span 
                                    key={m.id}
                                    className={`rounded-100 py-4 px-10 text-12 ${
                                      m.rol === 'Piloto' ? 'bg-blue-1-05 text-blue-1' :
                                      m.rol === 'Copiloto' ? 'bg-purple-1 text-white' :
                                      m.rol === 'Azafata' ? 'bg-pink-1 text-white' :
                                      'bg-yellow-4 text-yellow-3'
                                    }`}
                                  >
                                    {m.nombre} {m.apellido}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Estado de asignación */}
                            <div className="border-top-light pt-15 mt-15">
                              {asignacion ? (
                                <div className="d-flex items-center text-green-2">
                                  <i className="icon-check text-16 mr-10"></i>
                                  <span className="text-14">Asignado al vuelo {asignacion.numeroVuelo}</span>
                                </div>
                              ) : (
                                <div className="d-flex items-center text-light-1">
                                  <i className="icon-clock text-16 mr-10"></i>
                                  <span className="text-14">Sin asignar a vuelo</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {/* ==================== TAB ASIGNACIONES ==================== */}
            {tabActivo === 'asignaciones' && (
              <>
                {equipos.length === 0 && (
                  <div className="py-20 px-30 rounded-4 bg-yellow-4 mb-30">
                    <div className="d-flex items-center">
                      <i className="icon-alert-circle text-24 text-yellow-3 mr-10"></i>
                      <div className="text-15 text-yellow-3">
                        Primero debes crear equipos de tripulación para poder asignarlos a vuelos.
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabla de Vuelos con asignaciones */}
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
                            <th>Vuelo</th>
                            <th>Ruta</th>
                            <th>Fecha</th>
                            <th>Horario</th>
                            <th>Equipo Asignado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vuelos
                            .filter(v => {
                              // Solo mostrar vuelos futuros o de hoy
                              const fechaVuelo = new Date(v.fecha);
                              const hoy = new Date();
                              hoy.setHours(0, 0, 0, 0);
                              return fechaVuelo >= hoy;
                            })
                            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                            .map((vuelo) => {
                              const asignacion = obtenerAsignacionVuelo(vuelo.id);
                              const equipo = asignacion ? obtenerEquipoPorId(asignacion.equipoId) : null;
                              
                              return (
                                <tr key={vuelo.id}>
                                  <td className="fw-500 text-blue-1">{vuelo.numeroVuelo}</td>
                                  <td>
                                    {vuelo.origenCodigo} → {vuelo.destinoCodigo}
                                  </td>
                                  <td>
                                    {new Date(vuelo.fecha).toLocaleDateString('es-ES', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </td>
                                  <td>
                                    {vuelo.horaSalida?.substring(0, 5)} - {vuelo.horaLlegada?.substring(0, 5)}
                                  </td>
                                  <td>
                                    {equipo ? (
                                      <span className="rounded-100 py-4 px-15 text-14 fw-500 bg-green-1 text-white">
                                        {equipo.nombre}
                                      </span>
                                    ) : (
                                      <span className="rounded-100 py-4 px-15 text-14 fw-500 bg-red-3 text-red-2">
                                        Sin asignar
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <div className="d-flex items-center gap-10">
                                      {equipo ? (
                                        <button
                                          className="button h-35 px-15 -outline-red-1 text-red-1 text-14"
                                          onClick={() => quitarAsignacion(vuelo.id)}
                                        >
                                          Quitar
                                        </button>
                                      ) : null}
                                      <button
                                        className="button h-35 px-15 -dark-1 bg-blue-1 text-white text-14"
                                        onClick={() => abrirModalAsignacion(vuelo)}
                                        disabled={equipos.length === 0}
                                      >
                                        {equipo ? 'Cambiar' : 'Asignar'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>

                      {vuelos.length === 0 && (
                        <div className="text-center py-40 text-light-1">
                          No hay vuelos programados
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <Footer />
          </div>
        </div>
      </div>

      {/* ==================== MODAL PERSONAL ==================== */}
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
              {modoEdicion ? 'Editar Miembro' : 'Nuevo Miembro'}
            </h3>

            {modalError && (
              <ErrorAlert error={modalError} onClose={() => setModalError(null)} />
            )}

            <form onSubmit={handleSubmit}>
              <div className="row y-gap-20">
                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="text"
                      value={formulario.nombre}
                      onChange={(e) => setFormulario({...formulario, nombre: e.target.value})}
                      required
                    />
                    <label className="lh-1 text-14 text-light-1">Nombre</label>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="text"
                      value={formulario.apellido}
                      onChange={(e) => setFormulario({...formulario, apellido: e.target.value})}
                      required
                    />
                    <label className="lh-1 text-14 text-light-1">Apellido</label>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="text-14 fw-500 mb-10 d-block">Rol</label>
                  <select
                    className="form-select"
                    value={formulario.rol}
                    onChange={(e) => setFormulario({...formulario, rol: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: '0 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="Piloto">Piloto</option>
                    <option value="Copiloto">Copiloto</option>
                    <option value="Azafata">Azafata</option>
                    <option value="Ingeniero">Ingeniero de Vuelo</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="text"
                      value={formulario.licencia}
                      onChange={(e) => setFormulario({...formulario, licencia: e.target.value})}
                      required
                    />
                    <label className="lh-1 text-14 text-light-1">Número de Licencia</label>
                  </div>
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

      {/* ==================== MODAL EQUIPOS ==================== */}
      {mostrarModalEquipo && (
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
          onClick={() => setMostrarModalEquipo(false)}
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
              {modoEdicionEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
            </h3>

            {modalError && (
              <ErrorAlert error={modalError} onClose={() => setModalError(null)} />
            )}

            <form onSubmit={handleSubmitEquipo}>
              <div className="row y-gap-20">
                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="text"
                      value={formularioEquipo.nombre}
                      onChange={(e) => setFormularioEquipo({...formularioEquipo, nombre: e.target.value})}
                      required
                    />
                    <label className="lh-1 text-14 text-light-1">Nombre del Equipo</label>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="text"
                      value={formularioEquipo.descripcion}
                      onChange={(e) => setFormularioEquipo({...formularioEquipo, descripcion: e.target.value})}
                    />
                    <label className="lh-1 text-14 text-light-1">Descripción (opcional)</label>
                  </div>
                </div>

                <div className="col-12">
                  <label className="text-14 fw-500 mb-15 d-block">
                    Seleccionar Miembros del Equipo *
                  </label>
                  <div className="text-13 text-light-1 mb-15">
                    El equipo debe tener al menos un Piloto o Copiloto
                  </div>
                  
                  <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    padding: '15px'
                  }}>
                    {['Piloto', 'Copiloto', 'Azafata', 'Ingeniero'].map(rol => {
                      const miembrosRol = tripulacion.filter(t => t.rol === rol);
                      if (miembrosRol.length === 0) return null;
                      
                      return (
                        <div key={rol} className="mb-20">
                          <div className="text-14 fw-600 mb-10">{rol}s</div>
                          <div className="row y-gap-10">
                            {miembrosRol.map(miembro => {
                              const seleccionado = formularioEquipo.miembrosIds.includes(miembro.id);
                              const enOtroEquipo = equipos.find(e => 
                                e.id !== formularioEquipo.id && 
                                e.miembrosIds.includes(miembro.id)
                              );
                              
                              return (
                                <div className="col-md-6" key={miembro.id}>
                                  <label 
                                    className={`d-flex items-center gap-10 py-10 px-15 rounded-4 cursor-pointer ${
                                      seleccionado ? 'bg-blue-1-05' : 'bg-light-2'
                                    } ${enOtroEquipo ? 'opacity-50' : ''}`}
                                    style={{ cursor: enOtroEquipo ? 'not-allowed' : 'pointer' }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={seleccionado}
                                      onChange={() => !enOtroEquipo && toggleMiembroEnEquipo(miembro.id)}
                                      disabled={!!enOtroEquipo}
                                      style={{ width: '18px', height: '18px' }}
                                    />
                                    <div>
                                      <div className="text-14 fw-500">
                                        {miembro.nombre} {miembro.apellido}
                                      </div>
                                      <div className="text-12 text-light-1">
                                        {miembro.licencia}
                                        {enOtroEquipo && ` • En ${enOtroEquipo.nombre}`}
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="text-14 mt-15">
                    Miembros seleccionados: <strong>{formularioEquipo.miembrosIds.length}</strong>
                  </div>
                </div>
              </div>

              <div className="d-flex items-center pt-30 gap-20">
                <button
                  type="button"
                  className="button h-50 px-24 -outline-blue-1 text-blue-1"
                  onClick={() => setMostrarModalEquipo(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
                >
                  {modoEdicionEquipo ? 'Actualizar' : 'Crear'} Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL ASIGNACIÓN ==================== */}
      {mostrarModalAsignacion && vueloParaAsignar && (
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
          onClick={() => setMostrarModalAsignacion(false)}
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
            <h3 className="text-22 fw-600 mb-20">
              Asignar Tripulación
            </h3>
            
            <div className="py-15 px-20 rounded-4 bg-light-2 mb-30">
              <div className="row">
                <div className="col-6">
                  <div className="text-14 text-light-1">Vuelo</div>
                  <div className="text-18 fw-600 text-blue-1">{vueloParaAsignar.numeroVuelo}</div>
                </div>
                <div className="col-6">
                  <div className="text-14 text-light-1">Ruta</div>
                  <div className="text-16 fw-500">{vueloParaAsignar.origenCodigo} → {vueloParaAsignar.destinoCodigo}</div>
                </div>
                <div className="col-6 mt-15">
                  <div className="text-14 text-light-1">Fecha</div>
                  <div className="text-16 fw-500">
                    {new Date(vueloParaAsignar.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="col-6 mt-15">
                  <div className="text-14 text-light-1">Horario</div>
                  <div className="text-16 fw-500">
                    {vueloParaAsignar.horaSalida?.substring(0, 5)} - {vueloParaAsignar.horaLlegada?.substring(0, 5)}
                  </div>
                </div>
              </div>
            </div>

            {modalError && (
              <ErrorAlert error={modalError} onClose={() => setModalError(null)} />
            )}

            <div className="text-16 fw-500 mb-15">Selecciona un equipo:</div>

            <div className="row y-gap-15">
              {equipos.map(equipo => {
                const miembros = obtenerMiembrosEquipo(equipo.miembrosIds);
                const yaAsignado = asignaciones.find(a => 
                  a.equipoId === equipo.id && 
                  a.vueloId !== vueloParaAsignar.id &&
                  a.fecha === vueloParaAsignar.fecha?.split('T')[0]
                );
                
                return (
                  <div className="col-12" key={equipo.id}>
                    <div 
                      className={`py-20 px-20 rounded-4 border-light cursor-pointer ${yaAsignado ? 'opacity-50' : 'hover-shadow'}`}
                      style={{ 
                        cursor: yaAsignado ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => !yaAsignado && asignarEquipoAVuelo(equipo.id)}
                    >
                      <div className="d-flex justify-between items-center">
                        <div>
                          <div className="text-16 fw-600">{equipo.nombre}</div>
                          <div className="d-flex gap-10 mt-10">
                            {contarPorRol(equipo.miembrosIds, 'Piloto') > 0 && (
                              <span className="text-12 bg-blue-1-05 text-blue-1 py-2 px-8 rounded-100">
                                {contarPorRol(equipo.miembrosIds, 'Piloto')} Piloto(s)
                              </span>
                            )}
                            {contarPorRol(equipo.miembrosIds, 'Copiloto') > 0 && (
                              <span className="text-12 bg-purple-1 text-white py-2 px-8 rounded-100">
                                {contarPorRol(equipo.miembrosIds, 'Copiloto')} Copiloto(s)
                              </span>
                            )}
                            {contarPorRol(equipo.miembrosIds, 'Azafata') > 0 && (
                              <span className="text-12 bg-pink-1 text-white py-2 px-8 rounded-100">
                                {contarPorRol(equipo.miembrosIds, 'Azafata')} Azafata(s)
                              </span>
                            )}
                          </div>
                          {yaAsignado && (
                            <div className="text-12 text-red-1 mt-10">
                              Ya asignado a otro vuelo en esta fecha
                            </div>
                          )}
                        </div>
                        {!yaAsignado && (
                          <i className="icon-arrow-right text-20 text-blue-1"></i>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="d-flex items-center pt-30">
              <button
                type="button"
                className="button h-50 px-24 -outline-blue-1 text-blue-1"
                onClick={() => setMostrarModalAsignacion(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GestionTripulacion;
