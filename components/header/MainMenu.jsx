import Link from "next/link";
import { usePathname } from "next/navigation";

const MainMenu = ({ style = "" }) => {
  const pathname = usePathname();

  return (
    <nav className="menu js-navList">
      <ul className={`menu__nav ${style} -is-active`}>
        <li className={pathname === "/destinations" ? "current" : ""}>
          <Link href="/destinations">Destinations</Link>
        </li>
        {/* End Destinatinos single menu */}

        <li className={pathname === "/blog-list-v1" ? "current" : ""}>
          <Link href="/blog-list-v1">Blog</Link>
        </li>
        {/* End Blog menu */}

        <li className={pathname === "/contact" ? "current" : ""}>
          <Link href="/contact">Contact</Link>
        </li>
        {/* End Contact menu */}
      </ul>
    </nav>
  );
};

export default MainMenu;
