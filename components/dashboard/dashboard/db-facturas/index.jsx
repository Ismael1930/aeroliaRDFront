'use client'

import Sidebar from "../common/Sidebar";
import Header from "@/components/header/dashboard-header";
import Footer from "../common/Footer";
import facturaService from "@/api/facturaService";
import { useState, useEffect } from "react";

const GestionFacturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [codigoFiltro, setCodigoFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await facturaService.getAll();
      const facturasData = Array.isArray(response) ? response : (response.data || response.facturas || []);
      setFacturas(facturasData);
    } catch (err) {
      console.error(err);
      setError("Error al cargar las facturas.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por código de factura
  const facturasFiltradas = facturas.filter(f => {
    const codigo = (f.Codigo || f.codigo || '').toString();
    return codigo.toLowerCase().includes((codigoFiltro || '').toLowerCase());
  });

  // Paginación
  const indexOfLast = paginaActual * itemsPorPagina;
  const indexOfFirst = indexOfLast - itemsPorPagina;
  const facturasPaginadas = facturasFiltradas.slice(indexOfFirst, indexOfLast);

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
                <h1 className="text-30 lh-14 fw-600">Gestión de Facturas</h1>
                <div className="text-15 text-light-1">Ver facturas del sistema (solo lectura)</div>
              </div>
            </div>

            <div className="py-30 px-30 rounded-4 bg-white shadow-3">
              {/* Filtro por código de factura */}
              <div className="row y-gap-20 mb-20">
                <div className="col-12">
                  <input
                    type="text"
                    placeholder="Filtrar por código de factura"
                    className="form-control"
                    value={codigoFiltro}
                    onChange={(e) => { setCodigoFiltro(e.target.value); setPaginaActual(1); }}
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
                      <th>Código Reserva</th>
                      <th>Monto</th>
                      <th>Método de Pago</th>
                      <th>Fecha Emisión</th>
                      <th>Estado de Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturasPaginadas.map((factura) => {
                      const estadoPago = factura.EstadoPago || factura.estadoPago || '';
                      return (
                      <tr key={factura.Codigo || factura.codigo || factura.id}>
                        <td className="fw-500">{factura.Codigo || factura.codigo}</td>
                        <td className="fw-500">{factura.CodReserva || factura.codReserva}</td>
                        <td>{factura.Monto ?? factura.monto}</td>
                        <td>{factura.MetodoPago || factura.metodoPago}</td>
                        <td>{factura.FechaEmision ? new Date(factura.FechaEmision).toLocaleString() : (factura.fechaEmision ? new Date(factura.fechaEmision).toLocaleString() : '')}</td>
                        <td>
                          <span className={`py-10 px-15 rounded-100 text-12 fw-500 ${
                            estadoPago === 'Pagado' || estadoPago === 'Completado' ? 'bg-green-2 text-white' :
                            estadoPago === 'Cancelado' || estadoPago === 'Rechazado' ? 'bg-red-2 text-white' :
                            estadoPago === 'Pendiente' ? 'bg-yellow-2 text-dark-1' :
                            'bg-blue-1-05 text-blue-1'
                          }`}>
                            {estadoPago}
                          </span>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>

                {facturasFiltradas.length === 0 && (
                  <div className="text-center py-40 text-light-1">No se encontraron facturas</div>
                )}
              </div>
            )}

            {/* Paginación simple */}
            {!loading && facturasFiltradas.length > itemsPorPagina && (
              <div className="pt-30 border-top-light">
                <div className="row x-gap-10 y-gap-20 justify-between items-center">
                  <div className="col-auto">
                    <div className="text-14 text-light-1">Mostrando {indexOfFirst + 1} a {Math.min(indexOfLast, facturasFiltradas.length)} de {facturasFiltradas.length} facturas</div>
                  </div>
                  <div className="col-auto">
                    <div className="row x-gap-10 y-gap-10 items-center">
                      <div className="col-auto">
                        <button className="button -blue-1 size-40 rounded-full border-light" onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} style={{ opacity: paginaActual === 1 ? 0.5 : 1 }}>
                          <i className="icon-chevron-left text-12"></i>
                        </button>
                      </div>
                      {[...Array(Math.ceil(facturasFiltradas.length / itemsPorPagina))].map((_, i) => (
                        <div className="col-auto" key={i}>
                          <button className={`button size-40 rounded-full ${paginaActual === i + 1 ? 'bg-dark-1 text-white' : 'border-light bg-white text-dark-1'}`} onClick={() => setPaginaActual(i + 1)}>{i + 1}</button>
                        </div>
                      ))}
                      <div className="col-auto">
                        <button className="button -blue-1 size-40 rounded-full border-light" onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === Math.ceil(facturasFiltradas.length / itemsPorPagina)} style={{ opacity: paginaActual === Math.ceil(facturasFiltradas.length / itemsPorPagina) ? 0.5 : 1 }}>
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

export default GestionFacturas;
