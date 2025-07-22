
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Player, Team, Attendance, PlayerCreationData, Coach, CoachCreationData } from '../types';
import { api } from '../services/api';

interface DataContextType {
  players: Player[];
  teams: Team[];
  attendances: Attendance[];
  coaches: Coach[];
  loading: boolean;
  createTeam: (teamData: Omit<Team, 'id' | 'coach'>) => Promise<Team>;
  createPlayer: (playerData: PlayerCreationData) => Promise<Player>;
  createCoach: (coachData: CoachCreationData) => Promise<Coach>;
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
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [playersData, teamsData, attendancesData, coachesData] = await Promise.all([
        api.getPlayers(),
        api.getTeams(),
        api.getAttendances(),
        api.getCoaches(),
      ]);
      setPlayers(playersData);
      setTeams(teamsData);
      setAttendances(attendancesData);
      setCoaches(coachesData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createTeam = async (teamData: Omit<Team, 'id' | 'coach'>): Promise<Team> => {
    const newTeam = await api.createTeam(teamData);
    setTeams(prevTeams => [...prevTeams, newTeam]);
    return newTeam;
  };

  const createPlayer = async (playerData: PlayerCreationData): Promise<Player> => {
    const newPlayer = await api.createPlayer(playerData);
    setPlayers(prevPlayers => [newPlayer, ...prevPlayers]);
    return newPlayer;
  };

  const createCoach = async (coachData: CoachCreationData): Promise<Coach> => {
    const newCoach = await api.createCoach(coachData);
    setCoaches(prevCoaches => [...prevCoaches, newCoach]);
    return newCoach;
  };

  const recordAttendance = async (record: Pick<Attendance, 'playerId' | 'status'>) => {
    const today = new Date().toISOString().split('T')[0];
    const optimisticRecord: Attendance = { ...record, date: today };

    // Optimistic UI update for immediate feedback
    setAttendances(prev => {
        const existingIndex = prev.findIndex(a => a.playerId === record.playerId && a.date === today);
        const newAttendances = [...prev];
        if (existingIndex > -1) {
            newAttendances[existingIndex] = optimisticRecord;
        } else {
            newAttendances.push(optimisticRecord);
        }
        return newAttendances;
    });

    try {
        // Perform API call in background
        const newAttendance = await api.recordAttendance(record);
        // Reconcile with server data
        setAttendances(prev => {
            return prev.map(a => (a.playerId === newAttendance.playerId && a.date === newAttendance.date) ? newAttendance : a);
        });
    } catch (error) {
        console.error("Failed to record attendance, reverting state:", error);
        // On error, revert by refetching all data from the server
        fetchData();
        // Propagate error to the caller so it can show a toast
        throw error;
    }
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
    <DataContext.Provider value={{ players, teams, attendances, coaches, loading, createTeam, createPlayer, createCoach, recordAttendance, updatePlayer, updateTeam, recordPlayerPayment, deletePlayer, refetchData: fetchData }}>
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
