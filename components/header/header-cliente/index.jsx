'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import MainMenu from "../MainMenu";
import MobileMenu from "../MobileMenu";

const HeaderCliente = () => {
  const [navbar, setNavbar] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

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

  const handleLogout = async () => {
    await logout();
    // Asegurarse de que se limpie todo el storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    router.push('/home');
  };

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
                {/* Espacio vacío para mantener balance del layout */}
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

                <div className="row items-center x-gap-5 y-gap-20 pl-20 lg:d-none">
                  <div className="col-auto">
                    <button className="button -blue-1-05 size-50 rounded-22 flex-center">
                      <Image
                        width={20}
                        height={20}
                        src="/img/dashboard/sidebar/compass.svg"
                        alt="notification"
                      />
                    </button>
                  </div>
                  {/* End notification */}

                  <div className="col-auto">
                    <Link href="/dashboard/db-settings" className="button -blue-1-05 size-50 rounded-22 flex-center">
                      <Image
                        width={20}
                        height={20}
                        src="/img/dashboard/sidebar/gear.svg"
                        alt="settings"
                      />
                    </Link>
                  </div>
                  {/* End settings */}

                  <div className="col-auto">
                    <button 
                      onClick={handleLogout}
                      className="button -blue-1-05 size-50 rounded-22 flex-center"
                    >
                      <Image
                        width={20}
                        height={20}
                        src="/img/dashboard/sidebar/log-out.svg"
                        alt="logout"
                      />
                    </button>
                  </div>
                  {/* End logout */}
                </div>
                {/* End .row */}

                <div className="pl-15 text-center">
                  <img
                    width={40}
                    height={40}
                    src="https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg?w=2000"
                    alt="user"
                    className="size-40 rounded-22 object-cover"
                  />
                  <div className="text-14 fw-500 text-dark-1 mt-5">
                    {user?.nombre || user?.email?.split('@')[0] || 'Usuario'}
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
                    className="offcanvas offcanvas-start mobile_menu-contnet"
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

export default HeaderCliente;
