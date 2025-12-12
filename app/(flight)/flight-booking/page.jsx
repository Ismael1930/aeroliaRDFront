'use client'

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DynamicHeader from "@/components/header/DynamicHeader";
import DefaultFooter from "@/components/footer/default";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { crearReserva } from "@/api/reservaService";
import { obtenerAsientosDisponibles } from "@/api/vueloService";
import { obtenerClientePorUserId } from "@/api/clienteService";
import { obtenerPasajeroPorUserId } from "@/api/pasajeroService";

const FlightBookingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuth, user, loading: authLoading } = useAuth();
  const { searchData, clearSearchData } = useSearch();
  const [vuelo, setVuelo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado del formulario - inicializar con datos del contexto
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [numMaletas, setNumMaletas] = useState(Number(searchData.maletas) || 0);
  const [adultos, setAdultos] = useState(Number(searchData.pasajeros?.adultos) || 1);
  const [ninos, setNinos] = useState(Number(searchData.pasajeros?.ninos) || 0);
  const [pasajeros, setPasajeros] = useState([]);
  const [pasajeroPerfil, setPasajeroPerfil] = useState(null);
  const [clientePerfil, setClientePerfil] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [asientosDisponibles, setAsientosDisponibles] = useState([]);
  const [cargandoAsientos, setCargandoAsientos] = useState(false);
  
  // Estado del formulario de pago
  const [datosPago, setDatosPago] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: ''
  });

  // Estado del modal de comprobante
  const [mostrarModal, setMostrarModal] = useState(false);
  const [datosReserva, setDatosReserva] = useState(null);

  useEffect(() => {
    // Verificar autenticación
    if (!authLoading && !isAuth) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      router.push('/login');
      return;
    }

    // Obtener ID del vuelo de la URL
    const vueloId = searchParams.get('vueloId');
    if (!vueloId) {
      router.push('/flight-list-v1');
      return;
    }

    // Cargar datos del vuelo desde localStorage
    const resultados = localStorage.getItem('resultadosVuelos');
    if (resultados) {
      try {
        const vuelos = JSON.parse(resultados);
        const vueloSeleccionado = vuelos.find(v => v.id === parseInt(vueloId));
        if (vueloSeleccionado) {
          setVuelo(vueloSeleccionado);
          // Establecer la clase por defecto (Económica si está disponible)
          if (vueloSeleccionado.clasesDisponibles && vueloSeleccionado.clasesDisponibles.length > 0) {
            const economica = vueloSeleccionado.clasesDisponibles.find(c => c.clase === 'Economica');
            setClaseSeleccionada(economica || vueloSeleccionado.clasesDisponibles[0]);
          }
        } else {
          router.push('/flight-list-v1');
        }
      } catch (error) {
        console.error('Error al cargar vuelo:', error);
        router.push('/flight-list-v1');
      }
    }
    setLoading(false);
    // Cargar datos de cliente/pasajero del usuario autenticado
    const cargarPerfilUsuario = async () => {
      if (isAuth && (user?.id || user?.userId)) {
        try {
          const cliente = await obtenerClientePorUserId(user.id || user.userId);
          setClientePerfil(cliente || null);
        } catch (err) {
          console.warn('No se pudo obtener clientePerfil:', err);
        }
        try {
          const pasajero = await obtenerPasajeroPorUserId(user.id || user.userId);
          setPasajeroPerfil(pasajero || null);
        } catch (err) {
          console.warn('No se pudo obtener pasajeroPerfil:', err);
        }
      }
    };
    cargarPerfilUsuario();
  }, [authLoading, isAuth, router, searchParams, user?.id, user?.userId]);

  // Cargar asientos disponibles cuando cambia la clase seleccionada
  useEffect(() => {
    const cargarAsientos = async () => {
      if (vuelo && claseSeleccionada) {
        setCargandoAsientos(true);
        try {
          const response = await obtenerAsientosDisponibles(vuelo.id, claseSeleccionada.clase);
          // La respuesta puede venir como array directo o como objeto con propiedad 'data'
          const asientos = response.data || response;
          // Filtrar solo los asientos disponibles
          const asientosDisponibles = Array.isArray(asientos) 
            ? asientos.filter(a => a.disponible !== false) 
            : [];
          setAsientosDisponibles(asientosDisponibles);
        } catch (error) {
          console.error('Error al cargar asientos:', error);
          setAsientosDisponibles([]);
        } finally {
          setCargandoAsientos(false);
        }
      }
    };
    cargarAsientos();
  }, [vuelo, claseSeleccionada]);

  // Inicializar pasajeros cuando cambia el número de adultos o niños
  useEffect(() => {
    const totalPasajeros = adultos + ninos;
    const nuevosPasajeros = [];
    
    for (let i = 0; i < adultos; i++) {
      const isFirstAdult = i === 0;
      nuevosPasajeros.push({
        tipo: 'Adulto',
        nombre: isFirstAdult ? (pasajeroPerfil?.nombre || clientePerfil?.nombre || '') : '',
        apellido: isFirstAdult ? (pasajeroPerfil?.apellido || clientePerfil?.apellido || '') : '',
        numeroDocumento: isFirstAdult ? (pasajeroPerfil?.pasaporte || pasajeroPerfil?.numeroDocumento || clientePerfil?.pasaporte || '') : '',
        fechaNacimiento: isFirstAdult ? (pasajeroPerfil?.fechaNacimiento || clientePerfil?.fechaNacimiento || '') : '',
        numeroAsiento: '',
        esVentana: false
      });
    }
    
    for (let i = 0; i < ninos; i++) {
      nuevosPasajeros.push({
        tipo: 'Niño',
        nombre: '',
        apellido: '',
        numeroDocumento: '',
        fechaNacimiento: '',
        numeroAsiento: '',
        esVentana: false
      });
    }
    
    setPasajeros(nuevosPasajeros);
  }, [adultos, ninos, pasajeroPerfil, clientePerfil]);

  // Si el perfil del pasajero o cliente cambia, prefills los valores en el primer pasajero existente
  useEffect(() => {
    if (!pasajeroPerfil && !clientePerfil) return;
    if (pasajeros.length === 0) return;

    setPasajeros(prev => prev.map((p, i) => {
      if (i === 0 && p.tipo === 'Adulto') {
        return {
          ...p,
          nombre: p.nombre || pasajeroPerfil?.nombre || clientePerfil?.nombre || '',
          apellido: p.apellido || pasajeroPerfil?.apellido || clientePerfil?.apellido || '',
          numeroDocumento: p.numeroDocumento || pasajeroPerfil?.pasaporte || pasajeroPerfil?.numeroDocumento || clientePerfil?.pasaporte || '',
          fechaNacimiento: p.fechaNacimiento || pasajeroPerfil?.fechaNacimiento || clientePerfil?.fechaNacimiento || ''
        };
      }
      return p;
    }));
  }, [pasajeroPerfil, clientePerfil]);

  const formatearHora = (hora) => {
    if (!hora) return '--:--';
    if (typeof hora === 'string' && hora.includes(':')) {
      return hora.substring(0, 5);
    }
    const fecha = new Date(hora);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const isPrefilledField = (index, field) => {
    if (index !== 0) return false; // Only auto-fill first adult
    if (!pasajeroPerfil && !clientePerfil) return false;
    // Map form fields to profile keys
    if (field === 'numeroDocumento') {
      return Boolean(pasajeroPerfil?.pasaporte || pasajeroPerfil?.numeroDocumento || clientePerfil?.pasaporte || clientePerfil?.numeroDocumento);
    }
    if (field === 'fechaNacimiento') {
      return Boolean(pasajeroPerfil?.fechaNacimiento || clientePerfil?.fechaNacimiento);
    }
    // nombre/apellido
    return Boolean(pasajeroPerfil?.[field] || clientePerfil?.[field]);
  };

  const formatearFecha = (fechaHora) => {
    if (!fechaHora) return '';
    const fecha = new Date(fechaHora);
    return fecha.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calcularPrecioTotal = () => {
    if (!claseSeleccionada) return 0;
    const precioVuelo = claseSeleccionada.precio * (adultos + ninos);
    const precioMaletas = numMaletas * 25; // $25 por maleta
    // Recargo por asientos de ventana: $10 por asiento de ventana seleccionado
    const recargoVentana = pasajeros.reduce((acc, p) => acc + (p?.esVentana ? 10 : 0), 0);
    return precioVuelo + precioMaletas + recargoVentana;
  };

  const calcularRecargoPorClase = () => {
    if (!claseSeleccionada || !vuelo) return 0;
    const precioBase = vuelo.precioBase || 0;
    const precioClase = claseSeleccionada.precio;
    return Math.max(0, precioClase - precioBase);
  };

  const handlePasajeroChange = (index, field, value) => {
    const nuevosPasajeros = [...pasajeros];
    nuevosPasajeros[index][field] = value;

    // Si el campo es el numeroAsiento, determinar si es asiento de ventana
    if (field === 'numeroAsiento') {
      const numero = value;
      const asientoObj = asientosDisponibles.find(a => (a.numero || a.numeroAsiento || a) == numero);
      let esVentana = false;
      if (asientoObj) {
        if (typeof asientoObj.esVentana === 'boolean') {
          esVentana = asientoObj.esVentana;
        } else if (asientoObj.columna) {
          const col = String(asientoObj.columna).toUpperCase();
          // Asumir columnas A y la última (por ejemplo F/K/L) son ventana. Verifica A y F y K y L.
          const ventanaCols = ['A','F','K','L'];
          esVentana = ventanaCols.includes(col);
        }
      } else {
        // Si no existe objeto de asiento, intentar inferir por letra final del número (ej. 12A)
        const letra = String(numero).slice(-1).toUpperCase();
        const ventanaCols = ['A','F','K','L'];
        if (ventanaCols.includes(letra)) esVentana = true;
      }
      nuevosPasajeros[index].esVentana = esVentana;
    }

    setPasajeros(nuevosPasajeros);
  };

  const handleConfirmarReserva = async () => {
    // Validar que todos los pasajeros tengan datos completos
    const pasajerosIncompletos = pasajeros.some(p => 
      !p.nombre || !p.apellido || !p.numeroDocumento || !p.fechaNacimiento || !p.numeroAsiento
    );

    if (pasajerosIncompletos) {
      alert('Por favor complete la información de todos los pasajeros, incluyendo el número de asiento');
      return;
    }

    // Validar datos de pago
    if (!datosPago.numeroTarjeta || !datosPago.nombreTitular || !datosPago.fechaExpiracion || !datosPago.cvv) {
      alert('Por favor complete todos los datos de pago');
      return;
    }

    // Validar formato de tarjeta
    if (datosPago.numeroTarjeta.replace(/\s/g, '').length !== 16) {
      alert('El número de tarjeta debe tener 16 dígitos');
      return;
    }

    // Validar CVV
    if (datosPago.cvv.length !== 3) {
      alert('El CVV debe tener 3 dígitos');
      return;
    }

    setProcesando(true);
          // Obtener el cliente basado en el userId del usuario autenticado
          const cliente = await obtenerClientePorUserId(user?.id || user?.userId);
          const idCliente = cliente?.id || cliente?.idCliente;
      
          if (!idCliente) {
            alert('No se pudo obtener la información del cliente. Por favor intente nuevamente.');
            setProcesando(false);
            return;
          }

          // Obtener pasajero asociado al usuario autenticado
          let pasajeroObj = null;
          try {
            pasajeroObj = await obtenerPasajeroPorUserId(user?.id || user?.userId);
          } catch (err) {
            console.warn('No se pudo obtener pasajero por userId:', err);
          }
          const idPasajeroObtenido = pasajeroObj?.id || pasajeroObj?.idPasajero || null;
          if (!idPasajeroObtenido) {
            alert('No se pudo obtener el ID del pasajero asociado a su cuenta. Por favor verifique su perfil.');
            setProcesando(false);
            return;
          }

    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear reserva por cada pasajero
      const reservasPromises = pasajeros.map((pasajero, index) => {
        const maletaShare = numMaletas > 0 ? Math.floor(numMaletas / pasajeros.length) * 25 : 0;
        const ventanaRecargo = pasajero.esVentana ? 10 : 0;
        const precioPasajero = (claseSeleccionada.precio || 0) + maletaShare + ventanaRecargo;
        return crearReserva({
          idPasajero: (index === 0 && idPasajeroObtenido) ? idPasajeroObtenido : undefined,
          idVuelo: vuelo.id,
          idCliente: idCliente,
          numAsiento: pasajero.numeroAsiento,
          clase: claseSeleccionada.clase,
          metodoPago: "Tarjeta de Crédito",
          precioTotal: precioPasajero
        });
      });

      const resultados = await Promise.all(reservasPromises);
      
      // Generar código de reserva (simulado)
      const codigoReserva = 'RES' + Date.now().toString().slice(-8);
      
      // Preparar datos para el modal
      setDatosReserva({
        codigoReserva,
        fecha: new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        pasajeros,
        precioTotal: calcularPrecioTotal()
      });
      
      // Limpiar datos de búsqueda después de confirmar la reserva
      clearSearchData();
      
      // Mostrar modal
      setMostrarModal(true);
      
    } catch (error) {
      console.error('Error al crear reserva:', error);
      alert('Error al confirmar la reserva. Por favor intente nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!vuelo) {
    return null;
  }

  return (
    <>
      <div className="header-margin"></div>
      <DynamicHeader />

      <section className="pt-40 layout-pb-md">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-lg-8">
              <h2 className="text-30 fw-600 mb-30">Reservar Vuelo</h2>

              {/* Resumen del vuelo */}
              <div className="py-30 px-30 bg-white rounded-4 shadow-3 mb-30">
                <h5 className="text-20 fw-500 mb-20">Detalles del Vuelo</h5>
                
                <div className="py-20 px-20 rounded-4 bg-light-2">
                  <div className="row y-gap-10 justify-between">
                    <div className="col">
                      <div className="row y-gap-10 items-center">
                        {/* IDA */}
                        <div className="col-12 mb-10">
                          <div className="row items-center">
                            <div className="col-auto">
                              <div className="text-14 fw-500 text-blue-1">
                                {formatearFecha(vuelo.fecha)}
                              </div>
                            </div>
                            <div className="col-auto">
                              <div className="size-30 rounded-full flex-center bg-white">
                                <div className="text-14 fw-500 text-blue-1">IDA</div>
                              </div>
                            </div>
                          </div>
                        </div>

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
                                {vuelo.duracion || 'N/A'}
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

                        {/* REGRESO */}
                        {vuelo.tipoVuelo === 'IdaYVuelta' && vuelo.fechaRegreso && (
                          <>
                            <div className="col-12 mt-30 mb-10">
                              <div className="row items-center">
                                <div className="col-auto">
                                  <div className="text-14 fw-500 text-blue-1">
                                    {formatearFecha(vuelo.fechaRegreso)}
                                  </div>
                                </div>
                                <div className="col-auto">
                                  <div className="size-30 rounded-full flex-center bg-white">
                                    <div className="text-14 fw-500 text-blue-1">REG</div>
                                  </div>
                                </div>
                              </div>
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
                                    {vuelo.duracion || 'N/A'}
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
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de configuración */}
              <div className="py-30 px-30 bg-white rounded-4 shadow-3 mb-30">
                <h5 className="text-20 fw-500 mb-20">Configuración de Vuelo</h5>
                
                <div className="row y-gap-30">
                  {/* Selección de Clase */}
                  <div className="col-md-12">
                    <label className="text-14 fw-500 mb-10 d-block">Clase de Vuelo</label>
                    <div className="row y-gap-15">
                      {vuelo.clasesDisponibles?.map((clase) => (
                        <div key={clase.clase} className="col-12">
                          <div 
                            className={`py-20 px-20 rounded-4 border-light cursor-pointer ${
                              claseSeleccionada?.clase === clase.clase ? 'bg-blue-1-05 border-blue-1' : ''
                            }`}
                            onClick={() => setClaseSeleccionada(clase)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex justify-between items-center">
                              <div>
                                <div className="text-16 fw-500">{clase.clase}</div>
                                <div className="text-14 text-light-1">{clase.asientosDisponibles} asientos disponibles</div>
                              </div>
                              <div className="text-18 fw-600 text-blue-1">
                                US${clase.precio.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Número de Maletas */}
                  <div className="col-12">
                    <label className="text-14 fw-500 mb-10 d-block">Equipaje Adicional</label>
                    <div className="d-flex items-center">
                      <button 
                        type="button"
                        className="button -outline-blue-1 text-blue-1 size-40 rounded-4"
                        onClick={() => setNumMaletas(prev => Math.max(0, Number(prev) - 1))}
                      >
                        <i className="icon-minus text-12" />
                      </button>
                      <div className="flex-center ml-20 mr-20">
                        <div className="text-15 fw-500">{numMaletas} Maleta{numMaletas !== 1 ? 's' : ''}</div>
                        <div className="text-14 text-light-1 ml-10">(US$25.00 c/u)</div>
                      </div>
                      <button 
                        type="button"
                        className="button -outline-blue-1 text-blue-1 size-40 rounded-4"
                        onClick={() => setNumMaletas(prev => Number(prev) + 1)}
                      >
                        <i className="icon-plus text-12" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-top-light mt-30 pt-30">
                  <label className="text-14 fw-500 mb-15 d-block">Número de Pasajeros</label>
                  <div className="row y-gap-20">
                    {/* Adultos */}
                    <div className="col-md-6">
                      <div className="d-flex justify-between items-center">
                        <div>
                          <div className="text-15 fw-500">Adultos</div>
                          <div className="text-14 text-light-1">12 años o más</div>
                        </div>
                        <div className="d-flex items-center">
                          <button 
                            type="button"
                            className="button -outline-blue-1 text-blue-1 size-35 rounded-4"
                            onClick={() => setAdultos(Math.max(1, adultos - 1))}
                          >
                            <i className="icon-minus text-10" />
                          </button>
                          <div className="flex-center size-35 ml-10 mr-10">
                            <div className="text-15 fw-500">{adultos}</div>
                          </div>
                          <button 
                            type="button"
                            className="button -outline-blue-1 text-blue-1 size-35 rounded-4"
                            onClick={() => setAdultos(adultos + 1)}
                          >
                            <i className="icon-plus text-10" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Niños */}
                    <div className="col-md-6">
                      <div className="d-flex justify-between items-center">
                        <div>
                          <div className="text-15 fw-500">Niños</div>
                          <div className="text-14 text-light-1">0-11 años</div>
                        </div>
                        <div className="d-flex items-center">
                          <button 
                            type="button"
                            className="button -outline-blue-1 text-blue-1 size-35 rounded-4"
                            onClick={() => setNinos(Math.max(0, ninos - 1))}
                          >
                            <i className="icon-minus text-10" />
                          </button>
                          <div className="flex-center size-35 ml-10 mr-10">
                            <div className="text-15 fw-500">{ninos}</div>
                          </div>
                          <button 
                            type="button"
                            className="button -outline-blue-1 text-blue-1 size-35 rounded-4"
                            onClick={() => setNinos(ninos + 1)}
                          >
                            <i className="icon-plus text-10" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de pasajeros */}
              <div className="py-30 px-30 bg-white rounded-4 shadow-3">
                <h5 className="text-20 fw-500 mb-20">Información de Pasajeros</h5>
                
                {pasajeros.map((pasajero, index) => (
                  <div key={index} className="border-light rounded-4 px-30 py-20 mb-20">
                    <div className="d-flex items-center mb-20">
                      <div className="size-40 rounded-full bg-blue-1-05 flex-center mr-15">
                        <div className="text-16 fw-500 text-blue-1">{index + 1}</div>
                      </div>
                      <h6 className="text-16 fw-500">
                        Pasajero {index + 1} - {pasajero.tipo}
                      </h6>
                    </div>
                    
                    <div className="row y-gap-20">
                      <div className="col-md-6">
                        <div className="form-input">
                          <input 
                            type="text"
                            value={pasajero.nombre}
                            onChange={(e) => handlePasajeroChange(index, 'nombre', e.target.value)}
                            required
                            readOnly={isPrefilledField(index, 'nombre')}
                            disabled={isPrefilledField(index, 'nombre')}
                          />
                          <label className="lh-1 text-14 text-light-1">Nombre</label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-input">
                          <input 
                            type="text"
                            value={pasajero.apellido}
                            onChange={(e) => handlePasajeroChange(index, 'apellido', e.target.value)}
                            required
                            readOnly={isPrefilledField(index, 'apellido')}
                            disabled={isPrefilledField(index, 'apellido')}
                          />
                          <label className="lh-1 text-14 text-light-1">Apellido</label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-input">
                          <input 
                            type="text"
                            value={pasajero.numeroDocumento}
                            onChange={(e) => handlePasajeroChange(index, 'numeroDocumento', e.target.value)}
                            required
                            readOnly={isPrefilledField(index, 'numeroDocumento')}
                            disabled={isPrefilledField(index, 'numeroDocumento')}
                          />
                          <label className="lh-1 text-14 text-light-1">Número de Documento</label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-input">
                          <input 
                            type="date"
                            value={pasajero.fechaNacimiento}
                            onChange={(e) => handlePasajeroChange(index, 'fechaNacimiento', e.target.value)}
                            required
                            readOnly={isPrefilledField(index, 'fechaNacimiento')}
                            disabled={isPrefilledField(index, 'fechaNacimiento')}
                          />
                          <label className="lh-1 text-14 text-light-1">Fecha de Nacimiento</label>
                        </div>
                      </div>

                      <div className="col-md-12">
                        <label className="text-14 fw-500 mb-10 d-block">Número de Asiento</label>
                        {cargandoAsientos ? (
                          <div className="d-flex items-center justify-center py-20">
                            <div className="text-15 text-light-1">Cargando asientos disponibles...</div>
                          </div>
                        ) : asientosDisponibles.length > 0 ? (
                          <select
                            className="form-select"
                            value={pasajero.numeroAsiento}
                            onChange={(e) => handlePasajeroChange(index, 'numeroAsiento', e.target.value)}
                            required
                            style={{
                              width: '100%',
                              height: '50px',
                              padding: '0 20px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '15px'
                            }}
                          >
                            <option value="">Seleccione un asiento</option>
                            {asientosDisponibles.map((asiento) => {
                              const numeroAsiento = asiento.numero || asiento.numeroAsiento || asiento;
                              const yaSeleccionado = pasajeros.some((p, i) => i !== index && p.numeroAsiento === numeroAsiento);
                              // Determinar si es asiento de ventana
                              let esVentana = false;
                              if (asiento && typeof asiento === 'object') {
                                if (typeof asiento.esVentana === 'boolean') esVentana = asiento.esVentana;
                                else if (asiento.columna) {
                                  const col = String(asiento.columna).toUpperCase();
                                  const ventanaCols = ['A','F','K','L'];
                                  esVentana = ventanaCols.includes(col);
                                }
                              } else {
                                const letra = String(numeroAsiento).slice(-1).toUpperCase();
                                const ventanaCols = ['A','F','K','L'];
                                esVentana = ventanaCols.includes(letra);
                              }
                              return (
                                <option 
                                  key={numeroAsiento} 
                                  value={numeroAsiento}
                                  disabled={yaSeleccionado}
                                >
                                  {numeroAsiento} - Fila {asiento.fila || ''} {asiento.columna || ''}
                                  {esVentana ? ' (Ventana)' : ''}
                                  {yaSeleccionado && ' (Ya seleccionado)'}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          <div className="text-15 text-red-1">
                            No hay asientos disponibles para esta clase
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario de Pago */}
              <div className="py-30 px-30 bg-white rounded-4 shadow-3 mt-30">
                <h5 className="text-20 fw-500 mb-20">Información de Pago</h5>
                
                <div className="row y-gap-20">
                  <div className="col-12">
                    <div className="form-input">
                      <input 
                        type="text"
                        value={datosPago.numeroTarjeta}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                          const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                          setDatosPago({...datosPago, numeroTarjeta: formatted});
                        }}
                        maxLength="19"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                      <label className="lh-1 text-14 text-light-1">Número de Tarjeta</label>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-input">
                      <input 
                        type="text"
                        value={datosPago.nombreTitular}
                        onChange={(e) => setDatosPago({...datosPago, nombreTitular: e.target.value.toUpperCase()})}
                        placeholder="NOMBRE APELLIDO"
                        required
                      />
                      <label className="lh-1 text-14 text-light-1">Nombre del Titular</label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-input">
                      <input 
                        type="text"
                        value={datosPago.fechaExpiracion}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const formatted = value.length >= 2 ? value.slice(0, 2) + '/' + value.slice(2, 4) : value;
                          setDatosPago({...datosPago, fechaExpiracion: formatted});
                        }}
                        maxLength="5"
                        placeholder="MM/AA"
                        required
                      />
                      <label className="lh-1 text-14 text-light-1">Fecha de Expiración</label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-input">
                      <input 
                        type="text"
                        value={datosPago.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setDatosPago({...datosPago, cvv: value});
                        }}
                        maxLength="3"
                        placeholder="123"
                        required
                      />
                      <label className="lh-1 text-14 text-light-1">CVV</label>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex items-center gap-2">
                      <i className="icon-shield text-20 text-green-2"></i>
                      <div className="text-14 text-light-1">
                        Sus datos están protegidos con encriptación SSL
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar con resumen de precio */}
            <div className="col-xl-4 col-lg-4">
              <div className="py-30 px-30 bg-white rounded-4 shadow-3" style={{ position: 'sticky', top: '100px' }}>
                <h5 className="text-20 fw-500 mb-20">Resumen de Precio</h5>
                
                <div className="row y-gap-15">
                  <div className="col-12">
                    <div className="bg-blue-1-05 rounded-4 px-20 py-15">
                      <div className="text-14 text-light-1 mb-5">Vuelo</div>
                      <div className="text-16 fw-500">{vuelo.numeroVuelo}</div>
                    </div>
                  </div>

                  {claseSeleccionada && (
                    <>
                      <div className="col-12 mt-20">
                        <div className="d-flex items-center justify-between py-10">
                          <div className="text-15">Precio Base × {adultos + ninos}</div>
                          <div className="text-15 fw-500">
                            US${(vuelo.precioBase * (adultos + ninos)).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {calcularRecargoPorClase() > 0 && (
                        <div className="col-12">
                          <div className="d-flex items-center justify-between py-10">
                            <div className="text-15">Recargo {claseSeleccionada.clase} × {adultos + ninos}</div>
                            <div className="text-15 fw-500 text-blue-1">
                              +US${(calcularRecargoPorClase() * (adultos + ninos)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}

                      {numMaletas > 0 && (
                        <div className="col-12">
                          <div className="d-flex items-center justify-between py-10">
                            <div className="text-15">Maletas × {numMaletas}</div>
                            <div className="text-15 fw-500">US${(numMaletas * 25).toFixed(2)}</div>
                          </div>
                        </div>
                      )}

                      {pasajeros.some(p => p.esVentana) && (
                        <div className="col-12">
                          <div className="d-flex items-center justify-between py-10">
                            <div className="text-15">Recargo Ventana × {pasajeros.filter(p => p.esVentana).length}</div>
                            <div className="text-15 fw-500">US${(pasajeros.filter(p => p.esVentana).length * 10).toFixed(2)}</div>
                          </div>
                        </div>
                      )}

                      <div className="col-12">
                        <div className="border-top-light my-10"></div>
                      </div>

                      <div className="col-12">
                        <div className="d-flex items-center justify-between">
                          <div className="text-18 fw-600">Total</div>
                          <div className="text-24 fw-600 text-blue-1">
                            US${calcularPrecioTotal().toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 mt-20">
                        <button 
                          className="button -dark-1 py-15 px-35 h-50 col-12 rounded-4 bg-blue-1 text-white"
                          onClick={handleConfirmarReserva}
                          disabled={procesando || pasajeros.length === 0}
                        >
                          {procesando ? 'Procesando...' : 'Confirmar Reserva'}
                        </button>
                      </div>

                      <div className="col-12 mt-15">
                        <div className="bg-light-2 rounded-4 px-15 py-15">
                          <div className="text-14 fw-500 mb-10">Desglose:</div>
                          <div className="text-14 text-light-1">• {adultos} Adulto{adultos > 1 ? 's' : ''}</div>
                          {ninos > 0 && <div className="text-14 text-light-1">• {ninos} Niño{ninos > 1 ? 's' : ''}</div>}
                          {numMaletas > 0 && <div className="text-14 text-light-1">• {numMaletas} Maleta{numMaletas > 1 ? 's' : ''}</div>}
                          {pasajeros.some(p => p.esVentana) && (
                            <div className="text-14 text-light-1">• {pasajeros.filter(p => p.esVentana).length} Asiento(s) Ventana</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Comprobante */}
      {mostrarModal && datosReserva && (
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
          onClick={() => {
            setMostrarModal(false);
            router.push('/home');
          }}
        >
          <div 
            className="modal-content bg-white rounded-4 shadow-4"
            style={{
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '40px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="text-center mb-30">
              <div className="size-80 rounded-full bg-green-1 flex-center mx-auto mb-20">
                <i className="icon-check text-40 text-white"></i>
              </div>
              <h2 className="text-30 fw-600 mb-10">¡Reserva Confirmada!</h2>
              <p className="text-15 text-light-1">Su pago ha sido procesado exitosamente</p>
            </div>

            {/* Código de reserva */}
            <div className="bg-blue-1-05 rounded-4 px-30 py-20 mb-30 text-center">
              <div className="text-14 text-light-1 mb-5">Código de Reserva</div>
              <div className="text-30 fw-600 text-blue-1">{datosReserva.codigoReserva}</div>
            </div>

            {/* Detalles del vuelo */}
            <div className="border-top-light pt-20 mb-20">
              <h5 className="text-18 fw-600 mb-15">Detalles del Vuelo</h5>
              
              <div className="row y-gap-10 mb-20">
                <div className="col-6">
                  <div className="text-14 text-light-1">Vuelo</div>
                  <div className="text-15 fw-500">{vuelo.numeroVuelo}</div>
                </div>
                <div className="col-6">
                  <div className="text-14 text-light-1">Clase</div>
                  <div className="text-15 fw-500">{claseSeleccionada.clase}</div>
                </div>
                <div className="col-6">
                  <div className="text-14 text-light-1">Fecha</div>
                  <div className="text-15 fw-500">{formatearFecha(vuelo.fecha)}</div>
                </div>
                <div className="col-6">
                  <div className="text-14 text-light-1">Hora de Salida</div>
                  <div className="text-15 fw-500">{formatearHora(vuelo.horaSalida)}</div>
                </div>
                <div className="col-12">
                  <div className="d-flex items-center justify-between bg-light-2 rounded-4 px-20 py-15">
                    <div>
                      <div className="text-15 fw-500">{vuelo.origenCodigo}</div>
                      <div className="text-14 text-light-1">{vuelo.origen}</div>
                    </div>
                    <div className="text-center">
                      <i className="icon-arrow-right text-20 text-blue-1"></i>
                    </div>
                    <div className="text-end">
                      <div className="text-15 fw-500">{vuelo.destinoCodigo}</div>
                      <div className="text-14 text-light-1">{vuelo.destino}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pasajeros */}
            <div className="border-top-light pt-20 mb-20">
              <h5 className="text-18 fw-600 mb-15">Pasajeros</h5>
              {datosReserva.pasajeros.map((pasajero, index) => (
                <div key={index} className="d-flex justify-between items-center py-10 border-bottom-light">
                  <div>
                    <div className="text-15 fw-500">{pasajero.nombre} {pasajero.apellido}</div>
                    <div className="text-14 text-light-1">{pasajero.tipo}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-15 fw-500 text-blue-1">Asiento {pasajero.numeroAsiento}{pasajero.esVentana ? ' (Ventana)' : ''}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen de precio */}
            <div className="border-top-light pt-20 mb-30">
              <h5 className="text-18 fw-600 mb-15">Resumen de Pago</h5>
              
              <div className="d-flex justify-between py-10">
                <div className="text-15">Precio Base × {adultos + ninos}</div>
                <div className="text-15 fw-500">US${(vuelo.precioBase * (adultos + ninos)).toFixed(2)}</div>
              </div>
              
              {calcularRecargoPorClase() > 0 && (
                <div className="d-flex justify-between py-10">
                  <div className="text-15">Recargo {claseSeleccionada.clase}</div>
                  <div className="text-15 fw-500 text-blue-1">+US${(calcularRecargoPorClase() * (adultos + ninos)).toFixed(2)}</div>
                </div>
              )}
              
              {numMaletas > 0 && (
                <div className="d-flex justify-between py-10">
                  <div className="text-15">Maletas × {numMaletas}</div>
                  <div className="text-15 fw-500">US${(numMaletas * 25).toFixed(2)}</div>
                </div>
              )}

              {datosReserva?.pasajeros?.some(p => p.esVentana) && (
                <div className="d-flex justify-between py-10">
                  <div className="text-15">Recargo Ventana × {datosReserva.pasajeros.filter(p => p.esVentana).length}</div>
                  <div className="text-15 fw-500">US${(datosReserva.pasajeros.filter(p => p.esVentana).length * 10).toFixed(2)}</div>
                </div>
              )}
              
              <div className="border-top-light my-15"></div>
              
              <div className="d-flex justify-between items-center">
                <div className="text-18 fw-600">Total Pagado</div>
                <div className="text-24 fw-600 text-blue-1">US${datosReserva.precioTotal.toFixed(2)}</div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-light-2 rounded-4 px-20 py-15 mb-20">
              <div className="text-14 text-light-1 mb-5">
                <i className="icon-info-circle mr-5"></i>
                Un correo de confirmación ha sido enviado a {user?.email}
              </div>
              <div className="text-14 text-light-1">
                Fecha de emisión: {datosReserva.fecha}
              </div>
            </div>

            {/* Botones */}
            <div className="row x-gap-10">
              <div className="col-6">
                <button 
                  className="button -outline-blue-1 py-15 px-20 h-50 col-12 rounded-4"
                  onClick={() => window.print()}
                >
                  <i className="icon-printer mr-10"></i>
                  Imprimir
                </button>
              </div>
              <div className="col-6">
                <button 
                  className="button -dark-1 py-15 px-20 h-50 col-12 rounded-4 bg-blue-1 text-white"
                  onClick={() => {
                    setMostrarModal(false);
                    router.push('/home');
                  }}
                >
                  Ir al Inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <DefaultFooter />
    </>
  );
};

export default FlightBookingPage;
