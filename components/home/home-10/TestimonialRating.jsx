const TestimonialRating = () => {
  return (
    <>
      <h2 className="text-30 text-white">
        ¿Qué dicen nuestros
        <br /> clientes sobre nosotros?
      </h2>
      <p className="text-white mt-20">
        Miles de viajeros confían en nosotros para planificar sus aventuras.
        Descubre por qué somos la opción preferida para reservar vuelos y viajes.
      </p>

      <div className="row y-gap-30 text-white pt-60 lg:pt-40">
        <div className="col-sm-5 col-6">
          <div className="text-30 lh-15 fw-600">13m+</div>
          <div className="lh-15">Personas Felices</div>
        </div>
        {/* End .col */}

        <div className="col-sm-5 col-6">
          <div className="text-30 lh-15 fw-600">4.88</div>
          <div className="lh-15">Calificación general</div>
          <div className="d-flex x-gap-5 items-center pt-10">
            <div className="icon-star text-white text-10" />
            <div className="icon-star text-white text-10" />
            <div className="icon-star text-white text-10" />
            <div className="icon-star text-white text-10" />
            <div className="icon-star text-white text-10" />
          </div>
        </div>
        {/* End .col */}
      </div>
    </>
  );
};

export default TestimonialRating;
