import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

//   console.log('🔍 Middleware executado!');
//   console.log('📍 Pathname:', pathname);
//   console.log('🔑 Token:', token ? 'EXISTE' : 'NÃO EXISTE');

  // Rotas que precisam de autenticação
  const protectedRoutes = ['/dashboard', '/users', '/properties', '/reports'];
  
  // Rotas públicas (login, home)
  const publicRoutes = ['/', '/login'];

  // Se está tentando acessar rota protegida sem token
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    console.log('🚫 Redirecionando para login - sem token');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Se está autenticado e tentando acessar login, redireciona para dashboard
  if (token && publicRoutes.includes(pathname)) {
    console.log('✅ Redirecionando para dashboard - já autenticado');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log('➡️ Permitindo acesso');
  return NextResponse.next();
}

// Expandir o matcher para todas as rotas que queremos proteger
export const config = {
  matcher: ['/', '/dashboard', '/users', '/properties', '/reports', '/login']
};