'use client'

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Header1 from "./header-1";
import Header10 from "./header-10";
import HeaderDashBoard from "./dashboard-header";
import HeaderCliente from "./header-cliente";
import HeaderClienteHome from "./header-cliente-home";

/**
 * Header dinámico que cambia según el estado de autenticación y rol del usuario
 * - Usuario no autenticado: Header1 o Header10 (según la página)
 * - Cliente autenticado: HeaderCliente o HeaderClienteHome (según la página)
 * - Admin autenticado: HeaderDashBoard (header completo del dashboard)
 */
const DynamicHeader = () => {
  const { isAuth, user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Si es admin y NO está en una ruta de dashboard, redirigir
    if (!loading && isAuth && user) {
      const isAdmin = user.rol === 'Admin' || user.role === 'admin';
      const isDashboardRoute = pathname?.startsWith('/dashboard');
      
      // Admin debe estar siempre en dashboard
      if (isAdmin && !isDashboardRoute) {
        router.push('/dashboard/db-dashboard');
      }
    }
  }, [isAuth, user, loading, pathname, router]);

  // Verificar si estamos en home
  const isHome10 = pathname === '/home';

  // Mostrar loading o header público mientras se verifica la autenticación
  if (loading) {
    return isHome10 ? <Header10 /> : <Header1 />;
  }

  // Si no está autenticado, mostrar header público
  if (!isAuth || !user) {
    return isHome10 ? <Header10 /> : <Header1 />;
  }

  // Si es admin, mostrar header de dashboard
  const isAdmin = user.rol === 'Admin' || user.role === 'admin';
  if (isAdmin) {
    return <HeaderDashBoard />;
  }

  // Para clientes autenticados, mostrar header según la página
  return isHome10 ? <HeaderClienteHome /> : <HeaderCliente />;
};

export default DynamicHeader;
