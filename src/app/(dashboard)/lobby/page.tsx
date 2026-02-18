/**
 * Lobby Page - Naval Battle Command Center
 *
 * Dashboard page where authenticated users can:
 * - View their statistics and rank
 * - Start PvE training matches against AI
 * - Challenge other players in PvP matches
 * - Browse available matches
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useJoinMatchMutation } from "@/hooks/queries/useMatchMutations";
import { MatchStatus } from "@/types/game-enums";
import { UserStatsCard } from "@/components/lobby/UserStatsCard";
import { GameModeSelector } from "@/components/lobby/GameModeSelector";
import { LeaderBoardResponse } from "@/types/api-responses";
import { Leaderboard } from "@/components/lobby/LeaderBoard";
import { ScrollText, User, Zap } from "lucide-react";

export default function LobbyPage() {
  const router = useRouter();

  return (
    <div className="display-flex max-w-100vw mx-auto  ">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Centro de Comando
        </h1>
      </div>

      {/* Main Grid Layout - 2 columns on desktop, 1 on mobile */}
      <div className="flex center space-evenly gap-6 ">
        {/* Left Column - User Stats */}
        <div className="span-4 space-y-6">
          <UserStatsCard />

          {/* Quick Actions */}
          <Card className="p-2 pl-5  rounded-md border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl overflow-hidden h-half">
            <CardHeader className="pb-3 px-5 ">
              <CardTitle className="flex items-center gap-5 text-cyan-400">
                <Zap className="w-6 h-6" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1 space-y-3 justify-start">
              <Button
                variant="link"
                className="w-full p-4 justify-start text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50 transition-all group"
                onClick={() => router.push("/profile")}
              >
                <User className=" mr-3 h-6 w-6 text-white-500 group-hover:text-white-400" />
                Ver Perfil Completo
              </Button>
              <Button
                variant="link"
                className="w-full p-4 justify-start text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50 transition-all group"
                onClick={() => router.push("/lobby")}
              >
                <ScrollText className="mr-3 h-6 w-6 text-purple-500 group-hover:text-purple-400" />
                Histórico de Batalhas (FALTA NO BACK) {/** TODO:IMLEMENT */}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Battle Station */}
        <div className="display-flex center gap-10">
          {/* Section Header */}
          {/* Game Mode Selector */}
          <GameModeSelector />
          {/* Available Matches List */}
        </div>
        <div className="display-flex center h-full ">
          <Leaderboard></Leaderboard>
        </div>
      </div>
    </div>
  );
}
