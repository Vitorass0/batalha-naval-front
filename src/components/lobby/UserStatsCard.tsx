/**
 * User Stats Card Component
 * 
 * Displays user profile statistics including rank, wins, losses, and win rate.
 * Includes skeleton loading state for smooth UX.
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUserProfile, getUserRank, getWinRate } from '@/hooks/queries/useUserProfile';

/**
 * Skeleton loader for stats
 */
const StatSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-6 bg-naval-border rounded w-3/4" />
    <div className="h-4 bg-naval-border rounded w-1/2" />
  </div>
);

/**
 * Individual stat display
 */
interface StatItemProps {
  label: string;
  value: string | number;
  icon: string;
  highlight?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon, highlight }) => (
  <div className="flex items-center gap-3 p-3 rounded-md bg-naval-bg">
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-xs text-naval-text-muted uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-naval-action' : 'text-white'}`}>
        {value}
      </p>
    </div>
  </div>
);

/**
 * User Stats Card
 * 
 * Fetches and displays the current user's game statistics.
 */
export const UserStatsCard: React.FC = () => {
  const { data: user, isLoading, isError } = useUserProfile();

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-naval-error">Erro ao carregar estatísticas</p>
            <p className="text-sm text-naval-text-muted mt-1">
              Tente recarregar a página
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-naval-border rounded-md" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 bg-naval-border rounded-md" />
              <div className="h-20 bg-naval-border rounded-md" />
              <div className="h-20 bg-naval-border rounded-md" />
              <div className="h-20 bg-naval-border rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rank = getUserRank(user.wins);
  const winRate = getWinRate(user.wins, user.gamesPlayed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info & Rank */}
        <div className="flex items-center gap-4 p-4 rounded-md bg-gradient-to-r from-naval-action/20 to-transparent border border-naval-action/30">
          <div className="w-14 h-14 rounded-full bg-naval-action/30 flex items-center justify-center text-2xl">
            🎖️
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-white">{user.username}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">{rank.icon}</span>
              <span className="text-sm font-medium text-naval-action">{rank.title}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatItem
            label="Vitórias"
            value={user.wins}
            icon="🏆"
            highlight
          />
          <StatItem
            label="Derrotas"
            value={user.losses}
            icon="💔"
          />
          <StatItem
            label="Partidas"
            value={user.gamesPlayed}
            icon="🎮"
          />
          <StatItem
            label="Taxa de Vitória"
            value={winRate}
            icon="📈"
            highlight
          />
        </div>

        {/* Progress to next rank */}
        <div className="p-3 rounded-md bg-naval-bg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-naval-text-muted">Progresso para próximo rank</span>
            <span className="text-xs text-naval-text-secondary">{user.wins}/10 vitórias</span>
          </div>
          <div className="h-2 bg-naval-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-naval-action to-naval-action-hover transition-all duration-500"
              style={{ width: `${Math.min((user.wins / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
