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
    // Polling adaptativo por fase:
    // - SETUP: 3s (PvP precisa detectar quando ambos terminaram o setup)
    // - IN_PROGRESS: 2s (gameplay ativo, precisa de polling rápido)
    // - FINISHED: para de fazer polling
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === MatchStatus.SETUP) return 3000;
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

export const useInvitesQuery = () => {
  return useQuery({
    queryKey: ["matchInvites"],
    queryFn: () => matchService.getInvites(),
    refetchInterval: 5000, // Polling a cada 5s para detectar convites novos
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
