import Link from "next/link";
import { Button } from "@/components/ui/Button"; // Supondo que você já tenha esse componente

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-8">
      <h1 className="text-4xl font-bold tracking-tight text-blue-400">
        Batalha Naval
      </h1>
      <p className="text-slate-400 text-lg">Bem-vindo ao jogo!</p>
      
      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="default" className="w-32">
            Entrar
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="ghost" className="w-32 border border-slate-700">
            Criar conta
          </Button>
        </Link>
      </div>
    </div>
  );
}