
'use client'
import { useState, useEffect } from 'react';
import DateSearch from "../DateSearch";
import GuestSearch from "./GuestSearch";
import FlyingFromLocation from "./FlyingFromLocation";
import FlyingToLocation from "./FlyingToLocation";
import { useRouter } from "next/navigation";
import { buscarVuelos } from "@/api/vueloService";

const MainFilterSearchBox = ({ claseSeleccionada, tipoViaje, maletas }) => {
  const router = useRouter();
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [fechaSalidaInicio, setFechaSalidaInicio] = useState(null);
  const [fechaSalidaFin, setFechaSalidaFin] = useState(null);
  const [fechaRegresoInicio, setFechaRegresoInicio] = useState(null);
  const [fechaRegresoFin, setFechaRegresoFin] = useState(null);
  const [pasajeros, setPasajeros] = useState({ adultos: 2, ninos: 1, habitaciones: 1 });
  const [loading, setLoading] = useState(false);

  const handleBuscar = async () => {
    if (!origen || !destino || !fechaSalidaInicio) {
      alert('Por favor completa origen, destino y fecha de salida');
      return;
    }

    try {
      setLoading(true);
      const filtros = {
        origen: origen.codigo,
        destino: destino.codigo,
        fechaSalida: fechaSalidaInicio,
        fechaRegreso: fechaRegresoInicio,
        adultos: pasajeros.adultos,
        ninos: pasajeros.ninos,
        habitaciones: pasajeros.habitaciones,
        tipoViaje: tipoViaje === "Ida y Vuelta" ? "IdaYVuelta" : tipoViaje === "Solo Ida" ? "SoloIda" : "IdaYVuelta",
        clase: claseSeleccionada,
      };

      const response = await buscarVuelos(filtros);
      
      if (response.success) {
        // Guardar resultados en localStorage para mostrarlos en la página de resultados
        localStorage.setItem('resultadosVuelos', JSON.stringify(response.data));
        router.push('/flight-list-v1');
      } else {
        alert('No se encontraron vuelos con los criterios seleccionados');
      }
    } catch (error) {
      console.error('Error al buscar vuelos:', error);
      alert('Error al buscar vuelos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="mainSearch -col-4 -w-1070 bg-white shadow-1 rounded-4 pr-20 py-20 lg:px-20 lg:pt-5 lg:pb-20 mt-15">
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
              className="mainSearch__submit button -blue-1 py-15 px-35 h-60 col-12 rounded-4 bg-dark-1 text-white"
              onClick={handleBuscar}
              disabled={loading}
            >
              <i className="icon-search text-20 mr-10" />
              {loading ? 'Buscando...' : 'Buscar'}
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
