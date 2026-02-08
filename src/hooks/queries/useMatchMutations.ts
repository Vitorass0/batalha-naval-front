// React Query hooks para mutations de match
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '@/services/matchService';
import { SetupShipPayload, ShootPayload, Match } from '@/types/api-responses';

export const useCreateMatchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => matchService.createMatch(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

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

export const usePlaceShipMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ship: SetupShipPayload) => 
      matchService.placeShip(matchId, ship),
    onSuccess: (data: Match) => {
      queryClient.setQueryData(['match', matchId], data);
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
