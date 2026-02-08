/**
 * Register Page - Naval Design System
 * 
 * User registration interface with form validation using react-hook-form + Zod.
 * Follows flat/deep naval aesthetic with 100% visual consistency with Login page.
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { authService } from '@/services/authService';
import { setToken } from '@/lib/utils';

// ============================================================================
// Validation Schema
// ============================================================================

const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Nome de usuário é obrigatório')
      .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
      .max(20, 'Nome de usuário deve ter no máximo 20 caracteres')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Nome de usuário deve conter apenas letras, números e underscores'
      ),
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Digite um email válido'),
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================================================
// Alert Component (reused from Login)
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
// Register Page Component
// ============================================================================

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);

    try {
      const response = await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      // Persist token (UI layer responsibility)
      setToken(response.token);

      // Navigate to lobby
      router.push('/lobby');
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Erro ao criar conta. Tente novamente.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-naval-bg p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-5xl">⚓</div>
          <CardTitle>Batalha Naval</CardTitle>
          <CardDescription className="mt-2">
            Crie sua conta para entrar no jogo
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

            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white"
              >
                Nome de usuário
              </label>
              <Input
                id="username"
                type="text"
                placeholder="jogador123"
                autoComplete="username"
                error={!!errors.username}
                errorMessage={errors.username?.message}
                {...register('username')}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                error={!!errors.email}
                errorMessage={errors.email?.message}
                {...register('email')}
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
                autoComplete="new-password"
                error={!!errors.password}
                errorMessage={errors.password?.message}
                {...register('password')}
              />
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-white"
              >
                Confirmar senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-naval-text-secondary">
              Já tem uma conta?{' '}
            </span>
            <Link
              href="/login"
              className="text-naval-action hover:underline font-medium transition-colors"
            >
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
