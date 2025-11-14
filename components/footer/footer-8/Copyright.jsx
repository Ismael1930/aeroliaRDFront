import Social from "../../common/social/Social";

const Copyright = () => {
  return (
    <div className="row justify-between items-center y-gap-10">
      <div className="col-auto">
        <div className="row x-gap-30 y-gap-10">
          <div className="col-auto">
            <div className="d-flex items-center">
              © {new Date().getFullYear()} por
              <a
                href="https://themeforest.net/user/ib-themes"
                className="mx-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                ib-themes
              </a>
              Todos los derechos reservados.
            </div>
          </div>
          {/* End .col */}
          <div className="col-auto">
            <div className="d-flex x-gap-15">
              <a href="#">Privacidad</a>
              <a href="#">Términos</a>
              <a href="#">Mapa del Sitio</a>
            </div>
          </div>
          {/* End .col */}
        </div>
        {/* End .row */}
      </div>
      {/* End .col */}

      <div className="col-auto">
        <div className="row y-gap-10 items-center">
          <div className="col-auto">
            <div className="d-flex items-center">
              <button className="d-flex items-center text-14 fw-500 text-white mr-10">
                <i className="icon-globe text-16 mr-10" />
                <span className="underline">Español</span>
              </button>
              <button className="d-flex items-center text-14 fw-500 text-white mr-10">
                <i className="icon-usd text-16 mr-10" />
                <span className="underline">USD</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* End .col */}
    </div>
  );
};

export default Copyright;
