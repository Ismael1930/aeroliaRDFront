'use client'

import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import { 
  obtenerTodaLaTripulacion, 
  crearTripulacion, 
  actualizarTripulacion, 
  eliminarTripulacion 
} from "@/api/tripulacionService";

const GestionTripulacion = () => {
  const [tripulacion, setTripulacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    rol: 'Piloto',
    licencia: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const response = await obtenerTodaLaTripulacion();
        console.log('Respuesta tripulación:', response);
        // El API devuelve {success: true, data: [...]}
        const tripulacionData = response.data || response.tripulacion || (Array.isArray(response) ? response : []);
        setTripulacion(Array.isArray(tripulacionData) ? tripulacionData : []);
      } catch (err) {
        console.error('Error al cargar tripulación:', err);
        if (err.response?.status === 403) {
          setError('No tienes permisos para ver la tripulación. Contacta al administrador.');
        } else {
          setError('Error al cargar los datos. Por favor, intenta nuevamente.');
        }
      }
    } catch (error) {
      console.error('Error general al cargar datos:', error);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setFormulario({
      nombre: '',
      apellido: '',
      rol: 'Piloto',
      licencia: ''
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (miembro) => {
    setModoEdicion(true);
    setMiembroSeleccionado(miembro);
    setFormulario({
      id: miembro.id,
      nombre: miembro.nombre,
      apellido: miembro.apellido,
      rol: miembro.rol,
      licencia: miembro.licencia
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const datosMiembro = {
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        rol: formulario.rol,
        licencia: formulario.licencia
      };

      // Si es edición, agregar el ID
      if (modoEdicion && formulario.id) {
        datosMiembro.id = parseInt(formulario.id);
      }

      console.log('Datos enviados al backend:', datosMiembro);

      if (modoEdicion) {
        await actualizarTripulacion(datosMiembro);
        alert('Miembro actualizado exitosamente');
      } else {
        await crearTripulacion(datosMiembro);
        alert('Miembro creado exitosamente');
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar miembro:', error);
      const mensaje = error.response?.data?.message || 'Error al guardar el miembro de tripulación';
      alert(mensaje);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar este miembro?')) return;
    
    try {
      await eliminarTripulacion(id);
      alert('Miembro eliminado exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      alert('Error al eliminar el miembro');
    }
  };

  const tripulacionFiltrada = tripulacion.filter(t =>
    (t.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    t.apellido?.toLowerCase().includes(filtro.toLowerCase()) ||
    t.licencia?.toLowerCase().includes(filtro.toLowerCase())) &&
    (filtroRol === '' || t.rol === filtroRol)
  );

  // Cálculos de paginación
  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const tripulacionActual = tripulacionFiltrada.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(tripulacionFiltrada.length / itemsPorPagina);

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
                <h1 className="text-30 lh-14 fw-600">Gestión de Tripulación</h1>
                <div className="text-15 text-light-1">
                  Administrar toda la tripulación del sistema
                </div>
              </div>
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

            {/* Mensaje de error */}
            {error && (
              <div className="py-20 px-30 rounded-4 bg-red-1-05 mb-30">
                <div className="d-flex items-center">
                  <i className="icon-alert-circle text-24 text-red-1 mr-10"></i>
                  <div className="text-15 text-red-1">{error}</div>
                </div>
              </div>
            )}

            {/* Tabla de Tripulación */}
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
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tripulacionActual.map((miembro) => (
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
                      ))}
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
              {modoEdicion ? 'Editar Miembro' : 'Nuevo Miembro'}
            </h3>

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
    </>
  );
};

export default GestionTripulacion;
