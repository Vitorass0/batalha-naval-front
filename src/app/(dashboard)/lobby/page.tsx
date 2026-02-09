/**
 * Lobby Page - Naval Battle Command Center
 * 
 * Dashboard page where authenticated users can:
 * - View their statistics and rank
 * - Start PvE training matches against AI
 * - Challenge other players in PvP matches
 * - Browse available matches
 */


'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useMatchListQuery } from '@/hooks/queries/useMatchQuery';
import { useJoinMatchMutation } from '@/hooks/queries/useMatchMutations';
import { GameStatus } from '@/types/game-enums';
import { UserStatsCard } from '@/components/lobby/UserStatsCard';
import { GameModeSelector } from '@/components/lobby/GameModeSelector';
import { LeaderBoardResponse } from '@/types/api-responses';
import { Leaderboard } from '@/components/lobby/LeaderBoard';

export default function LobbyPage() {
  const router = useRouter();
  

  return (
    <div className="display-flex max-w-100vw mx-auto px-4 py-8 gap-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Centro de Comando
        </h1>
        <p className="text-naval-text-secondary mt-2 text-lg">
          Prepare-se para a batalha, Comandante
        </p>
      </div>

      {/* Main Grid Layout - 2 columns on desktop, 1 on mobile */}
      <div className="flex center space-evenly gap-6 ">
        {/* Left Column - User Stats */}
        <div className="span-4 space-y-6">
          <UserStatsCard />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span>⚡</span>
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/profile')}
              >
                👤 Ver Perfil Completo
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/lobby')}
              >
                📜 Histórico de Batalhas
              </Button>
            </CardContent>
          </Card>
          
        </div>
        
        {/* Right Column - Battle Station */}
        <div className='display-flex center gap-10'>
          
          {/* Section Header */}
          

          {/* Game Mode Selector */}
          <GameModeSelector />
          {/* Available Matches List */}

          
          
        </div>
        <div className="lg:col-span-8 space-y-6">
          <Leaderboard></Leaderboard>
        </div>
      </div>
    </div>
  );
}
