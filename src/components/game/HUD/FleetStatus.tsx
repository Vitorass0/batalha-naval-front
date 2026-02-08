// Componente FleetStatus - Status da frota (navios vivos/afundados)
'use client';

import React from 'react';
import { Ship } from '@/types/api-responses';
import { SHIP_NAMES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface FleetStatusProps {
  ships: Ship[];
  title: string;
}

export const FleetStatus: React.FC<FleetStatusProps> = ({ ships, title }) => {
  const aliveShips = ships.filter((s) => !s.isSunk).length;
  const totalShips = ships.length;

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Navios Restantes</span>
          <span className="font-bold">
            {aliveShips} / {totalShips}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all',
              aliveShips > 3 ? 'bg-green-500' : aliveShips > 1 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${(aliveShips / totalShips) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {ships.map((ship) => (
          <div
            key={ship.id}
            className={cn(
              'flex items-center justify-between p-2 rounded text-sm',
              ship.isSunk ? 'bg-red-100 line-through' : 'bg-green-100'
            )}
          >
            <span>{SHIP_NAMES[ship.type as keyof typeof SHIP_NAMES] || ship.type}</span>
            <span className="text-xs">
              {ship.isSunk ? '💥 Afundado' : `❤️ ${ship.size - ship.hits}/${ship.size}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
