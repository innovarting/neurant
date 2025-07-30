/**
 * Supabase Middleware - Manejo de autenticación en rutas
 * 
 * Este middleware se ejecuta en cada request y:
 * - Refresca tokens de sesión automáticamente
 * - Protege rutas que requieren autenticación
 * - Maneja redirects de autenticación
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components  
  const { data: { session }, error } = await supabase.auth.getSession()

  // Log session status para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔐 Auth middleware - Path: ${req.nextUrl.pathname}, Session: ${session ? 'active' : 'none'}`)
  }

  // Rutas que requieren autenticación
  const protectedRoutes = [
    '/dashboard',
    '/chatbots',
    '/conversations',
    '/analytics',
    '/settings',
    '/api/protected'
  ]

  // Rutas de autenticación (redirect si ya está logueado)
  const authRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Si está en ruta protegida y no tiene sesión, redirect a login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si está en ruta de auth y ya tiene sesión, redirect a dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Manejo especial para API routes protegidas
  if (req.nextUrl.pathname.startsWith('/api/protected') && !session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    )
  }

  // Log de errores de sesión
  if (error) {
    console.error('Middleware auth error:', error)
  }

  return supabaseResponse
}

// Rutas donde se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

/**
 * Helper para verificar si una ruta está protegida
 */
export function isProtectedPath(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/chatbots',
    '/conversations',
    '/analytics',
    '/settings'
  ]
  
  return protectedPaths.some(path => pathname.startsWith(path))
}

/**
 * Helper para verificar si una ruta es de autenticación
 */
export function isAuthPath(pathname: string): boolean {
  const authPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password'
  ]
  
  return authPaths.some(path => pathname.startsWith(path))
}