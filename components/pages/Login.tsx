

import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useClub } from '../../context/ClubContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

const Login: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const { login, isLoading, isAuthenticated } = useAuth();
  const { clubSettings, loading: clubLoading } = useClub();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (typeof (window as any).lucide !== 'undefined') {
      (window as any).lucide.createIcons();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      showToast('Credenciales incorrectas.', 'error');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
            {clubLoading ? <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 animate-pulse"></div> : (
              clubSettings.logoUrl ? (
                <img src={clubSettings.logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-full mx-auto mb-4"/>
              ) : (
                <i data-lucide="volleyball" className="w-16 h-16 text-primary mx-auto mb-4"></i>
              )
            )}
            <h1 className="text-2xl font-bold text-text-primary">{clubSettings.name}</h1>
            <p className="text-text-secondary">Inicio de sesión</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
           <div className="text-xs text-text-secondary space-y-1">
             <p>Admin: <strong>admin</strong> / <strong>password</strong></p>
             {/* <p>Super Admin: <strong>superadmin</strong> / <strong>superpassword</strong></p> */}
             <p>Entrenadores: Usar número de documento para usuario y contraseña.</p>
           </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;