// Componente TurnIndicator - Indica de quem é o turno
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TurnIndicatorProps {
  isYourTurn: boolean;
  playerName: string;
  opponentName: string;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  isYourTurn,
  playerName,
  opponentName,
}) => {
  return (
    <div className={cn(
      'px-6 py-3 rounded-lg text-center font-bold text-lg transition-all',
      isYourTurn
        ? 'bg-green-500 text-white animate-pulse'
        : 'bg-gray-300 text-gray-700'
    )}>
      {isYourTurn ? (
        <>🎯 Seu turno, {playerName}!</>
      ) : (
        <>⏳ Turno de {opponentName}</>
      )}
    </div>
  );
};
