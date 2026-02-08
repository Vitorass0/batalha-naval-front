import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  localStorage.removeItem('token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

export function setRefreshToken(refreshToken: string): void {
  localStorage.setItem('refreshToken', refreshToken);
}
export function removeRefreshToken():void{
  localStorage.removeItem('refreshToken')

}

export function isAuthenticated(): boolean {
  return !!getToken();
}
