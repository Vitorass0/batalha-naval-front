// React Query hooks para mutations de match
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '@/services/matchService';
import { SetupShipPayload, ShootPayload, Match } from '@/types/api-responses';
import { CreateMatch, SetupMatchRequest } from '@/types/api-requests';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

export const useCreateMatchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Recebe o objeto completo (mode, aiDifficulty, etc)
    mutationFn: (config: CreateMatch) => matchService.createMatch(config),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      if (typeof window !== 'undefined') {
        localStorage.setItem('matchId', data.matchId);
      }
    },
  });
};

export const useSetupMatchMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (ships: SetupShipPayload[]) => {

      const storedId = localStorage.getItem('matchId');

      if (!storedId) {throw new Error("Match ID NOT FOUND");
      }

      const requestPayload: SetupMatchRequest = {
        matchId:storedId,
        SetupShipPayload: ships 
      };

      return matchService.placeShip(requestPayload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['match'] });
      
      const matchId = localStorage.getItem('matchId');
      if (matchId) {
        router.push(`/game/${matchId}`);
      }
    },
    onError: (error) => {
      console.error('Erro tático ao posicionar frota:', error);
    }
  });
};
//
export const useJoinMatchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => matchService.joinMatch(matchId),
    onSuccess: (data: Match) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.setQueryData(['match', data.id], data);
    },
  });
};

export const useConfirmSetupMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => matchService.confirmSetup(matchId),
    onSuccess: (data: Match) => {
      queryClient.setQueryData(['match', matchId], data);
    },
  });
};

export const useShootMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shot: ShootPayload) => matchService.shoot(matchId, shot),
    onSuccess: () => {
      // Força refetch imediato após disparo
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    },
  });
};

export const useForfeitMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => matchService.forfeit(matchId),
    onSuccess: (data: Match) => {
      queryClient.setQueryData(['match', matchId], data);
    },
  });
};
