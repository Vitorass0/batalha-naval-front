// Enums e tipos do jogo
export enum CellState {
  WATER = "Water",
  SHIP = "Ship",
  HIT = "Hit",
  MISS = "Missed",
}
export enum ShipOrientation {
  HORIZONTAL = "Horizontal",
  VERTICAL = "Vertical",
}
export enum GameStatus {
  SETUP = "Setup",
  BATTLE = "InProgress",
  FINISHED = "Finished",
}
export enum ShipType {
  PORTA_AVIAO_A = "Porta-Aviões Alpha",
  PORTA_AVIAO_B = "Porta-Aviões Bravo",
  NAVIO_GUERRA_A = "Navio de Guerra Alpha",
  NAVIO_GUERRA_B = "Navio de Guerra Bravo",
  ENCOURACADO = "Encouraçado",
  SUBMARINO = "Submarino", // 2 células
}

export type Coordinate = {
  row: number;
  col: number;
};
