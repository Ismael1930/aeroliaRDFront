'use client'

import Image from "next/image";
import Link from "next/link";
import { FaPlaneDeparture, FaPlane, FaUsers, FaUserFriends, FaCog, FaSignOutAlt, FaTachometerAlt, FaReceipt, FaClipboardList } from 'react-icons/fa';
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
      icon: <FaTachometerAlt size={20} className="mr-15" />,
      name: "Dashboard",
      routePath: "/dashboard/db-dashboard",
    },
    // Sección de administración
    {
      id: 10,
      icon: <FaPlaneDeparture size={20} className="mr-15" />,
      name: "Gestión de Vuelos",
      routePath: "/dashboard/db-vuelos",
      adminOnly: true,
    },
    {
      id: 11,
      icon: <FaPlane size={20} className="mr-15" />,
      name: "Aeronaves",
      routePath: "/dashboard/db-aeronaves",
      adminOnly: true,
    },
    {
      id: 12,
      icon: <FaUsers size={20} className="mr-15" />,
      name: "Tripulación",
      routePath: "/dashboard/db-tripulacion",
      adminOnly: true,
    },
    {
      id: 13,
      icon: <FaUserFriends size={20} className="mr-15" />,
      name: "Clientes",
      routePath: "/dashboard/db-clientes",
      adminOnly: true,
    },
    {
      id: 14,
      icon: <FaReceipt size={20} className="mr-15" />,
      name: "Facturas",
      routePath: "/dashboard/db-facturas",
      adminOnly: true,
    },
    {
      id: 15,
      icon: <FaClipboardList size={20} className="mr-15" />,
      name: "Reservas",
      routePath: "/dashboard/db-reservas",
      adminOnly: true,
    },
     {
      id: 4,
      icon: <FaCog size={20} className="mr-15" />,
      name: "Settings",
      routePath: "/dashboard/db-settings",
    },
    {
      id: 5,
      icon: <FaSignOutAlt size={20} className="mr-15" />,
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
                    {/* icon can be a React node (from react-icons) or a string path for Image */}
                    {typeof item.icon === 'string' ? (
                      <Image width={20} height={20} src={item.icon} alt="image" className="mr-15" />
                    ) : (
                      <span className="mr-15">{item.icon}</span>
                    )}
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
                    {typeof item.icon === 'string' ? (
                      <Image width={20} height={20} src={item.icon} alt="image" className="mr-15" />
                    ) : (
                      <span className="mr-15">{item.icon}</span>
                    )}
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
