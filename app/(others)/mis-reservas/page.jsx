'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { obtenerReservasCliente, cancelarReserva } from "@/api/reservaService";
import { obtenerClientePorUserId } from "@/api/clienteService";
import DefaultFooter from "@/components/footer/default";
import HeaderClienteHome from "@/components/header/header-cliente-home";

const MisReservasPage = () => {
  const { isAuth, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    console.log('useEffect auth check:', { authLoading, isAuth });
    if (!authLoading && !isAuth) {
      router.push('/login');
    }
  }, [isAuth, authLoading, router]);

  useEffect(() => {
    console.log('useEffect cargar reservas check:', { 
      isAuth, 
      userId: user?.userId, 
      cargado,
      user 
    });
    if (isAuth && user?.userId && !cargado) {
      console.log('Ejecutando cargarReservas...');
      cargarReservas();
    }
  }, [isAuth, user?.userId, cargado]);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      console.log('Obteniendo cliente por userId:', user.userId);
      
      // Primero obtener el cliente por userId
      const clienteResponse = await obtenerClientePorUserId(user.userId);
      console.log('Cliente obtenido:', clienteResponse);
      
      // Extraer el ID del cliente
      const clienteId = clienteResponse?.id || clienteResponse?.data?.id;
      console.log('ID del cliente:', clienteId);
      
      if (!clienteId) {
        console.error('No se pudo obtener el ID del cliente');
        setReservas([]);
        setCargado(true);
        return;
      }
      
      // Ahora obtener las reservas con el ID del cliente
      console.log('Cargando reservas para clienteId:', clienteId);
      const response = await obtenerReservasCliente(clienteId);
      console.log('Respuesta del servidor:', response);
      const reservasData = Array.isArray(response) ? response : 
                          (response?.data ? (Array.isArray(response.data) ? response.data : []) : []);
      console.log('Reservas procesadas:', reservasData);
      setReservas(reservasData);
      setCargado(true);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      setReservas([]);
      setCargado(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarReserva = async (codigoReserva) => {
    if (!confirm('¿Está seguro que desea cancelar esta reserva?')) {
      return;
    }

    try {
      setProcesando(true);
      const response = await cancelarReserva(codigoReserva);
      console.log('Respuesta cancelación:', response);
      
      // Actualizar el estado local de la reserva cancelada
      setReservas(prevReservas => 
        prevReservas.map(reserva => 
          (reserva.codigo === codigoReserva || reserva.codigoReserva === codigoReserva)
            ? { ...reserva, estado: 'Cancelada' }
            : reserva
        )
      );
      
      alert('Reserva cancelada exitosamente');
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      alert('Error al cancelar la reserva. Por favor intente nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  const puedeCancelar = (fechaVuelo) => {
    if (!fechaVuelo) return false;
    try {
      const fechaVueloDate = new Date(fechaVuelo);
      const ahora = new Date();
      return fechaVueloDate > ahora;
    } catch {
      return false;
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  const formatearHora = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      // Si es una cadena de tiempo como "08:15:00" o "08:15", devolver los primeros 5 caracteres
      if (typeof fecha === 'string' && fecha.includes(':')) {
        return fecha.substring(0, 5);
      }
      return new Date(fecha).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <HeaderClienteHome />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
        <DefaultFooter />
      </>
    );
  }

  return (
    <>
      <HeaderClienteHome />
      
      <section className="layout-pt-lg layout-pb-lg">
        <div className="container">
          <div className="row y-gap-20 justify-between items-end pb-30 lg:pb-40 md:pb-32">
            <div className="col-auto">
              <h1 className="text-30 lh-14 fw-600">Mis Reservas</h1>
              <div className="text-15 text-light-1 mt-5">
                {reservas.length} {reservas.length === 1 ? 'reserva encontrada' : 'reservas encontradas'}
              </div>
            </div>
          </div>

          {reservas.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-60 mb-3">✈️</div>
              <h3 className="text-20 fw-500 mb-2">No tienes reservas activas</h3>
              <p className="text-light-1 mb-4">Comienza a planear tu próximo viaje</p>
              <button 
                onClick={() => router.push('/home')}
                className="button -md -blue-1 bg-blue-1 text-white px-30"
              >
                Buscar Vuelos
              </button>
            </div>
          ) : (
            <div className="row y-gap-30">
              <div className="col-12">
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table className="table-3 -border-bottom" style={{ width: '100%', minWidth: '1200px' }}>
                    <thead className="bg-light-2">
                      <tr>
                        <th>Código</th>
                        <th>Vuelo</th>
                        <th>Origen - Destino</th>
                        <th>Fecha Salida</th>
                        <th>Hora Salida</th>
                        <th>Hora Llegada</th>
                        <th>Asiento</th>
                        <th>Clase</th>
                        <th>Estado</th>
                        <th>Precio</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservas.map((reserva, index) => (
                        <tr key={reserva.id || index}>
                          <td className="fw-500">
                            {reserva.codigo || reserva.codigoReserva || 'N/A'}
                          </td>
                          <td>
                            <div className="fw-500">
                              {reserva.vuelo?.numeroVuelo || reserva.numeroVuelo || 'N/A'}
                            </div>
                            <div className="text-14 text-light-1">
                              {reserva.vuelo?.aerolinea || ''}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex items-center">
                              <div className="text-15 fw-500">
                                {reserva.vuelo?.aeropuertoOrigen?.codigo || reserva.origen || 'N/A'}
                              </div>
                              <div className="mx-2">→</div>
                              <div className="text-15 fw-500">
                                {reserva.vuelo?.aeropuertoDestino?.codigo || reserva.destino || 'N/A'}
                              </div>
                            </div>
                            <div className="text-14 text-light-1">
                              {reserva.vuelo?.aeropuertoOrigen?.ciudad || ''} - {reserva.vuelo?.aeropuertoDestino?.ciudad || ''}
                            </div>
                          </td>
                          <td>
                            {formatearFecha(reserva.fechaVuelo || reserva.vuelo?.fechaSalida || reserva.fechaSalida)}
                          </td>
                          <td>
                            {formatearHora(reserva.horaSalida || reserva.vuelo?.horaSalida || reserva.horaSalida || reserva.fechaSalida)}
                          </td>
                          <td>
                            {formatearHora(reserva.horaLlegada || reserva.vuelo?.horaLlegada || reserva.horaLlegada || reserva.fechaLlegada)}
                          </td>
                          <td className="text-center">
                            <span className="py-10 px-15 rounded-4 text-12 fw-500 bg-blue-1-05 text-blue-1">
                              {reserva.numAsiento || 'N/A'}
                            </span>
                          </td>
                          <td>{reserva.clase || 'Económica'}</td>
                          <td>
                            <span className={`py-10 px-15 rounded-100 text-12 fw-500 ${
                              reserva.estado === 'Confirmada' ? 'bg-green-2 text-white' :
                              reserva.estado === 'Cancelada' ? 'bg-red-2 text-white' :
                              'bg-yellow-2 text-dark-1'
                            }`}>
                              {reserva.estado || 'Confirmada'}
                            </span>
                          </td>
                          <td className="fw-500">
                            ${reserva.precioTotal || reserva.precio || 0}
                          </td>
                          <td>
                            {reserva.estado === 'Cancelada' ? (
                              <span className="text-14 text-red-2">Cancelada</span>
                            ) : puedeCancelar(reserva.fechaVuelo) ? (
                              <button
                                onClick={() => handleCancelarReserva(reserva.codigo || reserva.codigoReserva)}
                                disabled={procesando}
                                className="button -sm -red-1 bg-red-1 text-white px-20"
                              >
                                {procesando ? 'Cancelando...' : 'Cancelar'}
                              </button>
                            ) : (
                              <span className="text-14 text-light-1">No disponible</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <DefaultFooter />
    </>
  );
};

export default MisReservasPage;
