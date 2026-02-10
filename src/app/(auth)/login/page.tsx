/**
 * Login Page - Naval Design System
 * 
 * Authentication interface with form validation using react-hook-form + Zod.
 * Follows flat/deep naval aesthetic with no gradients.
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useAuth } from '@/providers/AuthProvider';

// ============================================================================
// Validation Schema
// ============================================================================

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username é obrigatório'),
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// Alert Component (inline for now)
// ============================================================================

interface AlertProps {
  type: 'error' | 'success';
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles = {
    error: 'bg-naval-error/10 border-naval-error text-naval-error',
    success: 'bg-green-500/10 border-green-500 text-green-400',
  };

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-md border ${styles[type]}`}
      role="alert"
    >
      <span className="text-sm">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current hover:opacity-70 transition-opacity"
          aria-label="Fechar alerta"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Login Page Component
// ============================================================================

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
  setError(null);
  try {
    await login(data);
  } catch (err: any) {
    setError(err.message || 'Erro ao fazer login.');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-naval-bg p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-5xl">⚓</div>
          <CardTitle>Batalha Naval</CardTitle>
          <CardDescription className="mt-2">
            Faça login para entrar no jogo
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            {/* username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white"
              >
                Username
              </label>
              <Input
                id="username"
                type="username"
                placeholder="Usuario"
                autoComplete= "username"
                error={!!errors.username}
                errorMessage={errors.username?.message}
                {...register('username')}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white"
              >
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={!!errors.password}
                errorMessage={errors.password?.message}
                {...register('password')}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-naval-text-secondary">
              Não tem uma conta?{' '}
            </span>
            <Link
              href="/register"
              className="text-naval-action hover:underline font-medium transition-colors"
            >
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
