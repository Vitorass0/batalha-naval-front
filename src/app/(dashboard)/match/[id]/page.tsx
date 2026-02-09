// Smart Component Orquestrador da Partida
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMatchQuery } from '@/hooks/queries/useMatchQuery';
import { GamePhase } from '@/types/game-enums';
import SetupPhase from './SetupPhase';
import BattlePhase from './BattlePhase';

export default function MatchPage() {
  const [matchId, setMatchId] = useState<string | null>(null);

  useEffect(() => {
    // Pegamos o ID que foi gerado no createMatch
    const id = localStorage.getItem('matchId');
    setMatchId(id);
  }, []);

  if (!matchId) {
    return <div>Identificando partida local...</div>;
  }

  // Como não existe GET, assumimos que se o usuário caiu aqui, 
  // ele precisa primeiro configurar os navios.
  // Criamos um objeto de partida "fake" apenas para o SetupPhase não quebrar
  const localMatch = {
    id: matchId,
    phase: GamePhase.SETUP,
    player1: { username: "Comandante", isReady: false }
  };

  return <SetupPhase match={localMatch as any} />;
}
