
import React, { useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useClub } from '../../context/ClubContext';


interface SidebarProps {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, closeSidebar }) => {
  const location = useLocation();
  const { logout, userType, coachInfo } = useAuth();
  const { clubSettings } = useClub();

  useEffect(() => {
    if (typeof (window as any).lucide !== 'undefined') {
      (window as any).lucide.createIcons();
    }
  }, [location, isSidebarOpen]);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  const visibleNavLinks = useMemo(() => {
    return NAV_LINKS.filter(link => {
      if (link.href === '/teams' && !clubSettings.teamCreationEnabled) {
        return false;
      }
      
      const userRole = userType === 'coach' ? 'admin' : userType;
      
      if (!link.roles) return true;
      return userRole ? link.roles.includes(userRole) : false;
    });
  }, [userType, clubSettings.teamCreationEnabled]);

  const SidebarHeader: React.FC = () => {    
    return (
      <div className="flex items-center gap-3 mb-8 px-2">
        {clubSettings.logoUrl ? (
          <img src={clubSettings.logoUrl} alt={`${clubSettings.name} Logo`} className="w-10 h-10 object-contain"/>
        ) : (
          <i data-lucide="volleyball" className="w-10 h-10 text-primary"></i>
        )}
        <h1 className="text-xl font-bold text-text-primary whitespace-nowrap">{clubSettings.name}</h1>
      </div>
    );
  };

  return (
    <aside 
      className={`
        bg-black/40 backdrop-blur-md flex flex-col z-40
        transition-all duration-300 ease-in-out
        fixed inset-y-0 left-0 h-full
        lg:relative lg:h-auto 
        ${isSidebarOpen 
          ? 'w-64 translate-x-0 p-4' 
          : 'w-64 -translate-x-full p-4 lg:w-0 lg:p-0 lg:translate-x-0'}
      `}
    >
      <div className={`flex flex-col min-w-[14rem] h-full transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
        <SidebarHeader />
        <nav className="flex-grow">
          <ul className="space-y-2">
            {visibleNavLinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-gray-700/50 hover:text-text-primary'
                    }`
                  }
                >
                  {link.icon}
                  <span className="whitespace-nowrap">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto">
           <button onClick={logout} className="flex items-center w-full gap-3 px-3 py-2 rounded-md text-text-secondary hover:bg-red-800/50 hover:text-text-primary transition-colors">
              <i data-lucide="log-out" className="w-5 h-5"></i>
              <span className="whitespace-nowrap">Cerrar Sesión</span>
           </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;