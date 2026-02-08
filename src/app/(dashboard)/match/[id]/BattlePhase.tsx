// Componente de Combate (Battle Phase)
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Match } from '@/types/api-responses';
import { Grid } from '@/components/game/board/Grid';
import { Radar } from '@/components/game/board/Radar';
import { TurnIndicator } from '@/components/game/HUD/TurnIndicator';
import { FleetStatus } from '@/components/game/HUD/FleetStatus';
import { GameControls } from '@/components/game/HUD/GameControls';
import { Button } from '@/components/ui/Button';
import { useShootMutation, useForfeitMutation } from '@/hooks/queries/useMatchMutations';
import { GamePhase, CellState } from '@/types/game-enums';
import { getToken } from '@/lib/utils';
import { GRID_SIZE } from '@/lib/constants';

interface BattlePhaseProps {
  match: Match;
}

export default function BattlePhase({ match }: BattlePhaseProps) {
  const router = useRouter();
  const shoot = useShootMutation(match.id);
  const forfeit = useForfeitMutation(match.id);
  const [lastShot, setLastShot] = useState<{ hit: boolean; message: string } | null>(null);

  // Determina qual jogador é o usuário atual
  const token = getToken();
  // TODO: Decodificar token para pegar userId (simplificado aqui)
  const isPlayer1 = true; // Placeholder - implementar lógica real
  
  const currentPlayer = isPlayer1 ? match.player1 : match.player2;
  const opponent = isPlayer1 ? match.player2 : match.player1;
  
  const isMyTurn = match.currentTurn === currentPlayer?.id;
  const isFinished = match.phase === GamePhase.FINISHED;

  // Grids (simplificado - idealmente viriam do match.player1.board e match.player2.board)
  const myGrid = currentPlayer?.board?.grid || Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill(CellState.WATER)
  );
  
  const opponentGrid = opponent?.board?.grid || Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill(CellState.WATER)
  );

  const handleAttack = async (row: number, col: number) => {
    try {
      const result = await shoot.mutateAsync({ row, col });
      
      setLastShot({
        hit: result.hit,
        message: result.hit
          ? result.sunk
            ? `🔥 Afundou um ${result.shipType}!`
            : '💥 Acertou!'
          : '💦 Errou!',
      });

      if (result.gameOver) {
        setTimeout(() => {
          alert(`🎉 Vitória! Você venceu a partida!`);
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao atacar:', error);
    }
  };

  const handleForfeit = async () => {
    if (confirm('Tem certeza que deseja desistir?')) {
      try {
        await forfeit.mutateAsync();
        router.push('/lobby');
      } catch (error) {
        console.error('Erro ao desistir:', error);
      }
    }
  };

  if (!opponent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Aguardando oponente...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header com indicador de turno */}
        <div className="mb-8">
          <TurnIndicator
            isYourTurn={isMyTurn && !isFinished}
            playerName={currentPlayer?.username || 'Você'}
            opponentName={opponent.username}
          />
          
          {lastShot && (
            <div className={`mt-4 text-center text-2xl font-bold ${
              lastShot.hit ? 'text-red-400' : 'text-blue-400'
            }`}>
              {lastShot.message}
            </div>
          )}

          {isFinished && (
            <div className="mt-4 text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-4">
                {match.winner === currentPlayer?.id ? '🎉 VITÓRIA!' : '💀 DERROTA'}
              </div>
              <Button onClick={() => router.push('/lobby')} size="lg">
                Voltar ao Lobby
              </Button>
            </div>
          )}
        </div>

        {/* Grids lado a lado */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Radar do Oponente */}
          <div className="flex justify-center">
            <Radar
              opponentGrid={opponentGrid}
              onAttack={handleAttack}
              isYourTurn={isMyTurn && !isFinished}
            />
          </div>

          {/* Meu Tabuleiro */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-white">
              Seu Tabuleiro
            </h3>
            <Grid
              grid={myGrid}
              readOnly={true}
              showShips={true}
            />
          </div>
        </div>

        {/* Status das Frotas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {currentPlayer?.board?.ships && (
            <FleetStatus
              ships={currentPlayer.board.ships}
              title="Sua Frota"
            />
          )}
          {opponent.board?.ships && (
            <FleetStatus
              ships={opponent.board.ships}
              title={`Frota de ${opponent.username}`}
            />
          )}
        </div>

        {/* Controles */}
        <div className="flex justify-center">
          <GameControls onForfeit={handleForfeit} />
        </div>
      </div>
    </div>
  );
}
