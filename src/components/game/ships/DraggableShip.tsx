// Componente DraggableShip - Wrapper do dnd-kit (placeholder)
'use client';

import React from 'react';
import { Ship } from './Ship';
import { ShipType, ShipOrientation } from '@/types/game-enums';

interface DraggableShipProps {
  type: ShipType;
  orientation: ShipOrientation;
  isPlaced: boolean;
  onSelect: () => void;
}

export const DraggableShip: React.FC<DraggableShipProps> = ({
  type,
  orientation,
  isPlaced,
  onSelect,
}) => {
  // TODO: Implementar dnd-kit quando necessário
  // Por enquanto, apenas um wrapper clicável
  
  return (
    <Ship
      type={type}
      orientation={orientation}
      isPlaced={isPlaced}
      onClick={onSelect}
    />
  );
};
