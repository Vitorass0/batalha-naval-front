// Componente Grid - Renderizador 10x10 base
"use client";

import React, { useMemo } from "react";
import { Cell } from "./Cell";
import { CellState, ShipType, ShipOrientation } from "@/types/game-enums";
import { GRID_SIZE } from "@/lib/constants";
import { ShipDto } from "@/types/api-responses";
import { ShipUnit } from "@/components/game/setup/ShipUnit";
import { CELL_SIZE, FLEET_CONFIG } from "@/lib/game-rules";

/** Set of valid backend ship name strings for quick lookup. */
const VALID_SHIP_TYPES = new Set<string>(Object.values(ShipType));

interface GridProps {
  grid: CellState[][];
  onCellClick?: (row: number, col: number) => void;
  onCellHover?: (row: number, col: number) => void;
  onCellLeave?: () => void;
  readOnly?: boolean;
  showShips?: boolean;
  animatingCell?: { row: number; col: number; type: "hit" | "miss" } | null;
  previewCells?: { x: number; y: number; isValid: boolean }[];
  highlightedCells?: Set<string>;
  /** Ship data to overlay images on the grid. */
  ships?: ShipDto[];
  /** If true, only renders images for sunk ships (used for radar/opponent board). */
  showSunkShipsOnly?: boolean;
}

export const Grid: React.FC<GridProps> = ({
  grid,
  onCellClick,
  onCellHover,
  onCellLeave,
  readOnly = false,
  showShips = true,
  animatingCell = null,
  previewCells = [],
  highlightedCells,
  ships,
  showSunkShipsOnly = false,
}) => {
  const getPreviewState = (col: number, row: number) => {
    const preview = previewCells.find((p) => p.x === col && p.y === row);
    if (preview) return { isPreview: true, isValid: preview.isValid };

    const highlighted = highlightedCells?.has(`${row}-${col}`) ?? false;
    return { isPreview: highlighted, isValid: true };
  };

  const visibleShips = useMemo(() => {
    if (!ships) return [];
    return showSunkShipsOnly ? ships.filter((s) => s.isSunk) : ships;
  }, [ships, showSunkShipsOnly]);

  return (
    <div className="relative p-4 md:p-8 bg-slate-900/50 rounded-xl border border-slate-800 shadow-2xl backdrop-blur-md select-none inline-block">
      <div>
        {/* Column letter headers */}
        <div className="flex">
          <div className="w-8 h-8 md:w-10 md:h-10" />
          {Array.from({ length: GRID_SIZE }, (_, i) => (
            <div
              key={i}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 font-bold text-xs md:text-sm"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>

        {/* Cell rows + ship overlay wrapper */}
        <div className="relative">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 font-bold text-xs md:text-sm">
                {rowIndex + 1}
              </div>

              {row.map((cellState, colIndex) => {
                const { isPreview, isValid } = getPreviewState(
                  colIndex,
                  rowIndex,
                );

                return (
                  <Cell
                    key={`${rowIndex}-${colIndex}`}
                    state={cellState}
                    onClick={() => onCellClick?.(rowIndex, colIndex)}
                    onMouseEnter={() => onCellHover?.(rowIndex, colIndex)}
                    onMouseLeave={onCellLeave}
                    disabled={readOnly}
                    showShip={showShips}
                    isAnimating={
                      animatingCell &&
                      animatingCell.row === rowIndex &&
                      animatingCell.col === colIndex
                        ? animatingCell.type
                        : null
                    }
                    isPreview={isPreview}
                    isValidPreview={isValid}
                  />
                );
              })}
            </div>
          ))}

          {/*
           * Ship image overlay — pixel-perfect at md+ breakpoint.
           * At md+: each cell = CELL_SIZE (40px), row-label column = CELL_SIZE.
           * So ship at (startX, startY) → left=(startX+1)*40, top=startY*40.
           * Hidden on mobile (< md) because cell size differs (32px) and would misalign.
           */}
          {visibleShips.length > 0 && (
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              {visibleShips.map((ship) => {
                if (!ship.coordinates?.length) return null;
                const startX = Math.min(...ship.coordinates.map((c) => c.x));
                const startY = Math.min(...ship.coordinates.map((c) => c.y));
                const isValidType = VALID_SHIP_TYPES.has(ship.name);
                const isHorizontal = ship.orientation === ShipOrientation.HORIZONTAL;
                const w = isHorizontal ? ship.size * CELL_SIZE : CELL_SIZE;
                const h = isHorizontal ? CELL_SIZE : ship.size * CELL_SIZE;
                return (
                  <div
                    key={ship.id}
                    className="absolute"
                    style={{
                      left: (startX + 1) * CELL_SIZE,
                      top: startY * CELL_SIZE,
                      width: w,
                      height: h,
                      opacity: ship.isSunk ? 1 : 0.82,
                      zIndex: 5,
                    }}
                  >
                    {isValidType ? (
                      <ShipUnit
                        type={ship.name as ShipType}
                        size={ship.size}
                        orientation={ship.orientation as ShipOrientation}
                      />
                    ) : (
                      // Fallback: solid colour bar when ship name is unrecognized
                      <div
                        className="w-full h-full rounded bg-slate-500 border border-slate-300 opacity-70"
                      />
                    )}
                    {/* Sunk tint */}
                    {ship.isSunk && (
                      <div className="absolute inset-0 bg-red-950/65 rounded pointer-events-none z-10" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Corner accent marks */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg m-2 pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg m-2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg m-2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg m-2 pointer-events-none" />
    </div>
  );
};