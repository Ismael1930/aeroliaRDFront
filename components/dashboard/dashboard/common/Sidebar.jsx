'use client'

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { isActiveLink } from "@/utils/linkActiveChecker";
import { usePathname, useRouter } from "next/navigation";

const Sidebar = () => {
const pathname = usePathname()
const router = useRouter()
const { user, logout } = useAuth()
const isAdmin = user?.rol === 'Admin' || user?.role === 'admin'

console.log('Sidebar - User:', user);
console.log('Sidebar - isAdmin:', isAdmin);

  const handleLogout = async () => {
    await logout();
    // Limpiar completamente el localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    router.push('/login');
  };

  const sidebarContent = [
    {
      id: 1,
      icon: "/img/dashboard/sidebar/compass.svg",
      name: "Dashboard",
      routePath: "/dashboard/db-dashboard",
    },
    {
      id: 2,
      icon: "/img/dashboard/sidebar/booking.svg",
      name: "Booking History",
      routePath: "/dashboard/db-booking",
    },
    {
      id: 3,
      icon: "/img/dashboard/sidebar/bookmark.svg",
      name: "Wishlist",
      routePath: "/dashboard/db-wishlist",
    },
    {
      id: 4,
      icon: "/img/dashboard/sidebar/gear.svg",
      name: "Settings",
      routePath: "/dashboard/db-settings",
    },
    // Sección de administración
    {
      id: 10,
      icon: "/img/dashboard/sidebar/compass.svg",
      name: "Gestión de Vuelos",
      routePath: "/dashboard/db-vuelos",
      adminOnly: true
    },
    {
      id: 11,
      icon: "/img/dashboard/sidebar/compass.svg",
      name: "Aeronaves",
      routePath: "/dashboard/db-aeronaves",
      adminOnly: true
    },
    {
      id: 12,
      icon: "/img/dashboard/sidebar/compass.svg",
      name: "Tripulación",
      routePath: "/dashboard/db-tripulacion",
      adminOnly: true
    },
    {
      id: 13,
      icon: "/img/dashboard/sidebar/compass.svg",
      name: "Clientes",
      routePath: "/dashboard/db-clientes",
      adminOnly: true
    },
    {
      id: 14,
      icon: "/img/dashboard/sidebar/compass.svg",
      name: "Tickets Soporte",
      routePath: "/dashboard/db-tickets",
      adminOnly: true
    },
    {
      id: 5,
      icon: "/img/dashboard/sidebar/log-out.svg",
      name: "Logout",
      routePath: "/login",
    },
  ];
  
  // Filtrar opciones según rol
  const menuItems = sidebarContent.filter(item => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <div className="sidebar -dashboard">
      {menuItems.map((item) => (
        <div className="sidebar__item" key={item.id}>
          {item.name === "Logout" ? (
            <div className="sidebar__button">
              <button
                onClick={handleLogout}
                className="d-flex items-center text-15 lh-1 fw-500 w-100 border-0 bg-transparent"
                style={{ cursor: 'pointer', textAlign: 'left' }}
              >
                <Image
                  width={20}
                  height={20}
                  src={item.icon}
                  alt="image"
                  className="mr-15"
                />
                {item.name}
              </button>
            </div>
          ) : (
            <div
              className={`${
                isActiveLink(item.routePath, pathname) ? "-is-active" : ""
              } sidebar__button `}
            >
              <Link
                href={item.routePath}
                className="d-flex items-center text-15 lh-1 fw-500"
              >
                <Image
                  width={20}
                  height={20}
                  src={item.icon}
                  alt="image"
                  className="mr-15"
                />
                {item.name}
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
