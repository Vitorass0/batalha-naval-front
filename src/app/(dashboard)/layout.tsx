// Layout do Dashboard - AuthGuard + Sidebar + UserMenu
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/utils';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { useProfileQuery } from '@/hooks/queries/useMatchQuery';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user } = useProfileQuery();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    authService.logout();
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold">⚓ Batalha Naval</h1>
            <nav className="flex space-x-4">
              <Link
                href="/lobby"
                className="hover:bg-blue-800 px-3 py-2 rounded transition"
              >
                Lobby
              </Link>
              <Link
                href="/profile"
                className="hover:bg-blue-800 px-3 py-2 rounded transition"
              >
                Perfil
              </Link>
            </nav>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-right">
                <div className="font-semibold">{user.username}</div>
                <div className="text-xs text-blue-200">
                  {user.wins}V - {user.losses}D
                </div>
              </div>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-blue-800"
            >
              Sair
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
