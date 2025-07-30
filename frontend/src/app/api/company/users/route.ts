/**
 * GET /api/company/users - List Company Users Endpoint (Admin+ only)
 */

import { NextRequest } from 'next/server'
import { withAdminAccess } from '@/lib/middleware/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError } from '@/lib/utils/api-errors'

export const GET = withAdminAccess(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const users = await AuthService.getCompanyUsers(
      request.user.profile.company_id,
      search
    )
    
    // Simple pagination (for production, consider using cursor-based pagination)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = users.slice(startIndex, endIndex)
    
    return Response.json({
      data: paginatedUsers,
      total: users.length,
      page,
      limit,
      hasMore: endIndex < users.length
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
})