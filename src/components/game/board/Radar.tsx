// Componente Radar - Grid do oponente (apenas cliques)
'use client';

import React from 'react';
import { Grid } from './Grid';
import { CellState } from '@/types/game-enums';
import { GRID_SIZE } from '@/lib/constants';

interface RadarProps {
  opponentGrid: CellState[][];
  onAttack: (row: number, col: number) => void;
  isYourTurn: boolean;
}

export const Radar: React.FC<RadarProps> = ({
  opponentGrid,
  onAttack,
  isYourTurn,
}) => {
  const handleCellClick = (row: number, col: number) => {
    if (!isYourTurn) return;
    
    const cellState = opponentGrid[row][col];
    
    // Só permite clicar em células não atacadas
    if (cellState === CellState.WATER || cellState === CellState.SHIP) {
      onAttack(row, col);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold mb-4 text-white">
        Radar do Oponente
      </h3>
      <Grid
        grid={opponentGrid}
        onCellClick={handleCellClick}
        readOnly={!isYourTurn}
        showShips={false} // Nunca mostra os navios do oponente
      />
      {!isYourTurn && (
        <p className="mt-4 text-yellow-400 font-semibold">
          Aguardando turno do oponente...
        </p>
      )}
    </div>
  );
};
