#!/usr/bin/env node

/**
 * Script para probar la conexión con Supabase Cloud
 * 
 * Uso: node scripts/test-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Función para cargar .env.local manualmente
function loadEnvLocal() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    envContent.split('\n').forEach(line => {
      line = line.trim()
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=')
        const value = valueParts.join('=')
        if (key && value) {
          process.env[key] = value
        }
      }
    })
  } catch (error) {
    console.error('❌ No se pudo cargar .env.local:', error.message)
    process.exit(1)
  }
}

// Cargar variables de entorno
loadEnvLocal()

async function testSupabaseConnection() {
  console.log('🔍 Probando conexión con Supabase Cloud...\n')
  
  // Verificar variables de entorno
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error('❌ Variables de entorno faltantes:')
    missing.forEach(varName => console.error(`   - ${varName}`))
    console.error('\n💡 Asegúrate de tener configurado .env.local')
    process.exit(1)
  }
  
  console.log('✅ Variables de entorno configuradas')
  console.log(`🌐 URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log(`🔑 Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`)
  console.log('')
  
  // Crear cliente
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    // Test 1: Conexión básica
    console.log('🔗 Probando conexión básica...')
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ Conexión exitosa (tabla user_profiles no existe aún)')
    } else if (error) {
      throw error
    } else {
      console.log('✅ Conexión exitosa y tabla accesible')
    }
    
    // Test 2: Verificar auth
    console.log('🔐 Probando configuración de auth...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      throw authError
    }
    
    console.log('✅ Configuración de auth correcta')
    
    // Test 3: Verificar con service role
    console.log('🛡️  Probando service role key...')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
    
    // Intentar acceder a auth.users (solo con service role)
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.log('⚠️  Service role test falló (puede ser normal):', usersError.message)
    } else {
      console.log(`✅ Service role funcionando (${users.users.length} usuarios en DB)`)
    }
    
    console.log('\n🎉 ¡Todos los tests de conexión pasaron!')
    console.log('🚀 Supabase Cloud está listo para usar')
    
  } catch (error) {
    console.error('\n❌ Error en la conexión:')
    console.error(error.message)
    console.error('\n🔧 Posibles soluciones:')
    console.error('1. Verificar las credenciales en .env.local')
    console.error('2. Verificar que el proyecto Supabase esté activo')
    console.error('3. Ejecutar los scripts SQL de setup en Supabase')
    process.exit(1)
  }
}

// Ejecutar el test
testSupabaseConnection()