/**
 * Medal Badge Component
 * 
 * Displays a medal/achievement with locked/unlocked states.
 * Shows tooltip on hover with medal name and description.
 */
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface Medal {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  unlocked: boolean;
  progress?: number; // Optional progress (0-100)
  maxProgress?: number;
}

interface MedalBadgeProps {
  medal: Medal;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Tooltip Component
 */
interface TooltipProps {
  medal: Medal;
  visible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ medal, visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
      <div className="bg-naval-surface border border-naval-action/50 rounded-md shadow-xl p-3 min-w-[200px] max-w-[280px]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{medal.icon}</span>
          <h4 className="font-bold text-white text-sm">{medal.name}</h4>
        </div>

        {/* Description */}
        <p className="text-xs text-naval-text-secondary mb-2">
          {medal.description}
        </p>

        {/* Requirement */}
        <div className="text-xs text-naval-text-muted border-t border-naval-border pt-2">
          <span className="font-medium">Requisito:</span> {medal.requirement}
        </div>

        {/* Progress (if applicable) */}
        {!medal.unlocked && medal.progress !== undefined && medal.maxProgress !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between items-center text-xs text-naval-text-muted mb-1">
              <span>Progresso</span>
              <span>{medal.progress}/{medal.maxProgress}</span>
            </div>
            <div className="h-1.5 bg-naval-border rounded-full overflow-hidden">
              <div
                className="h-full bg-naval-action transition-all"
                style={{ width: `${(medal.progress / medal.maxProgress) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className={cn(
          'mt-2 text-xs font-bold uppercase tracking-wide text-center py-1 rounded',
          medal.unlocked
            ? 'bg-naval-action/20 text-naval-action'
            : 'bg-naval-border text-naval-text-muted'
        )}>
          {medal.unlocked ? '✓ Desbloqueada' : '🔒 Bloqueada'}
        </div>
      </div>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-naval-action/50" />
      </div>
    </div>
  );
};

/**
 * Medal Badge Component
 */
export const MedalBadge: React.FC<MedalBadgeProps> = ({ 
  medal, 
  size = 'md' 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'relative rounded-lg border-2 transition-all duration-300 cursor-pointer',
          containerSizeClasses[size],
          medal.unlocked
            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-105'
            : 'bg-naval-surface border-naval-border opacity-40 grayscale hover:opacity-60'
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Medal Icon */}
        <div className={cn(
          'flex items-center justify-center',
          sizeClasses[size]
        )}>
          <span className={cn(
            'transition-transform duration-300',
            showTooltip && medal.unlocked && 'scale-110'
          )}>
            {medal.icon}
          </span>
        </div>

        {/* Lock Overlay for locked medals */}
        {!medal.unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-naval-bg/60 rounded-lg">
            <span className="text-2xl opacity-70">🔒</span>
          </div>
        )}

        {/* Progress Ring (optional) */}
        {!medal.unlocked && medal.progress !== undefined && medal.maxProgress !== undefined && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-naval-surface border-2 border-naval-border rounded-full flex items-center justify-center text-[10px] font-bold text-naval-text-secondary">
            {medal.progress}
          </div>
        )}
      </div>

      {/* Tooltip */}
      <Tooltip medal={medal} visible={showTooltip} />
    </div>
  );
};

export default MedalBadge;
