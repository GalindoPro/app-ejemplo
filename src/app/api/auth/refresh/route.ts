import { NextResponse } from 'next/server';
import { verifyRefreshToken, createAccessToken, createRefreshToken, revokeRefreshToken } from '@/server/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh Token requerido' },
        { status: 400 }
      );
    }

    const result = verifyRefreshToken(refreshToken);

    if (!result.valid || !result.user) {
      return NextResponse.json(
        { error: 'Refresh Token inválido o expirado. Por favor inicia sesión nuevamente.' },
        { status: 401 }
      );
    }

    // Revoke old refresh token (token rotation)
    revokeRefreshToken(refreshToken);

    // Generate new Access Token (60s) and new Refresh Token (600s)
    const newAccessToken = createAccessToken(result.user, 60);
    const newRefreshToken = createRefreshToken(result.user, 600);

    return NextResponse.json({
      success: true,
      message: 'Token renovado exitosamente vía BFF',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 60,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error al renovar sesión' },
      { status: 500 }
    );
  }
}
