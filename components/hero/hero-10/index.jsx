'use client'

import { useState } from 'react';
import FilterSelect from "./FilterSelect";
import MainFilterSearchBox from "./MainFilterSearchBox";

const Index = () => {
  const [claseSeleccionada, setClaseSeleccionada] = useState("Económica");
  const [tipoViaje, setTipoViaje] = useState("Ida y Vuelta");
  const [maletas, setMaletas] = useState("0 Maletas");

  return (
    <section className="masthead -type-10">
      <div className="container-1500">
        <div className="row">
          <div className="col-lg-auto">
            <div className="masthead__content">
              <h1
                className="text-60 lg:text-40 sm:text-30"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                ¿A Dónde Quieres Volar?
              </h1>
              <p className="mt-5" data-aos="fade-up" data-aos-delay="200">
                Descubre lugares increíbles con ofertas exclusivas
              </p>
              <div data-aos="fade-up" data-aos-delay="300">
                <div className="row y-gap-20 items-center pt-30">
                  <FilterSelect 
                    onClaseChange={setClaseSeleccionada}
                    onTipoViajeChange={setTipoViaje}
                    onMaletasChange={setMaletas}
                  />
                </div>
                {/* End .row */}

                <MainFilterSearchBox 
                  claseSeleccionada={claseSeleccionada}
                  tipoViaje={tipoViaje}
                  maletas={maletas}
                />
                {/* End filter content */}
              </div>
            </div>
            {/* End .masthead__content */}
          </div>
          {/* End .col-lg-auto */}
        </div>
        {/* End .row */}

        <div
          className="masthead__image"
          data-aos="fade-left"
          data-aos-delay="500"
        >
          <div className="row y-gap-30 flex-nowrap">
            <div className="col-auto">
              <img
                src="https://creativelayers.net/themes/gotrip-html/img/masthead/10/1.png"
                alt="image"
                className="rounded-16"
              />
            </div>
            {/* End col-auto */}

            <div className="col-auto">
              <img
                src="https://creativelayers.net/themes/gotrip-html/img/masthead/10/2.png"
                alt="image"
                className="rounded-16"
              />
            </div>
            {/* End col-auto */}
          </div>
          {/* End .row */}
        </div>
        {/* End .masthead__image */}
      </div>
      {/* End .container */}
    </section>
  );
};

export default Index;
