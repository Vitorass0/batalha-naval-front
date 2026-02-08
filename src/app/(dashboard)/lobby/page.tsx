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

export default function LobbyPage() {
  const router = useRouter();
  const { data: matches, isLoading: isLoadingMatches } = useMatchListQuery();
  const joinMatch = useJoinMatchMutation();

  const handleJoinMatch = async (matchId: string) => {
    try {
      const match = await joinMatch.mutateAsync(matchId);
      router.push(`/match/${match.id}`);
    } catch (error) {
      console.error('Erro ao entrar na partida:', error);
    }
  };

  // Filter available matches (waiting for opponent)
  const availableMatches = matches?.filter(
    (match) => match.status === GameStatus.WAITING && !match.player2
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - User Stats */}
        <div className="lg:col-span-4 space-y-6">
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
        <div className="lg:col-span-8 space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-naval-action rounded-full" />
            <h2 className="text-2xl font-semibold text-white">Estação de Batalha</h2>
          </div>

          {/* Game Mode Selector */}
          <GameModeSelector />

          {/* Available Matches List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🌊</span>
                Partidas Disponíveis
              </CardTitle>
              <CardDescription>
                Entre em partidas criadas por outros jogadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMatches ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center justify-between p-4 border border-naval-border rounded-md"
                    >
                      <div className="space-y-2">
                        <div className="h-4 bg-naval-border rounded w-32" />
                        <div className="h-3 bg-naval-border rounded w-24" />
                      </div>
                      <div className="h-9 bg-naval-border rounded w-20" />
                    </div>
                  ))}
                </div>
              ) : availableMatches.length > 0 ? (
                <div className="space-y-3">
                  {availableMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 border border-naval-border rounded-md bg-naval-bg hover:border-naval-action/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-white">
                            {match.player1}
                          </span>
                          <span className="text-naval-text-muted italic">
                            aguardando oponente...
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-naval-text-secondary">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            Aguardando
                          </span>
                          <span>•</span>
                          <span className="text-xs">ID: {match.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleJoinMatch(match.id)}
                        isLoading={joinMatch.isPending}
                        size="sm"
                      >
                        Entrar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-naval-text-secondary">
                    Nenhuma partida disponível no momento
                  </p>
                  <p className="text-sm text-naval-text-muted mt-1">
                    Crie uma nova partida ou desafie um oponente diretamente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
