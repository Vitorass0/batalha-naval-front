// Constantes do jogo
import { ShipType } from "@/types/game-enums";

export const GRID_SIZE = 10;

export const SHIP_SIZES: Record<ShipType, number> = {
  [ShipType.PORTA_AVIAO_A]: 6,
  [ShipType.PORTA_AVIAO_B]: 6,
  [ShipType.NAVIO_GUERRA_A]: 4,
  [ShipType.NAVIO_GUERRA_B]: 4,
  [ShipType.ENCOURACADO]: 3,
  [ShipType.SUBMARINO]: 1,
};

export const SHIP_NAMES: Record<ShipType, string> = {
  [ShipType.PORTA_AVIAO_A]: "Porta-Aviões Alpha",
  [ShipType.PORTA_AVIAO_B]: "Porta-Aviões Bravo",
  [ShipType.NAVIO_GUERRA_A]: "Navio de Guerra Alpha",
  [ShipType.NAVIO_GUERRA_B]: "Navio de Guerra Bravo",
  [ShipType.ENCOURACADO]: "Encouraçado",
  [ShipType.SUBMARINO]: "Submarino",
};

export const FLEET_COMPOSITION = [
  ShipType.PORTA_AVIAO_A,
  ShipType.PORTA_AVIAO_B,
  ShipType.NAVIO_GUERRA_A,
  ShipType.NAVIO_GUERRA_B,
  ShipType.ENCOURACADO,
  ShipType.SUBMARINO,
];

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5205";
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};
export const MATCH_POLLING_INTERVAL = 2000; // 2 segundos
