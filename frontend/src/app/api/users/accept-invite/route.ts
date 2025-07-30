/**
 * POST /api/users/accept-invite - Accept User Invitation Endpoint
 */

import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { acceptInviteSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError, validateJsonContentType } from '@/lib/utils/api-errors'

export const POST = withAuth(async (request) => {
  try {
    validateJsonContentType(request)
    
    const body = await request.json()
    const data = acceptInviteSchema.parse(body)
    
    const invitation = await AuthService.acceptInvitation(data.token, request.user.id)
    
    return Response.json({
      message: 'Invitation accepted successfully',
      data: invitation
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
})

// GET endpoint to validate invitation token (without auth)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return Response.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      )
    }
    
    const invitation = await AuthService.validateInvitationToken(token)
    
    if (!invitation) {
      return Response.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }
    
    return Response.json({
      data: {
        email: invitation.email,
        role: invitation.role,
        company: invitation.company,
        expires_at: invitation.expires_at
      }
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
}