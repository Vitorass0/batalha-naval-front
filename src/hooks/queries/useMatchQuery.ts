// React Query hooks para queries de match
import { useQuery } from "@tanstack/react-query";
import { matchService } from "@/services/matchService";
import { MATCH_POLLING_INTERVAL } from "@/lib/constants";
import { MatchStatus } from "@/types/game-enums";

export const useMatchQuery = (matchId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      if (!matchId) return null;
      return await matchService.getMatchState(matchId);
    },
    enabled: !!matchId,
    //se estiver jogando, atualiza a cada 2 segundos.
    //se acabou ou está setup, não precisa de polling agressivo (o setup usa mutation para atualizar).
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === MatchStatus.IN_PROGRESS) return 2000;
      return false;
    },
  });
};

export const useMatchListQuery = () => {
  return useQuery({
    queryKey: ["matches"],
    queryFn: () => matchService.listMatches(), //n faz nada ainda pq isso n existe no back
    refetchInterval: 600000, // Atualiza lista a cada 10 min -> pra n ficar mandando toda hr ja que n ta implementado
  });
};

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { authService } = await import("@/services/authService");
      return authService.getProfile();
    },
  });
};
