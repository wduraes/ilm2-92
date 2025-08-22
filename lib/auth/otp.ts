import bcrypt from 'bcryptjs';
import { featureFlags } from '@/lib/config/featureFlags';

export function generateOTPCode(): string {
  if (featureFlags.DEV_MODE) {
    return '123456';
  }
  
  // Generate random 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashOTPCode(code: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(code, saltRounds);
}

export async function verifyOTPCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function getOTPExpiry(): Date {
  // 5 minutes from now
  return new Date(Date.now() + 5 * 60 * 1000);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}