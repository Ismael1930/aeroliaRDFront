'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const FlightProperties = ({ sortBy = 'precio-asc', currentPage = 1, itemsPerPage = 10 }) => {
  const router = useRouter();
  const { isAuth } = useAuth();
  const [vuelos, setVuelos] = useState([]);
  const [vuelosOriginales, setVuelosOriginales] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleReservar = (vueloId) => {
    if (!isAuth) {
      // Guardar URL de retorno y redirigir al login
      localStorage.setItem('redirectAfterLogin', `/flight-booking?vueloId=${vueloId}`);
      router.push('/login');
    } else {
      // Ir directamente a la página de reserva
      router.push(`/flight-booking?vueloId=${vueloId}`);
    }
  };

  useEffect(() => {
    // Cargar los vuelos desde localStorage
    const resultados = localStorage.getItem('resultadosVuelos');
    if (resultados) {
      try {
        const data = JSON.parse(resultados);
        const vuelosData = Array.isArray(data) ? data : [];
        setVuelosOriginales(vuelosData);
        setVuelos(vuelosData);
      } catch (error) {
        console.error('Error al parsear resultados:', error);
        setVuelos([]);
        setVuelosOriginales([]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Ordenar vuelos cuando cambia sortBy
    if (vuelosOriginales.length > 0) {
      const vuelosOrdenados = [...vuelosOriginales].sort((a, b) => {
        switch (sortBy) {
          case 'precio-asc':
            return (a.precioBase || 0) - (b.precioBase || 0);
          case 'precio-desc':
            return (b.precioBase || 0) - (a.precioBase || 0);
          case 'hora-asc':
            return (a.horaSalida || '').localeCompare(b.horaSalida || '');
          case 'hora-desc':
            return (b.horaSalida || '').localeCompare(a.horaSalida || '');
          case 'duracion-asc':
            return (a.duracion || 0) - (b.duracion || 0);
          case 'asientos-desc':
            return (b.clasesDisponibles?.reduce((total, c) => total + c.asientosDisponibles, 0) || 0) - 
                   (a.clasesDisponibles?.reduce((total, c) => total + c.asientosDisponibles, 0) || 0);
          default:
            return 0;
        }
      });
      setVuelos(vuelosOrdenados);
    }
  }, [sortBy, vuelosOriginales]);

  // Calcular vuelos paginados
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVuelos = vuelos.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="col-12">
        <div className="text-center py-30">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (vuelos.length === 0) {
    return (
      <div className="col-12">
        <div className="py-30 px-30 bg-white rounded-4 text-center">
          <div className="text-center">
            <i className="icon-flight text-60 text-blue-1 mb-20"></i>
            <h4 className="text-20 fw-500">No se encontraron vuelos</h4>
            <p className="text-15 text-light-1 mt-10">
              Intenta modificar tus criterios de búsqueda
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatearHora = (hora) => {
    if (!hora) return '--:--';
    // Si es un string de tiempo "HH:mm:ss", extraer HH:mm
    if (typeof hora === 'string' && hora.includes(':')) {
      return hora.substring(0, 5); // Devuelve "HH:mm"
    }
    // Si es una fecha completa
    const fecha = new Date(hora);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatearFecha = (fechaHora) => {
    if (!fechaHora) return '';
    const fecha = new Date(fechaHora);
    return fecha.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatearDuracion = (minutos) => {
    if (!minutos) return '--h --m';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  return (
    <>
      {currentVuelos.map((vuelo) => (
        <div className="js-accordion" key={vuelo.id}>
          <div className="py-20 px-30 bg-white rounded-4 base-tr mt-30">
            <div className="row y-gap-20 justify-between">
              <div className="col">
                {/* Vuelo de Ida */}
                <div className="row y-gap-10 items-center">
                  <div className="col-sm-auto">
                    <img
                      className="size-40"
                      src="/img/flightIcons/1.png"
                      alt="airline"
                    />
                  </div>
                  <div className="col">
                    <div className="row x-gap-20 items-end">
                      <div className="col-auto">
                        <div className="lh-15 fw-500">{formatearHora(vuelo.horaSalida)}</div>
                        <div className="text-15 lh-15 text-light-1">{vuelo.origenCodigo}</div>
                      </div>
                      <div className="col text-center">
                        <div className="flightLine">
                          <div />
                          <div />
                        </div>
                        <div className="text-15 lh-15 text-light-1 mt-10">
                          {formatearDuracion(vuelo.duracion)}
                        </div>
                      </div>
                      <div className="col-auto">
                        <div className="lh-15 fw-500">
                          {formatearHora(vuelo.horaLlegada)}
                        </div>
                        <div className="text-15 lh-15 text-light-1">{vuelo.destinoCodigo}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-auto">
                    <div className="text-15 text-light-1 px-20 md:px-0">
                      {vuelo.numeroVuelo}
                    </div>
                  </div>
                </div>

                {/* Vuelo de Regreso - Solo si es Ida y Vuelta */}
                {vuelo.tipoVuelo === 'IdaYVuelta' && vuelo.fechaRegreso && (
                  <div className="row y-gap-10 items-center pt-30">
                    <div className="col-12 mb-10">
                      <div className="text-15 fw-500 text-blue-1">Vuelo de Regreso</div>
                    </div>
                    <div className="col-sm-auto">
                      <img
                        className="size-40"
                        src="/img/flightIcons/2.png"
                        alt="airline"
                      />
                    </div>
                    <div className="col">
                      <div className="row x-gap-20 items-end">
                        <div className="col-auto">
                          <div className="lh-15 fw-500">{formatearHora(vuelo.horaSalida)}</div>
                          <div className="text-15 lh-15 text-light-1">{vuelo.destinoCodigo}</div>
                        </div>
                        <div className="col text-center">
                          <div className="flightLine">
                            <div />
                            <div />
                          </div>
                          <div className="text-15 lh-15 text-light-1 mt-10">
                            {formatearDuracion(vuelo.duracion)}
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="lh-15 fw-500">
                            {formatearHora(vuelo.horaLlegada)}
                          </div>
                          <div className="text-15 lh-15 text-light-1">{vuelo.origenCodigo}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-auto">
                      <div className="text-15 text-light-1 px-20 md:px-0">
                        {vuelo.numeroVuelo}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* End .col */}

              <div className="col-md-auto">
                <div className="d-flex items-center h-full">
                  <div className="pl-30 border-left-light h-full md:d-none" />
                  <div>
                    <div className="text-right md:text-left mb-10">
                      <div className="text-18 lh-16 fw-500">
                        Desde US${vuelo.clasesDisponibles && vuelo.clasesDisponibles.length > 0 
                          ? Math.min(...vuelo.clasesDisponibles.map(c => c.precio)).toFixed(2)
                          : '0.00'}
                      </div>
                      <div className="text-15 lh-16 text-light-1">
                        {vuelo.tipoVuelo === 'IdaYVuelta' ? 'Ida y Vuelta' : 'Solo Ida'}
                        {vuelo.clasesDisponibles && vuelo.clasesDisponibles.length > 0 && (
                          <span className="ml-5">• {vuelo.clasesDisponibles.map(c => c.clase).join(', ')}</span>
                        )}
                      </div>
                      <div className="text-15 lh-16 text-light-1">
                        {vuelo.clasesDisponibles && vuelo.clasesDisponibles.length > 0 
                          ? `${vuelo.clasesDisponibles.reduce((total, c) => total + c.asientosDisponibles, 0)} asientos`
                          : '0 asientos'}
                      </div>
                    </div>
                    <div className="mt-10">
                      <button
                        className="button -dark-1 px-30 h-40 bg-yellow-1 text-dark-1 w-100"
                        onClick={() => handleReservar(vuelo.id)}
                      >
                        <i className="icon-ticket text-16 mr-10" />
                        Reservar
                      </button>
                    </div>
                    <div className="accordion__button mt-10">
                      <button
                        className="button -dark-1 px-30 h-40 bg-blue-1 text-white w-100"
                        data-bs-toggle="collapse"
                        data-bs-target={`#vuelo-${vuelo.id}`}
                      >
                        Ver Detalles <div className="icon-arrow-top-right ml-10" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* End .col-md-auto */}
            </div>
            {/* End .row */}

            <div className="collapse" id={`vuelo-${vuelo.id}`}>
              {/* Detalles de IDA */}
              <div className="border-light rounded-4 mt-30">
                <div className="py-20 px-30">
                  <div className="row justify-between items-center">
                    <div className="col-auto">
                      <div className="fw-500 text-dark-1">
                        IDA • {formatearFecha(vuelo.fecha)}
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="text-14 text-light-1">
                        {formatearDuracion(vuelo.duracion)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-30 px-30 border-top-light">
                  <div className="row y-gap-10 justify-between">
                    <div className="col-auto">
                      <div className="d-flex items-center mb-15">
                        <div className="w-28 d-flex justify-center mr-15">
                          <img src="/img/flights/1.png" alt="airline" />
                        </div>
                        <div className="text-14 text-light-1">
                          Vuelo {vuelo.numeroVuelo}
                        </div>
                      </div>
                      <div className="relative z-0">
                        <div className="border-line-2" />
                        <div className="d-flex items-center">
                          <div className="w-28 d-flex justify-center mr-15">
                            <div className="size-10 border-light rounded-full bg-white" />
                          </div>
                          <div className="row">
                            <div className="col-auto">
                              <div className="lh-14 fw-500">{formatearHora(vuelo.horaSalida)}</div>
                            </div>
                            <div className="col-auto">
                              <div className="lh-14 fw-500">
                                {vuelo.origenNombre} ({vuelo.origenCodigo})
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex items-center mt-15">
                          <div className="w-28 d-flex justify-center mr-15">
                            <img src="/img/flights/plane.svg" alt="plane" />
                          </div>
                          <div className="text-14 text-light-1">
                            {formatearDuracion(vuelo.duracion)}
                          </div>
                        </div>
                        <div className="d-flex items-center mt-15">
                          <div className="w-28 d-flex justify-center mr-15">
                            <div className="size-10 border-light rounded-full bg-border" />
                          </div>
                          <div className="row">
                            <div className="col-auto">
                              <div className="lh-14 fw-500">
                                {formatearHora(vuelo.horaLlegada)}
                              </div>
                            </div>
                            <div className="col-auto">
                              <div className="lh-14 fw-500">
                                {vuelo.destinoNombre} ({vuelo.destinoCodigo})
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-auto text-right md:text-left">
                      <div className="text-14 text-light-1">
                        {vuelo.clasesDisponibles && vuelo.clasesDisponibles.length > 0 
                          ? vuelo.clasesDisponibles.map(c => c.clase).join(', ') 
                          : 'Económica'}
                      </div>
                      <div className="text-14 mt-15 md:mt-5">
                        {vuelo.origenCiudad} → {vuelo.destinoCiudad}
                        <br />
                        {vuelo.clasesDisponibles && vuelo.clasesDisponibles.length > 0 
                          ? `${vuelo.clasesDisponibles.reduce((total, c) => total + c.asientosDisponibles, 0)} asientos disponibles`
                          : '0 asientos disponibles'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles de REGRESO - Solo si es Ida y Vuelta */}
              {vuelo.tipoVuelo === 'IdaYVuelta' && vuelo.fechaRegreso && (
                <div className="border-light rounded-4 mt-20">
                  <div className="py-20 px-30">
                    <div className="row justify-between items-center">
                      <div className="col-auto">
                        <div className="fw-500 text-dark-1">
                          REGRESO • {formatearFecha(vuelo.fechaRegreso)}
                        </div>
                      </div>
                      <div className="col-auto">
                        <div className="text-14 text-light-1">
                          {formatearDuracion(vuelo.duracion)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="py-30 px-30 border-top-light">
                    <div className="row y-gap-10 justify-between">
                      <div className="col-auto">
                        <div className="d-flex items-center mb-15">
                          <div className="w-28 d-flex justify-center mr-15">
                            <img src="/img/flights/1.png" alt="airline" />
                          </div>
                          <div className="text-14 text-light-1">
                            Vuelo {vuelo.numeroVuelo}
                          </div>
                        </div>
                        <div className="relative z-0">
                          <div className="border-line-2" />
                          <div className="d-flex items-center">
                            <div className="w-28 d-flex justify-center mr-15">
                              <div className="size-10 border-light rounded-full bg-white" />
                            </div>
                            <div className="row">
                              <div className="col-auto">
                                <div className="lh-14 fw-500">{formatearHora(vuelo.horaSalida)}</div>
                              </div>
                              <div className="col-auto">
                                <div className="lh-14 fw-500">
                                  {vuelo.destinoNombre} ({vuelo.destinoCodigo})
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex items-center mt-15">
                            <div className="w-28 d-flex justify-center mr-15">
                              <img src="/img/flights/plane.svg" alt="plane" />
                            </div>
                            <div className="text-14 text-light-1">
                              {formatearDuracion(vuelo.duracion)}
                            </div>
                          </div>
                          <div className="d-flex items-center mt-15">
                            <div className="w-28 d-flex justify-center mr-15">
                              <div className="size-10 border-light rounded-full bg-border" />
                            </div>
                            <div className="row">
                              <div className="col-auto">
                                <div className="lh-14 fw-500">
                                  {formatearHora(vuelo.horaLlegada)}
                                </div>
                              </div>
                              <div className="col-auto">
                                <div className="lh-14 fw-500">
                                  {vuelo.origenNombre} ({vuelo.origenCodigo})
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                    <div className="col-auto text-right md:text-left">
                      <div className="text-14 text-light-1">
                        {vuelo.clasesDisponibles && vuelo.clasesDisponibles.length > 0 
                          ? vuelo.clasesDisponibles.map(c => c.clase).join(', ') 
                          : 'Económica'}
                      </div>
                      <div className="text-14 mt-15 md:mt-5">
                        {vuelo.destinoCiudad} → {vuelo.origenCiudad}
                        <br />
                        {vuelo.clasesDisponibles && vuelo.clasesDisponibles.length > 0 
                          ? `${vuelo.clasesDisponibles.reduce((total, c) => total + c.asientosDisponibles, 0)} asientos disponibles`
                          : '0 asientos disponibles'}
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* End collapse content */}
          </div>
          {/* End bg-white */}
        </div>
      ))}
    </>
  );
};

export default FlightProperties;
