
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Player, Team, Attendance, PlayerCreationData } from '../types';
import { api } from '../services/api';

interface DataContextType {
  players: Player[];
  teams: Team[];
  attendances: Attendance[];
  loading: boolean;
  createTeam: (teamData: Omit<Team, 'id'>) => Promise<Team>;
  createPlayer: (playerData: PlayerCreationData) => Promise<Player>;
  recordAttendance: (record: Pick<Attendance, 'playerId' | 'status'>) => Promise<void>;
  updatePlayer: (playerData: Player) => Promise<void>;
  updateTeam: (teamData: Team) => Promise<void>;
  recordPlayerPayment: (playerId: string) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  refetchData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [playersData, teamsData, attendancesData] = await Promise.all([
        api.getPlayers(),
        api.getTeams(),
        api.getAttendances(),
      ]);
      setPlayers(playersData);
      setTeams(teamsData);
      setAttendances(attendancesData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createTeam = async (teamData: Omit<Team, 'id'>): Promise<Team> => {
    const newTeam = await api.createTeam(teamData);
    setTeams(prevTeams => [...prevTeams, newTeam]);
    return newTeam;
  };

  const createPlayer = async (playerData: PlayerCreationData): Promise<Player> => {
    const newPlayer = await api.createPlayer(playerData);
    setPlayers(prevPlayers => [newPlayer, ...prevPlayers]);
    return newPlayer;
  };

  const recordAttendance = async (record: Pick<Attendance, 'playerId' | 'status'>) => {
    const newAttendance = await api.recordAttendance(record);
    setAttendances(prev => {
        const existingIndex = prev.findIndex(a => a.playerId === newAttendance.playerId && a.date === newAttendance.date);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = newAttendance;
            return updated;
        }
        return [...prev, newAttendance];
    });
  };

  const updatePlayer = async (playerData: Player) => {
    const updatedPlayer = await api.updatePlayer(playerData);
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };
  
  const updateTeam = async (teamData: Team) => {
    const updatedTeam = await api.updateTeam(teamData);
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
  };

  const recordPlayerPayment = async (playerId: string) => {
    const updatedPlayer = await api.recordPlayerPayment(playerId);
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };
  
  const deletePlayer = async (playerId: string) => {
      await api.deletePlayer(playerId);
      await fetchData();
  };


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider value={{ players, teams, attendances, loading, createTeam, createPlayer, recordAttendance, updatePlayer, updateTeam, recordPlayerPayment, deletePlayer, refetchData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};