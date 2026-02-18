/**
 * Game Mode Selector Component
 *
 * Allows users to select between PvE (VS AI) and PvP (VS Player) game modes.
 * Handles match creation and navigation to the setup phase.
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  useCreateMatchMutation,
  useJoinMatchMutation,
} from "@/hooks/queries/useMatchMutations";
import { useMatchListQuery } from "@/hooks/queries/useMatchQuery";
import { MatchStatus } from "@/types/game-enums";
import {
  Badge,
  Bot,
  Brain,
  Gamepad2,
  Globe,
  Plus,
  Radar,
  RefreshCcw,
  Search,
  Swords,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AI Difficulty levels
 */
export type AIDifficulty = "Basic" | "Intermediate" | "Advanced";

interface DifficultyOption {
  value: AIDifficulty;
  label: string;
  description: string;
}

const difficultyOptions: DifficultyOption[] = [
  {
    value: "Basic",
    label: "Básico",
    description: "IA com ataques aleatórios. Ideal para iniciantes.",
  },
  {
    value: "Intermediate",
    label: "Intermediário",
    description: "IA que busca navios após acertos.",
  },
  {
    value: "Advanced",
    label: "Avançado",
    description: "IA com estratégia de caça otimizada.",
  },
];

export const GameModeSelector: React.FC = () => {
  const router = useRouter();
  const createMatch = useCreateMatchMutation();
  const joinMatch = useJoinMatchMutation();
  const { data: matches, isLoading: isLoadingMatches } = useMatchListQuery();

  //TODO: NAO FAZ nada ainda pq n existe um get match no back
  const handleJoinMatch = async (matchId: string) => {
    try {
      //const match = await joinMatch.mutateAsync(matchId);
      //router.push(`/match/${match.id}`);
    } catch (error) {
      //console.error('Erro ao entrar na partida:', error);
    }
  };

  //TODO:
  // Filter available matches (waiting for opponent)
  const availableMatches =
    matches?.filter(
      (match) => match.status === MatchStatus.SETUP && !match.player2, // TODO: tem que ver isso dps
    ) || [];

  // PvE State
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<AIDifficulty>("Basic");

  // PvP State
  const [opponentId, setOpponentId] = useState("");
  const [pvpError, setPvpError] = useState("");

  /**
   * Handle PvE match creation
   */
  const handleStartTraining = async () => {
    try {
      // Montamos o DTO específico para treino contra IA
      const match = await createMatch.mutateAsync({
        mode: "Classic", // Ou 'SOLO', conforme sua API
        aiDifficulty: selectedDifficulty, // Valor opcional que agora faz sentido
      });

      // Redireciona usando o ID retornado
      router.push(`/match/${match.matchId}`);
    } catch (error) {
      console.error("Erro ao iniciar treinamento:", error);
    }
  };

  /**
   * Handle PvP challenge
   */
  const handleChallenge = async () => {
    if (!opponentId.trim()) {
      setPvpError("Digite o ID do oponente");
      return;
    }

    setPvpError("");

    try {
      // Try to join an existing match or create a challenge
      const match = await joinMatch.mutateAsync(opponentId.trim());
      router.push(`/match/${match.id}`);
    } catch (error) {
      console.error("Erro ao desafiar oponente:", error);
      setPvpError("Não foi possível encontrar o oponente");
    }
  };

  return (
    <div className="space-y-6">
      {/* PvE Section */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
          <Bot className="w-64 h-64" />
        </div>
        <CardHeader className="pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-cyan-400  pb-0">
              <Bot className="w-6 h-6" />
              Treinamento (VS IA)
            </CardTitle>
          </div>
          <CardDescription className="text-sm font-small text-slate-400 mb-5">
            Aprimore suas habilidades contra a inteligência artificial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Difficulty Selection */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-300 ">
              Selecione a Dificuldade
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDifficulty(option.value)}
                  className={`
                    overflow-hiddenrelative flex flex-col p-3 rounded-2xl border-2 text-left transition-all hover:bg-slate-800/80 focus:outline-none
                    ${
                      selectedDifficulty === option.value
                        ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] scale-[1.02] z-10 "
                        : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/40 "
                    }
                  `}
                >
                  <div className="flex  items-center gap-2 mb-1 p-1">
                    {option.value === "Basic" && (
                      <Brain className="w-4 h-4 text-emerald-400" />
                    )}
                    {option.value === "Intermediate" && (
                      <Swords className="w-4 h-4 text-orange-400 " />
                    )}
                    {option.value === "Advanced" && (
                      <Zap className="w-4 h-4 text-red-400" />
                    )}
                    <span
                      className={cn(
                        "font-bold text-sm",
                        option.value === "Basic"
                          ? "text-emerald-400"
                          : option.value === "Intermediate"
                            ? "text-orange-400"
                            : "text-red-400",
                      )}
                    >
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug p-1 ">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleStartTraining}
            isLoading={createMatch.isPending}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-800 hover: text-white font-bold h-12 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99]"
            size="lg"
          >
            <Swords className="mr-2 h-5 w-5" />
            Iniciar Treinamento
          </Button>
        </CardContent>
      </Card>

      {/* PvP Section */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Swords className="w-64 h-64" />
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Swords className="w-6 h-6 " />
              Desafio (VS Jogador)
            </CardTitle>
            <Globe className="border-blue-500/30 text-blue-400 bg-blue-500/10 flex gap-1 items-center"></Globe>
          </div>
          <CardDescription className="text-slate-400">
            Enfrente outros comandantes em batalhas épicas
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              ID da Partida ou Oponente
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Digite o ID da partida para entrar..."
                value={opponentId}
                onChange={(e) => {
                  setOpponentId(e.target.value);
                  setPvpError("");
                }}
                error={!!pvpError}
                errorMessage={pvpError}
              />
            </div>
            <p className="text-xs text-slate-500">
              Ou crie uma nova partida e compartilhe o ID com seu oponente
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-800 hover: text-white font-bold h-12 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              onClick={handleChallenge}
              isLoading={joinMatch.isPending}
              disabled={!opponentId.trim()}
              size="lg"
            >
              <Gamepad2 className="mr-2 h-6 w-6 text-white" />
              <p className="text-white">Entrar na Partida</p>
            </Button>
            <Button
              onClick={handleStartTraining}
              isLoading={createMatch.isPending}
              size="lg"
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-800 hover: text-white font-bold h-12 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {" "}
              <Plus className="mr-2 h-5 w-5" />
              Criar Partida
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm min-h-[300px] flex flex-col">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Radar className="w-64 h-64" />
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-cyan-400">
                <Radar className="w-5 h-5" />
                Partidas Disponíveis
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Entre em partidas criadas por outros jogadores
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-cyan-400"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 border-t border-slate-800/50 bg-slate-950/20 m-1 rounded-b-xl">
          {isLoadingMatches ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center justify-between p-4 border border-naval-border rounded-md"
                >
                  <div className="space-y-2">
                    <div className="h-4 bg-naval-border rounded w-32" />
                    <div className="h-3 bg-naval-border rounded w-24" />
                  </div>
                  <div className="h-9 bg-naval-border rounded w-20" />
                </div>
              ))}
            </div>
          ) : availableMatches.length > 0 ? (
            <div className="space-y-3">
              {availableMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 border border-naval-border rounded-md bg-naval-bg hover:border-naval-action/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">
                        {match.player1}
                      </span>
                      <span className="text-naval-text-muted italic">
                        aguardando oponente...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-naval-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        Aguardando
                      </span>
                      <span>•</span>
                      <span className="text-xs">
                        ID: {match.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleJoinMatch(match.id)}
                    isLoading={joinMatch.isPending}
                    size="sm"
                  >
                    Entrar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="relative flex justify-center ">
                <div className="absolute inset-0 bg-cyan-700/20 blur-xl flex justify-center rounded-full animate-pulse"></div>
                <Search className="w-16 h-16 text-cyan-300/50 relative z-10 " />
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="text-lg font-medium text-slate-300">
                  Nenhuma partida encontrada
                </h3>
                <p className="text-sm text-slate-500">
                  Nenhuma partida pública disponível no momento. Crie uma nova
                  partida ou desafie um amigo diretamente.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameModeSelector;
