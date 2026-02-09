// Enums e tipos do jogo

export enum CellState {
  WATER = 'WATER',
  SHIP = 'SHIP',
  HIT = 'HIT',
  MISS = 'MISS',
}

export enum ShipOrientation {
  HORIZONTAL = 0,
  VERTICAL = 1,
}

export enum GamePhase {
  SETUP = 'SETUP',
  BATTLE = 'BATTLE',
  FINISHED = 'FINISHED',
}

export enum GameStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export enum ShipType {
  CARRIER = 'CARRIER',         // 5 células
  BATTLESHIP = 'BATTLESHIP',   // 4 células
  CRUISER = 'CRUISER',         // 3 células
  SUBMARINE = 'SUBMARINE',     // 3 células
  DESTROYER = 'DESTROYER',     // 2 células
}

export type Coordinate = {
  row: number;
  col: number;
};
