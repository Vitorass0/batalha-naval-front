/**
 * Leaderboard Component
 * * Displays the top ranking players based on their points and wins.
 * Includes rank progression visualization and skeleton loading states.
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useLeaderboard, getUserRank } from '@/hooks/queries/useUserProfile';

/**
 * Skeleton loader for leaderboard rows
 */
const LeaderboardSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-4 p-3 border border-naval-border rounded-md">
        <div className="w-8 h-8 bg-naval-border rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-naval-border rounded w-1/3" />
          <div className="h-3 bg-naval-border rounded w-1/4" />
        </div>
        <div className="w-12 h-6 bg-naval-border rounded" />
      </div>
    ))}
  </div>
);

/**
 * Individual Leaderboard Row Component
 */
interface PlayerRowProps {
  rankNumber: number;
  username: string;
  points: number;
  wins: number;
  isTopThree?: boolean;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ rankNumber, username, points, wins, isTopThree }) => {
  const rankInfo = getUserRank(wins);
  
  // Highlight colors for top 3
  const rankColors = [
    'bg-yellow-500 text-black', // 1st
    'bg-slate-300 text-black',   // 2nd
    'bg-amber-700 text-white',  // 3rd
  ];

  return (
    <div className={`flex items-center gap-4 p-3 rounded-md border transition-colors ${
      isTopThree 
        ? 'bg-naval-action/10 border-naval-action/30 shadow-[inset_0_0_10px_rgba(var(--naval-action-rgb),0.1)]' 
        : 'bg-naval-bg border-naval-border hover:border-naval-action/50'
    }`}>
      {/* Rank Position Badge */}
      <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
        isTopThree ? rankColors[rankNumber - 1] : 'bg-naval-border text-naval-text-secondary'
      }`}>
        {rankNumber}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white truncate">{username}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px]">{rankInfo.icon}</span>
          <span className="text-[10px] font-medium text-naval-text-muted uppercase tracking-wider">
            {rankInfo.title}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="text-right">
        <p className="text-sm font-mono font-bold text-naval-action">{points} PTS</p>
        <p className="text-[10px] text-naval-text-muted">{wins} Vitórias</p>
      </div>
    </div>
  );
};

/**
 * Leaderboard Card
 * * Fetches and displays the top commanders in the naval fleet.
 */
export const Leaderboard: React.FC = () => {
  const { data: players, isLoading, isError } = useLeaderboard();

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">🏆</span>
            Ranking Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 border-2 border-dashed border-naval-error/30 rounded-lg">
            <p className="text-naval-error font-medium">Erro no radar de frotas</p>
            <p className="text-xs text-naval-text-muted mt-1 uppercase">Sinal interrompido</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">⚓</span>
            LeaderBoard
          </CardTitle>
          <span className="text-[10px] bg-naval-border px-2 py-0.5 rounded text-naval-text-secondary uppercase font-mono">
            Ao Vivo
          </span>
        </div>
        <CardDescription className="text-xs">
          Comandantes com maior pontuação na frota.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : !players || players.length === 0 ? (
          <div className="text-center py-8 text-naval-text-muted italic text-sm">
            Nenhuma atividade de combate registrada.
          </div>
        ) : (
          <div className="space-y-2">
            {players.slice(0, 10).map((player, index) => (
              <PlayerRow
                key={player.userId}
                rankNumber={index + 1}
                username={player.username}
                points={player.points}
                wins={player.wins}
                isTopThree={index < 3}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;