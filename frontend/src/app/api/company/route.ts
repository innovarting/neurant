/**
 * GET/PUT /api/company - Company Management Endpoints
 */

import { NextRequest } from 'next/server'
import { withAuth, withAdminAccess } from '@/lib/middleware/auth'
import { updateCompanySchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError, validateJsonContentType } from '@/lib/utils/api-errors'

// GET company details (any authenticated user can view their company)
export const GET = withAuth(async (request) => {
  try {
    const company = await AuthService.getCompany(request.user.profile.company_id)
    
    return Response.json({
      data: company
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
})

// PUT update company details (admin+ only)
export const PUT = withAdminAccess(async (request) => {
  try {
    validateJsonContentType(request)
    
    const body = await request.json()
    const data = updateCompanySchema.parse(body)
    
    const company = await AuthService.updateCompany(
      request.user.profile.company_id,
      data
    )
    
    return Response.json({
      message: 'Company updated successfully',
      data: company
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
})