// Serviço de partidas (matches)
import {
  CreateMatch,
  SetupMatchRequest,
  MoveShipRequest,
} from "@/types/api-requests";
import api from "./api";
import {
  Match,
  MatchListItem,
  CreateMatchResponse,
  SetupShipPayload,
  ShootPayload,
  ShootResponse,
  MatchGameState,
  TimeoutCheckResult,
  MatchInviteDto,
} from "@/types/api-responses";

export const matchService = {
  // Criar nova partida
  async createMatch(initMatch: CreateMatch): Promise<CreateMatchResponse> {
    const { data } = await api.post<CreateMatchResponse>("/match", initMatch);
    return data;
  },

  // Posicionar navio durante o setup (legacy — kept for compatibility)
  async placeShip(setup: SetupMatchRequest): Promise<SetupMatchRequest> {
    const { data } = await api.post<SetupMatchRequest>(`/match/setup`, setup);
    return data;
  },

  /**
   * Submit the full fleet placement and mark the player as ready.
   *
   * Sends `POST /match/setup` with `{ matchId, ships }` where each ship
   * follows the `SetupShipPayload` DTO expected by the backend.
   *
   * @returns The raw response data from the API.
   */
  async setupFleet(
    matchId: string,
    ships: SetupShipPayload[],
  ): Promise<SetupMatchRequest> {
    const payload: SetupMatchRequest = { matchId, ships };
    const { data } = await api.post<SetupMatchRequest>("/match/setup", payload);
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

  // Desistir da partida (usa o endpoint /cancel do backend)
  // Se InProgress: conta como derrota para quem desistiu. Retorna 204.
  async forfeit(matchId: string): Promise<void> {
    await api.post(`/match/${matchId}/cancel`);
  },

  // Mover navio (modo Dinâmico)
  async moveShip(request: MoveShipRequest): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
      "/match/move",
      request,
    );
    return data;
  },

  // Verificar timeout de turno
  async checkTimeout(matchId: string): Promise<TimeoutCheckResult> {
    const { data } = await api.post<TimeoutCheckResult>(
      `/match/${matchId}/timeout`,
    );
    return data;
  },

  // Listar convites PvP pendentes
  async getInvites(): Promise<MatchInviteDto[]> {
    const { data } = await api.get<MatchInviteDto[]>("/match/invites");
    return data;
  },
};
