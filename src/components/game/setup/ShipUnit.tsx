/**
 * ShipUnit — Pure visual representation of a single ship.
 *
 * Renders a row (horizontal) or column (vertical) of cells whose total
 * length equals `size * CELL_SIZE`. No drag logic belongs here.
 */
"use client";

import React from "react";
import { ShipType, ShipOrientation } from "@/types/game-enums";
import { FLEET_CONFIG, CELL_SIZE } from "@/lib/game-rules";
import { cn } from "@/lib/utils";

// ─── Image paths per ship type ───────────────────────────────────────────────
// Place one PNG/SVG per ship (horizontal, bow → stern) inside /public/ships/

const SHIP_IMAGES: Record<ShipType, string> = {
  [ShipType.PORTA_AVIAO_A]: "/ships/porta-aviao-a.png",
  [ShipType.PORTA_AVIAO_B]: "/ships/porta-aviao-b.png",
  [ShipType.NAVIO_GUERRA_A]: "/ships/navio-guerra-a.png",
  [ShipType.NAVIO_GUERRA_B]: "/ships/navio-guerra-b.png",
  [ShipType.ENCOURACADO]: "/ships/encouracado.png",
  [ShipType.SUBMARINO]: "/ships/submarino.png",
};

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ShipUnitProps {
  type: ShipType;
  size: number;
  orientation: ShipOrientation;
  /** Extra Tailwind classes forwarded to the root element. */
  className?: string;
  /** When true, the ship is rendered at reduced opacity (already placed). */
  ghost?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ShipUnit: React.FC<ShipUnitProps> = ({
  type,
  size,
  orientation,
  className,
  ghost = false,
}) => {
  const isHorizontal = orientation === ShipOrientation.HORIZONTAL;
  const config = FLEET_CONFIG[type];

  // Natural image dimensions (image is always drawn horizontally)
  const imgW = size * CELL_SIZE;
  const imgH = CELL_SIZE;

  // Container flips w/h for vertical ships
  const containerStyle: React.CSSProperties = {
    width: isHorizontal ? imgW : imgH,
    height: isHorizontal ? imgH : imgW,
    position: "relative",
    overflow: "hidden",
  };

  // For vertical: rotate 90 ° clockwise around the image's top-left corner,
  // then shift right by imgH so the result lands inside the container.
  // Math: after rotate(90deg) round (0,0) the image sits at x∈[-imgH,0], y∈[0,imgW].
  //       translateX(+imgH) moves it to x∈[0,imgH], y∈[0,imgW] — fits exactly.
  const imgStyle: React.CSSProperties = isHorizontal
    ? { width: imgW, height: imgH, display: "block" }
    : {
        width: imgW,
        height: imgH,
        position: "absolute",
        transformOrigin: "0 0",
        transform: `translateX(${imgH}px) rotate(90deg)`,
      };

  return (
    <div
      title={config.label}
      style={containerStyle}
      className={cn("select-none", ghost && "opacity-40", className)}
    >
      <img
        src={SHIP_IMAGES[type]}
        alt={config.label}
        draggable={false}
        style={{ ...imgStyle, mixBlendMode: "multiply" }}
      />
    </div>
  );
};
