// Componente de Combate (Battle Phase)
"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
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
import {
  MatchStatus,
  CellState,
  ShipOrientation,
  MoveDirection,
} from "@/types/game-enums";
import { GRID_SIZE } from "@/lib/constants";
import { SHIP_NAMES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useTurnTimer } from "@/hooks/useTurnTimer";
import {
  useShootMutation,
  useForfeitMutation,
  useMoveShipMutation,
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

// ─── Helpers para movimentação (Modo Dinâmico) ──────────────────────────────

/** Verifica se um navio está avariado (qualquer célula atingida). */
function isShipDamaged(ship: ShipDto): boolean {
  return ship.coordinates?.some((c) => c.isHit) ?? false;
}

/** Retorna as direções permitidas para um navio com base na orientação. */
function getAllowedDirections(ship: ShipDto): MoveDirection[] {
  if (ship.size <= 1) {
    return [
      MoveDirection.NORTH,
      MoveDirection.SOUTH,
      MoveDirection.EAST,
      MoveDirection.WEST,
    ];
  }
  if (ship.orientation === ShipOrientation.VERTICAL) {
    return [MoveDirection.NORTH, MoveDirection.SOUTH];
  }
  return [MoveDirection.EAST, MoveDirection.WEST];
}

const DIRECTION_LABELS: Record<
  MoveDirection,
  { label: string; arrow: string }
> = {
  [MoveDirection.NORTH]: { label: "Norte", arrow: "↑" },
  [MoveDirection.SOUTH]: { label: "Sul", arrow: "↓" },
  [MoveDirection.EAST]: { label: "Leste", arrow: "→" },
  [MoveDirection.WEST]: { label: "Oeste", arrow: "←" },
};

export default function BattlePhase({ match }: BattlePhaseProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const shoot = useShootMutation(match.id);
  const forfeit = useForfeitMutation(match.id);
  const moveShip = useMoveShipMutation(match.id);
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

  // ─── Estado do Modo Dinâmico ───────────────────────────────────────────────
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [hasMovedThisTurn, setHasMovedThisTurn] = useState(false);
  // Lê o modo de jogo do localStorage (armazenado ao criar a partida).
  // Se não estiver presente (Player B/convidado), assume Dinâmico de forma otimista:
  // caso seja Clássico, o backend retornará erro na primeira tentativa de mover
  // e o painel será ocultado automaticamente.
  const [isDynamicMode, setIsDynamicMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(`gameMode_${match.id}`);
    if (stored === null) return true; // Modo desconhecido (Player B) → otimisticamente Dinâmico
    return stored === "Dynamic";
  });

  const isMyTurn = match.isMyTurn;
  const isFinished = match.status === MatchStatus.FINISHED;
  const isShooting = shoot.isPending;
  const isMoving = moveShip.isPending;

  // Vitória combinada: usa match.isWinner do parent, com fallback do handleAttack
  const resolvedIsWinner = match.isWinner ?? (didIWinByShooting ? true : null);

  // Reseta o estado de movimento quando o turno muda
  useEffect(() => {
    setHasMovedThisTurn(false);
    setSelectedShipId(null);
  }, [isMyTurn]);

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

  // ─── Modo Dinâmico: navio selecionado + highlighted cells ──────────────────
  const selectedShip = useMemo(
    () => myShips.find((s) => s.id === selectedShipId) ?? null,
    [myShips, selectedShipId],
  );

  const highlightedCells = useMemo(() => {
    if (!selectedShip) return undefined;
    const cells = new Set<string>();
    // Backend: x = col, y = row → frontend grid usa [row][col]
    for (const coord of selectedShip.coordinates) {
      cells.add(`${coord.y}-${coord.x}`);
    }
    return cells;
  }, [selectedShip]);

  /** Handler de movimento de navio (Modo Dinâmico) */
  const handleMoveShip = useCallback(
    async (direction: MoveDirection) => {
      if (!selectedShipId || !isMyTurn || isFinished || isMoving) return;

      try {
        await moveShip.mutateAsync({ shipId: selectedShipId, direction });
        setHasMovedThisTurn(true);
        // NÃO reseta o timer: mover não passa o turno — o tempo continua correndo
        addToast("Navio movido com sucesso!", "info", 2000);
      } catch (error: unknown) {
        const err = error as { status?: number; message?: string };
        const msg = err?.message || "Erro ao mover navio.";

        // Detecta se o backend rejeitou por não ser modo Dinâmico
        if (msg.includes("modo Dinâmico") || msg.includes("Dynamic")) {
          setIsDynamicMode(false);
          addToast(
            "Esta partida é no modo Clássico — navios não podem ser movidos.",
            "info",
            4000,
          );
        } else if (err?.status === 409) {
          // Posição de destino já foi alvejada
          if (msg.includes("alvejada") || msg.includes("atingida")) {
            addToast(
              "Posição já atingida! Escolha um destino diferente.",
              "info",
              3000,
            );
          } else {
            addToast(msg, "info", 3000);
          }
        } else {
          addToast(msg, "info", 3000);
        }
      }
    },
    [selectedShipId, isMyTurn, isFinished, isMoving, moveShip, addToast],
  );

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

        // 5b. Modo Dinâmico: acertou → pode mover de novo no próximo sub-turno
        if (result.isHit) {
          setHasMovedThisTurn(false);
          setSelectedShipId(null);
        }

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

  const whoIsWinner = (match: AdaptedMatch) => {
    const p1StatusIsDefeated =
      match.player1Board.ships.length === 6 &&
      match.player1Board.ships.every((ship) => ship.isSunk);
    const p2StatusIsDefeated =
      match.player2Board.ships.length === 6 &&
      match.player2Board.ships.every((ship) => ship.isSunk);
    return p1StatusIsDefeated
      ? "DERROTA"
      : p2StatusIsDefeated
        ? "VITÓRIA"
        : "PARTIDA ENCERRADA POR INATIVIDADE";
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 relative">
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
            <div className="flex justify-center gap-6 mt-4">
              <div className="px-4 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 text-sm font-mono">
                🎯 {match.stats.myHits} acertos
              </div>
              <div className="px-4 py-1.5 rounded-full bg-amber-900/30 border border-amber-700/40 text-amber-400 text-sm font-mono">
                ⚡ {match.stats.myStreak} sequência
              </div>
              <div className="px-4 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/40 text-slate-400 text-sm font-mono">
                💨 {match.stats.myMisses} erros
              </div>
            </div>
          )}

          {/* Tela de Fim de Jogo */}
          {isFinished && (
            <div className="mt-6 text-center">
              <div className="text-5xl font-black mb-4 animate-bounce">
                {whoIsWinner(match)}
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
              opponentShips={opponentShips}
            />
          </div>

          {/* Meu Tabuleiro + Painel de Movimento */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-slate-300 uppercase tracking-widest">⚓ Seu Tabuleiro</h3>
            <Grid
              grid={myGrid}
              readOnly={true}
              showShips={true}
              highlightedCells={highlightedCells}
              ships={myShips}
            />

            {/* ── Painel de Movimento (Modo Dinâmico) ────────────────────── */}
            {isDynamicMode && isMyTurn && !isFinished && (
              <div className="mt-4 w-full max-w-sm bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-purple-400">
                    ⚡ Modo Dinâmico
                  </span>
                  {hasMovedThisTurn && (
                    <span className="text-xs bg-green-700/40 text-green-300 px-2 py-0.5 rounded-full">
                      Movimento realizado
                    </span>
                  )}
                </div>

                {/* Seleção de navio */}
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">
                    Selecione um navio para mover:
                  </p>
                  <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                    {myShips
                      .filter((s) => !s.isSunk)
                      .map((ship) => {
                        const damaged = isShipDamaged(ship);
                        const isSelected = ship.id === selectedShipId;
                        const displayName =
                          SHIP_NAMES[ship.name as keyof typeof SHIP_NAMES] ||
                          ship.name;

                        return (
                          <button
                            key={ship.id}
                            onClick={() =>
                              setSelectedShipId(isSelected ? null : ship.id)
                            }
                            disabled={damaged || hasMovedThisTurn}
                            className={cn(
                              "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all text-left",
                              isSelected
                                ? "bg-cyan-600/30 border border-cyan-500 text-cyan-200"
                                : damaged
                                  ? "bg-red-900/20 border border-red-800/30 text-red-400 cursor-not-allowed opacity-60"
                                  : hasMovedThisTurn
                                    ? "bg-slate-700/30 border border-slate-700 text-slate-500 cursor-not-allowed"
                                    : "bg-slate-700/50 border border-slate-600 text-slate-300 hover:border-cyan-600/50 hover:bg-slate-700/80",
                            )}
                          >
                            <span className="truncate">{displayName}</span>
                            <span className="ml-2 whitespace-nowrap">
                              {damaged
                                ? "🔥 Avariado"
                                : ship.orientation === ShipOrientation.VERTICAL
                                  ? "↕"
                                  : "↔"}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Botões direcionais */}
                {selectedShip && !hasMovedThisTurn && (
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <p className="text-[11px] text-slate-500 mb-1">
                      {selectedShip.size <= 1
                        ? "Submarino: move em qualquer direção"
                        : selectedShip.orientation === ShipOrientation.VERTICAL
                          ? "Vertical: move Norte/Sul"
                          : "Horizontal: move Leste/Oeste"}
                    </p>
                    <div className="grid grid-cols-3 gap-1 w-fit">
                      {/* Linha 1: Norte (centro) */}
                      <div />
                      {getAllowedDirections(selectedShip).includes(
                        MoveDirection.NORTH,
                      ) ? (
                        <button
                          onClick={() => handleMoveShip(MoveDirection.NORTH)}
                          disabled={isMoving}
                          className="w-10 h-10 rounded-lg bg-cyan-700/40 hover:bg-cyan-600/50 border border-cyan-600/50 text-cyan-200 font-bold text-lg transition-all active:scale-90 disabled:opacity-50"
                          title="Mover para Norte"
                        >
                          ↑
                        </button>
                      ) : (
                        <div />
                      )}
                      <div />

                      {/* Linha 2: Oeste (esq) | centro vazio | Leste (dir) */}
                      {getAllowedDirections(selectedShip).includes(
                        MoveDirection.WEST,
                      ) ? (
                        <button
                          onClick={() => handleMoveShip(MoveDirection.WEST)}
                          disabled={isMoving}
                          className="w-10 h-10 rounded-lg bg-cyan-700/40 hover:bg-cyan-600/50 border border-cyan-600/50 text-cyan-200 font-bold text-lg transition-all active:scale-90 disabled:opacity-50"
                          title="Mover para Oeste"
                        >
                          ←
                        </button>
                      ) : (
                        <div />
                      )}
                      <div className="w-10 h-10 rounded-lg bg-slate-700/30 border border-slate-600/30 flex items-center justify-center text-slate-500 text-xs">
                        🚢
                      </div>
                      {getAllowedDirections(selectedShip).includes(
                        MoveDirection.EAST,
                      ) ? (
                        <button
                          onClick={() => handleMoveShip(MoveDirection.EAST)}
                          disabled={isMoving}
                          className="w-10 h-10 rounded-lg bg-cyan-700/40 hover:bg-cyan-600/50 border border-cyan-600/50 text-cyan-200 font-bold text-lg transition-all active:scale-90 disabled:opacity-50"
                          title="Mover para Leste"
                        >
                          →
                        </button>
                      ) : (
                        <div />
                      )}

                      {/* Linha 3: Sul (centro) */}
                      <div />
                      {getAllowedDirections(selectedShip).includes(
                        MoveDirection.SOUTH,
                      ) ? (
                        <button
                          onClick={() => handleMoveShip(MoveDirection.SOUTH)}
                          disabled={isMoving}
                          className="w-10 h-10 rounded-lg bg-cyan-700/40 hover:bg-cyan-600/50 border border-cyan-600/50 text-cyan-200 font-bold text-lg transition-all active:scale-90 disabled:opacity-50"
                          title="Mover para Sul"
                        >
                          ↓
                        </button>
                      ) : (
                        <div />
                      )}
                      <div />
                    </div>
                  </div>
                )}

                {isMoving && (
                  <p className="text-xs text-cyan-400 text-center animate-pulse">
                    Movendo navio...
                  </p>
                )}
              </div>
            )}
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
