import { NextResponse } from 'next/server';
import { revokeRefreshToken } from '@/server/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.refreshToken) {
      revokeRefreshToken(body.refreshToken);
    }

    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada correctamente en BFF',
    });
  } catch {
    return NextResponse.json({ success: true });
  }
}
