
'use client'

import React, { useState, useEffect } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";

const DateSearch = ({ onChange, isSingle = false }) => {
  const [dates, setDates] = useState(
    isSingle 
      ? new DateObject().setDay(5)
      : [
          new DateObject().setDay(5),
          new DateObject().setDay(14).add(1, "month"),
        ]
  );

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
        format="MMMM DD"
      />
    </div>
  );
};

export default DateSearch;
