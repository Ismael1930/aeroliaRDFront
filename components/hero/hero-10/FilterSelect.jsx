
'use client'

import { useState, useEffect } from "react";
import { useSearch } from "@/context/SearchContext";

const FilterSelect = ({ onClaseChange, onTipoViajeChange, onMaletasChange }) => {
  const { searchData } = useSearch();
  
  // Función para mapear el tipo de viaje del contexto al formato de UI
  const mapTipoViajeToUI = (tipo) => {
    if (tipo === "IdaYVuelta" || tipo === "Ida y Vuelta") return "Ida y Vuelta";
    if (tipo === "SoloIda" || tipo === "Solo Ida") return "Solo Ida";
    return "Ida y Vuelta";
  };
  
  const [returnValue, setReturnValue] = useState(mapTipoViajeToUI(searchData.tipoViaje));
  const [economyValue, setEconomyValue] = useState(searchData.clase || "Económica");
  const [bagsValue, setBagsValue] = useState(`${searchData.maletas || 0} Maleta${searchData.maletas === 1 ? '' : 's'}`);

  // Sincronizar con el contexto cuando cambie
  useEffect(() => {
    setReturnValue(mapTipoViajeToUI(searchData.tipoViaje));
    setEconomyValue(searchData.clase || "Económica");
    setBagsValue(`${searchData.maletas || 0} Maleta${searchData.maletas === 1 ? '' : 's'}`);
  }, [searchData]);

  useEffect(() => {
    if (onClaseChange) {
      onClaseChange(economyValue);
    }
  }, [economyValue, onClaseChange]);

  useEffect(() => {
    if (onTipoViajeChange) {
      onTipoViajeChange(returnValue);
    }
  }, [returnValue, onTipoViajeChange]);

  useEffect(() => {
    if (onMaletasChange) {
      onMaletasChange(bagsValue);
    }
  }, [bagsValue, onMaletasChange]);

  const handleReturnValueChange = (value) => {
    setReturnValue(value);
  };

  const handleEconomyValueChange = (value) => {
    setEconomyValue(value);
  };

  const handleBagsValueChange = (value) => {
    setBagsValue(value);
  };

  const dropdownOptions = [
    {
      title: "Tipo de Viaje",
      value: returnValue,
      list: [
        { label: "Ida y Vuelta" },
        { label: "Solo Ida" },
      ],
      onChange: handleReturnValueChange,
    },
    {
      title: "Clase",
      value: economyValue,
      list: [{ label: "Económica" }, { label: "Ejecutiva" }, { label: "Primera Clase" }],
      onChange: handleEconomyValueChange,
    },
    {
      title: "Maletas",
      value: bagsValue,
      list: [
        { label: "0 Maletas" },
        { label: "1 Maleta" },
        { label: "2 Maletas" },
        { label: "3 Maletas" },
        { label: "4 Maletas" },
      ],
      onChange: handleBagsValueChange,
    },
  ];

  return (
    <>
      {dropdownOptions.map((option, index) => (
        <div className="col-auto" key={index}>
          <div className="dropdown js-dropdown">
            <div
              className="dropdown__button d-flex items-center text-15"
              data-bs-toggle="dropdown"
              data-bs-auto-close="true"
              data-bs-offset="0,0"
            >
              <span className="js-dropdown-title">{option.value}</span>

              <i className="icon icon-chevron-sm-down text-7 ml-10" />
            </div>
            <div className="toggle-element -dropdown js-click-dropdown dropdown-menu">
              <div className="text-14 y-gap-15 js-dropdown-list">
                {option.list.map((item, index) => (
                  <div key={index}>
                    <div
                      role="button"
                      className={`${
                        item.label === option.value ? "text-blue-1 " : ""
                      }d-block js-dropdown-link`}
                      onClick={() => option.onChange(item.label)}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default FilterSelect;
