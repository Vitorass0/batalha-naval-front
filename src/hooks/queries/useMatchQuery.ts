// React Query hooks para queries de match
import { useQuery } from '@tanstack/react-query';
import { matchService } from '@/services/matchService';
import { MATCH_POLLING_INTERVAL } from '@/lib/constants';

export const useMatchQuery = (matchId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => matchService.getMatch(matchId),
    enabled,
    refetchInterval: MATCH_POLLING_INTERVAL,
    refetchIntervalInBackground: true,
  });
};

export const useMatchListQuery = () => {
  return useQuery({
    queryKey: ['matches'],
    queryFn: () => matchService.listMatches(),
    refetchInterval: 5000, // Atualiza lista a cada 5 segundos
  });
};

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { authService } = await import('@/services/authService');
      return authService.getProfile();
    },
  });
};
