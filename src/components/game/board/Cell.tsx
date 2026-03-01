// Componente Cell - Célula individual do tabuleiro
"use client";

import React from "react";
import { CellState } from "@/types/game-enums";
import { cn } from "@/lib/utils";

interface CellProps {
  state: CellState;
  onClick?: () => void;
  disabled?: boolean;
  showShip?: boolean;
  isAnimating?: "hit" | "miss" | null;
}

export const Cell: React.FC<CellProps> = ({
  state,
  onClick,
  disabled = false,
  showShip = true,
  isAnimating = null,
}) => {
  const getCellStyle = () => {
    switch (state) {
      case CellState.WATER:
        return "bg-blue-400 hover:bg-blue-300";
      case CellState.SHIP:
        return showShip ? "bg-gray-600" : "bg-blue-400 hover:bg-blue-300";
      case CellState.HIT:
        return "bg-gradient-to-br from-red-500 via-orange-500 to-red-700 border-red-400 shadow-[inset_0_0_8px_rgba(239,68,68,0.6)]";
      case CellState.MISS:
        return "bg-blue-900/80 border-blue-500/50";
      default:
        return "bg-blue-400";
    }
  };

  const getCellContent = () => {
    switch (state) {
      case CellState.HIT:
        return (
          <div className="text-yellow-300 text-lg font-bold drop-shadow-[0_0_4px_rgba(250,204,21,0.8)] animate-pulse">
            🔥
          </div>
        );
      case CellState.MISS:
        return <div className="text-blue-300/70 text-lg">●</div>;
      default:
        return null;
    }
  };

  return (
    <button
      className={cn(
        "w-10 h-10 border border-gray-700 flex items-center justify-center",
        "transition-all duration-200",
        getCellStyle(),
        !disabled &&
          state !== CellState.HIT &&
          state !== CellState.MISS &&
          "cursor-pointer",
        (disabled || state === CellState.HIT || state === CellState.MISS) &&
          "cursor-not-allowed",
        isAnimating === "hit" && "animate-hit-explosion",
        isAnimating === "miss" && "animate-miss-splash",
      )}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {getCellContent()}
    </button>
  );
};
