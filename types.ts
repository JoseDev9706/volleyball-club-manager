export enum MainCategory {
  Masculino = 'Masculino',
  Femenino = 'Femenino',
  Mixto = 'Mixto',
}

export enum SubCategory {
  Basico = 'Básico',
  Intermedio = 'Intermedio',
  Avanzado = 'Avanzado',
}

export enum Position {
  Setter = 'Colocador',
  Libero = 'Líbero',
  MiddleBlocker = 'Central',
  OutsideHitter = 'Punta Receptor',
  OppositeHitter = 'Opuesto',
}

export interface PlayerStats {
  attack: number;
  defense: number;
  block: number;
  pass: number;
}

export interface StatsRecord {
    id: string;
    date: string; // ISO string
    stats: PlayerStats;
}

export interface Player {
  id: string;
  name:string;
  document: string;
  address: string;
  phone: string;
  joinDate: string; // ISO string format
  birthDate: string; // YYYY-MM-DD
  avatarUrl: string;
  mainCategories: MainCategory[];
  subCategory: SubCategory;
  position: Position;
  statsHistory: StatsRecord[];
  lastPaymentDate?: string; // ISO string format
}

export type PlayerCreationData = Omit<Player, 'id' | 'joinDate' | 'statsHistory'> & {
  statsHistory: Omit<StatsRecord, 'id'>[];
};

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  document: string;
  avatarUrl: string;
}

export type CoachCreationData = Omit<Coach, 'id'>;


export interface Team {
  id: string;
  name: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  playerIds: string[];
  tournament?: string;
  tournamentPosition?: string;
  coachId?: string;
  coach?: {
    firstName: string;
    lastName: string;
  };
}


export interface Attendance {
    playerId: string;
    date: string; // YYYY-MM-DD
    status: 'Presente' | 'Ausente';
}

export interface ClubSettings {
  name: string;
  logoUrl: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
  },
  teamCreationEnabled: boolean;
  monthlyPaymentEnabled: boolean;
}