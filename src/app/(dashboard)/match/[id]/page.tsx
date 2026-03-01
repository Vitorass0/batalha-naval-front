// Smart Component Orquestrador da Partida
"use client";

import React, { useEffect, useState, useRef } from "react";
import SetupPhase from "./SetupPhase";
import BattlePhase from "./BattlePhase";
import { useMatchQuery } from "@/hooks/queries/useMatchQuery";
import { useRouter, useParams } from "next/navigation";
import { MatchGameState } from "@/types/api-responses";
import { MatchStatus, CellState } from "@/types/game-enums";

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();

  // Prioridade: ID da URL > ID do LocalStorage
  const urlId = params.id as string;
  const matchId =
    urlId && urlId !== "undefined"
      ? urlId
      : typeof window !== "undefined"
        ? localStorage.getItem("matchId")
        : null;

  // Busca o estado REAL do servidor
  const { data: gameState, isLoading, error } = useMatchQuery(matchId || "");

  // Rastreia o GUID real do jogador para detecção de vitória/derrota.
  // Capturado DURANTE o render (não em useEffect) para estar disponível
  // imediatamente quando adaptGameStateToEntity é chamada no mesmo render.
  const myPlayerIdRef = useRef<string | null>(null);
  if (gameState?.isMyTurn && gameState.currentTurnPlayerId) {
    myPlayerIdRef.current = gameState.currentTurnPlayerId;
  }

  useEffect(() => {
    if (!matchId) {
      router.push("/lobby");
    }
  }, [matchId, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mr-4"></div>
        <span>Sincronizando com o Quartel General...</span>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white gap-4">
        <h2 className="text-xl text-red-500">Falha na Comunicação</h2>
        <p className="text-gray-400">
          Não foi possível carregar os dados da batalha.
        </p>
        <button
          onClick={() => router.push("/lobby")}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Voltar ao Lobby
        </button>
      </div>
    );
  }

  // Converte o DTO do Back para a estrutura visual esperada
  const matchEntity = adaptGameStateToEntity(gameState, myPlayerIdRef.current);

  // Lógica de Seleção de Fase
  if (gameState.status === MatchStatus.SETUP) {
    return <SetupPhase match={matchEntity as any} />;
  }

  if (
    gameState.status === MatchStatus.IN_PROGRESS ||
    gameState.status === MatchStatus.FINISHED
  ) {
    return <BattlePhase match={matchEntity} />;
  }

  return <div>Estado desconhecido: {gameState.status}</div>;
}

function adaptGameStateToEntity(
  dto: MatchGameState,
  myPlayerId: string | null,
) {
  const MY_ID = "me";
  const OPPONENT_ID = "opponent";

  // Detecção robusta de vitória com múltiplas estratégias:
  // 1. Board-based: se todos os navios do oponente afundaram, eu venci (e vice-versa)
  // 2. GUID comparison: winnerId vs myPlayerId capturado durante o jogo
  // 3. Fallback: null (indeterminado) — o BattlePhase pode resolver via handleAttack
  let isWinner: boolean | null = null;
  if (dto.status === MatchStatus.FINISHED) {
    // Estratégia 1: Detecção pelo estado dos tabuleiros (mais confiável para vitória por tiro)
    const opponentShips = dto.opponentBoard?.ships ?? [];
    const myShips = dto.myBoard?.ships ?? [];
    const allOpponentShipsSunk =
      opponentShips.length > 0 && opponentShips.every((s) => s.isSunk);
    const allMyShipsSunk = myShips.length > 0 && myShips.every((s) => s.isSunk);

    if (allOpponentShipsSunk && !allMyShipsSunk) {
      isWinner = true;
    } else if (allMyShipsSunk && !allOpponentShipsSunk) {
      isWinner = false;
    } else if (dto.winnerId && myPlayerId) {
      // Estratégia 2: Comparação de GUID (necessário para timeout/desistência)
      isWinner = dto.winnerId === myPlayerId;
    } else if (dto.winnerId) {
      // Tem vencedor mas não temos nosso ID — indeterminado
      isWinner = null;
    } else {
      // Sem winnerId (empate, erro, etc.)
      isWinner = null;
    }
  }

  return {
    id: dto.matchId,
    status: dto.status,

    currentTurn: dto.isMyTurn ? MY_ID : OPPONENT_ID,
    currentTurnPlayerId: dto.currentTurnPlayerId,
    winnerId: dto.winnerId,
    isWinner,

    player1: {
      id: MY_ID,
      username: "Você",
      isReady: dto.status !== MatchStatus.SETUP,
    },
    player2: {
      id: OPPONENT_ID,
      username: "Oponente",
      isReady: dto.status !== MatchStatus.SETUP,
    },

    player1Board: {
      cells: fixBoardGrid(dto.myBoard.grid),
      ships: dto.myBoard.ships,
    },
    player2Board: {
      cells: fixBoardGrid(dto.opponentBoard.grid),
      ships: dto.opponentBoard.ships,
    },

    isMyTurn: dto.isMyTurn,
    stats: dto.stats,
  };
}

function fixBoardGrid(rawGrid: any[][]): CellState[][] {
  if (!rawGrid || rawGrid.length === 0) return [];

  // O Backend manda int[][], onde o primeiro índice é X (Coluna).
  // O Frontend espera CellState[][], onde o primeiro índice é Y (Linha).
  // Precisamos TRANSPOAR a matriz e CONVERTER os valores.

  const width = rawGrid.length; // X (Colunas no Back)
  const height = rawGrid[0].length; // Y (Linhas no Back)

  // Cria nova matriz [Y][X] (Linha, Coluna)
  const fixedGrid: CellState[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(CellState.WATER));

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // Pega o valor bruto (0, 1, 2, 3...)
      const rawValue = rawGrid[x][y];

      // Converte e Transpõe: fixedGrid[y][x] recebe o valor de rawGrid[x][y]
      fixedGrid[y][x] = mapCellState(rawValue);
    }
  }

  return fixedGrid;
}

function mapCellState(val: number | string): CellState {
  // O Backend usa JsonStringEnumConverter → envia "Water", "Ship", "Hit", "Missed"
  if (typeof val === "string") {
    switch (val) {
      case "Water":
        return CellState.WATER;
      case "Ship":
        return CellState.SHIP;
      case "Hit":
        return CellState.HIT;
      case "Missed":
        return CellState.MISS;
      default:
        return CellState.WATER;
    }
  }

  // Fallback para inteiros (caso o backend mude a serialização)
  switch (val) {
    case 0:
      return CellState.WATER;
    case 1:
      return CellState.SHIP;
    case 2:
      return CellState.HIT;
    case 3:
      return CellState.MISS;
    default:
      return CellState.WATER;
  }
}
