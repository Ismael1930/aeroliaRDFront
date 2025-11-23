'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import MainMenu from "../MainMenu";
import MobileMenu from "../MobileMenu";

const HeaderClienteHome = () => {
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
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    router.push('/home');
  };

  return (
    <>
      <header className={`header ${navbar ? "is-sticky bg-white" : ""}`}>
        <div className="header__container header__container-1500 mx-auto px-30 sm:px-20">
          <div className="row justify-between items-center">
            <div className="col-auto">
              <div className="d-flex items-center">
                <Link href="/" className="header-logo mr-50 d-flex items-center">
                  <img src="/img/Logo.png" alt="logo icon" style={{width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover'}} />
                  <span className="text-20 fw-600 text-dark-1 ml-10">AerolineaRD</span>
                </Link>
                {/* End logo */}

                <div className="header-menu">
                  <div className="header-menu__content">
                    <MainMenu style="text-dark-1" />
                  </div>
                </div>
                {/* End header-menu */}
              </div>
              {/* End d-flex */}
            </div>
            {/* End col */}

            <div className="col-auto">
              <div className="d-flex items-center">
                {/* User section for logged in clients */}
                <div className="d-flex items-center is-menu-opened-hide md:d-none">
                  <div className="d-flex items-center mr-20">
                    <Link href="/dashboard/db-settings" className="button -blue-1-05 size-40 rounded-22 flex-center mr-10">
                      <Image
                        width={18}
                        height={18}
                        src="/img/dashboard/sidebar/gear.svg"
                        alt="settings"
                      />
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="button -blue-1-05 size-40 rounded-22 flex-center"
                    >
                      <Image
                        width={18}
                        height={18}
                        src="/img/dashboard/sidebar/log-out.svg"
                        alt="logout"
                      />
                    </button>
                  </div>
                  
                  <div className="d-flex items-center">
                    <img  width={40}
                      height={40}
                      src="https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg?w=2000"
                      alt="user"
                      className="size-40 rounded-22 object-cover" />
                    <div className="ml-10">
                      <div className="text-14 fw-500 text-dark-1">
                        {user?.nombre || user?.email?.split('@')[0] || 'Usuario'}
                      </div>
                      <div className="text-12 text-light-1">Cliente</div>
                    </div>
                  </div>
                </div>
                {/* End user section */}

                {/* Start mobile menu icon */}
                <div className="d-none xl:d-flex x-gap-20 items-center pl-30 text-dark-1">
                  <div>
                    <button
                      className="d-flex items-center icon-menu text-inherit text-20"
                      data-bs-toggle="offcanvas"
                      aria-controls="mobile-sidebar_menu"
                      data-bs-target="#mobile-sidebar_menu"
                    />

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
                {/* End mobile menu icon */}
              </div>
              {/* End d-flex */}
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

export default HeaderClienteHome;
