1. Configuración que Implementaré
   Una vez tengas los proyectos creados, implementaré:
2. Variables de Entorno:
 - .env.local para desarrollo
 - .env.example como template
 - Configuración para ambos ambientes
3. Clientes Supabase:
 - Cliente para componentes React
 - Cliente server-side para Next.js
 - Middleware para autenticación
4. Extensiones de Base de Datos:
 - pgvector para RAG
 - uuid-ossp para IDs
 - btree_gin para indexación
5. Schema Inicial:
 - Tabla user_profiles
 - RLS policies básicas
 - Storage bucket 'documents'

6. ¿Cómo Crear los Proyectos?

7. Ve a https://supabase.com
8. Crea cuenta/inicia sesión
9. "New Project" × 2:
 - neurant-dev
 - neurant-prod
10. Región recomendada: us-east-1 o la más cercana
11. Copia las credenciales de cada proyecto



NeurAnt-DEV supabase_db_password: n3ur@nt*d3v
NeurAnt-PROD supabase_db_password: n3ur@nt*PR0D


---

Debes revisar bien tu archivo @CLAUDE.md para asegurarte de no cometer los mismos errores anteriores en sesiones futuras, porque es inconsebible que crees archivos que pertenecen al proyecto de desarrollo @frontend en la raiz como lo hiciste con la carpeta @lib quedebes eliminarla al igual que los archivos .env.local .env.local.example ya que estos deben de estar en la carpeta @frontend no en la raiz. Tambien debes de asegurar bien el flujo para el TaskManager, ya que **Siempre** al finalizar un desarrollo y que este este 100% completado y validado debes de marcarlo como **COMPLETADO** en su tarea pertinente que en teoria la deberias de referenciar en el archivo @Tasks/current.md de esta manera tienes acceso a ella y luego de marcarla como completada es que actualizas el archivo @Tasks/current.md con la nueva informacion (Última Tarea Completada, Tarea Actual, Estado del Proyecto y Referencias de Contexto). Revisa a profundidad el archivo @CLAUDE.md para que quede todo bien organizado y con las instrucciones correctas.