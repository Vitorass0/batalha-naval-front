/**
 * Hook de Timer de Turno
 *
 * Gerencia o countdown visual do turno e faz polling do endpoint de timeout.
 * Backend: 31s por turno, 4 timeouts consecutivos = partida cancelada por inatividade.
 *
 * Regras:
 * - Timer local puro: sempre reseta para TURN_TIMEOUT_SECONDS (31s) quando
 *   o turno muda (isMyTurn flipa) ou após atirar com sucesso (resetTimer).
 * - O backend é a fonte de verdade: o endpoint POST /match/{id}/timeout
 *   verifica se 31s reais passaram e aplica o timeout. O timer local é
 *   apenas visual — a decisão final é do servidor.
 * - Quando o timer chega a 0, dispara imediatamente o check de timeout no backend.
 * - Polling de segurança a cada 5s como backup (necessário para PvP,
 *   onde não há background service processando timeouts).
 * - Para jogos contra IA: detecta atividade do oponente via opponentShotCount.
 *   Quando o oponente joga (seja por timeout processado pelo background service
 *   ou gameplay normal), o timer reseta.
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { matchService } from "@/services/matchService";
import { TimeoutCheckResult } from "@/types/api-responses";
import { TURN_TIMEOUT_SECONDS, TIMEOUT_CHECK_INTERVAL } from "@/lib/constants";

interface UseTurnTimerOptions {
  matchId: string;
  isMyTurn: boolean;
  isFinished: boolean;
  /** opponentHits + opponentMisses — detecta quando o oponente jogou (essencial contra IA) */
  opponentShotCount: number;
  onTurnTimeout: (result: TimeoutCheckResult) => void;
  onGameOverByTimeout: (result: TimeoutCheckResult) => void;
}

interface UseTurnTimerReturn {
  /** Segundos restantes no turno atual (0–31) */
  secondsLeft: number;
  /** Porcentagem do tempo restante (0–100) */
  percentage: number;
  /** Se o timer está ativo */
  isActive: boolean;
  /** Se está com pouco tempo (≤ 10s) — só quando é meu turno */
  isWarning: boolean;
  /** Se está crítico (≤ 5s) — só quando é meu turno */
  isCritical: boolean;
  /** Reseta o timer manualmente (chamar após atirar com sucesso) */
  resetTimer: () => void;
}

export function useTurnTimer({
  matchId,
  isMyTurn,
  isFinished,
  opponentShotCount,
  onTurnTimeout,
  onGameOverByTimeout,
}: UseTurnTimerOptions): UseTurnTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState(TURN_TIMEOUT_SECONDS);
  const queryClient = useQueryClient();
  const isCheckingRef = useRef(false);
  const lastTurnRef = useRef(isMyTurn);

  // Rastreia se o timer chegou a 0 (timeout ocorreu localmente)
  const timeoutReachedRef = useRef(false);
  // Rastreia total de tiros do oponente para detectar quando ele jogou
  const lastOpponentShotsRef = useRef(opponentShotCount);

  // Refs para callbacks — evita recriar checkTimeout quando callbacks mudam,
  // o que causava restart do setInterval e impedia o polling de funcionar.
  const onTurnTimeoutRef = useRef(onTurnTimeout);
  const onGameOverByTimeoutRef = useRef(onGameOverByTimeout);
  useEffect(() => {
    onTurnTimeoutRef.current = onTurnTimeout;
  }, [onTurnTimeout]);
  useEffect(() => {
    onGameOverByTimeoutRef.current = onGameOverByTimeout;
  }, [onGameOverByTimeout]);

  // =====================================================================
  // RESET QUANDO O TURNO MUDA (isMyTurn flipa via polling)
  // =====================================================================
  // Quando isMyTurn muda, o turno foi trocado no servidor (por tiro, timeout, etc.).
  // Reseta o timer para o valor cheio — o backend já processou a troca,
  // então um novo período de 31s começa.
  useEffect(() => {
    if (lastTurnRef.current !== isMyTurn) {
      lastTurnRef.current = isMyTurn;
      setSecondsLeft(TURN_TIMEOUT_SECONDS);
      timeoutReachedRef.current = false;
    }
  }, [isMyTurn]);

  // =====================================================================
  // DETECÇÃO DE ATIVIDADE DO OPONENTE (essencial contra IA)
  // =====================================================================
  // Quando opponentShotCount muda, o oponente jogou. Isso pode ter sido:
  //   a) Resposta normal ao meu tiro (handleAttack já chamou resetTimer)
  //   b) Timeout processado pelo AiTimeoutBackgroundService
  //
  // SEMPRE reseta o timer quando o oponente joga.
  // No caso (a), é redundante mas inofensivo.
  // No caso (b), é ESSENCIAL — sem isso o timer fica travado em 0.
  // O toast só aparece quando timeoutReachedRef era true (caso b).
  useEffect(() => {
    if (isFinished) return;
    if (lastOpponentShotsRef.current !== opponentShotCount) {
      const wasTimeout = timeoutReachedRef.current;
      lastOpponentShotsRef.current = opponentShotCount;

      // SEMPRE reseta o timer quando o oponente joga
      setSecondsLeft(TURN_TIMEOUT_SECONDS);
      timeoutReachedRef.current = false;

      if (wasTimeout) {
        // Timeout foi processado pelo servidor e oponente jogou → feedback visual
        onTurnTimeoutRef.current({
          turnSwitched: true,
          isGameOver: false,
          winnerId: null,
          message: isMyTurn
            ? "Tempo esgotado! O oponente jogou automaticamente."
            : "Oponente demorou! Agora é seu turno.",
        });
        queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      }
    }
  }, [opponentShotCount, isFinished, isMyTurn, queryClient, matchId]);

  // Reset manual (após atirar com sucesso)
  const resetTimer = useCallback(() => {
    setSecondsLeft(TURN_TIMEOUT_SECONDS);
    timeoutReachedRef.current = false;
  }, []);

  // Countdown visual — conta para ambos os turnos (feedback visual)
  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished]);

  // =====================================================================
  // VERIFICAÇÃO DE TIMEOUT NO BACKEND
  // =====================================================================
  // Necessário para PvP (onde não há background service).
  // Para IA: redundante mas inofensivo (background service processa primeiro).
  const checkTimeout = useCallback(async () => {
    if (isFinished || isCheckingRef.current) return;

    isCheckingRef.current = true;
    try {
      const result = await matchService.checkTimeout(matchId);

      if (result.isGameOver) {
        onGameOverByTimeoutRef.current(result);
        queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      } else if (result.turnSwitched) {
        onTurnTimeoutRef.current(result);
        setSecondsLeft(TURN_TIMEOUT_SECONDS);
        timeoutReachedRef.current = false;
        queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      } else if (timeoutReachedRef.current) {
        // Timer chegou a 0 mas o backend disse que não houve timeout.
        // Possíveis causas:
        //   1. O AiTimeoutBackgroundService já processou o timeout (race condition)
        //   2. Pequeno drift entre clocks do frontend e backend
        // Força refetch do match para detectar mudanças (opponentShotCount, status, etc.)
        queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      }
    } catch (err) {
      console.warn("[useTurnTimer] Erro ao verificar timeout:", err);
      // Em caso de erro, força refetch para manter o estado atualizado
      if (timeoutReachedRef.current) {
        queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      }
    } finally {
      isCheckingRef.current = false;
    }
  }, [matchId, isFinished, queryClient]);

  // Polling periódico do timeout (a cada 5s) — necessário para PvP
  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(checkTimeout, TIMEOUT_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkTimeout, isFinished]);

  // Disparo IMEDIATO quando o timer chega a 0
  useEffect(() => {
    if (isFinished || secondsLeft > 0) return;
    timeoutReachedRef.current = true;
    checkTimeout();
  }, [secondsLeft, isFinished, checkTimeout]);

  const percentage = (secondsLeft / TURN_TIMEOUT_SECONDS) * 100;

  return {
    secondsLeft,
    percentage,
    isActive: !isFinished,
    isWarning: isMyTurn && secondsLeft <= 10 && secondsLeft > 5,
    isCritical: isMyTurn && secondsLeft <= 5,
    resetTimer,
  };
}
