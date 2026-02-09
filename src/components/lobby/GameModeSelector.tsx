/**
 * Game Mode Selector Component
 * 
 * Allows users to select between PvE (VS AI) and PvP (VS Player) game modes.
 * Handles match creation and navigation to the setup phase.
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateMatchMutation, useJoinMatchMutation } from '@/hooks/queries/useMatchMutations';
import { useMatchListQuery } from '@/hooks/queries/useMatchQuery';
import { GameStatus } from '@/types/game-enums';

/**
 * AI Difficulty levels
 */
export type AIDifficulty = 'Basic' | 'Intermediate' | 'ADVANCED';

interface DifficultyOption {
  value: AIDifficulty;
  label: string;
  description: string;
  icon: string;
}

const difficultyOptions: DifficultyOption[] = [
  {
    value: 'Basic',
    label: 'Básico',
    description: 'IA com ataques aleatórios. Ideal para iniciantes.',
    icon: '🎯',
  },
  {
    value: 'Intermediate',
    label: 'Intermediário',
    description: 'IA que busca navios após acertos.',
    icon: '🔥',
  },
  {
    value: 'ADVANCED',
    label: 'Advanced',
    description: 'IA com estratégia de caça otimizada.',
    icon: '⚡',
  },
];

export const GameModeSelector: React.FC = () => {
  const router = useRouter();
  const createMatch = useCreateMatchMutation();
  const joinMatch = useJoinMatchMutation();
  const { data: matches, isLoading: isLoadingMatches } = useMatchListQuery();

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
  
  // PvE State
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('Basic');
  
  // PvP State
  const [opponentId, setOpponentId] = useState('');
  const [pvpError, setPvpError] = useState('');

  /**
   * Handle PvE match creation
   */
  const handleStartTraining = async () => {
  try {
    // Montamos o DTO específico para treino contra IA
    const match = await createMatch.mutateAsync({
      mode: 'Classic',           // Ou 'SOLO', conforme sua API
      aiDifficulty: selectedDifficulty   // Valor opcional que agora faz sentido
    });
    
    // Redireciona usando o ID retornado
    router.push(`/match/${match.matchId}`); 
  } catch (error) {
    console.error('Erro ao iniciar treinamento:', error);
  }
};

  /**
   * Handle PvP challenge
   */
  const handleChallenge = async () => {
    if (!opponentId.trim()) {
      setPvpError('Digite o ID do oponente');
      return;
    }
    
    setPvpError('');
    
    try {
      // Try to join an existing match or create a challenge
      const match = await joinMatch.mutateAsync(opponentId.trim());
      router.push(`/match/${match.id}`);
    } catch (error) {
      console.error('Erro ao desafiar oponente:', error);
      setPvpError('Não foi possível encontrar o oponente');
    }
  };

  return (
    <div className="space-y-6">
      {/* PvE Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            Treinamento (VS IA)
          </CardTitle>
          <CardDescription>
            Aprimore suas habilidades contra a inteligência artificial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Difficulty Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-naval-text-secondary">
              Selecione a Dificuldade
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDifficulty(option.value)}
                  className={`
                    p-4 rounded-md border text-left transition-all duration-200
                    ${selectedDifficulty === option.value
                      ? 'border-naval-action bg-naval-action/10 ring-2 ring-naval-action/50'
                      : 'border-naval-border bg-naval-bg hover:border-naval-action/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{option.icon}</span>
                    <span className="font-semibold text-white">{option.label}</span>
                  </div>
                  <p className="text-xs text-naval-text-muted">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleStartTraining}
            isLoading={createMatch.isPending}
            className="w-full"
            size="lg"
          >
            🚀 Iniciar Treinamento
          </Button>
        </CardContent>
      </Card>

      {/* PvP Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">⚔️</span>
            Desafio (VS Jogador)
          </CardTitle>
          <CardDescription>
            Enfrente outros comandantes em batalhas épicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-naval-text-secondary">
              ID da Partida ou Oponente
            </label>
            <Input
              type="text"
              placeholder="Digite o ID da partida para entrar..."
              value={opponentId}
              onChange={(e) => {
                setOpponentId(e.target.value);
                setPvpError('');
              }}
              error={!!pvpError}
              errorMessage={pvpError}
            />
            <p className="text-xs text-naval-text-muted">
              Ou crie uma nova partida e compartilhe o ID com seu oponente
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleChallenge}
              isLoading={joinMatch.isPending}
              disabled={!opponentId.trim()}
              className="flex-1"
              size="lg"
            >
              ⚔️ Entrar na Partida
            </Button>
            <Button
              onClick={handleStartTraining}
              isLoading={createMatch.isPending}
              variant="outline"
              size="lg"
            >
              ➕ Criar Partida
            </Button>
          </div>
        </CardContent>
      </Card>
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
  );
};

export default GameModeSelector;
