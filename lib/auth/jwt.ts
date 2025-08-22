import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface JWTPayload {
  sub: string; // usuario.id
  email: string;
  nome: string;
  perfil: string;
  municipio_id?: string;
  role: 'authenticated';
  scopes: string[];
  iat?: number;
  exp?: number;
}

export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp' | 'role' | 'scopes'>): string {
  const fullPayload: JWTPayload = {
    ...payload,
    role: 'authenticated',
    scopes: ['read', 'write'],
  };
  
  return jwt.sign(fullPayload, JWT_SECRET, {
    expiresIn: '24h',
    algorithm: 'HS256',
  });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function getJWTFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['auth-token'] || null;
}