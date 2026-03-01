// Componente TurnIndicator - Indica de quem é o turno + timer
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TurnIndicatorProps {
  isYourTurn: boolean;
  playerName: string;
  opponentName: string;
  /** Segundos restantes no turno (0-31) */
  secondsLeft?: number;
  /** Porcentagem do tempo restante (0-100) */
  percentage?: number;
  /** Alerta de pouco tempo */
  isWarning?: boolean;
  /** Tempo crítico */
  isCritical?: boolean;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  isYourTurn,
  playerName,
  opponentName,
  secondsLeft,
  percentage = 100,
  isWarning = false,
  isCritical = false,
}) => {
  const showTimer = secondsLeft !== undefined;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "px-6 py-3 rounded-lg text-center font-bold text-lg transition-all relative overflow-hidden",
          isYourTurn
            ? isCritical
              ? "bg-red-600 text-white animate-pulse"
              : isWarning
                ? "bg-yellow-500 text-black"
                : "bg-green-500 text-white animate-pulse"
            : "bg-gray-300 text-gray-700",
        )}
      >
        <div className="flex items-center justify-center gap-3">
          {isYourTurn ? (
            <>
              🎯 Seu turno, {playerName}!
              {showTimer && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-full text-sm font-mono font-black",
                    isCritical
                      ? "bg-red-900/50 text-red-100"
                      : isWarning
                        ? "bg-yellow-700/40 text-yellow-100"
                        : "bg-green-700/40 text-green-100",
                  )}
                >
                  {secondsLeft}s
                </span>
              )}
            </>
          ) : (
            <>
              ⏳ Turno de {opponentName}
              {showTimer && (
                <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-full text-sm font-mono font-black bg-gray-500/30 text-gray-600">
                  {secondsLeft}s
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Barra de progresso do tempo */}
      {showTimer && (
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-linear",
              isCritical
                ? "bg-red-500"
                : isWarning
                  ? "bg-yellow-400"
                  : isYourTurn
                    ? "bg-green-400"
                    : "bg-gray-400",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};
