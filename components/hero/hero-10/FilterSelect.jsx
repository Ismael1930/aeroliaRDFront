
'use client'

import { useState, useEffect } from "react";

const FilterSelect = ({ onClaseChange, onTipoViajeChange, onMaletasChange }) => {
  const [returnValue, setReturnValue] = useState("Ida y Vuelta");
  const [economyValue, setEconomyValue] = useState("Económica");
  const [bagsValue, setBagsValue] = useState("0 Maletas");

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
