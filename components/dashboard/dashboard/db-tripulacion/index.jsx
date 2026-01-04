'use client'

import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import ErrorAlert, { SuccessAlert } from "@/components/common/ErrorAlert";
import { 
  obtenerTodoElPersonal, 
  crearPersonal, 
  actualizarPersonal, 
  eliminarPersonal,
  ROLES_PERSONAL,
  ESTADOS_PERSONAL
} from "@/api/personalService";
import {
  obtenerTodosLosEquipos,
  obtenerEquipoPorId,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
  obtenerEquiposDisponibles,
  ESTADOS_EQUIPO
} from "@/api/equipoService";
import {
  obtenerTodasLasAsignaciones,
  asignarEquipoAAeronave,
  desasignarEquipo,
  obtenerAeronavesSinEquipo
} from "@/api/asignacionEquipoService";
import { obtenerTodasLasAeronaves } from "@/api/aeronaveService";

const GestionTripulacion = () => {
  // Tab activo
  const [tabActivo, setTabActivo] = useState('personal');
  
  // Estados para Personal
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
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

  // Estados para Asignaciones (ahora a aeronaves)
  const [aeronaves, setAeronaves] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [mostrarModalAsignacion, setMostrarModalAsignacion] = useState(false);
  const [aeronaveParaAsignar, setAeronaveParaAsignar] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    rol: 'Piloto',
    licencia: '',
    certificacionesAeronave: '',
    tiempoDescansoMinutos: 480,
    estado: 'Disponible'
  });

  const [formularioEquipo, setFormularioEquipo] = useState({
    nombre: '',
    codigo: '',
    idsPersonal: []
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
      
      // Cargar personal
      try {
        const response = await obtenerTodoElPersonal();
        console.log('Respuesta personal:', response);
        const personalData = response.data || response || [];
        setPersonal(Array.isArray(personalData) ? personalData : []);
      } catch (err) {
        console.error('Error al cargar personal:', err);
        if (err.response?.status === 403) {
          setError('No tienes permisos para ver el personal. Contacta al administrador.');
        }
      }

      // Cargar equipos desde API
      try {
        const response = await obtenerTodosLosEquipos();
        console.log('Respuesta equipos:', response);
        const equiposData = response.data || response || [];
        setEquipos(Array.isArray(equiposData) ? equiposData : []);
      } catch (err) {
        console.error('Error al cargar equipos:', err);
      }

      // Cargar aeronaves para asignaciones
      try {
        const response = await obtenerTodasLasAeronaves();
        const aeronavesData = response.data || response || [];
        setAeronaves(Array.isArray(aeronavesData) ? aeronavesData : []);
      } catch (err) {
        console.error('Error al cargar aeronaves:', err);
      }

      // Cargar asignaciones desde API
      try {
        const response = await obtenerTodasLasAsignaciones();
        console.log('Respuesta asignaciones RAW:', response);
        const asignacionesData = response.data || response || [];
        console.log('Asignaciones procesadas:', asignacionesData);
        setAsignaciones(Array.isArray(asignacionesData) ? asignacionesData : []);
      } catch (err) {
        console.error('Error al cargar asignaciones:', err);
      }

    } catch (error) {
      console.error('Error general al cargar datos:', error);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
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
      tiempoDescansoMinutos: 480,
      estado: 'Disponible'
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (miembro) => {
    setModoEdicion(true);
    setMiembroSeleccionado(miembro);
    setModalError(null);
    const personalId = miembro.idPersonal || miembro.id;
    console.log('Editando personal con ID:', personalId, 'Miembro:', miembro);
    setFormulario({
      idPersonal: personalId,
      nombre: miembro.nombre,
      apellido: miembro.apellido,
      rol: miembro.rol,
      licencia: miembro.licencia,
      tiempoDescansoMinutos: miembro.tiempoDescansoMinutos || 480,
      estado: miembro.estado || 'Disponible'
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    
    try {
      const datosPersonal = {
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        rol: formulario.rol,
        licencia: formulario.licencia,
        certificacionesAeronave: 'General',
        tiempoDescansoMinutos: parseInt(formulario.tiempoDescansoMinutos) || 480
      };

      const personalId = formulario.idPersonal || formulario.id;
      
      // Validar que la licencia no exista ya (excepto si es el mismo personal en edición)
      const licenciaExistente = personal.find(p => {
        const pId = p.idPersonal || p.id;
        const esOtroPersonal = !modoEdicion || Number(pId) !== Number(personalId);
        return p.licencia?.toLowerCase() === formulario.licencia?.toLowerCase() && esOtroPersonal;
      });
      
      if (licenciaExistente) {
        setModalError(`Ya existe un personal con la licencia "${formulario.licencia}" (${licenciaExistente.nombre} ${licenciaExistente.apellido})`);
        return;
      }
      
      if (modoEdicion && personalId) {
        // Enviar tanto id como idPersonal por si el backend usa uno u otro
        datosPersonal.id = parseInt(personalId);
        datosPersonal.idPersonal = parseInt(personalId);
        console.log('Actualizando personal con datos:', datosPersonal);
        await actualizarPersonal(datosPersonal);
        setSuccessMsg('Personal actualizado exitosamente');
      } else {
        console.log('Creando personal con datos:', datosPersonal);
        await crearPersonal(datosPersonal);
        setSuccessMsg('Personal creado exitosamente');
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar personal:', error);
      setModalError(error);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar este personal?')) return;
    
    try {
      await eliminarPersonal(id);
      setSuccessMsg('Personal eliminado exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar personal:', error);
      setError(error);
    }
  };

  // ===================== FUNCIONES EQUIPOS =====================
  const abrirModalNuevoEquipo = () => {
    setModoEdicionEquipo(false);
    setModalError(null);
    setFormularioEquipo({
      nombre: '',
      codigo: '',
      idsPersonal: []
    });
    setMostrarModalEquipo(true);
  };

  const abrirModalEditarEquipo = (equipo) => {
    setModoEdicionEquipo(true);
    setEquipoSeleccionado(equipo);
    setModalError(null);
    
    // Usar obtenerMiembrosEquipo que ya maneja todas las estructuras posibles
    const miembrosDelEquipo = obtenerMiembrosEquipo(equipo);
    const idsPersonal = miembrosDelEquipo.map(p => Number(p.idPersonal || p.id)).filter(id => !isNaN(id));
    
    // Obtener el ID del equipo - mostrar todas las propiedades disponibles
    console.log('=== DEBUG EDITAR EQUIPO ===');
    console.log('Objeto equipo completo:', JSON.stringify(equipo, null, 2));
    console.log('Propiedades del equipo:', Object.keys(equipo));
    console.log('equipo.idEquipo:', equipo.idEquipo);
    console.log('equipo.id:', equipo.id);
    console.log('equipo.Id:', equipo.Id);
    console.log('equipo.ID:', equipo.ID);
    
    const equipoId = equipo.idEquipo || equipo.id || equipo.Id || equipo.ID;
    console.log('ID final extraído:', equipoId);
    
    setFormularioEquipo({
      idEquipo: equipoId,
      nombre: equipo.nombre,
      codigo: equipo.codigo || '',
      idsPersonal: idsPersonal
    });
    setMostrarModalEquipo(true);
  };

  const handleSubmitEquipo = async (e) => {
    e.preventDefault();
    setModalError(null);

    // Validaciones básicas
    if (!formularioEquipo.nombre.trim()) {
      setModalError('El nombre del equipo es requerido');
      return;
    }

    if (!formularioEquipo.codigo.trim()) {
      setModalError('El código del equipo es requerido');
      return;
    }

    if (formularioEquipo.idsPersonal.length === 0) {
      setModalError('Debe seleccionar miembros para el equipo');
      return;
    }

    // Validar que ningún miembro seleccionado esté en otro equipo
    const equipoActualId = formularioEquipo.idEquipo;
    for (const idPersonal of formularioEquipo.idsPersonal) {
      const equipoConMiembro = equipos.find(e => {
        const eId = e.idEquipo || e.id;
        if (Number(eId) === Number(equipoActualId)) return false; // Ignorar el equipo actual en edición
        const miembrosEquipo = obtenerMiembrosEquipo(e);
        return miembrosEquipo.some(p => Number(p.idPersonal || p.id) === Number(idPersonal));
      });
      
      if (equipoConMiembro) {
        const miembro = personal.find(p => Number(p.idPersonal || p.id) === Number(idPersonal));
        setModalError(`${miembro?.nombre} ${miembro?.apellido} ya pertenece al equipo "${equipoConMiembro.nombre}". Una persona solo puede estar en un equipo.`);
        return;
      }
    }

    // Validar composición del equipo
    const idsSeleccionados = formularioEquipo.idsPersonal.map(id => Number(id));
    const miembrosSeleccionados = personal.filter(p => {
      const pId = Number(p.idPersonal || p.id);
      return idsSeleccionados.includes(pId);
    });
    
    const pilotos = miembrosSeleccionados.filter(m => m.rol === 'Piloto');
    const copilotos = miembrosSeleccionados.filter(m => m.rol === 'Copiloto');
    const sobrecargosJefe = miembrosSeleccionados.filter(m => m.rol === 'Sobrecargo Jefe');
    const sobrecargos = miembrosSeleccionados.filter(m => m.rol === 'Sobrecargo');

    // Validar: exactamente 1 Piloto
    if (pilotos.length !== 1) {
      setModalError('El equipo debe tener exactamente 1 Piloto');
      return;
    }

    // Validar: exactamente 1 Copiloto
    if (copilotos.length !== 1) {
      setModalError('El equipo debe tener exactamente 1 Copiloto');
      return;
    }

    // Validar: exactamente 1 Sobrecargo Jefe
    if (sobrecargosJefe.length !== 1) {
      setModalError('El equipo debe tener exactamente 1 Sobrecargo Jefe');
      return;
    }

    // Validar: mínimo 3 y máximo 6 Sobrecargos
    if (sobrecargos.length < 3) {
      setModalError('El equipo debe tener al menos 3 Sobrecargos');
      return;
    }

    if (sobrecargos.length > 6) {
      setModalError('El equipo no puede tener más de 6 Sobrecargos');
      return;
    }

    try {
      const datosEquipo = {
        nombre: formularioEquipo.nombre,
        codigo: formularioEquipo.codigo,
        idsPersonal: formularioEquipo.idsPersonal
      };

      console.log('Modo edición:', modoEdicionEquipo);
      console.log('ID del equipo en formulario:', formularioEquipo.idEquipo);

      if (modoEdicionEquipo && formularioEquipo.idEquipo) {
        datosEquipo.id = formularioEquipo.idEquipo; // Backend espera "id"
        console.log('Datos a enviar para actualizar:', datosEquipo);
        await actualizarEquipo(datosEquipo);
        setSuccessMsg('Equipo actualizado exitosamente');
      } else {
        await crearEquipo(datosEquipo);
        setSuccessMsg('Equipo creado exitosamente');
      }

      setMostrarModalEquipo(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar equipo:', error);
      setModalError(error);
    }
  };

  const handleEliminarEquipo = async (id) => {
    if (!confirm('¿Está seguro de eliminar este equipo?')) return;
    
    // Verificar si el equipo está asignado a alguna aeronave
    const asignado = asignaciones.find(a => a.idEquipo === id && a.activa);
    if (asignado) {
      alert('No se puede eliminar el equipo porque está asignado a una aeronave. Primero quite la asignación.');
      return;
    }

    try {
      await eliminarEquipo(id);
      setSuccessMsg('Equipo eliminado exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar equipo:', error);
      setError(error);
    }
  };

  const toggleMiembroEnEquipo = (personalId) => {
    const id = Number(personalId);
    const idsActuales = [...formularioEquipo.idsPersonal];
    const index = idsActuales.findIndex(i => Number(i) === id);
    
    if (index >= 0) {
      idsActuales.splice(index, 1);
    } else {
      idsActuales.push(id);
    }
    
    setFormularioEquipo({...formularioEquipo, idsPersonal: idsActuales});
  };

  // ===================== FUNCIONES ASIGNACIONES =====================
  const abrirModalAsignacion = (aeronave) => {
    setAeronaveParaAsignar(aeronave);
    setModalError(null);
    setMostrarModalAsignacion(true);
  };

  const asignarEquipoAAeronaveHandler = async (idEquipo) => {
    if (!aeronaveParaAsignar) return;

    try {
      await asignarEquipoAAeronave({
        idEquipo: idEquipo,
        matricula: aeronaveParaAsignar.matricula,
        observaciones: ''
      });
      
      setSuccessMsg(`Equipo asignado a aeronave ${aeronaveParaAsignar.matricula}`);
      setMostrarModalAsignacion(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al asignar equipo:', error);
      setModalError(error);
    }
  };

  const quitarAsignacion = async (idAsignacion, matricula) => {
    if (!confirm('¿Está seguro de quitar la asignación de tripulación de esta aeronave?')) return;
    
    try {
      await desasignarEquipo({ idAsignacion, matricula });
      setSuccessMsg('Asignación eliminada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al desasignar equipo:', error);
      setError(error);
    }
  };

  // ===================== FILTROS Y PAGINACIÓN =====================
  const personalFiltrado = personal.filter(p =>
    (p.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.apellido?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.licencia?.toLowerCase().includes(filtro.toLowerCase())) &&
    (filtroRol === '' || p.rol === filtroRol) &&
    (filtroEstado === '' || p.estado === filtroEstado)
  );

  const equiposFiltrados = equipos.filter(e =>
    e.nombre?.toLowerCase().includes(filtroEquipo.toLowerCase()) ||
    e.codigo?.toLowerCase().includes(filtroEquipo.toLowerCase())
  );

  // Cálculos de paginación
  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const personalActual = personalFiltrado.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(personalFiltrado.length / itemsPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  // Helpers
  const obtenerMiembrosEquipo = (equipo) => {
    // Intentar diferentes nombres de campo que podría usar el backend
    const miembrosDirectos = equipo.personal || equipo.equiposPersonal || equipo.miembros || [];
    
    if (miembrosDirectos.length > 0) {
      // Si equiposPersonal tiene objetos con referencia a Personal
      if (miembrosDirectos[0]?.personal) {
        return miembrosDirectos.map(ep => ep.personal);
      }
      return miembrosDirectos;
    }
    
    // Si tiene idsPersonal, buscar en el estado personal
    const idsArray = equipo.idsPersonal || equipo.personalIds || [];
    if (idsArray.length > 0) {
      const idsEquipo = idsArray.map(id => Number(id));
      return personal.filter(p => {
        const pId = Number(p.idPersonal || p.id);
        return idsEquipo.includes(pId);
      });
    }
    
    return [];
  };

  const obtenerEquipoPorId = (idEquipo) => {
    return equipos.find(e => (e.idEquipo || e.id) === idEquipo);
  };

  const obtenerAsignacionAeronave = (matricula) => {
    // Buscar asignación activa - el campo puede ser 'activa', 'activo', o simplemente existir
    const asignacion = asignaciones.find(a => {
      const matriculaCoincide = a.matricula === matricula || a.aeronaveMatricula === matricula;
      // Si tiene campo activa/activo, verificarlo; si no, asumir que está activa
      const estaActiva = a.activa === true || a.activo === true || (a.activa === undefined && a.activo === undefined);
      return matriculaCoincide && estaActiva;
    });
    console.log(`Buscando asignación para ${matricula}:`, asignacion);
    return asignacion;
  };

  const contarPorRol = (equipo, rol) => {
    const miembros = obtenerMiembrosEquipo(equipo);
    return miembros.filter(m => m.rol === rol).length;
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Disponible': return 'text-white' + ' ' + 'fw-500';
      case 'En Servicio': return 'text-white' + ' ' + 'fw-500';
      case 'Descanso': return 'text-dark-1' + ' ' + 'fw-500';
      case 'Incapacitado': return 'text-white' + ' ' + 'fw-500';
      case 'Incompleto': return 'text-white' + ' ' + 'fw-500';
      default: return 'text-white' + ' ' + 'fw-500';
    }
  };

  const getEstadoBgColor = (estado) => {
    switch(estado) {
      case 'Disponible': return { backgroundColor: '#28a745' };
      case 'En Servicio': return { backgroundColor: '#3554d1' };
      case 'Descanso': return { backgroundColor: '#ffc107' };
      case 'Incapacitado': return { backgroundColor: '#dc3545' };
      case 'Incompleto': return { backgroundColor: '#6c757d' };
      default: return { backgroundColor: '#6c757d' };
    }
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
                    Personal ({personal.length})
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
                    Asignaciones Aeronaves ({asignaciones.filter(a => a.activa).length})
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
                      Nuevo Personal
                    </button>
                  </div>
                </div>

                {/* Filtros */}
                <div className="py-30 px-30 rounded-4 bg-white shadow-3 mb-30">
                  <div className="row y-gap-20">
                    <div className="col-md-5">
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
                    <div className="col-md-3">
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
                        <option value="Sobrecargo Jefe">Sobrecargo Jefe</option>
                        <option value="Sobrecargo">Sobrecargo</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        style={{
                          width: '100%',
                          height: '50px',
                          padding: '0 20px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="">Todos los estados</option>
                        <option value="Disponible">Disponible</option>
                        <option value="En Servicio">En Servicio</option>
                        <option value="Descanso">Descanso</option>
                        <option value="Incapacitado">Incapacitado</option>
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
                            <th>Certificaciones</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {personalActual.map((miembro, index) => {
                            const miembroId = miembro.idPersonal || miembro.id;
                            // Verificar si está en algún equipo
                            const enEquipo = equipos.find(e => 
                              e.personal?.some(p => (p.idPersonal || p.id) === miembroId)
                            );
                            return (
                              <tr key={miembroId || `personal-${index}`}>
                                <td className="fw-500">
                                  {miembro.nombre} {miembro.apellido}
                                </td>
                                <td>
                                  <span 
                                    className="rounded-100 py-4 px-10 text-center text-14 fw-500 text-white"
                                    style={{
                                      backgroundColor: miembro.rol === 'Piloto' ? '#3554d1' :
                                        miembro.rol === 'Copiloto' ? '#7c3aed' :
                                        miembro.rol === 'Sobrecargo Jefe' ? '#db2777' :
                                        '#ea580c'
                                    }}
                                  >
                                    {miembro.rol}
                                  </span>
                                </td>
                                <td className="text-blue-1">{miembro.licencia}</td>
                                <td>
                                  <span className="text-13">
                                    {miembro.certificacionesAeronave || '-'}
                                  </span>
                                </td>
                                <td>
                                  <span 
                                    className={`rounded-100 py-4 px-10 text-center text-14 ${getEstadoColor(miembro.estado)}`}
                                    style={getEstadoBgColor(miembro.estado)}
                                  >
                                    {miembro.estado}
                                  </span>
                                  {enEquipo && (
                                    <div className="text-12 text-light-1 mt-5">
                                      Equipo: {enEquipo.nombre}
                                    </div>
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
                                      onClick={() => handleEliminar(miembroId)}
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

                      {personalFiltrado.length === 0 && (
                        <div className="text-center py-40 text-light-1">
                          No se encontró personal
                        </div>
                      )}
                    </div>
                  )}

                  {/* Paginación */}
                  {!loading && personalFiltrado.length > 0 && (
                    <div className="pt-30 border-top-light">
                      <div className="row x-gap-10 y-gap-20 justify-between items-center">
                        <div className="col-auto">
                          <div className="text-14 text-light-1">
                            Mostrando {indexPrimero + 1} a {Math.min(indexUltimo, personalFiltrado.length)} de {personalFiltrado.length} personal
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
                      disabled={personal.length === 0}
                    >
                      <i className="icon-plus text-20 mr-10"></i>
                      Nuevo Equipo
                    </button>
                  </div>
                </div>

                {personal.length === 0 && (
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
                    placeholder="Buscar equipo por nombre o código..."
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
                          Crea tu primer equipo para asignarlo a aeronaves
                        </div>
                      </div>
                    </div>
                  ) : (
                    equiposFiltrados.map((equipo) => {
                      const equipoId = equipo.idEquipo || equipo.id;
                      const miembros = obtenerMiembrosEquipo(equipo);
                      const asignacion = asignaciones.find(a => a.idEquipo === equipoId && a.activa);
                      
                      return (
                        <div className="col-lg-6 col-md-6" key={equipoId}>
                          <div className="py-30 px-30 rounded-4 bg-white shadow-3">
                            <div className="d-flex justify-between items-start mb-20">
                              <div>
                                <h4 className="text-18 fw-600">{equipo.nombre}</h4>
                                <span className="text-14 text-blue-1">{equipo.codigo}</span>
                                <span 
                                  className={`ml-10 rounded-100 py-4 px-10 text-12 ${getEstadoColor(equipo.estado)}`}
                                  style={getEstadoBgColor(equipo.estado)}
                                >
                                  {equipo.estado}
                                </span>
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
                                  onClick={() => handleEliminarEquipo(equipoId)}
                                  title="Eliminar"
                                >
                                  <i className="icon-trash-2 text-16 text-red-2"></i>
                                </button>
                              </div>
                            </div>

                            {/* Estadísticas del equipo */}
                            <div className="d-flex gap-20 mb-20">
                              <div className="text-center" style={{ minWidth: '60px' }}>
                                <div className="text-20 fw-600 text-blue-1">{contarPorRol(equipo, 'Piloto')}</div>
                                <div className="text-12 text-light-1">Pilotos</div>
                              </div>
                              <div className="text-center" style={{ minWidth: '60px' }}>
                                <div className="text-20 fw-600 text-purple-1">{contarPorRol(equipo, 'Copiloto')}</div>
                                <div className="text-12 text-light-1">Copilotos</div>
                              </div>
                              <div className="text-center" style={{ minWidth: '80px' }}>
                                <div className="text-20 fw-600 text-pink-1">{contarPorRol(equipo, 'Sobrecargo Jefe')}</div>
                                <div className="text-12 text-light-1">S. Jefe</div>
                              </div>
                              <div className="text-center" style={{ minWidth: '70px' }}>
                                <div className="text-20 fw-600 text-yellow-3">{contarPorRol(equipo, 'Sobrecargo')}</div>
                                <div className="text-12 text-light-1">Sobrecargos</div>
                              </div>
                            </div>

                            {/* Miembros */}
                            <div className="border-top-light pt-15">
                              <div className="text-14 fw-500 mb-10">Miembros ({miembros.length}):</div>
                              <div className="d-flex flex-wrap gap-10">
                                {miembros.map((m, idx) => (
                                  <span 
                                    key={m.idPersonal || m.id || `miembro-${idx}`}
                                    className="rounded-100 py-4 px-10 text-12 text-white fw-500"
                                    style={{
                                      backgroundColor: m.rol === 'Piloto' ? '#3554d1' :
                                        m.rol === 'Copiloto' ? '#7c3aed' :
                                        m.rol === 'Sobrecargo Jefe' ? '#db2777' :
                                        '#ea580c'
                                    }}
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
                                  <span className="text-14">Asignado a aeronave {asignacion.matricula}</span>
                                </div>
                              ) : (
                                <div className="d-flex items-center text-light-1">
                                  <i className="icon-clock text-16 mr-10"></i>
                                  <span className="text-14">Sin asignar a aeronave</span>
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

            {/* ==================== TAB ASIGNACIONES A AERONAVES ==================== */}
            {tabActivo === 'asignaciones' && (
              <>
                {equipos.length === 0 && (
                  <div className="py-20 px-30 rounded-4 bg-yellow-4 mb-30">
                    <div className="d-flex items-center">
                      <i className="icon-alert-circle text-24 text-yellow-3 mr-10"></i>
                      <div className="text-15 text-yellow-3">
                        Primero debes crear equipos de tripulación para poder asignarlos a aeronaves.
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabla de Aeronaves con asignaciones */}
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
                            <th>Matrícula</th>
                            <th>Modelo</th>
                            <th>Capacidad</th>
                            <th>Estado Aeronave</th>
                            <th>Equipo Asignado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aeronaves
                            .filter(a => a.activo !== false)
                            .map((aeronave) => {
                              const asignacion = obtenerAsignacionAeronave(aeronave.matricula);
                              const equipoIdAsignado = asignacion ? (asignacion.idEquipo || asignacion.equipoId || asignacion.id_equipo) : null;
                              const asignacionId = asignacion ? (asignacion.idAsignacion || asignacion.id) : null;
                              const equipo = equipoIdAsignado ? obtenerEquipoPorId(equipoIdAsignado) : null;
                              const enMantenimiento = aeronave.estado === 'Mantenimiento' || aeronave.estado === 'En Mantenimiento';
                              
                              return (
                                <tr key={aeronave.matricula} className={enMantenimiento ? 'opacity-50' : ''}>
                                  <td className="fw-500 text-blue-1">{aeronave.matricula}</td>
                                  <td>{aeronave.modelo}</td>
                                  <td>{aeronave.capacidadPasajeros} pasajeros</td>
                                  <td>
                                    <span 
                                      className="rounded-100 py-4 px-10 text-14 fw-500 text-white"
                                      style={{
                                        backgroundColor: aeronave.estado === 'Disponible' ? '#28a745' :
                                          aeronave.estado === 'En Vuelo' ? '#3554d1' :
                                          enMantenimiento ? '#dc3545' :
                                          '#ffc107'
                                      }}
                                    >
                                      {aeronave.estado}
                                    </span>
                                  </td>
                                  <td>
                                    {equipo ? (
                                      <span 
                                        className="rounded-100 py-4 px-15 text-14 fw-500 text-white"
                                        style={{ backgroundColor: '#28a745' }}
                                      >
                                        {equipo.nombre} ({equipo.codigo})
                                      </span>
                                    ) : enMantenimiento ? (
                                      <span 
                                        className="rounded-100 py-4 px-15 text-14 fw-500 text-white"
                                        style={{ backgroundColor: '#6c757d' }}
                                      >
                                        No disponible
                                      </span>
                                    ) : (
                                      <span 
                                        className="rounded-100 py-4 px-15 text-14 fw-500 text-white"
                                        style={{ backgroundColor: '#dc3545' }}
                                      >
                                        Sin equipo
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {enMantenimiento ? (
                                      <span className="text-12" style={{ color: '#6c757d' }}>En mantenimiento</span>
                                    ) : (
                                      <div className="d-flex items-center gap-10">
                                        {equipo && asignacionId ? (
                                          <button
                                            className="button h-35 px-15 text-14 text-white"
                                            style={{ backgroundColor: '#dc3545', border: 'none' }}
                                            onClick={() => quitarAsignacion(asignacionId, aeronave.matricula)}
                                          >
                                            Quitar
                                          </button>
                                        ) : null}
                                        <button
                                          className="button h-35 px-15 -dark-1 bg-blue-1 text-white text-14"
                                          onClick={() => abrirModalAsignacion(aeronave)}
                                          disabled={equipos.length === 0}
                                        >
                                          {equipo ? 'Cambiar' : 'Asignar'}
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>

                      {aeronaves.length === 0 && (
                        <div className="text-center py-40 text-light-1">
                          No hay aeronaves registradas
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
              {modoEdicion ? 'Editar Personal' : 'Nuevo Personal'}
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
                    <option value="Sobrecargo Jefe">Sobrecargo Jefe</option>
                    <option value="Sobrecargo">Sobrecargo</option>
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

                <div className="col-md-6">
                  <div className="form-input">
                    <input
                      type="number"
                      value={formulario.tiempoDescansoMinutos}
                      onChange={(e) => setFormulario({...formulario, tiempoDescansoMinutos: e.target.value})}
                      min="0"
                    />
                    <label className="lh-1 text-14 text-light-1">Tiempo de Descanso (minutos)</label>
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
                      value={formularioEquipo.codigo}
                      onChange={(e) => setFormularioEquipo({...formularioEquipo, codigo: e.target.value})}
                      required
                      placeholder="Ej: EQ-001"
                    />
                    <label className="lh-1 text-14 text-light-1">Código (único)</label>
                  </div>
                </div>

                <div className="col-12">
                  <label className="text-14 fw-500 mb-15 d-block">
                    Seleccionar Miembros del Equipo *
                  </label>
                  <div className="text-13 text-light-1 mb-15">
                    <strong>Composición requerida:</strong> 1 Piloto + 1 Copiloto + 1 Sobrecargo Jefe + 3 a 6 Sobrecargos
                  </div>
                  
                  <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    padding: '15px'
                  }}>
                    {['Piloto', 'Copiloto', 'Sobrecargo Jefe', 'Sobrecargo'].map(rol => {
                      const miembrosRol = personal.filter(p => p.rol === rol);
                      if (miembrosRol.length === 0) return null;
                      
                      return (
                        <div key={rol} className="mb-20">
                          <div className="text-14 fw-600 mb-10">{rol === 'Sobrecargo Jefe' ? 'Sobrecargos Jefe' : rol + 's'}</div>
                          <div className="row y-gap-10">
                            {miembrosRol.map((miembro, idx) => {
                              const miembroId = miembro.idPersonal || miembro.id || `temp-${idx}`;
                              const estaSeleccionado = formularioEquipo.idsPersonal.some(id => Number(id) === Number(miembroId));
                              
                              // Para verificar si está en otro equipo (NO en el equipo actual que se está editando)
                              const equipoActualId = formularioEquipo.idEquipo;
                              const enOtroEquipo = modoEdicionEquipo ? equipos.find(e => {
                                const equipoId = e.idEquipo || e.id;
                                // Si es el mismo equipo que estamos editando, no contar como "otro equipo"
                                if (Number(equipoId) === Number(equipoActualId)) return false;
                                const miembrosEquipo = obtenerMiembrosEquipo(e);
                                return miembrosEquipo.some(p => Number(p.idPersonal || p.id) === Number(miembroId));
                              }) : null;
                              
                              return (
                                <div className="col-md-6" key={`member-${rol}-${miembroId}`}>
                                  <div 
                                    className={`d-flex items-center gap-10 py-10 px-15 rounded-4 ${
                                      estaSeleccionado ? 'bg-blue-1-05' : 'bg-light-2'
                                    } ${enOtroEquipo ? 'opacity-50' : ''}`}
                                    style={{ cursor: enOtroEquipo ? 'not-allowed' : 'pointer' }}
                                    onClick={() => {
                                      if (!enOtroEquipo) {
                                        toggleMiembroEnEquipo(miembroId);
                                      }
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={estaSeleccionado}
                                      readOnly
                                      disabled={!!enOtroEquipo}
                                      style={{ width: '18px', height: '18px', accentColor: '#3554d1' }}
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
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="text-14 mt-15">
                    Miembros seleccionados: <strong>{formularioEquipo.idsPersonal.length}</strong>
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

      {/* ==================== MODAL ASIGNACIÓN A AERONAVE ==================== */}
      {mostrarModalAsignacion && aeronaveParaAsignar && (
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
              Asignar Equipo a Aeronave
            </h3>
            
            <div className="py-15 px-20 rounded-4 bg-light-2 mb-30">
              <div className="row">
                <div className="col-6">
                  <div className="text-14 text-light-1">Matrícula</div>
                  <div className="text-18 fw-600 text-blue-1">{aeronaveParaAsignar.matricula}</div>
                </div>
                <div className="col-6">
                  <div className="text-14 text-light-1">Modelo</div>
                  <div className="text-16 fw-500">{aeronaveParaAsignar.modelo}</div>
                </div>
                <div className="col-6 mt-15">
                  <div className="text-14 text-light-1">Capacidad</div>
                  <div className="text-16 fw-500">{aeronaveParaAsignar.capacidadPasajeros} pasajeros</div>
                </div>
                <div className="col-6 mt-15">
                  <div className="text-14 text-light-1">Estado</div>
                  <div className="text-16 fw-500">{aeronaveParaAsignar.estado}</div>
                </div>
              </div>
            </div>

            {modalError && (
              <ErrorAlert error={modalError} onClose={() => setModalError(null)} />
            )}

            <div className="text-16 fw-500 mb-15">Selecciona un equipo disponible:</div>

            <div className="row y-gap-15">
              {equipos
                .filter(e => e.estado === 'Disponible' || !asignaciones.find(a => (a.idEquipo === (e.idEquipo || e.id)) && a.activa))
                .map(equipo => {
                  const equipoId = equipo.idEquipo || equipo.id;
                  const miembros = obtenerMiembrosEquipo(equipo);
                  const yaAsignado = asignaciones.find(a => a.idEquipo === equipoId && a.activa);
                
                  return (
                    <div className="col-12" key={equipoId}>
                      <div 
                        className={`py-20 px-20 rounded-4 border-light cursor-pointer ${yaAsignado ? 'opacity-50' : 'hover-shadow'}`}
                        style={{ 
                          cursor: yaAsignado ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => {
                          console.log('Asignando equipo con ID:', equipoId, 'Equipo:', equipo);
                          if (!yaAsignado) asignarEquipoAAeronaveHandler(equipoId);
                        }}
                      >
                        <div className="d-flex justify-between items-center">
                          <div>
                            <div className="text-16 fw-600">{equipo.nombre}</div>
                            <div className="text-14 text-blue-1">{equipo.codigo}</div>
                            <span 
                              className={`rounded-100 py-2 px-8 text-12 ${getEstadoColor(equipo.estado)}`}
                              style={getEstadoBgColor(equipo.estado)}
                            >
                              {equipo.estado}
                            </span>
                            <div className="d-flex gap-10 mt-10 flex-wrap">
                              {contarPorRol(equipo, 'Piloto') > 0 && (
                                <span className="text-12 text-white py-2 px-8 rounded-100" style={{ backgroundColor: '#3554d1' }}>
                                  {contarPorRol(equipo, 'Piloto')} Piloto(s)
                                </span>
                              )}
                              {contarPorRol(equipo, 'Copiloto') > 0 && (
                                <span className="text-12 text-white py-2 px-8 rounded-100" style={{ backgroundColor: '#7c3aed' }}>
                                  {contarPorRol(equipo, 'Copiloto')} Copiloto(s)
                                </span>
                              )}
                              {contarPorRol(equipo, 'Sobrecargo Jefe') > 0 && (
                                <span className="text-12 text-white py-2 px-8 rounded-100" style={{ backgroundColor: '#db2777' }}>
                                  {contarPorRol(equipo, 'Sobrecargo Jefe')} S.Jefe(s)
                                </span>
                              )}
                              {contarPorRol(equipo, 'Sobrecargo') > 0 && (
                                <span className="text-12 text-white py-2 px-8 rounded-100" style={{ backgroundColor: '#ea580c' }}>
                                  {contarPorRol(equipo, 'Sobrecargo')} Sobrecargo(s)
                                </span>
                              )}
                            </div>
                            {yaAsignado && (
                              <div className="text-12 text-red-1 mt-10">
                                Ya asignado a otra aeronave
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

            {equipos.filter(e => e.estado === 'Disponible').length === 0 && (
              <div className="text-center py-20 text-light-1">
                No hay equipos disponibles para asignar
              </div>
            )}

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
