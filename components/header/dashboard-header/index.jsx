
'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import MainMenu from "../MainMenu";
import MobileMenu from "../MobileMenu";
import { useAuth } from '@/context/AuthContext';

const HeaderDashBoard = () => {
  const { user } = useAuth();
  const [navbar, setNavbar] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const changeBackground = () => {
    if (window.scrollY >= 10) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
    const body = document.querySelector("body");
    if (isOpen) {
      body.classList.add("-is-sidebar-open");
    } else {
      body.classList.remove("-is-sidebar-open");
    }
  }, [isOpen]);

  return (
    <>
      <header
        className={`header -dashboard ${navbar ? "is-sticky bg-white" : ""}`}
      >
        <div className="header__container px-30 sm:px-20">
          <div className="-left-side">
            <Link href="/" className="header-logo d-flex items-center">
              <img src="/img/Logo.png" alt="logo icon" style={{width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover'}} />
              <span className="text-18 fw-600 text-dark-1 ml-10">AerolineaRD</span>
            </Link>
            {/* End logo */}
          </div>
          {/* End _left-side */}

          <div className="row justify-between items-center pl-60 lg:pl-20">
            <div className="col-auto">
              <div className="d-flex items-center">
                <button className="d-flex" onClick={handleToggle}>
                  <i className="icon-menu-2 text-20"></i>
                </button>
              </div>
            </div>
            {/* End .col-auto */}

            <div className="col-auto">
              <div className="d-flex items-center">
                <div className="header-menu">
                  <div className="header-menu__content">
                    <MainMenu style="text-dark-1" />
                  </div>
                </div>
                {/* End header-menu */}

                <div className="pl-15 d-flex flex-column items-center">
                  <img
                    width={50}
                    height={50}
                    src="https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg?w=2000"
                    alt="profile"
                    className="size-50 rounded-22 object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="pt-8 text-center">
                    <div className="text-14 fw-600">{user?.userName || user?.email || 'Usuario'}</div>
                    <div className="text-12 text-light-1">{user?.rol || (user?.roles && user.roles[0]) || 'Cliente'}</div>
                  </div>
                </div>

                <div className="d-none xl:d-flex x-gap-20 items-center pl-20">
                  <div>
                    <button
                      className="d-flex items-center icon-menu text-20"
                      data-bs-toggle="offcanvas"
                      aria-controls="mobile-sidebar_menu"
                      data-bs-target="#mobile-sidebar_menu"
                    ></button>
                  </div>

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
              {/* End -flex items-center */}
            </div>
            {/* End col-auto */}
          </div>
          {/* End .row */}
        </div>
        {/* End header_container */}
      </header>
      {/* End header */}
    </>
  );
};

export default HeaderDashBoard;
