
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
    // For background fetches, we don't want to show a loading spinner.
    // The main loading state is only for the initial page load.
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
      console.error("Failed to fetch data in background", error);
    } finally {
      // This ensures the main loading spinner is disabled after the first successful fetch.
      if (loading) {
        setLoading(false);
      }
    }
  }, [loading]);
  
  const createTeam = async (teamData: Omit<Team, 'id' | 'coach'>): Promise<Team> => {
    const newTeam = await api.createTeam(teamData);
    await fetchData(); // Refetch all data to ensure consistency across users
    return newTeam;
  };

  const createPlayer = async (playerData: PlayerCreationData): Promise<Player> => {
    const newPlayer = await api.createPlayer(playerData);
    await fetchData(); // Refetch all data to ensure consistency
    return newPlayer;
  };

  const createCoach = async (coachData: CoachCreationData): Promise<Coach> => {
    const newCoach = await api.createCoach(coachData);
    await fetchData(); // Refetch all data to ensure consistency
    return newCoach;
  };

  const recordAttendance = async (record: Pick<Attendance, 'playerId' | 'status'>) => {
    const today = new Date().toISOString().split('T')[0];
    const optimisticRecord: Attendance = { ...record, date: today };

    // Optimistic UI update for instant feedback to the user who performed the action.
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
        await api.recordAttendance(record);
        // After successfully recording, refetch all data to sync state across all users.
        await fetchData();
    } catch (error) {
        console.error("Failed to record attendance, reverting state:", error);
        // On error, revert by refetching data from the server to undo the optimistic update.
        await fetchData();
        throw error;
    }
  };

  const updatePlayer = async (playerData: Player) => {
    await api.updatePlayer(playerData);
    await fetchData(); // Refetch to get the canonical state from the server.
  };
  
  const updateTeam = async (teamData: Team) => {
    await api.updateTeam(teamData);
    await fetchData(); // Refetch to get the canonical state.
  };

  const recordPlayerPayment = async (playerId: string) => {
    await api.recordPlayerPayment(playerId);
    await fetchData(); // Refetch to update payment status for all.
  };
  
  const deletePlayer = async (playerId: string) => {
    await api.deletePlayer(playerId);
    await fetchData(); // Refetch to remove the player from the state.
  };

  // Initial data fetch on component mount.
  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Set up polling to refetch data periodically for real-time synchronization.
  useEffect(() => {
    const pollingInterval = 15000; // Poll every 15 seconds for near real-time updates.
    const intervalId = setInterval(() => {
        fetchData();
    }, pollingInterval);

    return () => clearInterval(intervalId); // Clean up interval on component unmount.
  }, [fetchData]);

  // Refetch data when the window/tab gets focus to ensure data is fresh.
  useEffect(() => {
    window.addEventListener('focus', fetchData);
    return () => {
        window.removeEventListener('focus', fetchData);
    };
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
