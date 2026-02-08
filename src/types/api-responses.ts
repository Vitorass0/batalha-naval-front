// DTOs de retorno da API
import { GamePhase, GameStatus, ShipOrientation, CellState } from './game-enums';

export interface User {
  id: string;
  username: string;
  email: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

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
  shipType: string;
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
