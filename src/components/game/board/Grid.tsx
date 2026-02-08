// Componente Grid - Renderizador 10x10 base
'use client';

import React from 'react';
import { Cell } from './Cell';
import { CellState } from '@/types/game-enums';
import { GRID_SIZE } from '@/lib/constants';

interface GridProps {
  grid: CellState[][];
  onCellClick?: (row: number, col: number) => void;
  readOnly?: boolean;
  showShips?: boolean;
}

export const Grid: React.FC<GridProps> = ({
  grid,
  onCellClick,
  readOnly = false,
  showShips = true,
}) => {
  return (
    <div className="inline-block bg-gray-800 p-4 rounded-lg shadow-xl">
      {/* Cabeçalho com letras (A-J) */}
      <div className="flex mb-2">
        <div className="w-8 h-8" /> {/* Espaço vazio no canto */}
        {Array.from({ length: GRID_SIZE }, (_, i) => (
          <div
            key={i}
            className="w-10 h-8 flex items-center justify-center text-white font-bold"
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      {/* Grid com células */}
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {/* Número da linha (1-10) */}
          <div className="w-8 h-10 flex items-center justify-center text-white font-bold">
            {rowIndex + 1}
          </div>
          
          {row.map((cellState, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              state={cellState}
              onClick={() => onCellClick?.(rowIndex, colIndex)}
              disabled={readOnly}
              showShip={showShips}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
