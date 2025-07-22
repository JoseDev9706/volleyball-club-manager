
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { api, LoginResponse } from '../services/api';
import { Coach } from '../types';

type UserType = 'admin' | 'superAdmin' | 'coach' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userType: UserType;
  coachInfo: Coach | null;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [coachInfo, setCoachInfo] = useState<Coach | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (user: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response: LoginResponse = await api.login(user, pass);
      if (response.success) {
        setIsAuthenticated(true);
        setUserType(response.userType);
        if (response.userType === 'coach' && response.coachInfo) {
          setCoachInfo(response.coachInfo);
        }
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
    setCoachInfo(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, coachInfo, login, logout, isLoading }}>
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