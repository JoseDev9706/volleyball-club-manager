
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { ClubSettings } from '../types';
import { api } from '../services/api';

interface ClubContextType {
  clubSettings: ClubSettings;
  loading: boolean;
  updateClubSettings: (settings: ClubSettings) => Promise<void>;
}

const defaultSettings: ClubSettings = {
  name: "Voley Club",
  logoUrl: "/logo-default.svg",
  colors: {
    primary: '#DC2626',
    secondary: '#F9FAFB',
    tertiary: '#FBBF24',
    background: '#000000',
    surface: '#1F2937',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
  },
  teamCreationEnabled: true,
  monthlyPaymentEnabled: true,
};


const ClubContext = createContext<ClubContextType>({
    clubSettings: defaultSettings,
    loading: true,
    updateClubSettings: async () => {},
});

export const ClubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clubSettings, setClubSettings] = useState<ClubSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClubSettings = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await api.getClubSettings();
      setClubSettings(settings);
    } catch (error) {
      console.error("Failed to fetch club settings", error);
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClubSettings();
  }, [fetchClubSettings]);

  const updateClubSettings = async (settings: ClubSettings) => {
    try {
      const updatedSettings = await api.updateClubSettings(settings);
      setClubSettings(updatedSettings);
    } catch (error) {
        console.error("Failed to update club settings", error);
        throw error;
    }
  };


  return (
    <ClubContext.Provider value={{ clubSettings, loading, updateClubSettings }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = (): ClubContextType => {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
