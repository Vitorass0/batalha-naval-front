// Componente Ship - Visual do navio
'use client';

import React from 'react';
import { ShipType, ShipOrientation } from '@/types/game-enums';
import { SHIP_SIZES, SHIP_NAMES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ShipProps {
  type: ShipType;
  orientation: ShipOrientation;
  isPlaced?: boolean;
  onClick?: () => void;
}

export const Ship: React.FC<ShipProps> = ({
  type,
  orientation,
  isPlaced = false,
  onClick,
}) => {
  const size = SHIP_SIZES[type];
  const name = SHIP_NAMES[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center p-4 rounded-lg border-2 transition-all',
        'cursor-pointer hover:scale-105',
        isPlaced
          ? 'bg-green-100 border-green-500 opacity-50'
          : 'bg-blue-100 border-blue-500'
      )}
      onClick={onClick}
    >
      <div className="text-sm font-semibold mb-2">{name}</div>
      <div
        className={cn(
          'flex gap-1',
          orientation === ShipOrientation.VERTICAL && 'flex-col'
        )}
      >
        {Array.from({ length: size }, (_, i) => (
          <div
            key={i}
            className={cn(
              'bg-gray-700 border border-gray-900',
              orientation === ShipOrientation.HORIZONTAL ? 'w-8 h-8' : 'w-8 h-8'
            )}
          />
        ))}
      </div>
      <div className="text-xs text-gray-600 mt-2">
        {isPlaced ? 'Posicionado' : 'Clique para posicionar'}
      </div>
    </div>
  );
};
