
'use client'

import React, { useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";

const DateSearch = () => {
  const hoy = new DateObject();
  const [dates, setDates] = useState([
    hoy,
    new DateObject().add(7, "days"),
  ]);

  return (
    <div className="text-15 text-light-1 ls-2 lh-16 custom_dual_datepicker">
      <DatePicker
        inputClass="custom_input-picker"
        containerClassName="custom_container-picker"
        value={dates}
        onChange={setDates}
        numberOfMonths={2}
        offsetY={10}
        range
        rangeHover
        minDate={hoy}
        format="MMMM DD"
      />
    </div>
  );
};

export default DateSearch;
