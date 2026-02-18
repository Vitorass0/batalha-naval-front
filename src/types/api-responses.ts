// DTOs de retorno da API
import { MatchStatus, ShipOrientation, CellState } from "./game-enums";

export interface UserProfile {
  rankPoints: number;
  wins: number;
  losses: number;
}
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  profile: UserProfile;
}
export interface UserDetails extends UserProfile {
  username: string;
  gamesPlayed: number;
}
export interface LeaderBoardResponse {
  userId: number;
  username: string;
  points: number;
  wins: number;
  rank: string;
}
export interface CreateMatchResponse {
  matchId: string;
}

export interface SetupShipPayload {
  name: string;
  size: number;
  startX: number;
  startY: number;
  orientation: ShipOrientation;
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
  status: MatchStatus;
  winner: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CoordinateDto {
  x: number;
  y: number;
  isHit: boolean;
}

export interface ShipDto {
  id: string;
  name: string;
  size: number;
  isSunk: boolean;
  orientation: ShipOrientation;
  coordinates: CoordinateDto[];
}

export interface BoardStateDto {
  grid: CellState[][];
  ships: ShipDto[];
}

export interface MatchStatsDto {
  myHits: number;
  myConsecutiveHits: number;
  opponentHits: number;
  opponentConsecutiveHits: number;
}

export interface MatchGameState {
  matchId: string;
  status: MatchStatus;
  currentTurnPlayerId: string;
  isMyTurn: boolean;
  winnerId?: string | null;
  myBoard: BoardStateDto;
  opponentBoard: BoardStateDto;
  stats: MatchStatsDto;
}

export interface MatchListItem {
  id: string;
  player1: string;
  player2: string | null;
  status: MatchStatus;
  createdAt: string;
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
