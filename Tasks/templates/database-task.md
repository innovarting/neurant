# Template: Database Task

## Identificación
- **ID:** TASK-P{phase}E{epic}-{subtask}
- **Título:** [Específico de database/schema]
- **Type:** Database
- **Phase:** {1-4} - {Nombre de Phase}
- **Epic:** {Nombre de Epic}
- **Sprint:** {Número de Sprint}
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** {X} horas
- **Prioridad:** {Crítica|Alta|Media|Baja}

## Definición Técnica
[Descripción específica de cambios en database: schema, migrations, índices, RLS policies, etc.]

## Referencias de Documentación NeurAnt
- **Database Schema:** `docs/architecture/13-diagrama-entidad-relacion.md:{línea-inicio}-{línea-fin}` (entidades específicas)
- **Database Design:** `docs/architecture/03-database-design.md:{línea-inicio}-{línea-fin}` (patrones y decisiones)
- **RBAC Model:** `docs/architecture/10-modelo-datos-rbac-extendido.md:{línea-inicio}-{línea-fin}` (si aplica RBAC)
- **Implementation Roadmap:** `docs/architecture/05-implementation-roadmap.md:{línea-inicio}-{línea-fin}` (Sprint context)

## Dependencias Técnicas
- **Requiere:**
  - [ ] TASK-ID-X ✅ (base infrastructure setup)
  - [ ] TASK-ID-Y ✅ (database connection established)
- **Bloquea:**
  - [ ] TASK-ID-Z (API endpoints que usan estas tablas)
  - [ ] TASK-ID-W (frontend components que necesitan datos)

## Entidades Afectadas
### Tablas Principales
- **{tabla_1}**: [Descripción y cambios]
- **{tabla_2}**: [Descripción y cambios]

### Relaciones
- **FK:** {tabla_padre} → {tabla_hija} (cardinalidad)
- **Constraints:** [Constraints de integridad específicos]

## Criterios de Aceptación Específicos
### Schema Implementation
- [ ] Tablas creadas con campos según documentación
- [ ] Primary keys y foreign keys configuradas
- [ ] Índices estratégicos implementados según spec
- [ ] ENUMs creados con valores correctos

### RLS Security (si aplica)
- [ ] RLS habilitado en tablas tenant
- [ ] Policies implementadas según jerarquía RBAC
- [ ] Functions helper creadas para authorization
- [ ] Isolation multi-tenant verificado

### Data Integrity
- [ ] Constraints de negocio implementados
- [ ] Triggers necesarios configurados
- [ ] Validaciones de integridad funcionando
- [ ] Cascade deletes configurados apropiadamente

## Archivos de Database
```
supabase/migrations/{timestamp}_{migration_name}.sql
supabase/seed.sql (si aplica)
lib/database/types.ts (TypeScript types)
lib/database/queries.ts (helper queries)
```

## Migration Script
```sql
-- Migration Up
BEGIN;

-- Crear ENUMs si necesario
CREATE TYPE {enum_name} AS ENUM (...);

-- Crear tablas
CREATE TABLE {table_name} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- campos según documentación
);

-- Crear índices
CREATE INDEX {index_name} ON {table_name} (...);

-- Habilitar RLS si aplica
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- Crear policies RLS
CREATE POLICY {policy_name} ON {table_name}
  FOR ALL USING (...);

-- Crear triggers si necesario
CREATE TRIGGER {trigger_name}
  BEFORE/AFTER INSERT/UPDATE/DELETE ON {table_name}
  FOR EACH ROW EXECUTE FUNCTION {function_name}();

COMMIT;
```

## Validation Queries
```sql
-- Verificar estructura de tabla
\d {table_name}

-- Verificar RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = '{table_name}';

-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = '{table_name}';

-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = '{table_name}';

-- Test básico de inserción
INSERT INTO {table_name} (campo1, campo2) VALUES (...);
SELECT * FROM {table_name} WHERE id = '...';
```

## TypeScript Types
```typescript
// Generar types desde Supabase
export interface {TableName} {
  id: string
  // campos según schema
  created_at: string
  updated_at: string
}

export type {TableName}Insert = Omit<{TableName}, 'id' | 'created_at' | 'updated_at'>
export type {TableName}Update = Partial<{TableName}Insert>
```

## RLS Testing (si aplica)
```sql
-- Test isolation multi-tenant
SET role authenticated;
SET request.jwt.claims TO '{"sub": "user-uuid", "company_id": "company-uuid"}';

-- Verificar que solo ve datos de su empresa
SELECT * FROM {table_name}; -- Debe retornar solo datos de company_id

-- Test con otro company_id
SET request.jwt.claims TO '{"sub": "user-uuid2", "company_id": "company-uuid2"}';
SELECT * FROM {table_name}; -- No debe ver datos de company anterior

RESET role;
```

## Performance Validation
```sql
-- Verificar query plans para índices
EXPLAIN ANALYZE SELECT * FROM {table_name} WHERE {indexed_column} = '...';

-- Verificar performance de RLS policies
EXPLAIN ANALYZE SELECT * FROM {table_name}; -- Con RLS activo
```

## Data Migration (si aplica)
```sql
-- Si hay datos existentes que migrar
INSERT INTO {new_table} (campo1, campo2)
SELECT old_campo1, old_campo2 
FROM {old_table}
WHERE {conditions};
```

## Rollback Plan
```sql
-- Migration Down
BEGIN;

-- Eliminar triggers
DROP TRIGGER IF EXISTS {trigger_name} ON {table_name};

-- Eliminar policies
DROP POLICY IF EXISTS {policy_name} ON {table_name};

-- Deshabilitar RLS
ALTER TABLE {table_name} DISABLE ROW LEVEL SECURITY;

-- Eliminar índices
DROP INDEX IF EXISTS {index_name};

-- Eliminar tablas
DROP TABLE IF EXISTS {table_name} CASCADE;

-- Eliminar ENUMs
DROP TYPE IF EXISTS {enum_name};

COMMIT;
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Database changes: [lista de tablas/cambios aplicados]
- Migration applied: {timestamp}_{migration_name}
- RLS policies: [políticas implementadas]
- Next database task: TASK-ID-NEXT
- Dependent API tasks now unblocked: [lista de tareas]
```

## Troubleshooting Database
### Common Issues
- **RLS Policy Errors:** [Como debuggear policies]
- **Migration Failures:** [Como resolver conflictos]
- **Performance Issues:** [Como optimizar queries]

### Debugging Commands
```bash
# Supabase CLI
supabase db reset
supabase db diff
supabase gen types typescript --local > types/database.ts

# PostgreSQL direct
psql -h localhost -p 5432 -U postgres -d postgres
\dt -- list tables
\di -- list indexes  
\dp -- list permissions
```

---
*Template específico para tareas de database: schema changes, migrations, RLS policies, índices, etc.*