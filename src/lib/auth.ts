// Client-side auth utilities for the ILM2 system

export interface User {
  id: string;
  email: string;
  nome: string;
  perfil: string;
  municipio_id?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Storage keys
const AUTH_TOKEN_KEY = 'ilm2_auth_token';
const AUTH_USER_KEY = 'ilm2_auth_user';

export function getAuthState(): AuthState {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    
    if (!token || !userStr) {
      return { user: null, token: null, isAuthenticated: false };
    }
    
    const user = JSON.parse(userStr);
    return { user, token, isAuthenticated: true };
    
  } catch (error) {
    console.error('Error getting auth state:', error);
    return { user: null, token: null, isAuthenticated: false };
  }
}

export function setAuthState(user: User, token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting auth state:', error);
  }
}

export function clearAuthState(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
}

export async function requestOTPCode(email: string): Promise<{ message: string }> {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth/request-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email: email.trim() }),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao enviar código');
  }
  
  return response.json();
}

export async function verifyOTPCode(email: string, code: string): Promise<{ success: boolean; user: User; token: string; error?: string }> {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, code }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao verificar código');
  }
  
  return data;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    clearAuthState();
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}