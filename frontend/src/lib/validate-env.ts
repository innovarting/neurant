/**
 * Environment Variables Validation
 * 
 * Validates that all required environment variables are present
 * and properly formatted for the current environment.
 */

import { getEnvironment, createLogger } from './environment'

const logger = createLogger('env-validation')

/**
 * Required environment variables for all environments
 */
interface RequiredEnvVars {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  NEXT_PUBLIC_APP_ENV: string
  NEXT_PUBLIC_APP_URL: string
}

/**
 * Optional environment variables with defaults
 */
interface OptionalEnvVars {
  NEXT_PUBLIC_APP_NAME: string
  NEXT_PUBLIC_APP_VERSION: string
  NODE_ENV: string
  NEXT_TELEMETRY_DISABLED: string
}

/**
 * Future integration variables (not required yet)
 */
interface FutureEnvVars {
  OPENAI_API_KEY?: string
  N8N_WEBHOOK_URL?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  SENTRY_DSN?: string
  NEXT_PUBLIC_ANALYTICS_ID?: string
}

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  environment: string
  requiredVars: Partial<RequiredEnvVars>
  optionalVars: Partial<OptionalEnvVars>
  futureVars: FutureEnvVars
}

/**
 * Validate a single environment variable
 */
function validateVar(
  name: string, 
  value: string | undefined, 
  required: boolean = true
): { isValid: boolean; error?: string; warning?: string } {
  if (!value) {
    if (required) {
      return { isValid: false, error: `Missing required environment variable: ${name}` }
    } else {
      return { isValid: true, warning: `Optional environment variable not set: ${name}` }
    }
  }

  // Specific validation rules
  switch (name) {
    case 'NEXT_PUBLIC_SUPABASE_URL':
      if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
        return { 
          isValid: false, 
          error: `Invalid Supabase URL format: ${name}. Should be https://project-id.supabase.co`
        }
      }
      break
      
    case 'NEXT_PUBLIC_SUPABASE_ANON_KEY':
    case 'SUPABASE_SERVICE_ROLE_KEY':
      if (value.length < 100) {
        return {
          isValid: false,
          error: `Invalid JWT token format: ${name}. Token appears too short`
        }
      }
      break
      
    case 'NEXT_PUBLIC_APP_ENV':
      if (!['development', 'preview', 'production'].includes(value)) {
        return {
          isValid: false,
          error: `Invalid environment value: ${name}. Must be 'development', 'preview', or 'production'`
        }
      }
      break
      
    case 'NEXT_PUBLIC_APP_URL':
      try {
        new URL(value)
      } catch {
        return {
          isValid: false,
          error: `Invalid URL format: ${name}. Must be a valid URL`
        }
      }
      break
  }

  return { isValid: true }
}

/**
 * Validate all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const env = getEnvironment()
  const errors: string[] = []
  const warnings: string[] = []
  
  logger.debug('Starting environment validation for:', env)

  // Required variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_ENV',
    'NEXT_PUBLIC_APP_URL'
  ]

  // Optional variables with defaults
  const optionalVars = [
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_VERSION',
    'NODE_ENV',
    'NEXT_TELEMETRY_DISABLED'
  ]

  // Future variables (not required yet)
  const futureVars = [
    'OPENAI_API_KEY',
    'N8N_WEBHOOK_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SENTRY_DSN',
    'NEXT_PUBLIC_ANALYTICS_ID'
  ]

  const result: ValidationResult = {
    isValid: true,
    errors,
    warnings,
    environment: env,
    requiredVars: {},
    optionalVars: {},
    futureVars: {}
  }

  // Validate required variables
  for (const varName of requiredVars) {
    const value = process.env[varName]
    const validation = validateVar(varName, value, true)
    
    if (!validation.isValid) {
      errors.push(validation.error!)
      result.isValid = false
    } else {
      result.requiredVars[varName as keyof RequiredEnvVars] = value!
    }
  }

  // Validate optional variables
  for (const varName of optionalVars) {
    const value = process.env[varName]
    const validation = validateVar(varName, value, false)
    
    if (validation.warning) {
      warnings.push(validation.warning)
    }
    
    if (value) {
      result.optionalVars[varName as keyof OptionalEnvVars] = value
    }
  }

  // Check future variables (no validation, just logging)
  for (const varName of futureVars) {
    const value = process.env[varName]
    if (value) {
      result.futureVars[varName as keyof FutureEnvVars] = value
      logger.debug(`Future integration variable found: ${varName}`)
    }
  }

  // Environment-specific validations
  if (env === 'production') {
    // Production should use PROD database
    if (result.requiredVars.NEXT_PUBLIC_SUPABASE_URL?.includes('wydcmmsxdhentmoxthnu')) {
      warnings.push('Production environment is using DEV database. This might be intentional for testing.')
    }
    
    // Production should have HTTPS URL
    if (result.requiredVars.NEXT_PUBLIC_APP_URL && !result.requiredVars.NEXT_PUBLIC_APP_URL.startsWith('https://')) {
      errors.push('Production environment must use HTTPS URL')
      result.isValid = false
    }
  }

  if (env === 'development') {
    // Development should use DEV database
    if (result.requiredVars.NEXT_PUBLIC_SUPABASE_URL?.includes('ewyyekypuzgurwgnouxp')) {
      warnings.push('Development environment is using PROD database. This is not recommended.')
    }
  }

  // Log results
  if (result.isValid) {
    logger.info(`✅ Environment validation passed for ${env}`)
    if (warnings.length > 0) {
      logger.warn(`⚠️ Warnings found:`, warnings)
    }
  } else {
    logger.error(`❌ Environment validation failed for ${env}:`, errors)
  }

  return result
}

/**
 * Validate environment and throw on failure
 */
export function validateEnvironmentStrict(): RequiredEnvVars {
  const result = validateEnvironment()
  
  if (!result.isValid) {
    throw new Error(`Environment validation failed:\n${result.errors.join('\n')}`)
  }
  
  return result.requiredVars as RequiredEnvVars
}

/**
 * Get validated environment variables with defaults
 */
export function getValidatedEnv() {
  const result = validateEnvironment()
  
  if (!result.isValid) {
    logger.error('Environment validation failed, using defaults where possible')
  }
  
  return {
    // Required (validated)
    NEXT_PUBLIC_SUPABASE_URL: result.requiredVars.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: result.requiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: result.requiredVars.SUPABASE_SERVICE_ROLE_KEY || '',
    NEXT_PUBLIC_APP_ENV: result.requiredVars.NEXT_PUBLIC_APP_ENV || 'development',
    NEXT_PUBLIC_APP_URL: result.requiredVars.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    
    // Optional (with defaults)
    NEXT_PUBLIC_APP_NAME: result.optionalVars.NEXT_PUBLIC_APP_NAME || 'NeurAnt',
    NEXT_PUBLIC_APP_VERSION: result.optionalVars.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    NODE_ENV: result.optionalVars.NODE_ENV || 'development',
    
    // Future integrations
    ...result.futureVars,
    
    // Validation metadata
    _validation: {
      isValid: result.isValid,
      environment: result.environment,
      errors: result.errors,
      warnings: result.warnings
    }
  }
}

/**
 * Runtime environment check (for debugging)
 */
export function debugEnvironment() {
  const result = validateEnvironment()
  
  console.group('🔍 Environment Debug Information')
  console.log('Environment:', result.environment)
  console.log('Validation Status:', result.isValid ? '✅ Valid' : '❌ Invalid')
  
  if (result.errors.length > 0) {
    console.group('❌ Errors')
    result.errors.forEach(error => console.error(error))
    console.groupEnd()
  }
  
  if (result.warnings.length > 0) {
    console.group('⚠️ Warnings')
    result.warnings.forEach(warning => console.warn(warning))
    console.groupEnd()
  }
  
  console.group('📋 Required Variables')
  Object.entries(result.requiredVars).forEach(([key, value]) => {
    const maskedValue = key.includes('KEY') ? '***masked***' : value
    console.log(`${key}: ${maskedValue}`)
  })
  console.groupEnd()
  
  if (Object.keys(result.futureVars).length > 0) {
    console.group('🔮 Future Variables')
    Object.entries(result.futureVars).forEach(([key, value]) => {
      const maskedValue = key.includes('KEY') || key.includes('SECRET') ? '***masked***' : value
      console.log(`${key}: ${maskedValue}`)
    })
    console.groupEnd()
  }
  
  console.groupEnd()
  
  return result
}