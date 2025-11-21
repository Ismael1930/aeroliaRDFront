'use client'

import { useState, useEffect } from "react";

const TopHeaderFilter = ({ onSortChange, totalVuelos = 0 }) => {
  const [sortOption, setSortOption] = useState('precio-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { value: 'precio-asc', label: 'Precio: Menor a Mayor' },
    { value: 'precio-desc', label: 'Precio: Mayor a Menor' },
    { value: 'hora-asc', label: 'Hora de salida: Temprano a Tarde' },
    { value: 'hora-desc', label: 'Hora de salida: Tarde a Temprano' },
    { value: 'duracion-asc', label: 'Duración: Corta a Larga' },
    { value: 'asientos-desc', label: 'Más asientos disponibles' },
  ];

  const handleSortChange = (value) => {
    setSortOption(value);
    setShowSortMenu(false);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  return (
    <>
      <div className="row y-gap-10 items-center justify-between">
        <div className="col-auto">
          <div className="text-18">
            <span className="fw-500">{totalVuelos} {totalVuelos === 1 ? 'vuelo' : 'vuelos'}</span> encontrados
          </div>
        </div>
        {/* End .col */}

        <div className="col-auto">
          <div className="row x-gap-20 y-gap-20">
            <div className="col-auto">
              <div className="dropdown js-dropdown js-price-slider-active">
                <button 
                  className="button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  type="button"
                >
                  <i className="icon-up-down text-14 mr-10" />
                  Ordenar
                </button>
                {showSortMenu && (
                  <div className="dropdown-menu show" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '5px', minWidth: '250px' }}>
                    <div className="bg-white rounded-4 shadow-2 py-10">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`dropdown-item px-20 py-10 text-14 ${
                            sortOption === option.value ? 'text-blue-1 fw-500' : ''
                          }`}
                          onClick={() => handleSortChange(option.value)}
                          type="button"
                        >
                          {option.label}
                          {sortOption === option.value && (
                            <i className="icon-check text-12 ml-10" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* End .col */}

            <div className="col-auto d-none xl:d-block">
              <button
                data-bs-toggle="offcanvas"
                data-bs-target="#listingSidebar"
                className="button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1"
              >
                <i className="icon-up-down text-14 mr-10" />
                Filter
              </button>
            </div>
            {/* End .col */}
          </div>
          {/* End .row */}
        </div>
        {/* End .col */}
      </div>
      {/* End .row */}
    </>
  );
};

export default TopHeaderFilter;
