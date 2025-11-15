
'use client'

import { useState, useEffect } from "react";
import { obtenerAeropuertos } from "@/api/vueloService";

const FlyingFromLocation = ({ onSelect }) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [aeropuertos, setAeropuertos] = useState([]);

  useEffect(() => {
    const cargarAeropuertos = async () => {
      try {
        const response = await obtenerAeropuertos();
        if (response.success) {
          setAeropuertos(response.data);
        }
      } catch (error) {
        console.error('Error al cargar aeropuertos:', error);
      }
    };
    cargarAeropuertos();
  }, []);

  const handleOptionClick = (item) => {
    setSearchValue(item.nombre || item.name);
    setSelectedItem(item);
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleDropdownOpen = () => {
    if (selectedItem) {
      setSearchValue("");
    }
  };

  const filteredAeropuertos = searchValue.length > 0 
    ? aeropuertos.filter(
        (item) =>
          (item.nombre?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.ciudad?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.codigo?.toLowerCase().includes(searchValue.toLowerCase()))
      )
    : aeropuertos;

  const locationSearchContent = filteredAeropuertos;

  return (
    <>
      <div className="searchMenu-loc px-24 lg:py-20 lg:px-0 js-form-dd js-liverSearch">
        <div
          data-bs-toggle="dropdown"
          data-bs-auto-close="true"
          data-bs-offset="0,22"
          onClick={handleDropdownOpen}
        >
          <h4 className="text-15 fw-500 ls-2 lh-16">Desde</h4>
          <div className="text-15 text-light-1 ls-2 lh-16">
            <input
              autoComplete="off"
              type="search"
              placeholder="¿Desde dónde viajas?"
              className="js-search js-dd-focus"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        <div className="shadow-2 dropdown-menu min-width-400">
          <div className="bg-white px-20 py-20 sm:px-0 sm:py-15 rounded-4">
            <ul className="y-gap-5 js-results" style={{maxHeight: '300px', overflowY: 'auto'}}>
              {locationSearchContent.map((item, index) => (
                <li
                  className={`-link d-block col-12 text-left rounded-4 px-20 py-15 js-search-option mb-1 ${
                    selectedItem && selectedItem.id === item.id ? "active" : ""
                  }`}
                  key={`aeropuerto-${item.id}-${index}`}
                  role="button"
                  onClick={() => handleOptionClick(item)}
                >
                  <div className="d-flex">
                    <div className="icon-location-2 text-light-1 text-20 pt-4" />
                    <div className="ml-10">
                      <div className="text-15 lh-12 fw-500 js-search-option-target">
                        {item.nombre || item.name} {item.codigo && `(${item.codigo})`}
                      </div>
                      <div className="text-14 lh-12 text-light-1 mt-5">
                        {item.ciudad || item.address}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlyingFromLocation;
