// Componente Cell - Célula individual do tabuleiro
'use client';

import React from 'react';
import { CellState } from '@/types/game-enums';
import { cn } from '@/lib/utils';

interface CellProps {
  state: CellState;
  onClick?: () => void;
  disabled?: boolean;
  showShip?: boolean;
}

export const Cell: React.FC<CellProps> = ({
  state,
  onClick,
  disabled = false,
  showShip = true,
}) => {
  const getCellStyle = () => {
    switch (state) {
      case CellState.WATER:
        return 'bg-blue-400 hover:bg-blue-300';
      case CellState.SHIP:
        return showShip ? 'bg-gray-600' : 'bg-blue-400 hover:bg-blue-300';
      case CellState.HIT:
        return 'bg-red-600';
      case CellState.MISS:
        return 'bg-white';
      default:
        return 'bg-blue-400';
    }
  };

  const getCellContent = () => {
    switch (state) {
      case CellState.HIT:
        return (
          <div className="text-white text-2xl font-bold">✕</div>
        );
      case CellState.MISS:
        return (
          <div className="text-blue-600 text-2xl font-bold">○</div>
        );
      default:
        return null;
    }
  };

  return (
    <button
      className={cn(
        'w-10 h-10 border border-gray-700 flex items-center justify-center',
        'transition-colors duration-150',
        getCellStyle(),
        !disabled && 'cursor-pointer',
        disabled && 'cursor-not-allowed'
      )}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {getCellContent()}
    </button>
  );
};
