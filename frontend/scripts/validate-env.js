#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * 
 * Validates all environment variables before starting development
 * or building the application.
 */

const path = require('path')
const fs = require('fs')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

// Console colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m'
}

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  debug: (msg) => console.log(`${colors.dim}🔍 ${msg}${colors.reset}`)
}

// Required environment variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_ENV',
  'NEXT_PUBLIC_APP_URL'
]

// Optional environment variables
const optionalVars = [
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_VERSION',
  'NODE_ENV',
  'NEXT_TELEMETRY_DISABLED'
]

// Future integration variables
const futureVars = [
  'OPENAI_API_KEY',
  'N8N_WEBHOOK_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SENTRY_DSN',
  'NEXT_PUBLIC_ANALYTICS_ID'
]

/**
 * Validate a single environment variable
 */
function validateVar(name, value, required = true) {
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
 * Main validation function
 */
function validateEnvironment() {
  console.log(`${colors.cyan}${colors.bright}🔍 NeurAnt Environment Validation${colors.reset}\n`)
  
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'development'
  log.info(`Environment: ${env}`)
  
  let isValid = true
  const errors = []
  const warnings = []
  const validVars = {}

  // Check if .env.local exists
  const envPath = path.join(__dirname, '../.env.local')
  if (!fs.existsSync(envPath)) {
    log.warning('.env.local file not found. Using system environment variables.')
    log.info('Run "npm run env:setup" to create .env.local from .env.example')
  }

  console.log('\n📋 Checking required variables...')
  
  // Validate required variables
  for (const varName of requiredVars) {
    const value = process.env[varName]
    const validation = validateVar(varName, value, true)
    
    if (!validation.isValid) {
      errors.push(validation.error)
      isValid = false
      log.error(validation.error)
    } else {
      validVars[varName] = value
      const maskedValue = varName.includes('KEY') ? '***masked***' : value
      log.success(`${varName}: ${maskedValue}`)
    }
  }

  console.log('\n📝 Checking optional variables...')
  
  // Validate optional variables
  for (const varName of optionalVars) {
    const value = process.env[varName]
    const validation = validateVar(varName, value, false)
    
    if (validation.warning) {
      warnings.push(validation.warning)
      log.warning(validation.warning)
    } else if (value) {
      validVars[varName] = value
      log.success(`${varName}: ${value}`)
    }
  }

  console.log('\n🔮 Checking future integration variables...')
  
  let futureCount = 0
  for (const varName of futureVars) {
    const value = process.env[varName]
    if (value) {
      futureCount++
      const maskedValue = varName.includes('KEY') || varName.includes('SECRET') ? '***masked***' : value
      log.info(`${varName}: ${maskedValue}`)
    }
  }
  
  if (futureCount === 0) {
    log.debug('No future integration variables configured yet')
  }

  // Environment-specific validations
  console.log('\n🎯 Environment-specific checks...')
  
  if (env === 'production') {
    if (validVars.NEXT_PUBLIC_SUPABASE_URL?.includes('wydcmmsxdhentmoxthnu')) {
      log.warning('Production environment is using DEV database')
    }
    
    if (validVars.NEXT_PUBLIC_APP_URL && !validVars.NEXT_PUBLIC_APP_URL.startsWith('https://')) {
      errors.push('Production environment must use HTTPS URL')
      isValid = false
      log.error('Production environment must use HTTPS URL')
    }
  }

  if (env === 'development') {
    if (validVars.NEXT_PUBLIC_SUPABASE_URL?.includes('ewyyekypuzgurwgnouxp')) {
      log.warning('Development environment is using PROD database')
    }
  }

  // Summary
  console.log(`\n${colors.bright}📊 Validation Summary${colors.reset}`)
  console.log(`Environment: ${colors.cyan}${env}${colors.reset}`)
  console.log(`Required Variables: ${colors.green}${Object.keys(validVars).filter(k => requiredVars.includes(k)).length}/${requiredVars.length}${colors.reset}`)
  console.log(`Warnings: ${colors.yellow}${warnings.length}${colors.reset}`)
  console.log(`Errors: ${colors.red}${errors.length}${colors.reset}`)

  if (isValid) {
    log.success('Environment validation passed! 🎉')
    process.exit(0)
  } else {
    log.error('Environment validation failed! ❌')
    console.log('\n💡 To fix these issues:')
    console.log('1. Copy .env.example to .env.local: npm run env:setup')
    console.log('2. Fill in your actual values in .env.local')
    console.log('3. Run validation again: npm run env:validate')
    process.exit(1)
  }
}

// Run validation
validateEnvironment()