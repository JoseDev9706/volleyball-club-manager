

import React, { ReactNode, useEffect, useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useData } from '../../context/DataContext';
import { useClub } from '../../context/ClubContext';
import { useAuth } from '../../context/AuthContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const { players } = useData();
  const { clubSettings } = useClub();
  const { coachInfo } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Close sidebar on navigation on mobile devices
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle window resize to show/hide sidebar appropriately
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof (window as any).lucide !== 'undefined') {
      (window as any).lucide.createIcons();
    }
  }, [location, isSidebarOpen]);

  const getTitle = () => {
    if (location.pathname.startsWith('/player/')) {
      const player = players.find(p => p.id === params.id);
      return player ? `Perfil de: ${player.name}` : 'Perfil de Jugador';
    }
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/attendance':
        return 'Control de Asistencia';
      case '/categories':
        return 'Gestión de Categorías';
      case '/teams':
        return 'Gestión de Equipos';
      case '/register':
        return 'Registrar Nuevo Jugador';
      case '/superadmin':
        return 'Configuración del Club';
      default:
        return clubSettings.name;
    }
  };

  return (
    <div className="flex h-screen text-text-primary bg-background overflow-x-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          aria-hidden="true"
        ></div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-black/30 backdrop-blur-md p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary z-40 lg:hidden"
              aria-label="Toggle navigation"
            >
              <i data-lucide="menu" className="w-6 h-6"></i>
            </button>
            <h1 className="text-xl md:text-2xl font-bold truncate">{getTitle()}</h1>
          </div>

          <div className="flex items-center gap-3 mb-8 px-2">
            {coachInfo && (
              <img
                src={coachInfo.avatarUrl}
                alt={`${coachInfo.firstName} ${coachInfo.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-lg font-bold text-text-primary whitespace-nowrap">
                {coachInfo
                  ? `${coachInfo.firstName} ${coachInfo.lastName}`
                  : 'Admin'}
              </h1>
              <p className="text-sm text-text-secondary">
                {coachInfo ? 'Entrenador' : ''}
              </p>
            </div>
          </div>



        </header>

        <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
