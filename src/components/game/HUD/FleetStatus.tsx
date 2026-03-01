// Componente FleetStatus - Status da frota (navios vivos/afundados)
"use client";

import React from "react";
import { ShipDto } from "@/types/api-responses";
import { SHIP_NAMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FleetStatusProps {
  ships: ShipDto[];
  title: string;
}

export const FleetStatus: React.FC<FleetStatusProps> = ({ ships, title }) => {
  const aliveShips = ships.filter((s) => !s.isSunk).length;
  const totalShips = ships.length;

  const getShipHits = (ship: ShipDto): number => {
    return ship.coordinates?.filter((c) => c.isHit).length ?? 0;
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-bold mb-3 text-white">{title}</h3>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-300">Navios Restantes</span>
          <span className="font-bold text-white">
            {aliveShips} / {totalShips}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all",
              aliveShips > 3
                ? "bg-green-500"
                : aliveShips > 1
                  ? "bg-yellow-500"
                  : "bg-red-500",
            )}
            style={{ width: `${(aliveShips / totalShips) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {ships.map((ship) => {
          const hits = getShipHits(ship);
          const displayName =
            SHIP_NAMES[ship.name as keyof typeof SHIP_NAMES] || ship.name;

          return (
            <div
              key={ship.id}
              className={cn(
                "flex items-center justify-between p-2 rounded text-sm transition-all",
                ship.isSunk
                  ? "bg-red-900/40 border border-red-700/50 line-through text-red-300 animate-ship-sunk"
                  : "bg-green-900/30 border border-green-700/30 text-green-300",
              )}
            >
              <span>{displayName}</span>
              <span className="text-xs">
                {ship.isSunk
                  ? "💥 Afundado"
                  : `❤️ ${ship.size - hits}/${ship.size}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
