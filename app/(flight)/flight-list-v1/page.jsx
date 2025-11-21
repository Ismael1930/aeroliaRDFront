'use client'

import { useState, useEffect } from "react";
import CallToActions from "@/components/common/CallToActions";
import Header11 from "@/components/header/header-11";
import DefaultFooter from "@/components/footer/default";
import FilterSelect from "@/components/hero/hero-10/FilterSelect";
import MainFilterSearchBox from "@/components/hero/hero-10/MainFilterSearchBox";
import TopHeaderFilter from "@/components/flight-list/flight-list-v1/TopHeaderFilter";
import FlightProperties from "@/components/flight-list/flight-list-v1/FlightProperties";
import Pagination from "@/components/flight-list/common/Pagination";
import Sidebar from "@/components/flight-list/flight-list-v1/Sidebar";

const FlightListPage = () => {
  const [sortBy, setSortBy] = useState('precio-asc');
  const [totalVuelos, setTotalVuelos] = useState(0);
  const [claseSeleccionada, setClaseSeleccionada] = useState("Económica");
  const [tipoViaje, setTipoViaje] = useState("Ida y Vuelta");
  const [maletas, setMaletas] = useState("0 Maletas");
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

      <Header11 />
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
            <div className="col-xl-3">
              <aside className="sidebar py-20 px-20 xl:d-none bg-white">
                <div className="row y-gap-40">
                  <Sidebar />
                </div>
              </aside>
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

      <CallToActions />
      {/* End Call To Actions Section */}

      <DefaultFooter />
    </>
  );
};

export default FlightListPage;
