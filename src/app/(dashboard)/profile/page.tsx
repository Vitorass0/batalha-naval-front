/**
 * Profile Page - Career Stats & Medals
 * 
 * Displays comprehensive user statistics, achievements, and earned medals.
 * Features detailed stats visualization and an interactive medal showcase.
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserProfile, getUserRank, getWinRate } from '@/hooks/queries/useUserProfile';
import { MedalBadge } from '@/components/profile/MedalBadge';
import { getUserMedals, getUnlockedMedalCount, sortMedalsByStatus } from '@/lib/medals';

/**
 * Stat Card Component
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  color?: 'success' | 'danger' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color = 'info' }) => {
  const colorClasses = {
    success: 'from-green-500/20 to-green-600/10 border-green-500/30',
    danger: 'from-red-500/20 to-red-600/10 border-red-500/30',
    info: 'from-naval-action/20 to-blue-500/10 border-naval-action/30',
  };

  return (
    <div className={`relative p-4 rounded-lg bg-gradient-to-br border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-naval-text-muted uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-white">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-naval-text-secondary mt-1">
              {trend}
            </p>
          )}
        </div>
        <span className="text-3xl opacity-50">{icon}</span>
      </div>
    </div>
  );
};

/**
 * Profile Page Component
 */
export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUserProfile();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-naval-border rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-naval-border rounded" />
            ))}
          </div>
          <div className="h-96 bg-naval-border rounded" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Erro ao Carregar Perfil
            </h2>
            <p className="text-naval-text-secondary mb-4">
              Não foi possível carregar suas informações
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rank = getUserRank(user.wins);
  const winRate = getWinRate(user.wins, user.gamesPlayed);
  const medals = getUserMedals(user);
  const sortedMedals = sortMedalsByStatus(medals);
  const unlockedCount = getUnlockedMedalCount(medals);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Perfil do Comandante
          </h1>
          <p className="text-naval-text-secondary mt-2 text-lg">
            Sua carreira e conquistas
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/lobby')}
        >
          ← Voltar ao Lobby
        </Button>
      </div>

      {/* Player Identity Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-naval-action to-blue-600 flex items-center justify-center text-4xl border-4 border-naval-action/30">
              ⚓
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1">
                {user.username}
              </h2>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">{rank.icon}</span>
                <span className="text-lg font-semibold text-naval-action">
                  {rank.title}
                </span>
              </div>
              <p className="text-sm text-naval-text-secondary">
                {user.email}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6 px-6 border-l border-naval-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{unlockedCount}</p>
                <p className="text-xs text-naval-text-muted">Medalhas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-naval-action">{winRate}</p>
                <p className="text-xs text-naval-text-muted">Taxa de Vitória</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Vitórias"
          value={user.wins}
          icon="🏆"
          color="success"
          trend={`De ${user.gamesPlayed} partidas`}
        />
        <StatCard
          label="Derrotas"
          value={user.losses}
          icon="💔"
          color="danger"
          trend={`${user.gamesPlayed - user.wins - user.losses} empates`}
        />
        <StatCard
          label="Total de Partidas"
          value={user.gamesPlayed}
          icon="🎮"
          color="info"
          trend="Desde o início"
        />
      </div>

      {/* Detailed Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Estatísticas Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Win Rate Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-naval-text-secondary">
                  Taxa de Vitória
                </span>
                <span className="text-lg font-bold text-naval-action">
                  {winRate}
                </span>
              </div>
              <div className="h-4 bg-naval-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                  style={{ width: winRate }}
                />
              </div>
            </div>

            {/* Additional Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-naval-bg border border-naval-border">
                <p className="text-xs text-naval-text-muted mb-1">Vitórias Consecutivas</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <div className="p-4 rounded-lg bg-naval-bg border border-naval-border">
                <p className="text-xs text-naval-text-muted mb-1">Melhor Sequência</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <div className="p-4 rounded-lg bg-naval-bg border border-naval-border">
                <p className="text-xs text-naval-text-muted mb-1">Total de Acertos</p>
                <p className="text-2xl font-bold text-white">-</p>
              </div>
              <div className="p-4 rounded-lg bg-naval-bg border border-naval-border">
                <p className="text-xs text-naval-text-muted mb-1">Total de Erros</p>
                <p className="text-2xl font-bold text-white">-</p>
              </div>
            </div>

            <p className="text-xs text-naval-text-muted text-center">
              💡 Estatísticas avançadas serão registradas em partidas futuras
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Medals Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎖️</span>
            Medalhas e Conquistas
          </CardTitle>
          <CardDescription>
            {unlockedCount} de {medals.length} medalhas desbloqueadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medals.length > 0 ? (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-naval-text-secondary">
                    Progresso de Conquistas
                  </span>
                  <span className="text-sm font-bold text-naval-action">
                    {Math.round((unlockedCount / medals.length) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-naval-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000"
                    style={{ width: `${(unlockedCount / medals.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Medal Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 justify-items-center">
                {sortedMedals.map((medal) => (
                  <MedalBadge key={medal.id} medal={medal} size="md" />
                ))}
              </div>

              {/* Empty State Hint */}
              {unlockedCount === 0 && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">🌊</div>
                  <p className="text-naval-text-secondary">
                    Jogue suas primeiras partidas para começar a desbloquear medalhas!
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/lobby')}
                  >
                    Ir para o Lobby
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-naval-text-muted">
              Nenhuma medalha disponível
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
