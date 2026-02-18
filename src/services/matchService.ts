// Serviço de partidas (matches)
import { CreateMatch, SetupMatchRequest } from "@/types/api-requests";
import api from "./api";
import {
  Match,
  MatchListItem,
  CreateMatchResponse,
  SetupShipPayload,
  ShootPayload,
  ShootResponse,
  MatchGameState,
} from "@/types/api-responses";

export const matchService = {
  // Criar nova partida
  async createMatch(initMatch: CreateMatch): Promise<CreateMatchResponse> {
    const { data } = await api.post<CreateMatchResponse>("/match", initMatch);
    return data;
  },

  // Posicionar navio durante o setup
  async placeShip(setup: SetupMatchRequest): Promise<SetupMatchRequest> {
    const { data } = await api.post<SetupMatchRequest>(`/match/setup`, setup);
    return data;
  },

  // Listar partidas disponíveis
  async listMatches(): Promise<MatchListItem[]> {
    const { data } = await api.get<MatchListItem[]>("/match");
    return data;
  },

  //estado atual da partida
  async getMatchState(matchId: string): Promise<MatchGameState> {
    const { data } = await api.get<MatchGameState>(`/match/${matchId}`);
    return data;
  },

  // Realizar ataque
  async shoot(matchId: string, shot: ShootPayload): Promise<ShootResponse> {
    const backendPayload = {
      matchId: matchId,
      x: shot.col,
      y: shot.row,
    };

    const { data } = await api.post<ShootResponse>(
      `/match/shot`,
      backendPayload,
    );
    return data;
  },

  // Desistir
  async cancelMatch(matchId: string): Promise<void> {
    await api.post(`/match/${matchId}/cancel`);
  },

  // Entrar em uma partida existente
  async joinMatch(matchId: string): Promise<Match> {
    const { data } = await api.post<Match>(`/match/${matchId}/join`);
    return data;
  },

  // Obter detalhes de uma partida
  async getMatch(matchId: string): Promise<Match> {
    const { data } = await api.get<Match>(`/match/${matchId}`);
    return data;
  },

  // Confirmar setup (marcar como pronto)
  async confirmSetup(matchId: string): Promise<Match> {
    const { data } = await api.post<Match>(`/match/${matchId}/ready`);
    return data;
  },

  // Desistir da partida
  async forfeit(matchId: string): Promise<Match> {
    const { data } = await api.post<Match>(`/match/${matchId}/forfeit`);
    return data;
  },
};
