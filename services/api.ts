
import { Player, Team, MainCategory, SubCategory, Position, Attendance, ClubSettings, PlayerCreationData } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const api = {
  login: async (user: string, pass: string): Promise<{ success: boolean; userType: 'admin' | 'superAdmin' | null }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass }),
    });
    return handleResponse(response);
  },
  
  getPlayers: (): Promise<Player[]> => {
    return fetch(`${API_BASE_URL}/players`).then(handleResponse);
  },
  
  getPlayerById: (id: string): Promise<Player | undefined> => {
    return fetch(`${API_BASE_URL}/players/${id}`).then(handleResponse);
  },

  getTeams: (): Promise<Team[]> => {
    return fetch(`${API_BASE_URL}/teams`).then(handleResponse);
  },

  getAttendances: (): Promise<Attendance[]> => {
    return fetch(`${API_BASE_URL}/attendances`).then(handleResponse);
  },
  
  getClubSettings: (): Promise<ClubSettings> => {
    return fetch(`${API_BASE_URL}/club-settings`).then(handleResponse);
  },
  
  updateClubSettings: async (settings: ClubSettings): Promise<ClubSettings> => {
    const response = await fetch(`${API_BASE_URL}/club-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },

  createTeam: async (teamData: Omit<Team, 'id'>): Promise<Team> => {
    const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
    });
    return handleResponse(response);
  },

  createPlayer: async (playerData: PlayerCreationData): Promise<Player> => {
    const response = await fetch(`${API_BASE_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
    });
    return handleResponse(response);
  },
  
  recordAttendance: async (record: Pick<Attendance, 'playerId' | 'status'>): Promise<Attendance> => {
    const response = await fetch(`${API_BASE_URL}/attendances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
    });
    return handleResponse(response);
  },
  
  updatePlayer: async (updatedPlayerData: Player): Promise<Player> => {
    const response = await fetch(`${API_BASE_URL}/players/${updatedPlayerData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlayerData),
    });
    return handleResponse(response);
  },

  updateTeam: async (updatedTeamData: Team): Promise<Team> => {
      const response = await fetch(`${API_BASE_URL}/teams/${updatedTeamData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTeamData),
    });
    return handleResponse(response);
  },

  recordPlayerPayment: async (playerId: string): Promise<Player> => {
    const response = await fetch(`${API_BASE_URL}/players/${playerId}/payment`, {
        method: 'POST',
    });
    return handleResponse(response);
  },

  deletePlayer: async (playerId: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
  }
};