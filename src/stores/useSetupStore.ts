/**
 * Setup Store - Ship Placement State Management
 * 
 * Zustand store for managing the ship placement phase.
 * Handles ship positioning, rotation, validation, and board state.
 */
import { create } from 'zustand';
import { ShipType, ShipOrientation } from '@/types/game-enums';
import { GRID_SIZE, SHIP_SIZES, FLEET_COMPOSITION } from '@/lib/constants';

/**
 * Ship position on the grid
 */
export interface ShipPosition {
  type: ShipType;
  size: number;
  orientation: ShipOrientation;
  startRow: number;
  startCol: number;
}

/**
 * Initial fleet positions (off-board for manual placement)
 */
const INITIAL_SHIPS: ShipPosition[] = FLEET_COMPOSITION.map((type, index) => ({
  type,
  size: SHIP_SIZES[type],
  orientation: ShipOrientation.HORIZONTAL,
  startRow: -1, // Off-board initially
  startCol: -1,
}));

/**
 * Setup Store State and Actions
 */
interface SetupStore {
  // State
  ships: ShipPosition[];
  selectedShip: ShipType | null;
  isDragging: boolean;
  
  // Actions
  placeShip: (type: ShipType, row: number, col: number) => boolean;
  addShip: (ship: ShipPosition) => boolean;
  removeShip: (type: ShipType) => void;
  updateShip: (type: ShipType, updates: Partial<ShipPosition>) => void;
  selectShip: (type: ShipType | null) => void;
  setDragging: (isDragging: boolean) => void;
  rotateShip: (type: ShipType) => boolean;
  resetBoard: () => void;
  clearBoard: () => void;
  randomizeBoard: () => void;
  
  // Queries
  isShipPlaced: (type: ShipType) => boolean;
  isPositionValid: (ship: ShipPosition) => boolean;
  allShipsPlaced: () => boolean;
  getShip: (type: ShipType) => ShipPosition | undefined;
}

/**
 * Helper: Get occupied cells by a ship
 */
const getShipCells = (ship: ShipPosition): Set<string> => {
  const cells = new Set<string>();
  const size = SHIP_SIZES[ship.type];
  
  for (let i = 0; i < size; i++) {
    const row = ship.orientation === ShipOrientation.HORIZONTAL
      ? ship.startRow
      : ship.startRow + i;
    const col = ship.orientation === ShipOrientation.HORIZONTAL
      ? ship.startCol + i
      : ship.startCol;
    cells.add(`${row},${col}`);
  }
  
  return cells;
};

/**
 * Helper: Check if position is within grid bounds
 */
const isWithinBounds = (ship: ShipPosition): boolean => {
  const size = SHIP_SIZES[ship.type];
  
  if (ship.startRow < 0 || ship.startCol < 0) return false;
  
  if (ship.orientation === ShipOrientation.HORIZONTAL) {
    return ship.startCol + size <= GRID_SIZE && ship.startRow < GRID_SIZE;
  } else {
    return ship.startRow + size <= GRID_SIZE && ship.startCol < GRID_SIZE;
  }
};

/**
 * Helper: Check if ships overlap
 */
const hasOverlap = (ship: ShipPosition, otherShips: ShipPosition[]): boolean => {
  const shipCells = getShipCells(ship);
  
  for (const other of otherShips) {
    if (other.type === ship.type) continue;
    if (other.startRow < 0 || other.startCol < 0) continue; // Skip unplaced ships
    
    const otherCells = getShipCells(other);
    
    // Check intersection
    for (const cell of shipCells) {
      if (otherCells.has(cell)) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Helper: Generate random ship placement
 */
const getRandomPlacement = (
  type: ShipType,
  existingShips: ShipPosition[],
  maxAttempts: number = 100
): ShipPosition | null => {
  const size = SHIP_SIZES[type];
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const orientation = Math.random() < 0.5 
      ? ShipOrientation.HORIZONTAL 
      : ShipOrientation.VERTICAL;
    
    const maxRow = orientation === ShipOrientation.HORIZONTAL 
      ? GRID_SIZE 
      : GRID_SIZE - size + 1;
    const maxCol = orientation === ShipOrientation.HORIZONTAL 
      ? GRID_SIZE - size + 1 
      : GRID_SIZE;
    
    const startRow = Math.floor(Math.random() * maxRow);
    const startCol = Math.floor(Math.random() * maxCol);
    
    const ship: ShipPosition = { type, size, orientation, startRow, startCol };
    
    if (isWithinBounds(ship) && !hasOverlap(ship, existingShips)) {
      return ship;
    }
  }
  
  return null;
};

/**
 * Zustand Store Implementation
 */
export const useSetupStore = create<SetupStore>((set, get) => ({
  // Initial State
  ships: [...INITIAL_SHIPS],
  selectedShip: null,
  isDragging: false,

  // Place ship at specific coordinates
  placeShip: (type, row, col) => {
    const state = get();
    const ship = state.ships.find((s) => s.type === type);
    
    if (!ship) return false;
    
    const updatedShip: ShipPosition = {
      ...ship,
      startRow: row,
      startCol: col,
    };
    
    if (state.isPositionValid(updatedShip)) {
      set((state) => ({
        ships: state.ships.map((s) =>
          s.type === type ? updatedShip : s
        ),
      }));
      return true;
    }
    
    return false;
  },

  // Add or update ship
  addShip: (ship) => {
    const state = get();
    if (state.isPositionValid(ship)) {
      set((state) => ({
        ships: state.ships.map((s) =>
          s.type === ship.type ? ship : s
        ),
      }));
      return true;
    }
    return false;
  },

  // Remove ship from board (return to initial position)
  removeShip: (type) =>
    set((state) => ({
      ships: state.ships.map((s) =>
        s.type === type ? { ...s, startRow: -1, startCol: -1 } : s
      ),
    })),

  // Update ship properties
  updateShip: (type, updates) => {
    const state = get();
    const ship = state.ships.find((s) => s.type === type);
    
    if (!ship) return;
    
    const updatedShip = { ...ship, ...updates };
    
    // Validate if position or orientation changed
    if (
      updates.startRow !== undefined ||
      updates.startCol !== undefined ||
      updates.orientation !== undefined
    ) {
      if (!state.isPositionValid(updatedShip)) {
        return;
      }
    }
    
    set((state) => ({
      ships: state.ships.map((s) =>
        s.type === type ? updatedShip : s
      ),
    }));
  },

  // Select ship for interaction
  selectShip: (type) => set({ selectedShip: type }),

  // Set dragging state
  setDragging: (isDragging) => set({ isDragging }),

  // Rotate ship 90 degrees
  rotateShip: (type) => {
    const state = get();
    const ship = state.ships.find((s) => s.type === type);
    
    if (!ship) return false;
    
    const newOrientation =
      ship.orientation === ShipOrientation.HORIZONTAL
        ? ShipOrientation.VERTICAL
        : ShipOrientation.HORIZONTAL;
    
    const updatedShip = { ...ship, orientation: newOrientation };
    
    // Only validate if ship is already placed on board
    if (ship.startRow >= 0 && ship.startCol >= 0) {
      if (!state.isPositionValid(updatedShip)) {
        return false;
      }
    }
    
    state.updateShip(type, { orientation: newOrientation });
    return true;
  },

  // Reset to initial state (ships off-board)
  resetBoard: () => set({ 
    ships: [...INITIAL_SHIPS],
    selectedShip: null,
    isDragging: false,
  }),

  // Clear all ships
  clearBoard: () => set({ 
    ships: INITIAL_SHIPS.map(s => ({ ...s, startRow: -1, startCol: -1 })),
    selectedShip: null,
    isDragging: false,
  }),

  // Randomize all ship placements
  randomizeBoard: () => {
    const placedShips: ShipPosition[] = [];
    
    for (const type of FLEET_COMPOSITION) {
      const placement = getRandomPlacement(type, placedShips);
      
      if (placement) {
        placedShips.push(placement);
      } else {
        // Fallback: if random placement fails, reset
        console.warn(`Failed to place ${type} randomly`);
        set({ ships: [...INITIAL_SHIPS] });
        return;
      }
    }
    
    set({ ships: placedShips, selectedShip: null });
  },

  // Check if specific ship is placed on board
  isShipPlaced: (type) => {
    const ship = get().ships.find((s) => s.type === type);
    return ship ? ship.startRow >= 0 && ship.startCol >= 0 : false;
  },

  // Validate ship position
  isPositionValid: (ship) => {
    const { ships } = get();
    
    // Off-board positions are valid (for unplaced ships)
    if (ship.startRow < 0 || ship.startCol < 0) return true;
    
    // Check bounds
    if (!isWithinBounds(ship)) return false;
    
    // Check overlap with other ships
    if (hasOverlap(ship, ships)) return false;
    
    return true;
  },

  // Check if all ships are placed
  allShipsPlaced: () => {
    const { ships } = get();
    return ships.every((ship) => ship.startRow >= 0 && ship.startCol >= 0);
  },

  // Get specific ship
  getShip: (type) => {
    return get().ships.find((s) => s.type === type);
  },
}));
