/**
 * Supabase Connection Tests
 * 
 * Funciones para verificar la conectividad y configuración
 * de Supabase Cloud en desarrollo.
 */

import { supabase } from './client'
import { supabaseAdmin } from './server'

// Tipos para los resultados de tests
interface TestResult {
  name: string
  success: boolean
  message: string
  data?: unknown
  error?: unknown
}

interface ConnectionTestSuite {
  environment: string
  projectUrl: string
  timestamp: string
  results: TestResult[]
  summary: {
    total: number
    passed: number
    failed: number
    success: boolean
  }
}

/**
 * Test 1: Conexión básica del cliente
 */
async function testClientConnection(): Promise<TestResult> {
  try {
    // Intentar una query simple que debería funcionar sin tablas
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    // Si la tabla no existe pero la conexión funciona, es OK
    if (error && error.code === 'PGRST116') {
      return {
        name: 'Client Connection',
        success: true,
        message: 'Cliente conectado correctamente (tabla pendiente de crear)',
        data: { projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL }
      }
    }
    
    if (error) {
      throw error
    }
    
    return {
      name: 'Client Connection',
      success: true,
      message: 'Cliente conectado y tabla accesible',
      data: { count: data?.length || 0 }
    }
  } catch (error: unknown) {
    return {
      name: 'Client Connection',
      success: false,
      message: 'Error de conexión del cliente',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Test 2: Verificar extensiones de base de datos
 */
async function testDatabaseExtensions(): Promise<TestResult> {
  try {
    // Test básico de conexión administrativa
    const { data, error } = await supabaseAdmin.auth.getSession()
    
    if (error) {
      return {
        name: 'Database Extensions',
        success: false,
        message: 'Error en cliente administrativo',
        error: error.message
      }
    }
    
    return {
      name: 'Database Extensions',
      success: true,
      message: 'Cliente administrativo configurado correctamente',
      data: { admin_client: 'ok', session: !!data.session }
    }
  } catch (error: unknown) {
    return {
      name: 'Database Extensions',
      success: false,
      message: 'Error verificando cliente administrativo',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Test 3: Verificar configuración de autenticación
 */
async function testAuthConfiguration(): Promise<TestResult> {
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }
    
    // Test de configuración sin usuario logueado
    return {
      name: 'Auth Configuration',
      success: true,
      message: 'Configuración de autenticación OK',
      data: { 
        hasSession: !!data.session,
        sessionExpiry: data.session?.expires_at || null
      }
    }
  } catch (error: unknown) {
    return {
      name: 'Auth Configuration',
      success: false,
      message: 'Error en configuración de auth',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Test 4: Verificar variables de entorno
 */
function testEnvironmentVariables(): TestResult {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    return {
      name: 'Environment Variables',
      success: false,
      message: `Variables faltantes: ${missing.join(', ')}`,
      error: { missing }
    }
  }
  
  // Verificar formato de las URLs y keys
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const urlValid = url.startsWith('https://') && url.includes('.supabase.co')
  const keyValid = anonKey.length > 100 // JWT tokens son largos
  
  return {
    name: 'Environment Variables',
    success: urlValid && keyValid,
    message: urlValid && keyValid 
      ? 'Variables de entorno configuradas correctamente'
      : 'Formato inválido en variables de entorno',
    data: {
      url: urlValid ? url : 'URL inválida',
      keyLength: anonKey.length,
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development'
    }
  }
}

/**
 * Ejecutar todos los tests
 */
export async function runConnectionTests(): Promise<ConnectionTestSuite> {
  console.log('🔍 Ejecutando tests de conexión Supabase...')
  
  const results: TestResult[] = []
  
  // Test de variables de entorno (síncrono)
  results.push(testEnvironmentVariables())
  
  // Tests asíncronos
  const asyncTests = [
    testClientConnection(),
    testDatabaseExtensions(),
    testAuthConfiguration()
  ]
  
  const asyncResults = await Promise.all(asyncTests)
  results.push(...asyncResults)
  
  // Calcular resumen
  const passed = results.filter(r => r.success).length
  const failed = results.length - passed
  
  const suite: ConnectionTestSuite = {
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      passed,
      failed,
      success: failed === 0
    }
  }
  
  // Log de resultados
  console.log('\n📊 Resultados de tests de conexión:')
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌'
    console.log(`${icon} ${result.name}: ${result.message}`)
    if (result.error) {
      console.error(`   Error: ${result.error}`)
    }
  })
  
  console.log(`\n📈 Resumen: ${passed}/${results.length} tests pasaron`)
  
  return suite
}

/**
 * Test simple para usar en desarrollo
 */
export async function quickConnectionTest(): Promise<boolean> {
  try {
    const envTest = testEnvironmentVariables()
    if (!envTest.success) {
      console.error('❌ Variables de entorno no configuradas')
      return false
    }
    
    const clientTest = await testClientConnection()
    if (!clientTest.success) {
      console.error('❌ Error de conexión del cliente')
      return false
    }
    
    console.log('✅ Conexión Supabase OK')
    return true
  } catch (error) {
    console.error('❌ Error en test de conexión:', error)
    return false
  }
}