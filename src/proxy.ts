// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // Solo ejecutar en producción (cuando está desplegado)
  if (process.env.NODE_ENV === 'production') {
    // Vercel y otras plataformas usan el header 'x-forwarded-proto'
    // para indicar el protocolo original de la petición.
    if (req.headers.get('x-forwarded-proto') !== 'https') {
      // Si no es HTTPS, construye la nueva URL y redirige.
      const newUrl = new URL(`https://${req.headers.get('host')}${req.nextUrl.pathname}`);
      return NextResponse.redirect(newUrl.toString(), 301); // 301 = Redirección Permanente
    }
  }

  // Si ya es HTTPS o estás en desarrollo, continúa sin hacer nada.
  return NextResponse.next();
}

// Configuración para que el middleware se ejecute en todas las rutas.
export const config = {
  matcher: '/:path*',
};
