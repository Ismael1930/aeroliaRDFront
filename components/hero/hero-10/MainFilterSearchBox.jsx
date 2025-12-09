
'use client'
import { useState, useEffect } from 'react';
import DateSearch from "../DateSearch";
import GuestSearch from "./GuestSearch";
import FlyingFromLocation from "./FlyingFromLocation";
import FlyingToLocation from "./FlyingToLocation";
import { useRouter } from "next/navigation";
import { buscarVuelos } from "@/api/vueloService";

const MainFilterSearchBox = ({ claseSeleccionada, tipoViaje, maletas, onSearchComplete, variant = 'home' }) => {
  const router = useRouter();
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [fechaSalidaInicio, setFechaSalidaInicio] = useState(null);
  const [fechaSalidaFin, setFechaSalidaFin] = useState(null);
  const [fechaRegresoInicio, setFechaRegresoInicio] = useState(null);
  const [fechaRegresoFin, setFechaRegresoFin] = useState(null);
  const [pasajeros, setPasajeros] = useState({ adultos: 2, ninos: 1, habitaciones: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determinar el texto del botón
  const getButtonText = () => {
    if (loading) return 'Buscando...';
    if (!origen && !destino) return 'Buscar Todos';
    return 'Buscar';
  };

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setError('');

      // Validación: origen y destino no pueden ser iguales
      if (origen && destino && origen.codigo === destino.codigo) {
        setError('El origen y el destino no pueden ser el mismo aeropuerto');
        setLoading(false);
        return;
      }
      
      // Crear filtros opcionales - solo incluir si están definidos
      const filtros = {};
      
      if (origen) filtros.origen = origen.codigo;
      if (destino) filtros.destino = destino.codigo;
      if (fechaSalidaInicio) filtros.fechaSalida = fechaSalidaInicio;
      if (fechaRegresoInicio) filtros.fechaRegreso = fechaRegresoInicio;
      
      // Siempre incluir estos campos
      filtros.adultos = pasajeros.adultos;
      filtros.ninos = pasajeros.ninos;
      filtros.habitaciones = pasajeros.habitaciones;
      filtros.tipoViaje = tipoViaje === "Ida y Vuelta" ? "IdaYVuelta" : tipoViaje === "Solo Ida" ? "SoloIda" : "IdaYVuelta";
      filtros.clase = claseSeleccionada;

      const response = await buscarVuelos(filtros);
      console.log('Respuesta de búsqueda:', response);
      
      // El backend retorna: { success: true, data: [...], count: X }
      let vuelos = [];
      if (response && response.success && response.data) {
        vuelos = response.data;
      } else if (Array.isArray(response)) {
        vuelos = response;
      }

      // Guardar resultados en localStorage
      localStorage.setItem('resultadosVuelos', JSON.stringify(vuelos));
      localStorage.removeItem('errorBusqueda');

      // Si hay callback, actualizar sin navegar
      if (onSearchComplete) {
        onSearchComplete(vuelos);
      } else {
        // Si no hay callback, navegar a la página de resultados
        router.push('/flight-list-v1');
      }
      
    } catch (error) {
      console.error('Error al buscar vuelos:', error);
      localStorage.setItem('resultadosVuelos', JSON.stringify([]));
      localStorage.setItem('errorBusqueda', 'Error al buscar vuelos. Por favor intenta nuevamente.');
      
      // Si hay callback, actualizar con lista vacía
      if (onSearchComplete) {
        onSearchComplete([]);
      } else {
        // Si no hay callback, navegar
        router.push('/flight-list-v1');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Estilos diferentes según la variante
  const containerClass = variant === 'results' 
    ? "mainSearch -col-5 border-light rounded-4 pr-20 py-20 lg:px-20 lg:pt-5 lg:pb-20 mt-15"
    : "mainSearch -col-4 bg-white shadow-1 rounded-4 pr-20 py-20 lg:px-20 lg:pt-5 lg:pb-20 mt-15";

  const buttonClass = variant === 'results'
    ? "mainSearch__submit button -blue-1 py-15 px-35 h-60 col-12 rounded-4 bg-dark-3 text-white"
    : "mainSearch__submit button -blue-1 py-15 px-35 h-60 col-12 rounded-4 bg-dark-1 text-white";

  return (
    <>
      <div className={containerClass}>
        {error && (
          <div className="col-12 mb-20" style={{ 
            padding: '15px',
            borderRadius: '4px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}
        <div className="button-grid items-center">
          <FlyingFromLocation onSelect={setOrigen} />
          {/* End Location Flying From */}

          <FlyingToLocation onSelect={setDestino} />
          {/* End Location Flying To */}

          <div className="searchMenu-date px-30 lg:py-20 lg:px-0 js-form-dd js-calendar">
            <div>
              <h4 className="text-15 fw-500 ls-2 lh-16">Salida</h4>
              <DateSearch 
                onChange={(inicio, fin) => {
                  setFechaSalidaInicio(inicio);
                  setFechaSalidaFin(fin);
                }} 
              />
            </div>
          </div>
          {/* End Depart */}

          {tipoViaje !== "Solo Ida" && (
            <div className="searchMenu-date px-30 lg:py-20 lg:px-0 js-form-dd js-calendar">
              <div>
                <h4 className="text-15 fw-500 ls-2 lh-16">Regreso</h4>
                <DateSearch 
                  onChange={(inicio, fin) => {
                    setFechaRegresoInicio(inicio);
                    setFechaRegresoFin(fin);
                  }} 
                />
              </div>
            </div>
          )}
          {/* End Return */}

          <GuestSearch onChange={setPasajeros} />
          {/* End guest */}

          <div className="button-item">
            <button
              className={buttonClass}
              onClick={handleBuscar}
              disabled={loading}
            >
              <i className="icon-search text-20 mr-10" />
              {getButtonText()}
            </button>
          </div>
          {/* End search button_item */}
        </div>
      </div>
      {/* End .mainSearch */}
    </>
  );
};

export default MainFilterSearchBox;
