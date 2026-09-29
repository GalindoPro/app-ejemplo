import { NextResponse } from 'next/server';
import { findUserByCredentials, createAccessToken, createRefreshToken } from '@/server/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    const user = findUserByCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas o usuario inactivo' },
        { status: 401 }
      );
    }

    // Generate short-lived Access Token (60s) & Refresh Token (600s)
    const accessToken = createAccessToken(user, 60);
    const refreshToken = createRefreshToken(user, 600);

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleCode: user.roleCode,
      isActive: user.isActive,
    };

    return NextResponse.json({
      success: true,
      message: 'Autenticación exitosa vía BFF',
      user: safeUser,
      accessToken,
      refreshToken,
      expiresIn: 60,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error interno en el servidor BFF' },
      { status: 500 }
    );
  }
}
