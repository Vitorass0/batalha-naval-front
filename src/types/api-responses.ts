// DTOs de retorno da API
import { GamePhase, GameStatus, ShipOrientation, CellState } from './game-enums';

export interface UserProfile {
  rankPoints: number;                                                                                                                                                                                                                                                                                   
  wins: number;                                                                                                                                                                                                                                                                                         
  losses: number; 
}
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  profile: UserProfile
}
export interface UserDetails extends UserProfile{
  username: string;
  //colocar total de partidas talvez aq tbm
}
export interface LeaderBoardResponse {
  userId: number,
  username: string,
  points: number,
  wins: number,
  rank: string
}
export interface CreateMatchResponse{
  matchId:string
}

//ate aqui ta batendo com o back

export interface Ship {
  id: string;
  type: string;
  size: number;
  orientation: ShipOrientation;
  startRow: number;
  startCol: number;
  hits: number;
  isSunk: boolean;
}

export interface Board {
  grid: CellState[][];
  ships: Ship[];
}

export interface Player {
  id: string;
  username: string;
  isReady: boolean;
  board?: Board;
}

export interface Match {
  id: string;
  player1: Player;
  player2: Player | null;
  currentTurn: string | null;
  phase: GamePhase;
  status: GameStatus;
  winner: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MatchListItem {
  id: string;
  player1: string;
  player2: string | null;
  status: GameStatus;
  createdAt: string;
}

export interface SetupShipPayload {
  name: string;
  size:number;
  orientation: ShipOrientation;
  startRow: number;
  startCol: number;
}

export interface ShootPayload {
  row: number;
  col: number;
}

export interface ShootResponse {
  hit: boolean;
  sunk: boolean;
  shipType?: string;
  gameOver: boolean;
  winner?: string;
}
