
import React from 'react';

export interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: ('admin' | 'superAdmin')[];
}

export const NAV_LINKS: NavLink[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <i data-lucide="layout-dashboard" className="w-5 h-5"></i>,
  },
  {
    href: '/attendance',
    label: 'Asistencia',
    icon: <i data-lucide="calendar-check" className="w-5 h-5"></i>,
  },
  {
    href: '/categories',
    label: 'Categorías',
    icon: <i data-lucide="users-round" className="w-5 h-5"></i>,
  },
  {
    href: '/teams',
    label: 'Equipos',
    icon: <i data-lucide="shield" className="w-5 h-5"></i>,
  },
  {
    href: '/register',
    label: 'Registrar Jugador',
    icon: <i data-lucide="user-plus" className="w-5 h-5"></i>,
  },
  {
    href: '/superadmin',
    label: 'Configuración',
    icon: <i data-lucide="settings" className="w-5 h-5"></i>,
    roles: ['superAdmin']
  },
];
