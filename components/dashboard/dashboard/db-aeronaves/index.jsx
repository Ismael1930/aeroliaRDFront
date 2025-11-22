'use client'

import { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import { 
  obtenerTodasLasAeronaves, 
  crearAeronave, 
  actualizarAeronave, 
  eliminarAeronave 
} from "@/api/aeronaveService";

const GestionAeronaves = () => {
  const [aeronaves, setAeronaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [aeronaveSeleccionada, setAeronaveSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

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
      
      try {
        const response = await obtenerTodasLasAeronaves();
        console.log('Respuesta aeronaves:', response);
        const aeronavesData = Array.isArray(response) ? response : (response.data || response.aeronaves || []);
        setAeronaves(aeronavesData);
      } catch (err) {
        console.error('Error al cargar aeronaves:', err);
        if (err.response?.status === 403) {
          setError('No tienes permisos para ver las aeronaves. Contacta al administrador.');
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
      modelo: '',
      matricula: '',
      capacidad: '',
      estado: 'Disponible'
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (aeronave) => {
    setModoEdicion(true);
    setAeronaveSeleccionada(aeronave);
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
    try {
      const datosAeronave = {
        matricula: formulario.matricula,
        modelo: formulario.modelo,
        capacidad: parseInt(formulario.capacidad),
        estado: formulario.estado
      };

      console.log('Datos enviados al backend:', datosAeronave);

      if (modoEdicion) {
        await actualizarAeronave(datosAeronave);
        alert('Aeronave actualizada exitosamente');
      } else {
        await crearAeronave(datosAeronave);
        alert('Aeronave creada exitosamente');
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar aeronave:', error);
      alert('Error al guardar la aeronave');
    }
  };

  const handleEliminar = async (matricula) => {
    if (!confirm('¿Está seguro de eliminar esta aeronave?')) return;
    
    try {
      await eliminarAeronave(matricula);
      alert('Aeronave eliminada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar aeronave:', error);
      alert('Error al eliminar la aeronave');
    }
  };

  const aeronavesFiltradas = aeronaves.filter(a =>
    a.modelo?.toLowerCase().includes(filtro.toLowerCase()) ||
    a.matricula?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Cálculos de paginación
  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const aeronavesActuales = aeronavesFiltradas.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(aeronavesFiltradas.length / itemsPorPagina);

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
                <h1 className="text-30 lh-14 fw-600">Gestión de Aeronaves</h1>
                <div className="text-15 text-light-1">
                  Administrar todas las aeronaves del sistema
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
                  <input
                    type="text"
                    placeholder="Buscar por modelo o matrícula..."
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

            {/* Tabla de Aeronaves */}
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
                        <th>Modelo</th>
                        <th>Matrícula</th>
                        <th>Capacidad</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aeronavesActuales.map((aeronave) => (
                        <tr key={aeronave.matricula}>
                          <td className="fw-500">{aeronave.modelo}</td>
                          <td className="fw-500 text-blue-1">{aeronave.matricula}</td>
                          <td>{aeronave.capacidad} pasajeros</td>
                          <td>
                            <span className={`rounded-100 py-4 px-10 text-center text-14 fw-500 ${
                              aeronave.estado === 'Disponible' ? 'bg-green-1 text-white' :
                              aeronave.estado === 'Mantenimiento' ? 'bg-yellow-4 text-yellow-3' :
                              'bg-red-3 text-red-2'
                            }`}>
                              {aeronave.estado}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex items-center gap-10">
                              <button
                                className="flex-center bg-light-2 rounded-4 size-35"
                                onClick={() => abrirModalEditar(aeronave)}
                                title="Editar"
                              >
                                <i className="icon-edit text-16 text-light-1"></i>
                              </button>
                              <button
                                className="flex-center bg-red-3 rounded-4 size-35"
                                onClick={() => handleEliminar(aeronave.matricula)}
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

                  {aeronavesFiltradas.length === 0 && (
                    <div className="text-center py-40 text-light-1">
                      No se encontraron aeronaves
                    </div>
                  )}
                </div>
              )}

              {/* Paginación */}
              {!loading && aeronavesFiltradas.length > 0 && (
                <div className="pt-30 border-top-light">
                  <div className="row x-gap-10 y-gap-20 justify-between items-center">
                    <div className="col-auto">
                      <div className="text-14 text-light-1">
                        Mostrando {indexPrimero + 1} a {Math.min(indexUltimo, aeronavesFiltradas.length)} de {aeronavesFiltradas.length} aeronaves
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
              {modoEdicion ? 'Editar Aeronave' : 'Nueva Aeronave'}
            </h3>

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
