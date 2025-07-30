#!/usr/bin/env node

/**
 * Environment Debug Script
 * 
 * Provides detailed debugging information about the current
 * environment configuration and setup.
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
  section: (title) => console.log(`\n${colors.cyan}${colors.bright}🔧 ${title}${colors.reset}`),
  subsection: (title) => console.log(`\n${colors.magenta}📋 ${title}${colors.reset}`),
  item: (key, value, mask = false) => {
    const displayValue = mask ? '***masked***' : value
    console.log(`  ${colors.dim}${key}:${colors.reset} ${displayValue || colors.red + 'not set' + colors.reset}`)
  },
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`)
}

/**
 * Get environment information
 */
function getEnvironmentInfo() {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'development'
  const nodeEnv = process.env.NODE_ENV || 'development'
  
  return {
    environment: env,
    nodeEnv,
    isServer: typeof window === 'undefined',
    timestamp: new Date().toISOString(),
    processEnv: Object.keys(process.env).length
  }
}

/**
 * Get database configuration
 */
function getDatabaseConfig() {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'development'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  
  let projectType = 'unknown'
  let projectId = 'unknown'
  
  if (supabaseUrl.includes('wydcmmsxdhentmoxthnu')) {
    projectType = 'DEV'
    projectId = 'wydcmmsxdhentmoxthnu'
  } else if (supabaseUrl.includes('ewyyekypuzgurwgnouxp')) {
    projectType = 'PROD'
    projectId = 'ewyyekypuzgurwgnouxp'
  }
  
  return {
    environment: env,
    projectType,
    projectId,
    url: supabaseUrl,
    expectedForEnv: env === 'production' ? 'PROD' : 'DEV',
    isCorrectDb: (env === 'production' && projectType === 'PROD') || 
                 (env !== 'production' && projectType === 'DEV')
  }
}

/**
 * Check file system
 */
function checkFileSystem() {
  const files = [
    '.env.local',
    '.env.example',
    'package.json',
    'next.config.ts',
    'src/lib/environment.ts',
    'src/lib/validate-env.ts',
    'src/config/app.ts'
  ]
  
  const results = {}
  
  for (const file of files) {
    const filePath = path.join(__dirname, '..', file)
    results[file] = {
      exists: fs.existsSync(filePath),
      path: filePath
    }
    
    if (results[file].exists) {
      try {
        const stats = fs.statSync(filePath)
        results[file].size = stats.size
        results[file].modified = stats.mtime.toISOString()
      } catch (error) {
        results[file].error = error.message
      }
    }
  }
  
  return results
}

/**
 * Get feature flags based on environment
 */
function getFeatureFlags() {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'development'
  
  return {
    // Development features
    showDebugInfo: env === 'development',
    enableHotReload: env === 'development',
    showDetailedErrors: env !== 'production',
    
    // Preview features  
    enablePreviewBanner: env === 'preview',
    allowTestData: env !== 'production',
    
    // Production features
    enableAnalytics: env === 'production',
    enableErrorReporting: env === 'production',
    enablePerformanceMonitoring: env === 'production'
  }
}

/**
 * Main debug function
 */
function debugEnvironment() {
  console.log(`${colors.cyan}${colors.bright}🔍 NeurAnt Environment Debug Information${colors.reset}`)
  console.log(`${colors.dim}Generated at: ${new Date().toISOString()}${colors.reset}`)
  
  // Environment Info
  log.section('Environment Information')
  const envInfo = getEnvironmentInfo()
  log.item('Current Environment', envInfo.environment)
  log.item('Node Environment', envInfo.nodeEnv)
  log.item('Runtime', envInfo.isServer ? 'Server' : 'Client')
  log.item('Process ENV Variables', envInfo.processEnv)
  
  // Required Variables
  log.section('Required Environment Variables')
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_ENV',
    'NEXT_PUBLIC_APP_URL'
  ]
  
  for (const varName of requiredVars) {
    const value = process.env[varName]
    const shouldMask = varName.includes('KEY')
    log.item(varName, value, shouldMask)
  }
  
  // Optional Variables
  log.section('Optional Environment Variables')
  const optionalVars = [
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_VERSION',
    'NODE_ENV',
    'NEXT_TELEMETRY_DISABLED'
  ]
  
  for (const varName of optionalVars) {
    const value = process.env[varName]
    log.item(varName, value)
  }
  
  // Future Variables
  log.section('Future Integration Variables')
  const futureVars = [
    'OPENAI_API_KEY',
    'N8N_WEBHOOK_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SENTRY_DSN',
    'NEXT_PUBLIC_ANALYTICS_ID'
  ]
  
  let futureConfigured = 0
  for (const varName of futureVars) {
    const value = process.env[varName]
    if (value) futureConfigured++
    const shouldMask = varName.includes('KEY') || varName.includes('SECRET')
    log.item(varName, value, shouldMask)
  }
  
  if (futureConfigured > 0) {
    log.info(`${futureConfigured} future integration variables configured`)
  } else {
    log.info('No future integration variables configured yet')
  }
  
  // Database Configuration
  log.section('Database Configuration')
  const dbConfig = getDatabaseConfig()
  log.item('Environment', dbConfig.environment)
  log.item('Project Type', dbConfig.projectType)
  log.item('Project ID', dbConfig.projectId)
  log.item('Expected for ENV', dbConfig.expectedForEnv)
  
  if (dbConfig.isCorrectDb) {
    log.success('Using correct database for environment')
  } else {
    log.warning('Database mismatch detected!')
    log.warning(`${dbConfig.environment} environment using ${dbConfig.projectType} database`)
  }
  
  // Feature Flags
  log.section('Feature Flags')
  const features = getFeatureFlags()
  Object.entries(features).forEach(([key, value]) => {
    log.item(key, value ? 'enabled' : 'disabled')
  })
  
  // File System Check
  log.section('File System')
  const files = checkFileSystem()
  Object.entries(files).forEach(([fileName, info]) => {
    if (info.exists) {
      log.item(fileName, `✅ exists (${info.size} bytes, modified: ${info.modified?.slice(0, 10)})`)
    } else {
      log.item(fileName, '❌ missing')
    }
  })
  
  // Recommendations
  log.section('Recommendations')
  
  if (!files['.env.local'].exists) {
    log.warning('Create .env.local from .env.example: npm run env:setup')
  }
  
  if (!dbConfig.isCorrectDb) {
    log.warning('Check database configuration in .env.local')
  }
  
  if (envInfo.environment === 'production' && !process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) {
    log.warning('Production should use HTTPS URL')
  }
  
  if (futureConfigured === 0 && envInfo.environment === 'development') {
    log.info('Consider setting up integration variables for development')
  }
  
  console.log(`\n${colors.green}${colors.bright}✅ Debug information generated successfully${colors.reset}`)
}

// Run debug
debugEnvironment()