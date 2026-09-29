import { NextResponse } from 'next/server';
import { verifyToken } from '@/server/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force');
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

  // If testing forced 401 on demand
  if (force === 'true') {
    return NextResponse.json(
      {
        error: 'Simulación: 401 Unauthorized (Token Expirado Forzado para Prueba de Video).',
        code: 'TOKEN_EXPIRED',
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'No autorizado. Se requiere token Bearer.', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const check = verifyToken(token);

  if (!check.valid) {
    return NextResponse.json(
      {
        error: 'Access Token expirado o inválido.',
        code: check.expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: '¡Petición completada con éxito tras la validación / renovación del Token!',
    user: check.payload,
    timestamp: new Date().toISOString(),
    status: 'AUTHENTICATED_OK',
  });
}
