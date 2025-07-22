
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
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

const getInitialUserType = (): UserType => {
  const savedUserType = localStorage.getItem('userType');
  // Ensure the saved user type is one of the allowed values before using it.
  if (savedUserType && ['admin', 'superAdmin', 'coach'].includes(savedUserType)) {
      return savedUserType as UserType;
  }
  return null;
}

const getInitialCoachInfo = (): Coach | null => {
    const savedCoach = localStorage.getItem('coachInfo');
    if (savedCoach) {
        try {
            // Safely parse the stored JSON for coach information.
            return JSON.parse(savedCoach);
        } catch (e) {
            console.error("Failed to parse coachInfo from localStorage", e);
            // If parsing fails, the data is corrupt. Clear it.
            localStorage.removeItem('coachInfo');
            return null;
        }
    }
    return null;
}


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage to persist session across page reloads.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
      // Check for a consistent auth state. Both items should exist for a valid session.
      return localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('userType');
  });
  const [userType, setUserType] = useState<UserType>(getInitialUserType);
  const [coachInfo, setCoachInfo] = useState<Coach | null>(getInitialCoachInfo);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Centralized logout function to clear both state and localStorage.
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserType(null);
    setCoachInfo(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('coachInfo');
  }, []);

  const login = async (user: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response: LoginResponse = await api.login(user, pass);
      if (response.success) {
        // Set state for the current session
        setIsAuthenticated(true);
        setUserType(response.userType);
        
        // Persist state in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', response.userType as string);

        if (response.userType === 'coach' && response.coachInfo) {
          setCoachInfo(response.coachInfo);
          localStorage.setItem('coachInfo', JSON.stringify(response.coachInfo));
        } else {
          setCoachInfo(null);
          localStorage.removeItem('coachInfo');
        }
        return true;
      }
      // If login is not successful, ensure we are logged out.
      logout();
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      logout(); // Ensure we are logged out on API error.
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for storage changes to sync logout across tabs.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        // When 'isAuthenticated' is removed in another tab, it signifies a logout.
        // Sync this tab by logging out as well.
        if (event.key === 'isAuthenticated' && !event.newValue) {
            logout();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // When the component unmounts, clean up the event listener to prevent memory leaks.
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout]); // The effect depends on the `logout` function.

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
