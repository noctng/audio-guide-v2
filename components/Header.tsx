import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MuseumIcon } from './icons';
import { useAuth } from '../context/AuthContext';
import { useGuest } from '../context/GuestContext';

const Header: React.FC = () => {
  const { session, logout: adminLogout } = useAuth();
  const { guest, logout: guestLogout } = useGuest();
  const navigate = useNavigate();

  const activeLinkClass = 'bg-gray-800 text-white';
  const inactiveLinkClass = 'text-gray-300 hover:bg-gray-700 hover:text-white';
  const linkBaseClass = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';

  const handleAdminLogout = async () => {
    await adminLogout();
    navigate('/login');
  };

  const handleGuestLogout = () => {
    guestLogout();
    navigate('/');
  };

  return (
    <header className="bg-gray-900 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to={guest ? "/language-selection" : "/"} className="flex items-center">
              <div className="flex-shrink-0 text-white">
                <MuseumIcon className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-white">Museum Audio Guide</h1>
              </div>
            </NavLink>
          </div>
          <nav className="flex items-center space-x-2 md:space-x-4">
            {guest && !session && (
              <div className="flex items-center space-x-2 md:space-x-4">
                <span className="text-sm text-gray-400 hidden md:block">Welcome, {guest.name}</span>
                <NavLink
                  to="/language-selection"
                  className={({ isActive }) =>
                    `${linkBaseClass} ${isActive || window.location.hash.includes('/guide') ? activeLinkClass : inactiveLinkClass}`
                  }
                >
                  Visitor
                </NavLink>
                <button
                  onClick={handleGuestLogout}
                  className={`${linkBaseClass} ${inactiveLinkClass}`}
                >
                  End Session
                </button>
              </div>
            )}

            {session ? (
              <>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
                  }
                >
                  Admin
                </NavLink>
                <button
                  onClick={handleAdminLogout}
                  className={`${linkBaseClass} ${inactiveLinkClass}`}
                >
                  Logout
                </button>
              </>
            ) : (
                !guest && (
                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                        `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
                        }
                    >
                        Admin Login
                    </NavLink>
                )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;