# Configuración de Supabase Cloud - NeurAnt

Esta carpeta contiene los scripts SQL necesarios para configurar los proyectos de Supabase Cloud.

## 📋 Proyectos Configurados

### Proyecto DEV
- **URL:** https://wydcmmsxdhentmoxthnu.supabase.co
- **Propósito:** Desarrollo y testing
- **Acceso:** Dashboard de Supabase Cloud

### Proyecto PROD  
- **URL:** https://ewyyekypuzgurwgnouxp.supabase.co
- **Propósito:** Producción
- **Acceso:** Dashboard de Supabase Cloud

## 🚀 Instrucciones de Setup

### Paso 1: Habilitar Extensiones
1. Abrir el SQL Editor en el dashboard de Supabase
2. Ejecutar el script: `01-enable-extensions.sql`
3. Verificar que no hay errores
4. **Repetir en ambos proyectos (DEV y PROD)**

### Paso 2: Crear Schema Inicial
1. Ejecutar el script: `02-initial-schema.sql`
2. Verificar que las tablas se crearon correctamente
3. **Repetir en ambos proyectos (DEV y PROD)**

### Paso 3: Configurar Storage
1. Ejecutar el script: `03-storage-setup.sql`
2. Verificar que los buckets se crearon
3. **Repetir en ambos proyectos (DEV y PROD)**

### Paso 4: Probar Conexión
```bash
cd frontend
node scripts/test-supabase.js
```

## 📁 Archivos en esta carpeta

| Archivo | Descripción | Orden |
|---------|-------------|-------|
| `01-enable-extensions.sql` | Habilita extensiones críticas (pgvector, uuid-ossp, btree_gin) | 1️⃣ |
| `02-initial-schema.sql` | Crea tablas básicas y políticas RLS | 2️⃣ |
| `03-storage-setup.sql` | Configura buckets de Storage y políticas | 3️⃣ |
| `README.md` | Este archivo con instrucciones | ℹ️ |

## ✅ Verificación de Setup

Después de ejecutar los scripts, deberás tener:

### Extensiones Habilitadas
- ✅ `uuid-ossp` - Para IDs únicos
- ✅ `vector` - Para funcionalidades RAG/AI  
- ✅ `btree_gin` - Para indexación avanzada

### Tablas Creadas
- ✅ `user_profiles` - Perfiles de usuario
- ✅ `companies` - Empresas (multi-tenancy)
- ✅ `chatbots` - Chatbots básicos

### Storage Buckets
- ✅ `documents` - Documentos de chatbots (privado)
- ✅ `avatars` - Avatars de usuarios (público)
- ✅ `company-assets` - Assets de empresas (público)

### RLS Policies
- ✅ Políticas de seguridad configuradas
- ✅ Multi-tenancy implementado
- ✅ Acceso basado en usuario/empresa

## 🔧 Troubleshooting

### Error: "relation does not exist"
- Asegúrate de ejecutar `02-initial-schema.sql` primero

### Error: "extension does not exist"  
- Ejecuta `01-enable-extensions.sql` en el proyecto correcto

### Error de permisos en Storage
- Verifica que `03-storage-setup.sql` se ejecutó correctamente

### Variables de entorno incorrectas
- Verifica que las credenciales en `.env.local` coincidan con el proyecto

## 🎯 Próximos Pasos

Una vez completado el setup:

1. ✅ Ejecutar test de conexión
2. ⏳ Continuar con la tarea de autenticación (TASK-P1E2-02A)
3. ⏳ Implementar schema completo de chatbots
4. ⏳ Configurar n8n integrations

## 🚨 Notas Importantes

- **NO** commitear credenciales al repositorio
- Los scripts son idempotentes (se pueden ejecutar múltiples veces)
- Siempre probar en DEV antes que en PROD
- Las credenciales ya están configuradas en `frontend/.env.local`