'use client';

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const UserProfile = () => {
  const { user, logout, isAuth } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!isAuth || !user) {
    return (
      <div className="d-flex items-center">
        <Link href="/login" className="button px-30 fw-400 text-14 -outline-blue-1 h-50 text-blue-1 mr-20">
          Log In
        </Link>
        <Link href="/signup" className="button px-30 fw-400 text-14 -blue-1 bg-blue-1 h-50 text-white">
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="d-flex items-center">
      <div className="dropdown">
        <button
          className="button px-30 fw-400 text-14 border-light rounded-100 h-50 d-flex items-center"
          type="button"
          id="userDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="icon-user text-20 mr-10"></i>
          <span>{user.name || user.email}</span>
        </button>
        <ul className="dropdown-menu" aria-labelledby="userDropdown">
          <li>
            <Link className="dropdown-item" href="/dashboard">
              <i className="icon-grid mr-10"></i> Dashboard
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" href="/dashboard/profile">
              <i className="icon-user mr-10"></i> My Profile
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" href="/dashboard/bookings">
              <i className="icon-ticket mr-10"></i> My Bookings
            </Link>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button 
              className="dropdown-item text-red-1" 
              onClick={handleLogout}
            >
              <i className="icon-logout mr-10"></i> Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfile;
