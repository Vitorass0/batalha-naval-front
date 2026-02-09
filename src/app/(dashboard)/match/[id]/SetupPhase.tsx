'use client';

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
  
  useSetupMatchMutation,
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

  // Hooks de Mutation
  const setupMatch = useSetupMatchMutation();
  //const confirmSetup = useConfirmSetupMutation(match.id);

  // Inicializa grid vazio para renderização
  const emptyGrid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(CellState.WATER));

  const renderGrid = () => {
  // 1. Cria a base de água
  const grid = emptyGrid.map((row) => [...row]);
  
  // 2. Filtra APENAS os navios que estão no tabuleiro
  const placedShips = ships.filter(s => s.startRow >= 0 && s.startCol >= 0);

  placedShips.forEach((ship) => {
    const size = SHIP_SIZES[ship.type];
    for (let i = 0; i < size; i++) {
      const row = ship.orientation === ShipOrientation.HORIZONTAL
        ? ship.startRow
        : ship.startRow + i;
      const col = ship.orientation === ShipOrientation.HORIZONTAL
        ? ship.startCol + i
        : ship.startCol;
      
      // Proteção extra contra overflow do grid (ex: navio saindo pela borda)
      if (grid[row] && grid[row][col] !== undefined) {
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
      orientation: orientation,
      startRow: row,
      startCol: col,
      size: SHIP_SIZES[selectedShip] // Tamanho real para validação no Store
    });
  };

  const handleRotate = () => {
    if (selectedShip) {
      rotateShip(selectedShip);
    }
  };

  /**
   * Orchestrates the final submission:
   * 1. Sends the map of ship positions.
   * 2. Signals readiness to the backend.
   */
  const handleConfirm = async () => {
    if (!allShipsPlaced()) {
      alert("Comandante, posicione todos os navios antes de confirmar!");
      return;
    }

    try {
      // 1. Mapeamento para o formato do Backend (SetupMatchRequest)
      const setupShipsPayload = ships.map((ship) => ({
        name: ship.type,
        size: SHIP_SIZES[ship.type],
        startRow: ship.startRow,
        startCol: ship.startCol,
        orientation: ShipOrientation.HORIZONTAL,
      }));
      // 2. Primeiro envia as posições
      console.log('Payload a ser enviado:', JSON.stringify(setupShipsPayload, null, 2));

      // Envia as posições
      await setupMatch.mutateAsync(setupShipsPayload);

      console.log('Frota confirmada e pronta para o combate!');
    } catch (error) {
      console.error('Erro na sequência de confirmação:', error);
    }
  };

  // Verifica se qualquer um dos jogadores já confirmou
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
            Arraste os navios ou clique no tabuleiro para definir a estratégia
          </p>
          {match.player2 && (
            <div className="mt-4 p-2 bg-black/30 inline-block rounded-lg border border-white/10">
              <span className="text-yellow-400 font-mono">ADVERSÁRIO:</span> 
              <span className="text-white ml-2">{match.player2.username}</span>
              {match.player2.isReady && <span className="text-green-400 ml-2">✓ PRONTO</span>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Lateral de Navios */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur shadow-2xl rounded-xl p-6 border-b-8 border-naval-action">
              <h2 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-widest">
                Porto de Guerra
              </h2>
              
              <div className="space-y-4">
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

              <div className="mt-8 pt-6 border-t border-gray-100">
                <GameControls
                  onRotate={handleRotate}
                  onConfirm={handleConfirm}
                  canRotate={!!selectedShip}
                  canConfirm={allShipsPlaced() && !isPlayerReady}
                  confirmLabel="Zarpar Frota"
                />
                
                <Button
                  onClick={clearBoard}
                  variant="outline"
                  className="w-full mt-4 text-red-500 hover:bg-red-50"
                  disabled={isPlayerReady}
                >
                  Reiniciar Tabuleiro
                </Button>
              </div>

              {isPlayerReady && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-center font-bold animate-pulse">
                    ⚓ AGUARDANDO COMANDANTE ADVERSÁRIO...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Área do Tabuleiro */}
          <div className="lg:col-span-2 flex items-center justify-center bg-blue-950/40 rounded-3xl p-6 border border-white/5 shadow-inner">
            <Grid
              grid={renderGrid()}
              onCellClick={handleCellClick}
              readOnly={isPlayerReady} // Bloqueia o grid após confirmar
              showShips={true}
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => router.push('/lobby')}
            variant="ghost"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Retornar ao Menu Principal
          </Button>
        </div>
      </div>
    </div>
  );
}