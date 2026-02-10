'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { LoginInput, RegisterInput } from '@/types/api-requests';
import { AuthResponse } from '@/types/api-responses';
import { setUsername, removeUsername, removeToken, setToken, setRefreshToken, removeRefreshToken } from '@/lib/utils';
import {  useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: string | null;
  login: (credentials: LoginInput) => Promise<void>;
  register: (credentials: RegisterInput) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient =  useQueryClient();
  const pathname = usePathname();


  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (token && savedUser) {
    setUser(savedUser);
    if (pathname === '/login' || pathname === '/register' || pathname === '/') {
        router.replace('/lobby');
      }
  }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = async (data: AuthResponse) => {
    queryClient.clear();
    console.log("Auth Success Data:", data);
    setUser(data.username);
    setUsername(data.username);
    setToken(data.accessToken);
    setRefreshToken(data.refreshToken)
    console.log("Token set in localStorage (AuthProvider):", data.accessToken);
    console.log("RefreshToken set in localStorage (AuthProvider):", data.refreshToken);
    document.cookie = `auth-token=${data.accessToken}; path=/; samesite=strict;`;
    
    router.replace('/lobby');
  };

  const login = async (credentials: LoginInput) => {
    try {
      const data = await authService.login(credentials);
      await handleAuthSuccess(data);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error; 
    }
  };

  const register = async (credentials: RegisterInput) => {
    try{
      await authService.register(credentials);
      await login(credentials)
    }catch(error){
      console.error("Erro ao Registrar",error);
      throw error;
    }
  };

  const logout = () => {

    setUser(null);
    removeUsername();
    removeToken();
    removeRefreshToken();
    localStorage.removeItem('matchId'); 
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    queryClient.clear();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para facilitar o uso nos componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};