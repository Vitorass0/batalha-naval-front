// Componente de Combate (Battle Phase)
"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ShipDto, MatchStatsDto, ShootResponse } from "@/types/api-responses";
import { Grid } from "@/components/game/board/Grid";
import { Radar } from "@/components/game/board/Radar";
import { TurnIndicator } from "@/components/game/HUD/TurnIndicator";
import { FleetStatus } from "@/components/game/HUD/FleetStatus";
import { GameControls } from "@/components/game/HUD/GameControls";
import { Button } from "@/components/ui/Button";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { MatchStatus, CellState } from "@/types/game-enums";
import { GRID_SIZE } from "@/lib/constants";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useTurnTimer } from "@/hooks/useTurnTimer";
import {
  useShootMutation,
  useForfeitMutation,
} from "@/hooks/queries/useMatchMutations";

/**
 * Tipo adaptado que vem de adaptGameStateToEntity (page.tsx)
 * Reflete a estrutura REAL que este componente recebe.
 */
interface AdaptedMatch {
  id: string;
  status: MatchStatus;
  currentTurn: string;
  currentTurnPlayerId: string;
  winnerId?: string | null;
  isWinner: boolean | null;
  isMyTurn: boolean;
  player1: { id: string; username: string; isReady: boolean };
  player2: { id: string; username: string; isReady: boolean };
  player1Board: { cells: CellState[][]; ships: ShipDto[] };
  player2Board: { cells: CellState[][]; ships: ShipDto[] };
  stats: MatchStatsDto;
}

interface BattlePhaseProps {
  match: AdaptedMatch;
}

export default function BattlePhase({ match }: BattlePhaseProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const shoot = useShootMutation(match.id);
  const forfeit = useForfeitMutation(match.id);
  const { playHit, playMiss, playSunk, playVictory } = useGameSounds();
  const { messages, addToast, removeToast } = useToast();

  // Estado de animação da célula que acabou de receber disparo
  const [animatingCell, setAnimatingCell] = useState<{
    row: number;
    col: number;
    type: "hit" | "miss";
  } | null>(null);

  // Banner "Navio Afundado!" overlay
  const [sunkBanner, setSunkBanner] = useState<string | null>(null);

  // Rastreia se EU venci via tiro direto (handleAttack retornou isGameOver: true).
  // Essa é a fonte MAIS confiável: se eu atirei e o jogo acabou, eu venci.
  // Usado como fallback caso match.isWinner não esteja determinado corretamente.
  const [didIWinByShooting, setDidIWinByShooting] = useState(false);

  const isMyTurn = match.isMyTurn;
  const isFinished = match.status === MatchStatus.FINISHED;
  const isShooting = shoot.isPending;

  // Vitória combinada: usa match.isWinner do parent, com fallback do handleAttack
  const resolvedIsWinner = match.isWinner ?? (didIWinByShooting ? true : null);

  // Timer de turno + polling de timeout
  // Callbacks são estabilizados internamente via refs no hook — não precisa de useCallback aqui
  const { resetTimer, ...turnTimer } = useTurnTimer({
    matchId: match.id,
    isMyTurn,
    isFinished,
    opponentShotCount:
      (match.stats?.opponentHits ?? 0) + (match.stats?.opponentMisses ?? 0),
    onTurnTimeout: (result) => {
      const msg =
        result.message ||
        (isMyTurn
          ? "Tempo esgotado! Turno passado para o oponente."
          : "Oponente demorou! Agora é seu turno.");
      addToast(msg, "info", 3000);
    },
    onGameOverByTimeout: (result) => {
      const msg = result.message || "Partida encerrada por inatividade.";
      // O toast será mostrado pelo useEffect de game-over quando o polling
      // detectar o status Finished e determinar quem venceu.
      // Aqui apenas invalida os caches para que o polling pegue o estado final.
      addToast(msg, "info", 4000);
      queryClient.invalidateQueries({ queryKey: ["match", match.id] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderBoard"] });
    },
  });

  // Grids - adaptados corretamente
  const myGrid =
    match.player1Board?.cells ??
    Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(CellState.WATER));

  const opponentGrid =
    match.player2Board?.cells ??
    Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(CellState.WATER));

  // Navios
  const myShips = match.player1Board?.ships ?? [];
  const opponentShips = match.player2Board?.ships ?? [];

  /** Handler de ataque com animações, sons e toasts */
  const handleAttack = useCallback(
    async (row: number, col: number) => {
      // Bloqueia se não é meu turno, já está disparando, ou partida encerrada
      if (!isMyTurn || isShooting || isFinished) return;

      try {
        const result: ShootResponse = await shoot.mutateAsync({ row, col });

        // 1. Animação na célula imediatamente
        setAnimatingCell({
          row,
          col,
          type: result.isHit ? "hit" : "miss",
        });

        // 2. Efeito sonoro
        if (result.isSunk) {
          playSunk();
        } else if (result.isHit) {
          playHit();
        } else {
          playMiss();
        }

        // 3. Toast com a mensagem do backend
        if (result.message) {
          const toastType = result.isSunk
            ? "sunk"
            : result.isHit
              ? "hit"
              : "miss";
          addToast(result.message, toastType);
        }

        // 4. Banner de navio afundado
        if (result.isSunk) {
          setSunkBanner("Navio Afundado!");
          setTimeout(() => setSunkBanner(null), 2500);
        }

        // 5. Reseta o timer após tiro bem-sucedido (turno muda)
        resetTimer();

        // 6. Game Over — se EU atirei e o jogo acabou, EU venci.
        //    Marca a ref IMEDIATAMENTE para que o banner e o useEffect
        //    de game-over usem essa info como fallback.
        if (result.isGameOver) {
          setDidIWinByShooting(true);
          // Invalida cache de perfil e leaderboard para refletir novo resultado
          queryClient.invalidateQueries({ queryKey: ["userProfile"] });
          queryClient.invalidateQueries({ queryKey: ["leaderBoard"] });
        }

        // Limpa animação da célula após o tempo da animação CSS
        setTimeout(() => setAnimatingCell(null), 600);
      } catch (error: unknown) {
        const err = error as { status?: number; message?: string };
        // Erro 409 = Já atirou nessa posição
        if (err?.status === 409) {
          addToast(
            "Você já atirou nessa posição! Escolha outra.",
            "info",
            2500,
          );
        } else {
          const errorMessage =
            err?.message || "Erro ao processar disparo. Tente novamente.";
          addToast(errorMessage, "info");
        }
        console.error("Erro ao atacar:", error);
      }
    },
    [
      isMyTurn,
      isShooting,
      isFinished,
      shoot,
      playHit,
      playMiss,
      playSunk,
      addToast,
      queryClient,
      resetTimer,
    ],
  );

  const handleForfeit = async () => {
    if (confirm("Tem certeza que deseja desistir?")) {
      try {
        await forfeit.mutateAsync();
        router.push("/lobby");
      } catch (error) {
        console.error("Erro ao desistir:", error);
        addToast("Erro ao desistir da partida.", "info");
      }
    }
  };

  // Detecta game over via polling (quando o oponente vence, timeout, ou meu tiro vencedor)
  // Usa resolvedIsWinner que combina match.isWinner (parent) + didIWinByShootingRef (fallback)
  const gameOverHandledRef = useRef(false);
  useEffect(() => {
    if (isFinished && !gameOverHandledRef.current) {
      gameOverHandledRef.current = true;

      // Invalida cache de perfil e leaderboard para manter stats atualizados
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderBoard"] });

      if (resolvedIsWinner === true) {
        playVictory();
        addToast("Você venceu a batalha!", "victory", 5000);
      } else if (resolvedIsWinner === false) {
        addToast("Você perdeu a batalha.", "defeat", 5000);
      }
      // Se resolvedIsWinner === null, não mostra toast (indeterminado, raro)
    }
  }, [isFinished, resolvedIsWinner, addToast, playVictory, queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-8 relative">
      {/* Toast Container */}
      <ToastContainer messages={messages} onRemove={removeToast} />

      {/* Banner "Navio Afundado!" overlay */}
      {sunkBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-sunk-banner bg-gradient-to-r from-orange-600 to-red-700 text-white px-12 py-6 rounded-2xl shadow-2xl border-4 border-orange-400">
            <div className="text-5xl font-black tracking-wider text-center">
              🔥 {sunkBanner} 🔥
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header com indicador de turno */}
        <div className="mb-8">
          <TurnIndicator
            isYourTurn={isMyTurn && !isFinished}
            playerName={match.player1.username}
            opponentName={match.player2.username}
            secondsLeft={turnTimer.secondsLeft}
            percentage={turnTimer.percentage}
            isWarning={turnTimer.isWarning}
            isCritical={turnTimer.isCritical}
          />

          {/* Stats compactas */}
          {match.stats && (
            <div className="flex justify-center gap-8 mt-4 text-sm">
              <div className="text-green-400">
                Acertos: {match.stats.myHits} | Sequência:{" "}
                {match.stats.myStreak}
              </div>
              <div className="text-red-400">Erros: {match.stats.myMisses}</div>
            </div>
          )}

          {/* Tela de Fim de Jogo */}
          {isFinished && (
            <div className="mt-6 text-center">
              <div className="text-5xl font-black mb-4 animate-bounce">
                {resolvedIsWinner === true
                  ? "VITÓRIA!"
                  : resolvedIsWinner === false
                    ? "DERROTA"
                    : "PARTIDA ENCERRADA POR INATIVIDADE"}
              </div>
              <Button onClick={() => router.push("/lobby")} size="lg">
                Voltar ao Lobby
              </Button>
            </div>
          )}
        </div>

        {/* Grid lado a lado */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Radar do Oponente (ataque) */}
          <div className="flex justify-center">
            <Radar
              opponentGrid={opponentGrid}
              onAttack={handleAttack}
              isYourTurn={isMyTurn && !isFinished}
              isLoading={isShooting}
              animatingCell={animatingCell}
            />
          </div>

          {/* Meu Tabuleiro (somente leitura) */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-white">Seu Tabuleiro</h3>
            <Grid grid={myGrid} readOnly={true} showShips={true} />
          </div>
        </div>

        {/* Status das Frotas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {myShips.length > 0 && (
            <FleetStatus ships={myShips} title="Sua Frota" />
          )}
          {opponentShips.length > 0 && (
            <FleetStatus ships={opponentShips} title="Frota do Oponente" />
          )}
        </div>

        {/* Controles */}
        {!isFinished && (
          <div className="flex justify-center">
            <GameControls onForfeit={handleForfeit} />
          </div>
        )}
      </div>
    </div>
  );
}
