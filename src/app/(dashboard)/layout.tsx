// Layout do Dashboard - AuthGuard + Sidebar + UserMenu
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/utils';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { useUserProfile } from '@/hooks/queries/useUserProfile';
import { useAuth } from '@/providers/AuthProvider';
import { log } from 'console';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {logout} = useAuth();

  const { data: user } = useUserProfile();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur ">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
           <a href="#" className="flex items-center gap-2 text-xl font-bold text-slate-100 transition-colors hover:text-cyan-400">
           ⚓
            <span>Batalha Naval</span>
          </a>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/lobby"className="text-cyan-400 transition-colors hover:text-cyan-300">Lobby</Link>
              <Link href="/profile"className="text-slate-400 transition-colors hover:text-slate-100">Perfil</Link>
            </nav>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex flex-col items-end">
                <div className="text-sm font-semibold text-slate-100">{user.username}</div>
                <div className="text-xs text-slate-400">
                  {user.wins}V - {user.losses}D
                </div>
              </div>
            )}
          <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-700 p-0 hover:bg-slate-800">
                <Image src="/mortyy.jpg" alt="@dimas" width={50} height={60} className="relative h-10 w-10 rounded-full border border-slate-700 p-0 hover:bg-slate-800"></Image>
          </Button>
          <Button onClick={handleLogout} variant="outline"size="sm" className="text-red-400 hover:bg-red-950/30 focus:bg-red-950/30 cursor-pointer">
              Logout  {/* dps vou fazer baixando */}
          </Button>  
          
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
