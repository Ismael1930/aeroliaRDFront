'use client'

import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import reservaService from "@/api/reservaService";
import { useState, useEffect } from "react";
import { FiEye, FiX } from 'react-icons/fi';

const GestionReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numeroVueloFiltro, setNumeroVueloFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reservaService.getAll();
      // result may be { items, count, raw } per new API wrapper
      const reservasData = Array.isArray(result) ? result : (result.items || result.data || result.reservas || []);
      setReservas(reservasData);
    } catch (err) {
      console.error(err);
      setError("Error al cargar las reservas.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por número de vuelo (sensible a mayúsculas/minúsculas)
  const reservasFiltradas = reservas.filter(r => {
    const numero = (r.NumeroVuelo || r.numeroVuelo || '').toString();
    return numero.toLowerCase().includes((numeroVueloFiltro || '').toLowerCase());
  });

  // Paginación
  const indexOfLast = paginaActual * itemsPorPagina;
  const indexOfFirst = indexOfLast - itemsPorPagina;
  const reservasPaginadas = reservasFiltradas.slice(indexOfFirst, indexOfLast);

  const openModal = (reserva) => {
    setSelectedReserva(reserva);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReserva(null);
  };

  // Precio a mostrar en el modal: preferir factura.monto si existe
  const modalPrecio = selectedReserva
    ? ((selectedReserva.Factura && (selectedReserva.Factura.Monto ?? selectedReserva.Factura.monto)) ?? (selectedReserva.PrecioTotal ?? selectedReserva.precioTotal ?? selectedReserva.monto ?? ''))
    : '';

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
                <h1 className="text-30 lh-14 fw-600">Gestión de Reservas</h1>
                <div className="text-15 text-light-1">Ver reservas del sistema (solo lectura)</div>
              </div>
            </div>

            <div className="py-30 px-30 rounded-4 bg-white shadow-3">
              {/* Filtro por Número de Vuelo */}
              <div className="row y-gap-20 mb-20">
                <div className="col-12">
                  <input
                    type="text"
                    placeholder="Filtrar por número de vuelo"
                    className="form-control"
                    value={numeroVueloFiltro}
                    onChange={(e) => { setNumeroVueloFiltro(e.target.value); setPaginaActual(1); }}
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
              {loading ? (
                <div className="text-center py-40">
                  <div className="spinner-border text-blue-1"></div>
                </div>
              ) : error ? (
                <div className="text-danger">{error}</div>
              ) : (
                <div className="overflow-scroll scroll-bar-1">
                  <table className="table-3 -border-bottom col-12">
                    <thead className="bg-light-2">
                      <tr>
                        <th>Código</th>
                        <th>Número Vuelo</th>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Clase</th>
                        <th>Estado</th>
                        <th>Precio</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservasPaginadas.map((reserva) => {
                        const precio = reserva.PrecioTotal ?? reserva.precioTotal ?? reserva.monto ?? (reserva.Factura && (reserva.Factura.Monto ?? reserva.Factura.monto)) ?? '';
                        const estado = reserva.Estado || reserva.estado || '';
                        return (
                        <tr key={reserva.Codigo || reserva.codigo || reserva.id}>
                          <td className="fw-500">{reserva.Codigo || reserva.codigo}</td>
                          <td className="fw-500">{reserva.NumeroVuelo || reserva.numeroVuelo || ''}</td>
                          <td>{reserva.Origen || reserva.origen || ''}</td>
                          <td>{reserva.Destino || reserva.destino || ''}</td>
                          <td>{reserva.Clase || reserva.clase || ''}</td>
                          <td>
                            <span className={`py-10 px-15 rounded-100 text-12 fw-500 ${
                              estado === 'Confirmada' ? 'bg-green-2 text-white' :
                              estado === 'Cancelada' ? 'bg-red-2 text-white' :
                              'bg-yellow-2 text-dark-1'
                            }`}>
                              {estado}
                            </span>
                          </td>
                          <td>{precio}</td>
                          <td>
                            <button className="button -sm -blue-1" onClick={() => openModal(reserva)} aria-label={`Ver ${reserva.Codigo || reserva.codigo}`}>
                              <FiEye style={{ color: '#0d6efd' }} />
                            </button>
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {/* Modal de detalle */}
                  {isModalOpen && selectedReserva && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="modal-card bg-white rounded-8" style={{ width: '90%', maxWidth: 900, maxHeight: '90%', overflowY: 'auto', padding: 20 }}>
                        <div className="d-flex justify-between items-center mb-10">
                          <h3 className="mb-0">Detalle Reserva — {selectedReserva.Codigo || selectedReserva.codigo}</h3>
                          <button className="button -sm" onClick={closeModal} aria-label="Cerrar modal"><FiX style={{ color: '#dc3545' }} /></button>
                        </div>

                        <div className="row y-gap-10">
                          <div className="col-6">
                            <strong>Código:</strong> {selectedReserva.Codigo || selectedReserva.codigo}
                          </div>
                          <div className="col-6">
                            <strong>Pasajero:</strong> {(selectedReserva.PasajeroNombre || selectedReserva.pasajeroNombre || '') + ' ' + (selectedReserva.PasajeroApellido || selectedReserva.pasajeroApellido || '')}
                          </div>
                          <div className="col-6">
                            <strong>Número Vuelo:</strong> {selectedReserva.NumeroVuelo || selectedReserva.numeroVuelo || ''}
                          </div>
                          <div className="col-6">
                            <strong>Fecha Vuelo:</strong> {(selectedReserva.FechaVuelo || selectedReserva.fechaVuelo) ? new Date(selectedReserva.FechaVuelo || selectedReserva.fechaVuelo).toLocaleString() : ''}
                          </div>
                          <div className="col-6">
                            <strong>Origen:</strong> {selectedReserva.Origen || selectedReserva.origen || ''}
                          </div>
                          <div className="col-6">
                            <strong>Destino:</strong> {selectedReserva.Destino || selectedReserva.destino || ''}
                          </div>
                          <div className="col-6">
                            <strong>Asiento:</strong> {selectedReserva.NumAsiento || selectedReserva.numAsiento || ''}
                          </div>
                          <div className="col-6">
                            <strong>Clase:</strong> {selectedReserva.Clase || selectedReserva.clase || ''}
                          </div>
                          <div className="col-6">
                            <strong>Fecha Reserva:</strong> {(selectedReserva.FechaReserva || selectedReserva.fechaReserva) ? new Date(selectedReserva.FechaReserva || selectedReserva.fechaReserva).toLocaleString() : ''}
                          </div>
                          <div className="col-6">
                            <strong>Estado:</strong> {selectedReserva.Estado || selectedReserva.estado || ''}
                          </div>
                          <div className="col-6">
                            <strong>Precio Total:</strong> {modalPrecio}
                          </div>

                          {/* Factura nested */}
                          {selectedReserva.Factura && (
                            <div className="col-12 mt-10">
                              <h4>Factura</h4>
                              <div><strong>Código Factura:</strong> {selectedReserva.Factura.Codigo || selectedReserva.Factura.codigo}</div>
                              <div><strong>Cod Reserva:</strong> {selectedReserva.Factura.CodReserva || selectedReserva.Factura.codReserva || selectedReserva.Factura.codReserva}</div>
                              <div><strong>Monto:</strong> {selectedReserva.Factura.Monto || selectedReserva.Factura.monto}</div>
                              <div><strong>Método Pago:</strong> {selectedReserva.Factura.MetodoPago || selectedReserva.Factura.metodoPago}</div>
                              <div><strong>Fecha Emisión:</strong> {(selectedReserva.Factura.FechaEmision || selectedReserva.Factura.fechaEmision) ? new Date(selectedReserva.Factura.FechaEmision || selectedReserva.Factura.fechaEmision).toLocaleString() : ''}</div>
                              <div><strong>Estado Pago:</strong> {selectedReserva.Factura.EstadoPago || selectedReserva.Factura.estadoPago || selectedReserva.Factura.estadoPago}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {reservasFiltradas.length === 0 && (
                    <div className="text-center py-40 text-light-1">No se encontraron reservas</div>
                  )}
                </div>
              )}

              {/* Paginación simple */}
              {!loading && reservasFiltradas.length > itemsPorPagina && (
                <div className="pt-30 border-top-light">
                  <div className="row x-gap-10 y-gap-20 justify-between items-center">
                    <div className="col-auto">
                      <div className="text-14 text-light-1">Mostrando {indexOfFirst + 1} a {Math.min(indexOfLast, reservasFiltradas.length)} de {reservasFiltradas.length} reservas</div>
                    </div>
                    <div className="col-auto">
                      <div className="row x-gap-10 y-gap-10 items-center">
                        <div className="col-auto">
                          <button className="button -blue-1 size-40 rounded-full border-light" onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} style={{ opacity: paginaActual === 1 ? 0.5 : 1 }}>
                            <i className="icon-chevron-left text-12"></i>
                          </button>
                        </div>
                        {[...Array(Math.ceil(reservasFiltradas.length / itemsPorPagina))].map((_, i) => (
                          <div className="col-auto" key={i}>
                            <button className={`button size-40 rounded-full ${paginaActual === i + 1 ? 'bg-dark-1 text-white' : 'border-light bg-white text-dark-1'}`} onClick={() => setPaginaActual(i + 1)}>{i + 1}</button>
                          </div>
                        ))}
                        <div className="col-auto">
                          <button className="button -blue-1 size-40 rounded-full border-light" onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === Math.ceil(reservasFiltradas.length / itemsPorPagina)} style={{ opacity: paginaActual === Math.ceil(reservasFiltradas.length / itemsPorPagina) ? 0.5 : 1 }}>
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
    </>
  );
};

export default GestionReservas;
