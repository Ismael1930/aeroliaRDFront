import DynamicHeader from "@/components/header/DynamicHeader";
import Hero10 from "@/components/hero/hero-10";
import Footer8 from "@/components/footer/footer-8";
import BlockGuide from "@/components/block/BlockGuide";

export const metadata = {
  title: "Inicio || GoTrip - Plantilla de Viajes y Tours",
  description: "GoTrip - Plantilla de Viajes y Tours",
};

const home = () => {
  return (
    <>
      {/* End Page Title */}

      <DynamicHeader />
      {/* End Header 5 */}

      <Hero10 />
      {/* End Hero 5 */}

      <section className="layout-pt-sm layout-pb-md">
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">Por Qué Elegirnos</h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  Estos destinos populares tienen mucho que ofrecer
                </p>
              </div>
            </div>
          </div>
          {/* End .row */}

          <div className="row y-gap-40 justify-between pt-50">
            <BlockGuide />
          </div>
          {/* End .row */}
        </div>
        {/* End .container */}
      </section>
      {/* Why choose Block Guide Section */}

      {/* <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row y-gap-20 justify-between items-end">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">Vuelos Recomendados</h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  Descubre las mejores ofertas de vuelos
                </p>
              </div>
            </div>
           

            <div className="col-auto">
              <Link
                href="/flight-list-v1"
                className="button -md -blue-1 bg-blue-1-05 text-blue-1"
              >
                Ver Más <div className="icon-arrow-top-right ml-15" />
              </Link>
            </div>
            
          </div>
          

          <div className="row y-gap-30 pt-40 sm:pt-20">
            <Flights />
          </div>
          
        </div>
     
      </section> */}
      {/* Popular Routes Sections */}

      {/* <section className="layout-pt-md layout-pb-lg">
        <div className="container">
          <div className="row justify-between items-end">
             <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">Mejores Destinos</h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  Estos destinos populares tienen mucho que ofrecer
                </p>
              </div>
            </div> 
            

            <div className="col-auto">
              <a
                href="#"
                className="button -md -blue-1 bg-blue-1-05 text-blue-1"
              >
                Ver Más <div className="icon-arrow-top-right ml-15" />
              </a>
            </div> 
            
          </div>
          

          <div className="relative mt-40 sm:mt-20 js-section-slider">
           <TopDestinations /> 
          </div>
          
        </div>
        
      </section> */}
      {/* End .Top Destinations */}

      {/* <section className="layout-pt-lg layout-pb-lg bg-dark-3">
        <div className="container">
          <div className="row y-gap-40 justify-between text-white">
            <div className="col-xl-5 col-lg-6">
              <TestimonialRating />
            </div>
            

            <div className="col-lg-6">
              <Testimonial />
            </div>
            
          </div>
          
        </div>
      </section> */}
      {/* End testimonial and brand sections Section */}

      {/* <section className="layout-pt-lg layout-pb-lg">
        <div className="container">
          <div className="row justify-between items-end">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">Rutas Populares</h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  Estos destinos populares tienen mucho que ofrecer
                </p>
              </div>
            </div>
            

            <div className="col-auto">
              <Link
                href="#"
                className="button -md -blue-1 bg-blue-1-05 text-blue-1"
              >
                Ver Más <div className="icon-arrow-top-right ml-15" />
              </Link>
            </div>
          </div>
          

          <div className="relative mt-40 sm:mt-20">
            <PopularRoutes />
          </div>
          
        </div>
        
      </section> */}
      {/* End popular routes Section */}

      {/* <AppBanner /> */}
      {/* App Banner Section */}

      {/* <section className="layout-pt-lg layout-pb-lg">
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">
                  Inspírate para tu próximo viaje
                </h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  Descubre ideas para tu próxima aventura
                </p>
              </div>
            </div>
          </div>
          
          <div className="row y-gap-30 pt-40">
            <Blog />
          </div>
          
        </div>
        
      </section> */}
     

      <Footer8 />
      
    </>
  );
};

export default home;
