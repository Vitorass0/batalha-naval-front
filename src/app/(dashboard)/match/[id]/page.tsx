// Smart Component Orquestrador da Partida
'use client';

import React, { useEffect, useState } from 'react';
import SetupPhase from './SetupPhase';
import BattlePhase from './BattlePhase';
import { GameStatus } from '@/types/game-enums';

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

 //PLACE HOLDER DE UMA PARTIDA Pois ja foi configurado no front e no back nao existe getmatch, ta sendo armaznado no local storage e sendo enviado a cada requisição( aqui precisa mudar dps)
  const localMatch = {
    id: matchId,
    phase: GameStatus.SETUP,
    player1: { username: "Comandante", isReady: false }
  };

  return <SetupPhase match={localMatch as any} />;
}
