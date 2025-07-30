# Template: Infrastructure Task

## Identificación
- **ID:** TASK-P{phase}E{epic}-{subtask}
- **Título:** [Descripción técnica específica]
- **Type:** Infrastructure
- **Phase:** {1-4} - {Nombre de Phase}
- **Epic:** {Nombre de Epic}
- **Sprint:** {Número de Sprint}
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** {X} horas
- **Prioridad:** {Crítica|Alta|Media|Baja}

## Definición Técnica
[Descripción detallada de qué se va a implementar específicamente]

## Referencias de Documentación NeurAnt
- **Tech Stack:** `docs/architecture/04-tech-stack.md:{línea-inicio}-{línea-fin}` (contexto específico)
- **Implementation:** `docs/architecture/05-implementation-roadmap.md:{línea-inicio}-{línea-fin}` (Sprint específico)
- **Additional Context:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (si aplica)

## Dependencias Técnicas
- **Requiere:**
  - [ ] TASK-ID-X ✅ (descripción de dependencia)
  - [ ] TASK-ID-Y ✅ (otra dependencia crítica)
- **Bloquea:**
  - [ ] TASK-ID-Z (qué tareas no pueden empezar sin esta)
  - [ ] Epic completo si es crítica

## Criterios de Aceptación Específicos
### Setup y Configuración
- [ ] [Criterio específico de instalación/configuración]
- [ ] [Verificación de versiones correctas]
- [ ] [Configuración de environment variables]

### Funcionalidad Básica
- [ ] [Feature principal funcionando]
- [ ] [Integración con otros servicios]
- [ ] [Error handling básico implementado]

### Validación Técnica
- [ ] [Comando de build pasa sin errores]
- [ ] [Tests de humo pasan]
- [ ] [Deployment exitoso]

## Archivos a Crear/Modificar
```
/path/to/file1
/path/to/file2
/config/file.json
```

## Comandos de Implementación
```bash
# Setup commands
command1
command2

# Validation commands  
command3
command4

# Test commands
command5
```

## Validación Técnica
### Build Validation
```bash
npm run build
npm run lint  
npm run typecheck
```

### Functional Validation
```bash
npm run dev
# Verificar en http://localhost:3000
# Test specific functionality
```

### Integration Validation
```bash
# Verificar conexiones externas
# Verificar environment variables
# Verificar secrets/keys
```

## Métricas de Éxito
- **Performance:** [Métricas específicas - ej: build time < 2min]
- **Reliability:** [Criterios de estabilidad - ej: 0 errores en console]
- **Security:** [Validaciones de seguridad si aplica]

## Configuración Post-Implementación
### Environment Variables
```bash
# Variables necesarias
VAR1=valor
VAR2=valor

# Variables opcionales
OPT_VAR=valor
```

### Next Steps
- **Immediate:** [Qué hacer inmediatamente después]
- **Follow-up:** [Configuraciones adicionales necesarias]
- **Documentation:** [Qué documentar]

## Troubleshooting
### Common Issues
- **Issue 1:** [Problema común y solución]
- **Issue 2:** [Otro problema y workaround]

### Debugging Commands
```bash
# Para diagnosticar problemas
debug_command1
debug_command2
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Branch: feature/{branch-name}
- Último commit: "{commit-message}"
- Siguiente tarea: TASK-ID-NEXT
- Archivos clave: [lista de archivos importantes]
- Decisiones técnicas: [decisiones tomadas durante implementación]
```

## Rollback Plan
En caso de problemas críticos:
1. [Paso para revertir cambios]
2. [Comando de rollback]
3. [Verificación de estado previo]

---
*Template específico para tareas de infrastructure/setup que requieren configuración de servicios, deployment, environment setup, etc.*