// Componente Radar - Grid do oponente (apenas cliques)
"use client";

import React from "react";
import { Grid } from "./Grid";
import { CellState } from "@/types/game-enums";
import { GRID_SIZE } from "@/lib/constants";
import { ShipDto } from "@/types/api-responses";

interface RadarProps {
  opponentGrid: CellState[][];
  onAttack: (row: number, col: number) => void;
  isYourTurn: boolean;
  isLoading?: boolean;
  animatingCell?: { row: number; col: number; type: "hit" | "miss" } | null;
  /** Opponent ships — only sunk ones will be revealed as images. */
  opponentShips?: ShipDto[];
}

export const Radar: React.FC<RadarProps> = ({
  opponentGrid,
  onAttack,
  isYourTurn,
  isLoading = false,
  animatingCell = null,
  opponentShips,
}) => {
  const canInteract = isYourTurn && !isLoading;

  const handleCellClick = (row: number, col: number) => {
    if (!canInteract) return;

    const cellState = opponentGrid[row][col];

    // Só permite clicar em células não atacadas (Water visível, Ship está mascarada como Water pelo backend)
    if (cellState === CellState.WATER || cellState === CellState.SHIP) {
      onAttack(row, col);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold mb-4 text-cyan-400 uppercase tracking-widest">⚡ Radar do Oponente</h3>
      <div className={isLoading ? "opacity-70 pointer-events-none" : ""}>
        <Grid
          grid={opponentGrid}
          onCellClick={handleCellClick}
          readOnly={!canInteract}
          showShips={false}
          animatingCell={animatingCell}
          ships={opponentShips}
          showSunkShipsOnly={true}
        />
      </div>
      {isLoading && (
        <p className="mt-4 text-cyan-400 font-semibold animate-pulse">
          Processando disparo...
        </p>
      )}
      {!isYourTurn && !isLoading && (
        <p className="mt-4 text-yellow-400 font-semibold">
          Aguardando turno do oponente...
        </p>
      )}
    </div>
  );
};
