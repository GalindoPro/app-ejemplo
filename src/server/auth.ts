import usersData from '@/shared/data/users.json';
import { UserDTO } from '@/modules/auth/dtos/user.dto';

export interface TokenPayload {
  userId: string;
  email: string;
  roleCode: 'ADMIN' | 'LIMITED';
  fullName: string;
  exp: number; // Unix timestamp in seconds
  iat: number;
}

// In-memory active refresh tokens store
const validRefreshTokens = new Set<string>();

/**
 * Base64 helper for encoding/decoding token payloads
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Generate a short-lived Access Token (default 60 seconds / 1 min for demo)
 */
export function createAccessToken(user: UserDTO, expiresInSeconds: number = 60): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    roleCode: user.roleCode,
    fullName: user.fullName,
    iat,
    exp,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  // Simple signature token representation for demonstration
  const signature = base64UrlEncode(`sig_${user.id}_${exp}`);
  return `${header}.${body}.${signature}`;
}

/**
 * Generate a longer-lived Refresh Token (default 600 seconds / 10 mins)
 */
export function createRefreshToken(user: UserDTO, expiresInSeconds: number = 600): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    roleCode: user.roleCode,
    fullName: user.fullName,
    iat,
    exp,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'REFRESH' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode(`ref_${user.id}_${Date.now()}`);
  const token = `${header}.${body}.${signature}`;

  validRefreshTokens.add(token);
  return token;
}

/**
 * Verify token and check expiration
 */
export function verifyToken(token: string): { valid: boolean; payload: TokenPayload | null; expired: boolean } {
  try {
    if (!token) return { valid: false, payload: null, expired: false };

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, payload: null, expired: false };
    }

    const payload: TokenPayload = JSON.parse(base64UrlDecode(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      return { valid: false, payload, expired: true };
    }

    return { valid: true, payload, expired: false };
  } catch {
    return { valid: false, payload: null, expired: false };
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { valid: boolean; user: UserDTO | null } {
  const check = verifyToken(token);
  if (!check.valid || !check.payload) {
    return { valid: false, user: null };
  }

  const user = (usersData as UserDTO[]).find((u) => u.id === check.payload?.userId);
  if (!user || !user.isActive) {
    return { valid: false, user: null };
  }

  return { valid: true, user };
}

/**
 * Revoke refresh token
 */
export function revokeRefreshToken(token: string): void {
  validRefreshTokens.delete(token);
}

/**
 * Find user by email & password
 */
export function findUserByCredentials(email: string, pass: string): UserDTO | null {
  const user = (usersData as UserDTO[]).find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass
  );
  if (!user || !user.isActive) return null;
  return user;
}
