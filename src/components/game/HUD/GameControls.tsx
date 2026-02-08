// Componente GameControls - Botões de controle (Girar, Desistir, Confirmar)
'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface GameControlsProps {
  onRotate?: () => void;
  onConfirm?: () => void;
  onForfeit?: () => void;
  canRotate?: boolean;
  canConfirm?: boolean;
  confirmLabel?: string;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onRotate,
  onConfirm,
  onForfeit,
  canRotate = false,
  canConfirm = false,
  confirmLabel = 'Confirmar',
}) => {
  return (
    <div className="flex gap-3 flex-wrap">
      {onRotate && (
        <Button
          onClick={onRotate}
          disabled={!canRotate}
          variant="outline"
        >
          🔄 Girar Navio
        </Button>
      )}
      
      {onConfirm && (
        <Button
          onClick={onConfirm}
          disabled={!canConfirm}
          variant="default"
        >
          ✓ {confirmLabel}
        </Button>
      )}
      
      {onForfeit && (
        <Button
          onClick={onForfeit}
          variant="destructive"
        >
          🏳️ Desistir
        </Button>
      )}
    </div>
  );
};
