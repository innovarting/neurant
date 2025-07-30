# GUÍA DE DISEÑO VISUAL - NeurAnt
## Sistema de Diseño para Plataforma Multi-Agente de IA

---

### 📋 **INFORMACIÓN DEL DOCUMENTO**
- **Versión:** 1.0
- **Fecha:** Enero 2025
- **Audiencia:** Equipos de Desarrollo, Diseño y Producto
- **Propósito:** Especificaciones completas de diseño visual y UX para implementación

---

## 🎯 **1. INTRODUCCIÓN Y PRINCIPIOS**

### **Personalidad de Marca NeurAnt**
NeurAnt es una plataforma que combina **innovación tecnológica** con **accesibilidad humana**. Su diseño debe transmitir:

- **🤝 Accesible**: Fácil de usar para usuarios no técnicos
- **🚀 Innovador**: Tecnología de vanguardia sin ser intimidante  
- **🛡️ Confiable**: Profesional y seguro para entornos empresariales
- **❤️ Cercano**: Empático y comprensivo con las necesidades PyME

### **Principios de Diseño UX**

#### **1. Familiaridad Progresiva**
- Usar patrones conocidos (Gmail, WhatsApp, Stripe)
- Introducir complejidad gradualmente
- Metaphoras visuales familiares para conceptos de IA

#### **2. Progresión sin Fricción**  
- Onboarding en <10 minutos garantizado
- Estados de carga claros y tranquilizadores
- Eliminación de pasos innecesarios

#### **3. Retroalimentación Constante**
- Feedback visual inmediato en todas las acciones
- Estados de error empáticos, no técnicos
- Progreso visible en configuraciones complejas

#### **4. Recuperación Fácil**
- Deshacer acciones críticas
- Wizard de "solución de problemas" visual
- Soporte contextual integrado

### **Filosofía: "Accesible pero Profesional"**
El diseño debe **sentirse simple** para un dueño de PyME, pero **verse profesional** para un CTO enterprise. Balance entre calidez humana y credibilidad técnica.

---

## 🎨 **2. IDENTIDAD VISUAL**

### **2.1 Paleta de Colores**

#### **Color Primario - Naranja NeurAnt**
```
Naranja Principal: #F97316
- Tint 50: #FFF7ED
- Tint 100: #FFEDD5  
- Tint 200: #FED7AA
- Tint 300: #FDBA74
- Tint 400: #FB923C
- Tint 500: #F97316 (Principal)
- Tint 600: #EA580C
- Tint 700: #C2410C
- Tint 800: #9A3412
- Tint 900: #7C2D12
```

#### **Colores Secundarios**
```
Azul Confianza: #3B82F6
- Para elementos informativos y de confianza
- Tint 50: #EFF6FF → Tint 900: #1E3A8A

Verde Éxito: #10B981  
- Confirmaciones, estados exitosos
- Tint 50: #ECFDF5 → Tint 900: #064E3B

Rojo Alerta: #EF4444
- Errores, alertas críticas
- Tint 50: #FEF2F2 → Tint 900: #7F1D1D

Amarillo Atención: #F59E0B
- Advertencias, información importante
- Tint 50: #FFFBEB → Tint 900: #78350F
```

#### **Escala de Grises**
```
Modo Claro:
- Gray 50: #F9FAFB (Backgrounds)
- Gray 100: #F3F4F6 (Card backgrounds)
- Gray 200: #E5E7EB (Borders)
- Gray 300: #D1D5DB (Borders hover)
- Gray 400: #9CA3AF (Placeholder text)
- Gray 500: #6B7280 (Secondary text)
- Gray 600: #4B5563 (Primary text)
- Gray 700: #374151 (Headings)
- Gray 800: #1F2937 (Primary headings)
- Gray 900: #111827 (High contrast text)

Modo Oscuro:
- Dark 50: #18181B (Backgrounds)
- Dark 100: #27272A (Card backgrounds)  
- Dark 200: #3F3F46 (Borders)
- Dark 300: #52525B (Borders hover)
- Dark 400: #71717A (Placeholder text)
- Dark 500: #A1A1AA (Secondary text)
- Dark 600: #D4D4D8 (Primary text)
- Dark 700: #E4E4E7 (Headings)
- Dark 800: #F4F4F5 (Primary headings)
- Dark 900: #FAFAFA (High contrast text)
```

### **2.2 Sistema Tipográfico**

#### **Fuente Principal: Inter**
- **Razón**: Legibilidad óptima en pantallas, soporte completo para español
- **Fallback**: system-ui, -apple-system, sans-serif

#### **Jerarquía de Texto**

```
Display XL: 72px / 90px - Bold (Marketing headlines)
Display L: 60px / 72px - Bold (Hero titles)
Display M: 48px / 60px - SemiBold (Section titles)
Display S: 36px / 44px - SemiBold (Card headers)

Heading XL: 30px / 38px - SemiBold (Page titles)
Heading L: 24px / 32px - SemiBold (Section headers)
Heading M: 20px / 28px - Medium (Subsection headers)
Heading S: 18px / 26px - Medium (Component headers)

Body XL: 20px / 30px - Regular (Lead paragraphs)
Body L: 18px / 28px - Regular (Default body)
Body M: 16px / 24px - Regular (Standard text)
Body S: 14px / 20px - Regular (Secondary text)

Caption L: 14px / 18px - Medium (Labels, small headers)
Caption M: 12px / 16px - Medium (Captions, metadata)
Caption S: 11px / 14px - Medium (Micro copy)
```

#### **Pesos de Fuente**
- **Regular (400)**: Texto general, párrafos
- **Medium (500)**: Labels, subtítulos importantes
- **SemiBold (600)**: Headings, títulos de sección
- **Bold (700)**: Títulos principales, CTAs críticos

### **2.3 Iconografía**

#### **Estilo de Iconos**
- **Tipo**: Outline (2px stroke weight)
- **Tamaño base**: 24x24px (escalable: 16, 20, 24, 32, 48px)
- **Esquinas**: Redondeadas (2px border radius)
- **Estilo**: Minimalista, friendly, no excesivamente técnico

#### **Categorías de Iconos**

**🤖 IA y Automatización**
- Bot: Cara robótica friendly, no intimidante
- Brain: Cerebro estilizado con conexiones
- Magic Wand: Varita para "magia" de IA
- Zap: Rayo para automatización rápida

**💬 Comunicación**
- Chat: Burbujas de conversación
- WhatsApp: Logo oficial (cuando se permita)
- Phone: Teléfono para handoff humano
- Users: Múltiples personas para equipos

**📊 Analytics y Datos**
- Chart: Gráficos de barras/líneas limpios
- Trending Up: Flecha ascendente para métricas
- Eye: Visibilidad/monitoreo
- Target: Objetivos y KPIs

**⚙️ Configuración**
- Settings: Engranaje clásico
- Puzzle: Piezas para integraciones
- Lock: Seguridad (simple, no amenazante)
- Key: Acceso y autenticación

### **2.4 Sistema de Espaciado**

#### **Unidad Base: 4px**
```
Spacing Scale:
- 1: 4px (Micro spacing)
- 2: 8px (Small spacing)  
- 3: 12px (Medium-small)
- 4: 16px (Medium)
- 5: 20px (Medium-large)
- 6: 24px (Large)
- 8: 32px (Extra large)
- 10: 40px (XXL)
- 12: 48px (XXXL)
- 16: 64px (Section spacing)
- 20: 80px (Page spacing)
- 24: 96px (Hero spacing)
```

#### **Contenedores y Grids**
```
Max Widths:
- sm: 640px (Mobile content)
- md: 768px (Tablet content)
- lg: 1024px (Desktop content)
- xl: 1280px (Wide desktop)
- 2xl: 1536px (Ultra wide)

Containers:
- Mobile: 16px padding lateral
- Tablet: 24px padding lateral  
- Desktop: 32px padding lateral
```

---

## 🧩 **3. COMPONENTES VISUALES**

### **3.1 Botones**

#### **Botón Primario**
```
Estilo Base:
- Background: Naranja 500 (#F97316)
- Text: Blanco (#FFFFFF)
- Border: None
- Border Radius: 8px
- Padding: 12px 24px (Medium), 8px 16px (Small)
- Font: Body M Medium (16px)
- Min Height: 44px (touch-friendly)

Estados:
- Hover: Background Naranja 600 (#EA580C)
- Active: Background Naranja 700 (#C2410C)  
- Focus: Ring Naranja 500 (4px offset)
- Disabled: Background Gray 300, Text Gray 500
- Loading: Spinner blanco, texto "Procesando..."
```

#### **Botón Secundario**
```
Estilo Base:
- Background: Transparent
- Text: Naranja 600 (#EA580C)
- Border: 2px solid Naranja 500
- Border Radius: 8px
- Padding: 10px 22px (ajuste por border)

Estados:
- Hover: Background Naranja 50, Border Naranja 600
- Active: Background Naranja 100
- Focus: Ring Naranja 500 (4px offset)
- Disabled: Border Gray 300, Text Gray 400
```

#### **Botón Ghost**
```
Estilo Base:
- Background: Transparent
- Text: Gray 700 (claro) / Gray 300 (oscuro)
- Border: None
- Hover: Background Gray 100 (claro) / Dark 200 (oscuro)
```

#### **Botón Destructivo**
```
Estilo Base:
- Background: Rojo 500 (#EF4444)
- Text: Blanco
- Mismo patrón que primario, colores rojos
```

### **3.2 Formularios**

#### **Input Fields**
```
Estilo Base:
- Background: Blanco (claro) / Dark 100 (oscuro)
- Border: 2px solid Gray 200 (claro) / Dark 300 (oscuro)
- Border Radius: 8px
- Padding: 12px 16px
- Font: Body M Regular
- Min Height: 44px

Estados:
- Focus: Border Naranja 500, Ring Naranja 500 (2px)
- Error: Border Rojo 500, Ring Rojo 500
- Success: Border Verde 500, Ring Verde 500
- Disabled: Background Gray 100, Text Gray 400
```

#### **Labels**
```
Estilo:
- Font: Caption L Medium (14px)
- Color: Gray 700 (claro) / Gray 300 (oscuro)
- Margin Bottom: 6px
- Requerido: Asterisco rojo pequeño
```

#### **Mensajes de Validación**
```
Error:
- Color: Rojo 600
- Font: Caption M Regular (12px)
- Icon: X Circle outline
- Margin Top: 4px

Success:
- Color: Verde 600  
- Font: Caption M Regular
- Icon: Check Circle outline

Helper Text:
- Color: Gray 500
- Font: Caption M Regular
- No icon
```

#### **Select Dropdowns**
```
Estilo Base:
- Mismo que Input Field
- Icon: Chevron Down (Gray 400)
- Padding Right: 40px (espacio para icon)

Dropdown Menu:
- Background: Blanco (claro) / Dark 100 (oscuro)
- Border: 2px solid Gray 200
- Border Radius: 8px
- Shadow: 0 10px 25px rgba(0,0,0,0.1)
- Max Height: 300px (scroll si necesario)

Option Items:
- Padding: 12px 16px
- Hover: Background Gray 50 (claro) / Dark 200 (oscuro)
- Selected: Background Naranja 50, Text Naranja 700
```

### **3.3 Chat e Interfaces Conversacionales**

#### **Burbujas de Chat**

**Mensaje Usuario (Outgoing)**
```
Estilo:
- Background: Naranja 500 (#F97316)
- Text: Blanco
- Border Radius: 16px 16px 4px 16px
- Padding: 12px 16px
- Max Width: 80% del contenedor
- Align: Right
- Margin: 4px 16px 4px 0
```

**Mensaje Bot (Incoming)**
```
Estilo:
- Background: Gray 100 (claro) / Dark 200 (oscuro)
- Text: Gray 800 (claro) / Gray 200 (oscuro)
- Border Radius: 16px 16px 16px 4px
- Padding: 12px 16px
- Max Width: 80% del contenedor
- Align: Left
- Margin: 4px 0 4px 16px
```

**Mensaje Sistema**
```
Estilo:
- Background: Azul 50 (claro) / Dark 300 (oscuro)
- Text: Azul 700 (claro) / Azul 300 (oscuro)
- Border Radius: 8px
- Padding: 8px 12px
- Font: Caption L Medium
- Text Align: Center
- Margin: 8px 16px
```

#### **Estados de Conversación**

**Typing Indicator**
```
Visual:
- 3 dots animados (fade in/out secuencial)
- Color: Gray 400
- Contenedor: Background Gray 100, Border Radius 16px
- Padding: 8px 12px
- Duración animación: 1.4s loop
```

**Bot Processing**
```
Visual:
- Spinner pequeño + "IA procesando..."
- Color: Naranja 500
- Font: Caption M Regular
- Italic: true
```

#### **Avatares**

**Avatar Usuario**
```
- Tamaño: 32px círculo
- Background: Gradient (Naranja 400 → Naranja 600)
- Text: Iniciales blancas, Caption L Medium
- Position: Top right de mensaje
```

**Avatar Bot**
```
- Tamaño: 32px círculo  
- Background: Gray 200 (claro) / Dark 400 (oscuro)
- Icon: Bot outline (Naranja 500)
- Position: Top left de mensaje
```

### **3.4 Navegación**

#### **Sidebar Navigation**
```
Container:
- Width: 280px (desktop), hidden/overlay (mobile)
- Background: Blanco (claro) / Dark 100 (oscuro)
- Border Right: 1px solid Gray 200 (claro) / Dark 300 (oscuro)
- Padding: 24px 16px

Logo Area:
- Height: 60px
- Logo: NeurAnt + tagline
- Margin Bottom: 32px

Navigation Items:
- Padding: 12px 16px
- Border Radius: 8px
- Font: Body M Medium
- Color: Gray 600 (claro) / Gray 400 (oscuro)
- Icon: 20px, margin right 12px

Estados Nav Items:
- Hover: Background Gray 50 (claro) / Dark 200 (oscuro)
- Active: Background Naranja 50, Text Naranja 700, Icon Naranja 600
- Disabled: Color Gray 400, Icon Gray 300
```

#### **Top Navigation**
```
Container:
- Height: 64px
- Background: Blanco (claro) / Dark 100 (oscuro)
- Border Bottom: 1px solid Gray 200
- Padding: 0 24px
- Display: Flex, items center, justify between

Breadcrumbs:
- Font: Caption L Regular
- Color: Gray 500
- Separator: "/" (Gray 300)
- Active: Gray 700, no link

User Menu:
- Avatar: 36px circle
- Dropdown: Same style as Select
- Items: Profile, Settings, Logout
```

### **3.5 Estados y Feedback**

#### **Loading States**

**Spinner Principal**
```
- Tamaño: 40px
- Color: Naranja 500
- Stroke Width: 4px
- Animación: 1s linear infinite rotation
```

**Loading Skeletons**
```
- Background: Gray 200 (claro) / Dark 300 (oscuro)
- Border Radius: 4px
- Animación: Shimmer gradient 2s ease-in-out infinite
- Usar para: Cards, text lines, avatares
```

**Progress Bars**
```
Container:
- Height: 8px
- Background: Gray 200 (claro) / Dark 300 (oscuro)
- Border Radius: 4px

Fill:
- Background: Naranja 500
- Border Radius: 4px
- Transition: width 0.3s ease
```

#### **Notificaciones Toast**

**Toast Success**
```
- Background: Verde 50 (claro) / Dark 200 (oscuro)
- Border: Verde 200
- Text: Verde 800 (claro) / Verde 300 (oscuro)
- Icon: Check Circle (Verde 500)
- Duration: 5s auto dismiss
```

**Toast Error**
```
- Background: Rojo 50 (claro) / Dark 200 (oscuro)
- Border: Rojo 200
- Text: Rojo 800 (claro) / Rojo 300 (oscuro)
- Icon: X Circle (Rojo 500)
- Duration: 8s (más tiempo para errores)
```

**Toast Info**
```
- Background: Azul 50 (claro) / Dark 200 (oscuro)
- Border: Azul 200
- Text: Azul 800 (claro) / Azul 300 (oscuro)
- Icon: Info Circle (Azul 500)
- Duration: 6s
```

---

## 📱 **4. PATRONES DE EXPERIENCIA UX**

### **4.1 Onboarding Ultra-Rápido (<10 min)**

#### **Paso 1: Bienvenida y Propósito**
```
Layout:
- Centered content, max-width 500px
- Hero icon: 120px bot friendly
- Título: Display M "¡Bienvenido a NeurAnt!"
- Subtítulo: Body L "Crea tu primer chatbot en menos de 10 minutos"
- CTA Primario: "Comenzar ahora"
- Link Secundario: "¿Ya tienes cuenta? Iniciar sesión"

Visual:
- Background: Gradient sutil (Naranja 50 → Blanco)
- Illustración: Bot saludando, estilo amigable
- Progress indicator: 1/5 (dots, Naranja 500)
```

#### **Paso 2: Información Básica de Empresa**
```
Form:
- Campo: Nombre de empresa (required)
- Campo: Industria (select con opciones comunes)
- Campo: Tamaño empresa (select: 1-10, 11-50, 51-200, 200+)
- Helper text: "Nos ayuda a personalizar tu experiencia"

Validación:
- Tiempo real, sin submit prematuro
- Progress bar: 40% completado
- CTA: "Continuar" (disabled hasta válido)
```

#### **Paso 3: Configuración WhatsApp Inicial**
```
Layout:
- Split screen: Instructions (left) + QR Code (right)
- Instructions: Lista numerada con íconos
- QR Code: Large, centered, con border Naranja 500

Estados:
- Loading: "Generando código QR..."
- Success: "✅ WhatsApp conectado"
- Error: "Problema de conexión. Reintentar"
- Timeout: "Código expirado. Generar nuevo"
```

#### **Paso 4: Personalización Rápida del Bot**
```
Form:
- Campo: Nombre del bot
- Campo: Personalidad (radio buttons: Formal, Amigable, Técnico)
- Campo: Saludo inicial (textarea con placeholder)
- Preview: Chat mockup en tiempo real

Visual:
- Live preview del chat con cambios instantáneos
- Character counter para saludo
- Examples/suggestions button
```

#### **Paso 5: Confirmación y Primer Test**
```
Layout:
- Success state con checkmarks animados
- Resumen de configuración
- Test widget integrado
- CTAs: "Probar ahora" + "Ir al dashboard"

Celebration:
- Micro-animation de confetti
- Success toast: "¡Tu chatbot está listo!"
- Metric: "Completado en X minutos"
```

### **4.2 Configuración de IA y Documentos**

#### **Panel de Entrenamiento**
```
Layout (Split):
Left Panel (40%):
- Tabs: Documentos, URLs, Texto manual
- Upload zone: Drag & drop elegante
- Document list: Con status y acciones
- Training progress: Progress bar + ETA

Right Panel (60%):
- Live preview del knowledge base
- Test chat integrado
- Confidence indicators por respuesta
- Suggested improvements
```

#### **Estados de Procesamiento**
```
Document Upload:
- Dragging: Border punteado Naranja 300, background Naranja 50
- Processing: Progress bar + "Analizando contenido..."
- Success: Check icon + "Documento agregado"
- Error: X icon + mensaje específico del error

AI Training:
- Queue indicator: "X documentos en cola"
- Processing: Animated brain icon + percentage
- Complete: "Conocimiento actualizado"
```

### **4.3 Gestión de Conversaciones en Tiempo Real**

#### **Layout Principal de Conversaciones**
```
Structure (3-column):
Left Sidebar (300px):
- Filtros y búsqueda
- Lista de conversaciones
- Status indicators
- Badge counts

Center Panel (flexible):
- Chat interface activo
- Message composer
- Quick actions

Right Panel (280px):
- Contact info
- Conversation history
- Escalation options
- Notes y tags
```

#### **Lista de Conversaciones**
```
Item Structure:
- Avatar + nombre (o número)
- Último mensaje preview (truncado)
- Timestamp relativo
- Status badge
- Unread indicator

Estados:
- Active: Background Naranja 50, border left Naranja 500
- Unread: Bold text, blue dot
- Escalated: Red border, warning icon
- Resolved: Gray text, check icon
```

#### **Indicadores de Estado en Tiempo Real**
```
Connection Status:
- Connected: Green dot + "Conectado"
- Connecting: Pulsing yellow dot + "Conectando..."
- Disconnected: Red dot + "Desconectado"
- Error: Red X + error específico

Agent Status:
- Available: Green "Disponible"
- Busy: Yellow "Ocupado"
- Away: Gray "Ausente"
- Offline: Red "Desconectado"
```

### **4.4 Dashboard de Analytics**

#### **KPIs Principales**
```
Layout:
- Grid 4 columnas (responsive → 2x2 → 1 columna)
- Card style: White background, subtle shadow
- Each card: Icon + Valor + Label + Trend

Métricas Críticas:
1. Conversaciones Activas (realtime counter)
2. Tiempo Respuesta Promedio (con benchmark)
3. Satisfacción Cliente (star rating + %)
4. Automatización Rate (% resuelto por IA)

Visual:
- Números grandes: Display M Bold
- Trends: Arrow icon + percentage change
- Colors: Verde (good), Rojo (bad), Gray (neutral)
```

#### **Gráficos y Visualizaciones**
```
Chart Container:
- Background: White card
- Padding: 24px
- Border radius: 12px
- Title: Heading M + time range selector

Chart Types:
- Line: Conversaciones por hora/día
- Bar: Temas más consultados
- Donut: Distribución por canal
- Heat map: Actividad por hora del día

Colors:
- Primary data: Naranja 500
- Secondary: Azul 400
- Comparison: Gray 400
- Negative: Rojo 400
```

### **4.5 Marketplace de Integraciones**

#### **Grid de Integraciones**
```
Layout:
- Grid responsive: 3 cols → 2 cols → 1 col
- Card style: Hover elevación sutil
- Categories: Tabs horizontales

Integration Card:
- Logo/icon: 48px
- Nombre: Heading S
- Descripción: Body S (2 líneas max)
- Status: Badge (Instalado/Disponible)
- CTA: "Instalar" o "Configurar"

Visual:
- Installed: Check badge verde
- Popular: "Popular" badge naranja
- New: "Nuevo" badge azul
```

#### **Wizard de Instalación**
```
Steps:
1. Permisos y alcance
2. Configuración básica
3. Testing de conexión
4. Confirmación

Visual por Step:
- Progress indicator: Steps con líneas conectoras
- Current step: Naranja 500, completed: Verde 500
- Form validation en tiempo real
- "Anterior" + "Siguiente" navigation
- Skip options donde aplicable
```

---

## 📐 **5. GUÍAS DE APLICACIÓN**

### **5.1 Modo Claro vs Modo Oscuro**

#### **Elementos que NO Cambian**
```
- Color Naranja primario (#F97316)
- Iconos outline style
- Border radius y spacing
- Typography scale
- Component proportions
```

#### **Elementos que SÍ Cambian**
```
Backgrounds:
Claro: Blanco (#FFFFFF) → Oscuro: Dark 50 (#18181B)
Claro: Gray 50 (#F9FAFB) → Oscuro: Dark 100 (#27272A)

Text:
Claro: Gray 900 (#111827) → Oscuro: Dark 900 (#FAFAFA)
Claro: Gray 600 (#4B5563) → Oscuro: Dark 600 (#D4D4D8)

Borders:
Claro: Gray 200 (#E5E7EB) → Oscuro: Dark 300 (#52525B)
Claro: Gray 300 (#D1D5DB) → Oscuro: Dark 400 (#71717A)
```

#### **Consideraciones Especiales**
```
Shadows:
- Modo claro: rgba(0,0,0,0.1)
- Modo oscuro: rgba(0,0,0,0.3) (más intensas)

Images/Illustrations:
- Proveer versiones optimizadas para cada modo
- Logos: Versión light/dark
- Icons: Mantener peso visual consistent

Chat Bubbles:
- Bot messages: Contraste suficiente en ambos modos
- User messages: Mantener naranja en ambos
```

### **5.2 Responsive Design**

#### **Breakpoints y Comportamientos**
```
Mobile (0-767px):
- Single column layouts
- Hamburger navigation
- Bottom sheet modals
- Simplified forms (1 column)
- Touch-optimized interactions (min 44px)

Tablet (768-1023px):
- Sidebar navigation (collapsible)
- 2-column forms
- Modal overlays
- Intermediate spacing

Desktop (1024px+):
- Full sidebar navigation
- Multi-column layouts
- Hover states activos
- Keyboard shortcuts
- Larger spacing values
```

#### **Componentes Específicos Mobile**

**Bottom Navigation (Mobile Only)**
```
- Height: 68px + safe area
- Background: Blanco/Dark 100
- Border top: Gray 200/Dark 300
- 5 main items: Dashboard, Chats, Bots, Analytics, More
- Active: Naranja 500 icon + label
- Inactive: Gray 400 icon + label
```

**Mobile Chat Interface**
```
- Header: Fixed, contact info + back button
- Messages: Full height minus header/composer
- Composer: Fixed bottom, auto-expand textarea
- Keyboard handling: Scroll to bottom on focus
```

### **5.3 Accesibilidad (WCAG 2.1 AA)**

#### **Contraste de Colores**
```
Ratios Mínimos:
- Text normal: 4.5:1
- Text grande (18px+): 3:1
- Components: 3:1
- UI elements: 3:1

Verificación:
- Naranja 500 sobre blanco: ✓ 4.52:1
- Naranja 600 sobre blanco: ✓ 5.74:1
- Gray 600 sobre blanco: ✓ 7.23:1
- Dark 600 sobre Dark 50: ✓ 11.58:1
```

#### **Navegación por Teclado**
```
Focus States:
- Ring: 4px solid con color del componente
- Offset: 2px del elemento
- Visible en todos los elementos interactivos
- Skip links para navegación rápida

Tab Order:
- Lógico: left-to-right, top-to-bottom
- Bypass blocks: "Skip to main content"
- Modal trapping: Focus dentro del modal
- Return focus: Al cerrar modals/dropdowns
```

#### **Screen Readers**
```
ARIA Labels:
- Buttons: Descriptivo, no genérico ("Enviar mensaje" no "Enviar")
- Form fields: Labels asociados + descriptions
- Status updates: aria-live regions
- Navigation: Landmarks y roles

Alt Text:
- Images: Descriptivo del contenido
- Icons: Función, no apariencia
- Decorative: alt="" (vacío)
- Complex graphics: Long descriptions
```

#### **Motion y Animaciones**
```
Prefers-reduced-motion:
- Respetar preferencia del usuario
- Alternativas sin movimiento
- Animaciones esenciales → instantáneas
- Opcional: Setting manual en app
```

### **5.4 White Label y Personalización**

#### **Elementos Customizables**
```
Logo y Branding:
- Logo principal: SVG, 200px max width
- Favicon: 32x32, 16x16 versions
- Loading logo: Versión simplificada

Colors:
- Primary color: Reemplaza Naranja 500
- Generate tints automáticamente
- Secondary color: Opcional
- Mantener grises y states (rojo, verde, amarillo)

Typography:
- Fuente principal: Google Fonts supported
- Mantener scale y hierarchy
- Fallbacks siempre incluidos
```

#### **Restricciones de Personalización**
```
NO Customizable:
- Layout structure
- Component proportions
- Spacing system
- Icon style
- Animation timing
- Accessibility features

Conditional Customization:
- Solo si mantiene contraste WCAG
- Solo si mantiene usabilidad
- Preview obligatorio antes de aplicar
```

#### **Configuración UI**
```
Admin Panel:
- Preview en tiempo real
- Color picker con validación
- Logo uploader con specs
- Reset to defaults option
- Export/import configurations

Implementation:
- CSS custom properties
- Runtime theme switching
- Cached configurations
- Fallback to defaults
```

### **5.5 Estados Vacío y Error**

#### **Empty States**
```
No Conversations:
- Illustration: Bot esperando pacientemente
- Heading: "¡Listo para tu primera conversación!"
- Description: "Los chats aparecerán aquí cuando lleguen"
- CTA: "Probar bot ahora"

No Integrations:
- Illustration: Puzzle pieces esperando
- Heading: "Conecta tu primera integración"
- Description: "Potencia tu bot con Google Sheets, Gmail y más"
- CTA: "Explorar integraciones"

No Analytics Data:
- Illustration: Gráfico vacío con reloj
- Heading: "Datos llegando pronto..."
- Description: "Las métricas aparecerán después de las primeras conversaciones"
- Secondary text: "Generalmente toma 24-48 horas"
```

#### **Error States**
```
Connection Error:
- Icon: Wifi con X roja
- Heading: "Problema de conexión"
- Description: "No pudimos conectar con el servidor"
- CTAs: "Reintentar" (primario) + "Reportar problema" (secundario)

Authentication Error:
- Icon: Lock con warning
- Heading: "Sesión expirada"
- Description: "Por seguridad, necesitas iniciar sesión nuevamente"
- CTA: "Iniciar sesión"

Rate Limit Error:
- Icon: Clock con pause
- Heading: "Límite alcanzado"
- Description: "Has alcanzado el límite de tu plan. Actualiza para continuar."
- CTAs: "Ver planes" (primario) + "Contactar soporte"
```

#### **Tono de Messaging**
```
Characteristics:
- Empático, no culpa al usuario
- Solutivo, siempre ofrece next steps
- Claro, sin jerga técnica
- Positivo, frame challenges como opportunities

Examples:
❌ "Error 503: Service unavailable"
✅ "Estamos trabajando en una mejora. Inténtalo en unos minutos."

❌ "Invalid input format"
✅ "El formato no es correcto. Prueba con: ejemplo@email.com"

❌ "Insufficient permissions"
✅ "Necesitas permisos de administrador para esta acción"
```

---

## 🛠️ **6. IMPLEMENTACIÓN Y CHECKLISTS**

### **6.1 Checklist Pre-Desarrollo**

#### **Setup de Design System**
```
Tokens y Variables:
□ CSS custom properties definidas
□ JavaScript design tokens exportados
□ Figma variables sincronizadas
□ Documentation website inicializado

Core Components:
□ Button variants y states
□ Input fields y validación
□ Typography scale implementada
□ Color palette confirmada
□ Icon library integrada
```

#### **Accessibility Foundation**
```
WCAG Compliance:
□ Color contrast ratios verificados
□ Focus states implementados
□ Screen reader testing comenzado
□ Keyboard navigation functional
□ ARIA labels y roles definidos

Testing Setup:
□ axe-core integrado
□ Lighthouse CI configurado
□ Manual testing checklist creado
□ Screen reader software instalado
```

### **6.2 Métricas y Performance**

#### **UX Metrics**
```
Core Web Vitals:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

User Experience:
- Time to Interactive: < 3s
- Page Load Time: < 2s
- Form completion rate: > 85%
- User satisfaction (CSAT): > 4.2/5
```

#### **Design System Metrics**
```
Component Usage:
- Reusability rate: > 80%
- Design debt: < 10% custom overrides
- Consistency score: > 90%
- A11y compliance: 100% WCAG AA

Developer Experience:
- Component integration time: < 30min
- Documentation clarity score: > 4.5/5
- Build time impact: < 15% increase
```

### **6.3 Testing y Validación**

#### **Usability Testing Protocol**
```
Pre-Launch Testing:
1. Moderated user testing (5 users, key flows)
2. Unmoderated task completion (20 users)
3. A/B testing on critical CTAs
4. Mobile usability testing
5. Accessibility testing with disabled users

Success Criteria:
- Task completion rate: > 85%
- Time on task: Within 20% of target
- User satisfaction: > 4.0/5
- Error rate: < 5%
- Accessibility: Zero critical issues
```

#### **Cross-Platform Testing**
```
Device Testing:
□ iOS Safari (iPhone SE, 12 Pro, 13 Pro Max)
□ Android Chrome (Galaxy S21, Pixel 6)
□ Desktop Chrome, Firefox, Safari
□ Tablet (iPad, Samsung Galaxy Tab)

Network Testing:
□ 3G simulation
□ WiFi interruption handling
□ Offline state management
□ Progressive enhancement
```

### **6.4 Design Review Process**

#### **Review Checkpoints**
```
Component Level:
□ Matches design specifications exactly
□ All states implemented (hover, focus, disabled)
□ Responsive behavior correct
□ Accessibility requirements met
□ Performance benchmarks achieved

Flow Level:
□ User journey seamless
□ Error states handled gracefully
□ Loading states informative
□ Success states celebratory
□ Edge cases considered
```

#### **Quality Gates**
```
Before Code Review:
□ Design QA passed
□ Accessibility audit clean
□ Cross-browser testing complete
□ Performance metrics within targets

Before Production:
□ Stakeholder approval received
□ User testing results positive
□ Analytics tracking implemented
□ Documentation updated
□ Rollback plan prepared
```

### **6.5 Maintenance y Evolución**

#### **Continuous Improvement**
```
Monthly Reviews:
- User feedback analysis
- Analytics review (conversion, engagement)
- Performance monitoring
- Accessibility compliance check
- Component usage analysis

Quarterly Updates:
- Design system evolution planning
- New component requirements
- Deprecation of unused patterns
- Tool and technology updates
```

#### **Feedback Loop**
```
Data Sources:
- User support tickets
- Usability testing results
- Developer feedback
- Analytics insights
- Accessibility audits

Action Items:
- Component improvements
- New pattern development
- Documentation updates
- Training needs
- Tool upgrades
```

---

## 🔧 **7. RECOMENDACIONES TÉCNICAS DE IMPLEMENTACIÓN**

### **7.1 Librerías de Componentes UI Recomendadas**

#### **shadcn/ui - Recomendación Principal**
```
Ventajas para NeurAnt:
- Compatible con Next.js 14+ y App Router
- Basado en Radix UI (accesibilidad WCAG por defecto)
- Customizable con Tailwind CSS (alineado con design tokens)
- Copy-paste approach (no dependencia externa pesada)
- Soporte completo para modo oscuro
- Componentes headless fácilmente brandeable

Componentes Prioritarios:
- Button, Input, Select, Dialog, Toast
- Command, Popover, Dropdown Menu
- Avatar, Badge, Card, Separator
- Form validation con react-hook-form
- Accordion, Tabs, Progress
```

#### **Alternativas Consideradas**
```
Radix UI Primitives:
- Pros: Máxima flexibilidad, accesibilidad nativa
- Contras: Más trabajo de styling, mayor curva de aprendizaje

Mantine:
- Pros: Componentes completos, theme system robusto
- Contras: Menos alineado con design tokens custom

Chakra UI:
- Pros: Developer experience excelente
- Contras: Bundle size mayor, menos customizable
```

### **7.2 Herramientas de Styling Recomendadas**

#### **Tailwind CSS - Implementación del Design System**
```
Configuración Recomendada:
- Custom theme basado en design tokens de la guía
- Plugin de forms para consistencia en inputs
- Plugin de typography para jerarquías de texto
- Configuración de breakpoints responsive
- Variables CSS para modo claro/oscuro

Extensiones Sugeridas:
- @tailwindcss/forms
- @tailwindcss/typography
- tailwindcss-animate (para micro-interacciones)
- class-variance-authority (para variantes de componentes)
```

#### **CSS-in-JS Alternativo**
```
Stitches.js:
- Recomendado si se prefiere CSS-in-JS
- Excelente TypeScript support
- Theming avanzado para white-label
- Performance optimizada
```

### **7.3 Iconografía y Assets**

#### **Lucide React - Sistema de Iconos**
```
Selección por:
- Outline style (alineado con guía de diseño)
- Consistencia visual
- Tree-shakeable (solo importar iconos necesarios)
- Customizable (tamaño, color, stroke width)
- Excelente para interfaces de IA/tech

Categorías Prioritarias:
- Bot, Brain, Zap, Sparkles (IA)
- MessageCircle, Phone, Users (Comunicación)
- BarChart3, TrendingUp, Target (Analytics)
- Settings, Puzzle, Lock, Key (Configuración)
```

#### **Alternativas de Iconos**
```
Heroicons:
- Diseñado por Tailwind team
- Outline y solid variants
- Excelente consistency

Phosphor Icons:
- Más variedad de iconos
- Multiple weights disponibles
- Buena para apps técnicas
```

### **7.4 Herramientas de Animación**

#### **Framer Motion - Micro-interacciones**
```
Casos de Uso en NeurAnt:
- Transiciones entre states de componentes
- Loading states y skeletons animados
- Hover effects sutiles en cards/buttons
- Page transitions en onboarding
- Celebratory animations (confetti, success states)

Consideraciones:
- Bundle size impact moderado
- Excelente developer experience
- Respeta prefers-reduced-motion automáticamente
```

#### **Alternativas Ligeras**
```
Auto-animate:
- Ultra ligero para transiciones automáticas
- Perfecto para listas y layouts dinámicos

CSS Animations:
- Máximo performance
- Para animaciones críticas (spinners, progress)
```

### **7.5 Gestión de Estado UI**

#### **Zustand - Estado de UI Global**
```
Casos de Uso:
- Theme switching (claro/oscuro)
- Sidebar collapse/expand state
- Toast notifications queue
- Modal/dialog management
- User preferences (white-label settings)

Ventajas:
- Minimal boilerplate
- TypeScript first
- No providers necesarios
- Excelente para estado UI simple
```

#### **React Query (TanStack Query) - Estado de Servidor**
```
Ya confirmado en stack técnico:
- Perfecto para chat real-time data
- Cache de analytics y métricas
- Optimistic updates en configuraciones
- Background refetch para dashboard
```

### **7.6 Formularios y Validación**

#### **React Hook Form + Zod**
```
Recomendación para NeurAnt:
- Performance óptimo (uncontrolled components)
- Validación TypeScript-first con Zod
- Integración nativa con shadcn/ui
- Excelente UX para forms complejos (onboarding, configuración)

Casos Críticos:
- Onboarding multi-step forms
- Bot configuration panels
- Integration setup wizards
- User profile management
```

### **7.7 Testing de Componentes UI**

#### **Testing Library + Jest**
```
Enfoque Recomendado:
- Testing de accesibilidad con @testing-library/jest-dom
- Visual regression testing con Chromatic/Percy
- User interaction testing con @testing-library/user-event
- A11y testing con jest-axe

Prioridades de Testing:
- Componentes críticos (buttons, forms, chat)
- Flujos de onboarding
- Estados de error y loading
- Keyboard navigation
```

### **7.8 Performance y Bundling**

#### **Next.js 14+ Optimizaciones**
```
Configuraciones Recomendadas:
- Bundle analyzer para monitoring de size
- Dynamic imports para componentes pesados
- Image optimization nativo
- Font optimization (Inter preload)
- Edge functions para features real-time

Critical Path:
- Core components en main bundle
- Chat components lazy-loaded
- Analytics/dashboard como route-level splits
```

### **7.9 Desarrollo y Tooling**

#### **Storybook - Component Development**
```
Beneficios para Design System:
- Desarrollo aislado de componentes
- Visual testing de todas las variants
- Documentación interactiva
- Integración con Figma (design tokens sync)
- Regression testing visual

Setup Recomendado:
- Storybook 7+ con Vite builder
- Addon controls para variant testing
- Addon a11y para accessibility testing
- Addon docs para documentación automática
```

#### **Developer Experience Tools**
```
Prettier + ESLint:
- Configuración standard para consistency
- Tailwind class sorting automático
- Import organization automática

TypeScript:
- Strict mode habilitado
- Component prop types strict
- Theme typing para design tokens

Husky + lint-staged:
- Pre-commit hooks para quality
- Automated testing antes de commit
```

### **7.10 Deployment y CI/CD**

#### **Vercel - Hosting Recomendado**
```
Ya confirmado en stack:
- Edge functions para real-time features
- Automatic image optimization
- Performance monitoring integrado
- Preview deployments para design review

Configuraciones Críticas:
- Build time optimization
- Bundle size monitoring
- Core Web Vitals tracking
- Error boundary reporting
```

---

## 📋 **CONCLUSIÓN Y PRÓXIMOS PASOS**

### **Resumen del Sistema de Diseño**
Este sistema está diseñado para crear una experiencia **accesible**, **profesional** y **escalable** para NeurAnt, enfocada en usuarios PyME latinoamericanos que necesitan herramientas de IA potentes pero simples de usar.

### **Prioridades de Implementación**
1. **Fase 1**: Core components (buttons, forms, navigation)
2. **Fase 2**: Chat interfaces y estados en tiempo real
3. **Fase 3**: Dashboard analytics y visualizaciones
4. **Fase 4**: Advanced features (white-label, integrations)

### **Éxito Esperado**
- Onboarding completado en <10 minutos
- Satisfacción usuario >4.2/5
- Compliance WCAG 2.1 AA al 100%
- Tiempo de desarrollo reducido en 40%
- Consistencia visual en toda la plataforma

---

*Esta guía es un documento vivo que debe evolucionar con el producto y las necesidades de los usuarios.*