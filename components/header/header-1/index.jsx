
'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import MainMenu from "../MainMenu";
import CurrenctyMegaMenu from "../CurrenctyMegaMenu";
import LanguageMegaMenu from "../LanguageMegaMenu";
import MobileMenu from "../MobileMenu";

const Header1 = () => {
  const [navbar, setNavbar] = useState(false);

  const changeBackground = () => {
    if (window.scrollY >= 10) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
    return () => {
      window.removeEventListener("scroll", changeBackground);
    };
  }, []);

  // Clases condicionales para fondo y texto
  // Invertir lógica: arriba blanco, scroll dark-1
  const isSticky = navbar;
  const headerBgClass = isSticky ? "bg-dark-1 is-sticky" : "bg-white";
  const textClass = isSticky ? "text-white" : "text-dark-1";
  const btnClass = isSticky
    ? "button px-30 fw-400 text-14 bg-white h-50 text-dark-1"
    : "button px-30 fw-400 text-14 bg-dark-1 h-50 text-white";
  const btnOutlineClass = isSticky
    ? "button px-30 fw-400 text-14 border-white h-50 text-white ml-20"
    : "button px-30 fw-400 text-14 border-dark-1 h-50 text-dark-1 ml-20";

  return (
    <>
      <header className={`header ${headerBgClass}`}>
        <div className="header__container px-30 sm:px-20">
          <div className="row justify-between items-center">
            <div className="col-auto">
              <div className="d-flex items-center">
                <Link href="/" className="header-logo mr-20 d-flex items-center">
                  <img src="/img/Logo.png" alt="logo icon" style={{width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover'}} />
                  <span className={`text-20 fw-600 ml-10 ${textClass}`}>AerolineaRD</span>
                </Link>
                {/* End logo */}

                {/* <div className="header-menu">
                  <div className="header-menu__content">
                    <MainMenu style={textClass} />
                  </div>
                </div> */}
                {/* End header-menu */}
              </div>
              {/* End d-flex */}
            </div>
            {/* End col */}

            <div className="col-auto">
              <div className="d-flex items-center">
                {/* <div className={`row x-gap-20 items-center xxl:d-none ${textClass}`}>
                  <CurrenctyMegaMenu textClass={textClass} />
                  {

                  <div className="col-auto">
                    <div className="w-1 h-20 bg-white-20" />
                  </div>
                  

                  <LanguageMegaMenu textClass={textClass} />
                  
                </div> */}
                {/* End language and currency selector */}

                {/* Start btn-group */}
                <div className="d-flex items-center ml-20 is-menu-opened-hide md:d-none">
                  <Link
                    href="/login"
                    className={btnClass}
                  >
                    Soy un Experto
                  </Link>
                  <Link
                    href="/signup"
                    className={btnOutlineClass}
                  >
                    Iniciar Sesión / Registrarse
                  </Link>
                </div>
                {/* End btn-group */}

                {/* Start mobile menu icon */}
                <div className={`d-none xl:d-flex x-gap-20 items-center pl-30 ${textClass}`}>
                  <div>
                    <Link
                      href="/login"
                      className="d-flex items-center icon-user text-inherit text-22"
                    />
                  </div>
                  <div>
                    <button
                      className="d-flex items-center icon-menu text-inherit text-20"
                      data-bs-toggle="offcanvas"
                      aria-controls="mobile-sidebar_menu"
                      data-bs-target="#mobile-sidebar_menu"
                    />

                    <div
                      className="offcanvas offcanvas-start  mobile_menu-contnet "
                      tabIndex="-1"
                      id="mobile-sidebar_menu"
                      aria-labelledby="offcanvasMenuLabel"
                      data-bs-scroll="true"
                    >
                      <MobileMenu />
                      {/* End MobileMenu */}
                    </div>
                  </div>
                </div>
                {/* End mobile menu icon */}
              </div>
            </div>
            {/* End col-auto */}
          </div>
          {/* End .row */}
        </div>
        {/* End header_container */}
      </header>
    </>
  );
};

export default Header1;
