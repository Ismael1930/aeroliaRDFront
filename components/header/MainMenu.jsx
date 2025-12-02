import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const MainMenu = ({ style = "" }) => {
  const pathname = usePathname();
  const { isAuth } = useAuth();

  // Si el usuario está autenticado, no mostrar el menú
  if (isAuth) {
    return null;
  }

  return (
    <nav className="menu js-navList">
      <ul className={`menu__nav ${style} -is-active`}>
        <li className={pathname === "/destinations" ? "current" : ""}>
          <Link href="/destinations">Destinos</Link>
        </li>
        {/* End Destinatinos single menu */}

        <li className={pathname === "/blog-list-v1" ? "current" : ""}>
          <Link href="/blog-list-v1">Blog</Link>
        </li>
        {/* End Blog menu */}

        <li className={pathname === "/contact" ? "current" : ""}>
          <Link href="/contact">Contacto</Link>
        </li>
        {/* End Contact menu */}
      </ul>
    </nav>
  );
};

export default MainMenu;
