// Smart Component Orquestrador da Partida
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useMatchQuery } from '@/hooks/queries/useMatchQuery';
import { GamePhase } from '@/types/game-enums';
import SetupPhase from './SetupPhase';
import BattlePhase from './BattlePhase';

export default function MatchPage() {
  const params = useParams();
  const matchId = params.id as string;
  
  const { data: match, isLoading, error } = useMatchQuery(matchId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-2xl">Carregando partida...</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-400 text-2xl">
          Erro ao carregar partida. Tente novamente.
        </div>
      </div>
    );
  }

  // Redireciona baseado na fase do jogo
  if (match.phase === GamePhase.SETUP) {
    return <SetupPhase match={match} />;
  }

  if (match.phase === GamePhase.BATTLE || match.phase === GamePhase.FINISHED) {
    return <BattlePhase match={match} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-white text-2xl">
        Aguardando início da partida...
      </div>
    </div>
  );
}
