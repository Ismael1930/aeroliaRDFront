'use client'

import { useState, useEffect } from "react";
import { useSearch } from "@/context/SearchContext";
import CallToActions from "@/components/common/CallToActions";
import DynamicHeader from "@/components/header/DynamicHeader";
import DefaultFooter from "@/components/footer/default";
import FilterSelect from "@/components/hero/hero-10/FilterSelect";
import MainFilterSearchBox from "@/components/hero/hero-10/MainFilterSearchBox";
import TopHeaderFilter from "@/components/flight-list/flight-list-v1/TopHeaderFilter";
import FlightProperties from "@/components/flight-list/flight-list-v1/FlightProperties";
import Pagination from "@/components/flight-list/common/Pagination";
import Sidebar from "@/components/flight-list/flight-list-v1/Sidebar";

const FlightListPage = () => {
  const { searchData } = useSearch();
  
  // Función para mapear el tipo de viaje del contexto al formato de UI
  const mapTipoViajeToUI = (tipo) => {
    if (tipo === "IdaYVuelta" || tipo === "Ida y Vuelta") return "Ida y Vuelta";
    if (tipo === "SoloIda" || tipo === "Solo Ida") return "Solo Ida";
    return "Ida y Vuelta";
  };
  
  const [sortBy, setSortBy] = useState('precio-asc');
  const [totalVuelos, setTotalVuelos] = useState(0);
  const [claseSeleccionada, setClaseSeleccionada] = useState(searchData.clase || "Económica");
  const [tipoViaje, setTipoViaje] = useState(mapTipoViajeToUI(searchData.tipoViaje));
  const [maletas, setMaletas] = useState(`${searchData.maletas || 0} Maleta${searchData.maletas === 1 ? '' : 's'}`);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sincronizar con el contexto
  useEffect(() => {
    setClaseSeleccionada(searchData.clase || "Económica");
    setTipoViaje(mapTipoViajeToUI(searchData.tipoViaje));
    setMaletas(`${searchData.maletas || 0} Maleta${searchData.maletas === 1 ? '' : 's'}`);
  }, [searchData]);

  useEffect(() => {
    // Obtener el total de vuelos de localStorage
    const resultados = localStorage.getItem('resultadosVuelos');
    if (resultados) {
      try {
        const data = JSON.parse(resultados);
        setTotalVuelos(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        setTotalVuelos(0);
      }
    }
  }, [refreshKey]);

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const handleSearchComplete = (vuelos) => {
    setTotalVuelos(Array.isArray(vuelos) ? vuelos.length : 0);
    setCurrentPage(1); // Reset a la primera página
    setRefreshKey(prev => prev + 1); // Forzar re-render de FlightProperties
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="header-margin"></div>
      {/* header top margin */}

      <DynamicHeader />
      {/* End Header 1 */}

      <section className="pt-40 pb-40">
        <div className="container">
          <div className="row y-gap-20 items-center">
            <FilterSelect 
              onClaseChange={setClaseSeleccionada}
              onTipoViajeChange={setTipoViaje}
              onMaletasChange={setMaletas}
            />
          </div>
          <MainFilterSearchBox 
            claseSeleccionada={claseSeleccionada}
            tipoViaje={tipoViaje}
            maletas={maletas}
            onSearchComplete={handleSearchComplete}
            variant="results"
          />
        </div>
      </section>
      {/* Top SearchBanner */}

      <section className="layout-pt-md layout-pb-md bg-light-2">
        <div className="container">
          <div className="row y-gap-30">
            <div className="col-xl-2">
              {/* <aside className="sidebar py-20 px-20 xl:d-none bg-white">
                <div className="row y-gap-40">
                  <Sidebar />
                </div>
              </aside> */}
              {/* End sidebar for desktop */}

              <div
                className="offcanvas offcanvas-start"
                tabIndex="-1"
                id="listingSidebar"
              >
                <div className="offcanvas-header">
                  <h5 className="offcanvas-title" id="offcanvasLabel">
                    Filter Tours
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  ></button>
                </div>
                {/* End offcanvas header */}

                <div className="offcanvas-body">
                  <aside className="sidebar y-gap-40  xl:d-block">
                    <Sidebar />
                  </aside>
                </div>
                {/* End offcanvas body */}
              </div>
              {/* End mobile menu sidebar */}
            </div>
            {/* End col */}

            <div className="col-xl-9 ">
              <TopHeaderFilter 
                onSortChange={handleSortChange} 
                totalVuelos={totalVuelos}
              />

              <div className="row">
                <FlightProperties 
                  key={refreshKey} 
                  sortBy={sortBy} 
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                />
              </div>
              {/* End .row */}
              <Pagination 
                totalItems={totalVuelos}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
            {/* End .col for right content */}
          </div>
          {/* End .row */}
        </div>
        {/* End .container */}
      </section>
      {/* End layout for listing sidebar and content */}

      {/* <CallToActions /> */}
      {/* End Call To Actions Section */}

      <DefaultFooter />
    </>
  );
};

export default FlightListPage;
