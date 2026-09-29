import { NextResponse } from 'next/server';
import { verifyToken } from '@/server/auth';
import productsData from '@/shared/data/products.json';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

  // Si se envía token, validamos su vigencia
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const check = verifyToken(token);

    if (!check.valid) {
      if (check.expired) {
        return NextResponse.json(
          {
            error: 'Access Token expirado. Renueve su token vía /api/auth/refresh.',
            code: 'TOKEN_EXPIRED',
          },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Access Token inválido.', code: 'TOKEN_INVALID' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      source: 'BFF-NextJS-BackendProxy',
      data: productsData,
      authenticated: true,
      requestedBy: check.payload?.email,
    });
  }

  // Si no se envía token (acceso público al catálogo)
  return NextResponse.json({
    success: true,
    source: 'BFF-NextJS-BackendProxy',
    data: productsData,
    authenticated: false,
  });
}
