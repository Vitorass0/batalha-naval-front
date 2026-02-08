// Componente de Posicionamento de Navios (Setup Phase)
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Match } from '@/types/api-responses';
import { useSetupStore } from '@/stores/useSetupStore';
import { Grid } from '@/components/game/board/Grid';
import { DraggableShip } from '@/components/game/ships/DraggableShip';
import { GameControls } from '@/components/game/HUD/GameControls';
import { Button } from '@/components/ui/Button';
import { FLEET_COMPOSITION, GRID_SIZE, SHIP_SIZES } from '@/lib/constants';
import { CellState, ShipOrientation } from '@/types/game-enums';
import {
  usePlaceShipMutation,
  useConfirmSetupMutation,
} from '@/hooks/queries/useMatchMutations';

interface SetupPhaseProps {
  match: Match;
}

export default function SetupPhase({ match }: SetupPhaseProps) {
  const router = useRouter();
  const {
    ships,
    selectedShip,
    selectShip,
    addShip,
    rotateShip,
    clearBoard,
    isShipPlaced,
    allShipsPlaced,
  } = useSetupStore();

  const placeShip = usePlaceShipMutation(match.id);
  const confirmSetup = useConfirmSetupMutation(match.id);

  // Inicializa grid vazio
  const emptyGrid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(CellState.WATER));

  // Renderiza navios posicionados no grid
  const renderGrid = () => {
    const grid = emptyGrid.map((row) => [...row]);
    
    ships.forEach((ship) => {
      const size = SHIP_SIZES[ship.type];
      for (let i = 0; i < size; i++) {
        const row =
          ship.orientation === ShipOrientation.HORIZONTAL
            ? ship.startRow
            : ship.startRow + i;
        const col =
          ship.orientation === ShipOrientation.HORIZONTAL
            ? ship.startCol + i
            : ship.startCol;
        
        if (row < GRID_SIZE && col < GRID_SIZE) {
          grid[row][col] = CellState.SHIP;
        }
      }
    });

    return grid;
  };

  const handleCellClick = (row: number, col: number) => {
    if (!selectedShip) return;

    const ship = ships.find((s) => s.type === selectedShip);
    const orientation = ship?.orientation || ShipOrientation.HORIZONTAL;

    addShip({
      type: selectedShip,
      orientation,
      startRow: row,
      startCol: col,
    });
  };

  const handleRotate = () => {
    if (selectedShip) {
      rotateShip(selectedShip);
    }
  };

  const handleConfirm = async () => {
    if (!allShipsPlaced()) return;

    try {
      // Envia todos os navios para o backend
      for (const ship of ships) {
        await placeShip.mutateAsync({
          shipType: ship.type,
          orientation: ship.orientation,
          startRow: ship.startRow,
          startCol: ship.startCol,
        });
      }

      // Confirma o setup
      await confirmSetup.mutateAsync();
    } catch (error) {
      console.error('Erro ao confirmar setup:', error);
    }
  };

  const isPlayerReady = match.player1.isReady || match.player2?.isReady;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Posicione Sua Frota
          </h1>
          <p className="text-gray-300">
            Clique em um navio e depois clique no tabuleiro para posicioná-lo
          </p>
          {match.player2 && (
            <div className="mt-4 text-yellow-300">
              Adversário: {match.player2.username}
              {match.player2.isReady && ' ✓ Pronto!'}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Frota Disponível */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4">Sua Frota</h2>
              <div className="space-y-3">
                {FLEET_COMPOSITION.map((shipType) => (
                  <DraggableShip
                    key={shipType}
                    type={shipType}
                    orientation={
                      ships.find((s) => s.type === shipType)?.orientation ||
                      ShipOrientation.HORIZONTAL
                    }
                    isPlaced={isShipPlaced(shipType)}
                    onSelect={() => selectShip(shipType)}
                  />
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <GameControls
                  onRotate={handleRotate}
                  onConfirm={handleConfirm}
                  canRotate={!!selectedShip && isShipPlaced(selectedShip)}
                  canConfirm={allShipsPlaced()}
                  confirmLabel="Confirmar Posições"
                />
                
                <Button
                  onClick={clearBoard}
                  variant="outline"
                  className="w-full mt-3"
                >
                  Limpar Tabuleiro
                </Button>
              </div>

              {isPlayerReady && (
                <div className="mt-4 p-4 bg-green-100 rounded-lg text-center">
                  <div className="text-green-700 font-bold">
                    ✓ Setup Confirmado!
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Aguardando oponente...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabuleiro */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <Grid
              grid={renderGrid()}
              onCellClick={handleCellClick}
              readOnly={false}
              showShips={true}
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={() => router.push('/lobby')}
            variant="ghost"
            className="text-white"
          >
            ← Voltar ao Lobby
          </Button>
        </div>
      </div>
    </div>
  );
}
