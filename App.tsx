import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import Attendance from './components/pages/Attendance';
import Categories from './components/pages/Categories';
import Teams from './components/pages/Teams';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import PlayerProfile from './components/pages/PlayerProfile';
import RegisterPlayer from './components/pages/RegisterPlayer';
import SuperAdmin from './components/pages/SuperAdmin';
import SuperAdminRoute from './components/shared/SuperAdminRoute';
import { useClub } from './context/ClubContext';
import AdminRoute from './components/shared/adminRoute';
import Coaches from './components/pages/coaches';


function hexToRgb(hex: string): string | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
        : null;
}

const App: React.FC = () => {
  const { clubSettings } = useClub();

  useEffect(() => {
    const root = document.documentElement;
    const colors = clubSettings.colors;
    
    const colorMap: Record<string, string | null> = {
        '--color-primary': hexToRgb(colors.primary),
        '--color-secondary': hexToRgb(colors.secondary),
        '--color-tertiary': hexToRgb(colors.tertiary),
        '--color-background': hexToRgb(colors.background),
        '--color-surface': hexToRgb(colors.surface),
        '--color-text-primary': hexToRgb(colors.textPrimary),
        '--color-text-secondary': hexToRgb(colors.textSecondary),
    };

    for (const [property, value] of Object.entries(colorMap)) {
        if (value) {
            root.style.setProperty(property, value);
        }
    }
    
    // Update favicon
    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = clubSettings.logoUrl || '/favicon.ico';
    }

  }, [clubSettings]);


  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="categories" element={<Categories />} />
          <Route path="teams" element={<Teams />} />
          <Route path="player/:id" element={<PlayerProfile />} />
          <Route path="register" element={<RegisterPlayer />} />
          <Route path="coaches" element={
            <AdminRoute>
              <Coaches />
            </AdminRoute>
          } />
          <Route path="superadmin" element={
            <SuperAdminRoute>
              <SuperAdmin />
            </SuperAdminRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;