'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { LoginInput, RegisterInput } from '@/types/api-requests';
import { AuthResponse } from '@/types/api-responses';
import { setUsername, deleteUsername, removeToken } from '@/lib/utils';

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

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) setUser(savedUser);
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {

    setUser(data.username);
    
    setUsername(data.username);
    
    document.cookie = `auth-token=${data.accessToken}; path=/; samesite=strict; secure`;
    
    router.push('/lobby');
  };

  const login = async (credentials: LoginInput) => {
    const data = await authService.login(credentials);
    handleAuthSuccess(data);
  };

  const register = async (credentials: RegisterInput) => {
    const data = await authService.register(credentials);
    handleAuthSuccess(data);
  };

  const logout = () => {
    setUser(null);
    deleteUsername();
    removeToken();
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
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