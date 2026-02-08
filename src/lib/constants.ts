// Constantes do jogo
import { ShipType } from '@/types/game-enums';

export const GRID_SIZE = 10;

export const SHIP_SIZES: Record<ShipType, number> = {
  [ShipType.CARRIER]: 5,
  [ShipType.BATTLESHIP]: 4,
  [ShipType.CRUISER]: 3,
  [ShipType.SUBMARINE]: 3,
  [ShipType.DESTROYER]: 2,
};

export const SHIP_NAMES: Record<ShipType, string> = {
  [ShipType.CARRIER]: 'Porta-aviões',
  [ShipType.BATTLESHIP]: 'Encouraçado',
  [ShipType.CRUISER]: 'Cruzador',
  [ShipType.SUBMARINE]: 'Submarino',
  [ShipType.DESTROYER]: 'Destroyer',
};

export const FLEET_COMPOSITION = [
  ShipType.CARRIER,
  ShipType.BATTLESHIP,
  ShipType.CRUISER,
  ShipType.SUBMARINE,
  ShipType.DESTROYER,
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const MATCH_POLLING_INTERVAL = 2000; // 2 segundos
