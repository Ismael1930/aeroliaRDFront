const BlockGuide = () => {
  const blockContent = [
    {
      id: 1,
      icon: "/img/featureIcons/1/1.svg",
      title: "Garantía del Mejor Precio",
      text: `Encuentra las mejores tarifas para tus vuelos y viajes.`,
      delayAnim: "100",
    },
    {
      id: 2,
      icon: "/img/featureIcons/1/2.svg",
      title: "Reserva Fácil y Rápida",
      text: `Reserva tus vuelos en minutos con nuestro sistema intuitivo.`,
      delayAnim: "200",
    },
    {
      id: 3,
      icon: "/img/featureIcons/1/3.svg",
      title: "Atención al Cliente 24/7",
      text: `Estamos disponibles las 24 horas para asistirte en lo que necesites.`,
      delayAnim: "300",
    },
  ];
  return (
    <>
      {blockContent.map((item) => (
        <div
          className="col-lg-3 col-sm-6"
          data-aos="fade"
          data-aos-delay={item.delayAnim}
          key={item.id}
        >
          <div className="featureIcon -type-1 ">
            <div className="d-flex justify-center">
              <img src={item.icon} alt="image" className="js-lazy" />
            </div>
            <div className="text-center mt-30">
              <h4 className="text-18 fw-500">{item.title}</h4>
              <p className="text-15 mt-10">{item.text}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default BlockGuide;
