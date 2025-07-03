
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { api } from '../services/api';

type UserType = 'admin' | 'superAdmin' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userType: UserType;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (user: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.login(user, pass);
      if (response.success) {
        setIsAuthenticated(true);
        setUserType(response.userType);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
