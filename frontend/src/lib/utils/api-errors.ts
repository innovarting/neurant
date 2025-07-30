/**
 * API Error Utilities - NeurAnt
 * 
 * Manejo centralizado de errores para endpoints de API.
 * Incluye handling de errores Supabase, Zod validation y errores custom.
 */

import { z } from 'zod'

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error)

  if (error instanceof APIError) {
    return Response.json(
      { 
        error: error.message, 
        details: error.details 
      },
      { status: error.status }
    )
  }

  if (error instanceof z.ZodError) {
    return Response.json(
      { 
        error: 'Validation error', 
        details: error.errors 
      },
      { status: 400 }
    )
  }

  // Supabase auth errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string }
    
    switch (supabaseError.code) {
      case 'invalid_credentials':
        return Response.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      case 'email_not_confirmed':
        return Response.json(
          { error: 'Please verify your email address' },
          { status: 401 }
        )
      case 'signup_disabled':
        return Response.json(
          { error: 'Sign up is currently disabled' },
          { status: 403 }
        )
      case 'email_address_invalid':
        return Response.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        )
      case 'password_too_short':
        return Response.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        )
      case 'email_address_not_authorized':
        return Response.json(
          { error: 'Email address not authorized' },
          { status: 403 }
        )
      case 'too_many_requests':
        return Response.json(
          { error: 'Too many requests. Please try again later' },
          { status: 429 }
        )
      default:
        return Response.json(
          { error: supabaseError.message || 'Authentication error' },
          { status: 400 }
        )
    }
  }

  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export function validateJsonContentType(request: Request): void {
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    throw new APIError(
      400,
      'Bad Request',
      'Content-Type must be application/json'
    )
  }
}

export function createErrorResponse(
  status: number, 
  message: string, 
  details?: any
): Response {
  return Response.json(
    { error: message, details },
    { status }
  )
}