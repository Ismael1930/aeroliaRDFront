
'use client'

import React, { useState, useEffect } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";

const DateSearch = ({ onChange, isSingle = false }) => {
  // Definir la fecha mínima (hoy) y asegurar fechas iniciales >= hoy
  const hoy = new DateObject();
  const initialDates = isSingle
    ? hoy
    : [hoy, new DateObject().add(7, "days")];

  const [dates, setDates] = useState(initialDates);

  useEffect(() => {
    if (onChange) {
      if (isSingle) {
        onChange(dates ? dates.format("YYYY-MM-DD") : null);
      } else {
        const [salida, regreso] = dates || [];
        onChange(salida ? salida.format("YYYY-MM-DD") : null, regreso ? regreso.format("YYYY-MM-DD") : null);
      }
    }
  }, [dates]);

  const handleChange = (newDates) => {
    setDates(newDates);
  };

  return (
    <div className="text-15 text-light-1 ls-2 lh-16 custom_dual_datepicker">
      <DatePicker
        inputClass="custom_input-picker"
        containerClassName="custom_container-picker"
        value={dates}
        onChange={handleChange}
        numberOfMonths={2}
        offsetY={10}
        range={!isSingle}
        rangeHover={!isSingle}
        minDate={hoy}
        format="MMMM DD"
      />
    </div>
  );
};

export default DateSearch;
