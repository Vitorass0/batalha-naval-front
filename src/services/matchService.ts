// Serviço de partidas (matches)
import api from './api';
import {
  Match,
  MatchListItem,
  SetupShipPayload,
  ShootPayload,
  ShootResponse,
} from '@/types/api-responses';

export const matchService = {
  // Listar partidas disponíveis
  async listMatches(): Promise<MatchListItem[]> {
    const { data } = await api.get<MatchListItem[]>('/matches');
    return data;
  },

  // Criar nova partida
  async createMatch(): Promise<Match> {
    const { data } = await api.post<Match>('/matches');
    return data;
  },

  // Entrar em uma partida existente
  async joinMatch(matchId: string): Promise<Match> {
    const { data } = await api.post<Match>(`/matches/${matchId}/join`);
    return data;
  },

  // Obter detalhes de uma partida
  async getMatch(matchId: string): Promise<Match> {
    const { data } = await api.get<Match>(`/matches/${matchId}`);
    return data;
  },

  // Posicionar navio durante o setup
  async placeShip(matchId: string, ship: SetupShipPayload): Promise<Match> {
    const { data } = await api.post<Match>(`/matches/${matchId}/setup`, ship);
    return data;
  },

  // Confirmar setup (marcar como pronto)
  async confirmSetup(matchId: string): Promise<Match> {
    const { data } = await api.post<Match>(`/matches/${matchId}/ready`);
    return data;
  },

  // Realizar ataque
  async shoot(matchId: string, shot: ShootPayload): Promise<ShootResponse> {
    const { data } = await api.post<ShootResponse>(
      `/matches/${matchId}/shoot`,
      shot
    );
    return data;
  },

  // Desistir da partida
  async forfeit(matchId: string): Promise<Match> {
    const { data } = await api.post<Match>(`/matches/${matchId}/forfeit`);
    return data;
  },
};
