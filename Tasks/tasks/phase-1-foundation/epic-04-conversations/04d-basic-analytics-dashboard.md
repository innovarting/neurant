# TASK-P1E4-04d: Basic Analytics Dashboard

## Identificación
- **ID:** TASK-P1E4-04d
- **Título:** Basic Analytics Dashboard UI
- **Type:** Frontend UI
- **Phase:** 1 - Foundation
- **Epic:** Epic 4 - Conversations
- **Sprint:** Sprint 1.2
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 12 horas
- **Prioridad:** Media

## Definición Técnica
Implementar dashboard básico de analytics para conversaciones y chatbots, incluyendo métricas clave (volumen, satisfacción, tiempos de respuesta), gráficos interactivos, filtros por fecha/chatbot, exportación de datos, y indicadores KPI con actualización en tiempo real.

## Referencias de Documentación NeurAnt
- **UI/UX Requirements:** `docs/architecture/08-onboarding-flow.md:150-200` (dashboard analytics patterns)
- **Component Specs:** `docs/architecture/13-diagrama-entidad-relacion.md:460-480` (analytics data structure)  
- **User Flow:** `docs/architecture/12-guias-implementacion-rbac.md:150-200` (analytics permissions)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:50-75` (charting libraries)

## Referencias de Diseño Visual (GUIA_DISENO_VISUAL_NEURANT.md)
- **🎯 PATRÓN CRÍTICO - Dashboard Analytics:** `GUIA_DISENO_VISUAL_NEURANT.md:698-738` (KPIs Principales, Gráficos y Visualizaciones completas)
- **Cards y Layouts:** `GUIA_DISENO_VISUAL_NEURANT.md:698-717` (Grid 4 columnas, métricas críticas, trends)
- **Formularios:** `GUIA_DISENO_VISUAL_NEURANT.md:277-342` (Input Fields para filtros de fecha, chatbot)
- **Botones:** `GUIA_DISENO_VISUAL_NEURANT.md:223-275` (Botón Primario para exportación, Secundario para filtros)
- **Estados y Feedback:** `GUIA_DISENO_VISUAL_NEURANT.md:472-532` (Loading states para datos, Toast para exportaciones)
- **Tipografía:** `GUIA_DISENO_VISUAL_NEURANT.md:116-149` (Display M Bold para números grandes, Caption para metadata)
- **Colores:** `GUIA_DISENO_VISUAL_NEURANT.md:53-114` (Verde success, Rojo alerts, Gray neutral para trends)
- **Responsive Design:** `GUIA_DISENO_VISUAL_NEURANT.md:824-867` (Grid responsivo: 4→2→1 columnas)
- **Accesibilidad:** `GUIA_DISENO_VISUAL_NEURANT.md:869-923` (WCAG 2.1 AA para visualizaciones de datos)
- **Recomendaciones Técnicas:** `GUIA_DISENO_VISUAL_NEURANT.md:1219-1235` (shadcn/ui componentes), `GUIA_DISENO_VISUAL_NEURANT.md:1356-1363` (TanStack Query para real-time data)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E4-04a ✅ (conversations database schema)
  - [x] TASK-P1E4-04b ✅ (conversations analytics API)
  - [x] TASK-P1E2-02d ✅ (dashboard layout base)
  - [x] TASK-P1E3-03b ✅ (chatbots API for filters)
- **Bloquea:**
  - [ ] TASK-P2E1-05d (advanced RAG analytics)
  - [ ] TASK-P3E1-08a (HITL performance metrics)

## UI/UX Specifications
### Design Requirements
- **Layout:** Grid-based dashboard con widgets reorganizables
- **Responsive:** Mobile-first con breakpoints adaptativos
- **Theme:** Support completo para light/dark mode
- **Accessibility:** WCAG 2.1 AA con keyboard navigation para charts

### Component Structure
```tsx
// Estructura de componentes principales
interface AnalyticsDashboardProps {
  dateRange: DateRange
  selectedChatbots: string[]
  refreshInterval?: number
}

interface MetricCardProps {
  title: string
  value: number | string
  previousValue?: number
  trend?: 'up' | 'down' | 'stable'
  icon: React.ComponentType
  format?: 'number' | 'percentage' | 'duration' | 'currency'
}

interface ConversationVolumeChartProps {
  data: ConversationVolumeData[]
  period: 'day' | 'week' | 'month'
  onPeriodChange: (period: string) => void
}

interface SatisfactionChartProps {
  data: SatisfactionData[]
  showTrend?: boolean
}
```

## Criterios de Aceptación Específicos
### Functional Requirements
- [ ] Métricas clave con trends y comparaciones período anterior
- [ ] Gráficos interactivos con zoom, tooltip y drill-down
- [ ] Filtros por rango de fechas, chatbots y operadores
- [ ] Exportación de datos en CSV/Excel
- [ ] Refresh automático cada 5 minutos
- [ ] Indicadores en tiempo real para conversaciones activas

### Visual Requirements
- [ ] Design system shadcn/ui aplicado a todos los components
- [ ] Color coding consistente para estados y métricas
- [ ] Responsive grid que adapta en mobile/tablet/desktop
- [ ] Loading skeletons durante fetch de datos
- [ ] Empty states informativos cuando no hay datos

### Accessibility Requirements
- [ ] Charts accesibles con tablas de datos alternativas
- [ ] Keyboard navigation para todos los controles
- [ ] Screen reader announcements para cambios de datos
- [ ] Alto contraste para todos los elementos visuales
- [ ] Focus indicators claros en elementos interactivos

### Performance Requirements
- [ ] Lazy loading de gráficos complejos
- [ ] Data caching con smart invalidation
- [ ] Debounced API calls para filtros
- [ ] Virtual scrolling para tablas de datos grandes
- [ ] Bundle splitting para librerías de charts

## Archivos a Crear/Modificar
```
// Main pages
app/dashboard/analytics/page.tsx
app/dashboard/analytics/conversations/page.tsx
app/dashboard/analytics/chatbots/page.tsx

// Core components
components/analytics/analytics-dashboard.tsx
components/analytics/metric-card.tsx
components/analytics/kpi-grid.tsx
components/analytics/conversation-volume-chart.tsx
components/analytics/satisfaction-chart.tsx
components/analytics/response-time-chart.tsx
components/analytics/top-chatbots-table.tsx
components/analytics/recent-conversations-table.tsx
components/analytics/analytics-filters.tsx
components/analytics/date-range-picker.tsx
components/analytics/export-button.tsx
components/analytics/refresh-indicator.tsx
components/analytics/index.ts

// Chart utilities
components/charts/area-chart.tsx
components/charts/bar-chart.tsx
components/charts/line-chart.tsx
components/charts/donut-chart.tsx
components/charts/chart-container.tsx
components/charts/chart-tooltip.tsx

// Hooks
hooks/use-analytics-data.ts
hooks/use-real-time-metrics.ts
hooks/use-export-data.ts
hooks/use-chart-interactions.ts

// Utilities
lib/utils/analytics-helpers.ts
lib/utils/chart-formatters.ts
lib/utils/export-helpers.ts

// Types
types/analytics.ts

// Tests
__tests__/components/analytics/analytics-dashboard.test.tsx
__tests__/components/analytics/metric-card.test.tsx
__tests__/hooks/use-analytics-data.test.ts
```

## Component Implementation

### Main Analytics Dashboard
```tsx
// app/dashboard/analytics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { addDays, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnalyticsFilters } from '@/components/analytics/analytics-filters'
import { KPIGrid } from '@/components/analytics/kpi-grid'
import { ConversationVolumeChart } from '@/components/analytics/conversation-volume-chart'
import { SatisfactionChart } from '@/components/analytics/satisfaction-chart'
import { ResponseTimeChart } from '@/components/analytics/response-time-chart'
import { TopChatbotsTable } from '@/components/analytics/top-chatbots-table'
import { RecentConversationsTable } from '@/components/analytics/recent-conversations-table'
import { ExportButton } from '@/components/analytics/export-button'
import { RefreshIndicator } from '@/components/analytics/refresh-indicator'
import { useAnalyticsData } from '@/hooks/use-analytics-data'
import { useRealTimeMetrics } from '@/hooks/use-real-time-metrics'
import type { DateRange, AnalyticsFilters as FiltersType } from '@/types/analytics'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  })

  const [filters, setFilters] = useState<FiltersType>({
    chatbot_ids: [],
    operator_ids: [],
    channels: [],
    status: 'all'
  })

  const [autoRefresh, setAutoRefresh] = useState(true)

  const {
    data: analyticsData,
    loading,
    error,
    lastUpdated,
    refetch
  } = useAnalyticsData({
    dateRange,
    filters,
    refreshInterval: autoRefresh ? 300000 : undefined // 5 minutes
  })

  // Real-time metrics for live updates
  const { liveMetrics } = useRealTimeMetrics({
    enabled: autoRefresh
  })

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange)
  }

  const handleFiltersChange = (newFilters: FiltersType) => {
    setFilters(newFilters)
  }

  const quickDateRanges = [
    {
      label: 'Últimos 7 días',
      value: { from: subDays(new Date(), 7), to: new Date() }
    },
    {
      label: 'Últimos 30 días', 
      value: { from: subDays(new Date(), 30), to: new Date() }
    },
    {
      label: 'Este mes',
      value: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }
    },
    {
      label: 'Mes pasado',
      value: { 
        from: startOfMonth(subDays(new Date(), 30)), 
        to: endOfMonth(subDays(new Date(), 30)) 
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Métricas y insights de rendimiento de tus chatbots
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <RefreshIndicator 
            lastUpdated={lastUpdated}
            autoRefresh={autoRefresh}
            onToggleAutoRefresh={setAutoRefresh}
            onRefresh={refetch}
          />
          <ExportButton 
            data={analyticsData}
            dateRange={dateRange}
            filters={filters}
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <AnalyticsFilters
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            quickRanges={quickDateRanges}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {/* KPI Overview */}
      <KPIGrid 
        data={analyticsData?.overview}
        liveMetrics={liveMetrics}
        loading={loading}
        previousPeriodData={analyticsData?.previousPeriod}
      />

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfacción</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Volumen de Conversaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ConversationVolumeChart
                  data={analyticsData?.conversationVolume || []}
                  loading={loading}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfacción del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <SatisfactionChart
                  data={analyticsData?.satisfaction || []}
                  loading={loading}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TopChatbotsTable 
              data={analyticsData?.topChatbots || []}
              loading={loading}
            />
            <RecentConversationsTable
              data={analyticsData?.recentConversations || []}
              loading={loading}
            />
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversaciones por Día</CardTitle>
              </CardHeader>
              <CardContent>
                <ConversationVolumeChart
                  data={analyticsData?.conversationVolume || []}
                  loading={loading}
                  height={400}
                  showComparison={true}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Puntuación de Satisfacción</CardTitle>
              </CardHeader>
              <CardContent>
                <SatisfactionChart
                  data={analyticsData?.satisfaction || []}
                  loading={loading}
                  height={300}
                  showTrend={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <SatisfactionChart
                  data={analyticsData?.satisfactionDistribution || []}
                  loading={loading}
                  height={300}
                  type="donut"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tiempo de Respuesta</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponseTimeChart
                  data={analyticsData?.responseTime || []}
                  loading={loading}
                  height={400}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### KPI Grid Component
```tsx
// components/analytics/kpi-grid.tsx
'use client'

import { 
  MessageCircle, 
  Users, 
  Clock, 
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { MetricCard } from './metric-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsOverview, LiveMetrics } from '@/types/analytics'

interface KPIGridProps {
  data?: AnalyticsOverview
  liveMetrics?: LiveMetrics
  loading: boolean
  previousPeriodData?: AnalyticsOverview
}

export const KPIGrid: React.FC<KPIGridProps> = ({
  data,
  liveMetrics,
  loading,
  previousPeriodData
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'stable'
  }

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Conversaciones"
        value={data?.total_conversations || 0}
        previousValue={previousPeriodData?.total_conversations}
        trend={previousPeriodData ? calculateTrend(
          data?.total_conversations || 0,
          previousPeriodData.total_conversations
        ) : undefined}
        icon={MessageCircle}
        format="number"
        liveValue={liveMetrics?.active_conversations}
      />

      <MetricCard
        title="Conversaciones Activas"
        value={data?.active_conversations || 0}
        previousValue={previousPeriodData?.active_conversations}
        trend={previousPeriodData ? calculateTrend(
          data?.active_conversations || 0,
          previousPeriodData.active_conversations
        ) : undefined}
        icon={Users}
        format="number"
        liveValue={liveMetrics?.active_conversations}
        isLive={true}
      />

      <MetricCard
        title="Tiempo Resp. Promedio"
        value={data?.avg_response_time_minutes || 0}
        previousValue={previousPeriodData?.avg_response_time_minutes}
        trend={previousPeriodData ? calculateTrend(
          previousPeriodData.avg_response_time_minutes || 0, // Inverted: lower is better
          data?.avg_response_time_minutes || 0
        ) : undefined}
        icon={Clock}
        format="duration"
      />

      <MetricCard
        title="Satisfacción"
        value={data?.avg_satisfaction_rating || 0}
        previousValue={previousPeriodData?.avg_satisfaction_rating}
        trend={previousPeriodData ? calculateTrend(
          data?.avg_satisfaction_rating || 0,
          previousPeriodData.avg_satisfaction_rating || 0
        ) : undefined}
        icon={ThumbsUp}
        format="rating"
        suffix="/5"
      />
    </div>
  )
}
```

### Metric Card Component  
```tsx
// components/analytics/metric-card.tsx
'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: number | string
  previousValue?: number
  trend?: 'up' | 'down' | 'stable'
  icon: React.ComponentType<{ className?: string }>
  format?: 'number' | 'percentage' | 'duration' | 'currency' | 'rating'
  suffix?: string
  prefix?: string
  liveValue?: number
  isLive?: boolean
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  trend,
  icon: Icon,
  format = 'number',
  suffix = '',
  prefix = '',
  liveValue,
  isLive = false,
  className
}) => {
  const [displayValue, setDisplayValue] = useState(value)
  const [isUpdating, setIsUpdating] = useState(false)

  // Animate value changes for live metrics
  useEffect(() => {
    if (liveValue !== undefined && liveValue !== displayValue) {
      setIsUpdating(true)
      const timer = setTimeout(() => {
        setDisplayValue(liveValue)
        setIsUpdating(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [liveValue, displayValue])

  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'number':
        return val.toLocaleString()
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'duration':
        if (val < 60) return `${val.toFixed(0)}s`
        return `${(val / 60).toFixed(1)}m`
      case 'currency':
        return `$${val.toLocaleString()}`
      case 'rating':
        return val.toFixed(1)
      default:
        return val.toString()
    }
  }

  const calculatePercentageChange = (): number => {
    if (!previousValue || previousValue === 0) return 0
    const current = typeof displayValue === 'number' ? displayValue : parseFloat(displayValue.toString())
    return ((current - previousValue) / previousValue) * 100
  }

  const percentageChange = previousValue ? calculatePercentageChange() : null

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card className={cn('transition-all duration-200', isUpdating && 'ring-2 ring-blue-500/20', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
          {isLive && (
            <Badge variant="outline" className="ml-2 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Live
            </Badge>
          )}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className={cn(
            'text-2xl font-bold transition-all duration-200',
            isUpdating && 'scale-105'
          )}>
            {prefix}{formatValue(displayValue)}{suffix}
          </div>
          
          {percentageChange !== null && trend && (
            <div className={cn(
              'flex items-center text-xs',
              getTrendColor()
            )}>
              {getTrendIcon()}
              <span className="ml-1">
                {Math.abs(percentageChange).toFixed(1)}% vs período anterior
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Conversation Volume Chart
```tsx
// components/analytics/conversation-volume-chart.tsx
'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer } from '@/components/charts/chart-container'
import { ChartTooltip } from '@/components/charts/chart-tooltip'
import type { ConversationVolumeData } from '@/types/analytics'

interface ConversationVolumeChartProps {
  data: ConversationVolumeData[]
  loading?: boolean
  height?: number
  showComparison?: boolean
}

export const ConversationVolumeChart: React.FC<ConversationVolumeChartProps> = ({
  data,
  loading = false,
  height = 300,
  showComparison = false
}) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')

  if (loading) {
    return <Skeleton className={`w-full h-[${height}px]`} />
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No hay datos para mostrar</p>
      </div>
    )
  }

  const formatXAxisLabel = (tickItem: string) => {
    try {
      const date = parseISO(tickItem)
      switch (period) {
        case 'day':
          return format(date, 'dd/MM', { locale: es })
        case 'week':
          return format(date, 'dd MMM', { locale: es })
        case 'month':
          return format(date, 'MMM yyyy', { locale: es })
        default:
          return format(date, 'dd/MM', { locale: es })
      }
    } catch {
      return tickItem
    }
  }

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <ChartTooltip
          title={format(parseISO(label), 'dd MMMM yyyy', { locale: es })}
          items={[
            {
              label: 'Conversaciones',
              value: payload[0].value,
              color: payload[0].color
            },
            ...(showComparison && payload[1] ? [{
              label: 'Período anterior',
              value: payload[1].value,
              color: payload[1].color
            }] : [])
          ]}
        />
      )
    }
    return null
  }

  return (
    <ChartContainer>
      {/* Period selector */}
      <div className="flex justify-end mb-4 space-x-2">
        {(['day', 'week', 'month'] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p === 'day' && 'Día'}
            {p === 'week' && 'Semana'}
            {p === 'month' && 'Mes'}
          </Button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="conversationsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
            {showComparison && (
              <linearGradient id="comparisonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisLabel}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip content={customTooltip} />
          {showComparison && <Legend />}
          
          <Area
            type="monotone"
            dataKey="conversations"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#conversationsGradient)"
            strokeWidth={2}
            name="Conversaciones"
          />
          
          {showComparison && (
            <Area
              type="monotone"
              dataKey="previous_period"
              stroke="hsl(var(--muted-foreground))"
              fillOpacity={1}
              fill="url(#comparisonGradient)"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Período anterior"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
```

### Analytics Data Hook
```tsx
// hooks/use-analytics-data.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { DateRange, AnalyticsFilters, AnalyticsData } from '@/types/analytics'

interface UseAnalyticsDataOptions {
  dateRange: DateRange
  filters: AnalyticsFilters
  refreshInterval?: number
}

export const useAnalyticsData = (options: UseAnalyticsDataOptions) => {
  const { dateRange, filters, refreshInterval } = options
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const queryKey = [
    'analytics',
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    filters
  ]

  const {
    data,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<AnalyticsData> => {
      const searchParams = new URLSearchParams({
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
        ...(filters.chatbot_ids?.length && { 
          chatbot_ids: filters.chatbot_ids.join(',') 
        }),
        ...(filters.operator_ids?.length && { 
          operator_ids: filters.operator_ids.join(',') 
        }),
        ...(filters.channels?.length && { 
          channels: filters.channels.join(',') 
        }),
        ...(filters.status !== 'all' && { status: filters.status })
      })

      const response = await fetch(`/api/conversations/analytics?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const result = await response.json()
      setLastUpdated(new Date())
      return result.data
    },
    staleTime: 60000, // 1 minute
    refetchInterval: refreshInterval,
    onError: (error) => {
      toast.error('Error loading analytics data')
      console.error('Analytics fetch error:', error)
    }
  })

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    try {
      await refetch()
      toast.success('Analytics data refreshed')
    } catch (error) {
      toast.error('Failed to refresh data')
    }
  }, [refetch])

  return {
    data,
    loading,
    error: error?.message || null,
    lastUpdated,
    refetch: handleRefresh
  }
}
```

### Export Button Component
```tsx
// components/analytics/export-button.tsx
'use client'

import { useState } from 'react'
import { Download, FileText, Table } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useExportData } from '@/hooks/use-export-data'
import { toast } from 'sonner'
import type { AnalyticsData, DateRange, AnalyticsFilters } from '@/types/analytics'

interface ExportButtonProps {
  data?: AnalyticsData
  dateRange: DateRange
  filters: AnalyticsFilters
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  dateRange,
  filters
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const { exportToCSV, exportToExcel } = useExportData()

  const handleExport = async (format: 'csv' | 'excel') => {
    if (!data) {
      toast.error('No data available to export')
      return
    }

    setIsExporting(true)
    
    try {
      const filename = `analytics-${dateRange.from.toISOString().split('T')[0]}-to-${dateRange.to.toISOString().split('T')[0]}`
      
      if (format === 'csv') {
        await exportToCSV(data, filename)
        toast.success('CSV downloaded successfully')
      } else {
        await exportToExcel(data, filename)
        toast.success('Excel file downloaded successfully')
      }
    } catch (error) {
      toast.error('Export failed')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || !data}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <Table className="mr-2 h-4 w-4" />
          Exportar Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Type Definitions
```typescript
// types/analytics.ts
export interface DateRange {
  from: Date
  to: Date
}

export interface AnalyticsFilters {
  chatbot_ids: string[]
  operator_ids: string[]
  channels: string[]
  status: 'all' | 'active' | 'ended' | 'waiting_human'
}

export interface AnalyticsOverview {
  total_conversations: number
  active_conversations: number
  ended_conversations: number
  avg_session_duration_minutes: number
  avg_messages_per_conversation: number
  avg_satisfaction_rating: number
  satisfaction_responses: number
  avg_response_time_minutes: number
  total_messages: number
  bot_messages: number
  human_messages: number
  escalation_rate: number
}

export interface ConversationVolumeData {
  date: string
  conversations: number
  previous_period?: number
  new_conversations: number
  ended_conversations: number
}

export interface SatisfactionData {
  date: string
  rating: number
  responses: number
  distribution?: {
    rating_1: number
    rating_2: number
    rating_3: number
    rating_4: number
    rating_5: number
  }
}

export interface ResponseTimeData {
  date: string
  avg_response_time: number
  bot_response_time: number
  human_response_time: number
  p95_response_time: number
}

export interface TopChatbot {
  id: string
  name: string
  total_conversations: number
  avg_satisfaction: number
  response_time: number
  escalation_rate: number
}

export interface RecentConversation {
  id: string
  end_user_name: string
  channel: string
  status: string
  started_at: string
  message_count: number
  satisfaction_rating?: number
}

export interface AnalyticsData {
  overview: AnalyticsOverview
  previousPeriod: AnalyticsOverview
  conversationVolume: ConversationVolumeData[]
  satisfaction: SatisfactionData[]
  satisfactionDistribution: SatisfactionData[]
  responseTime: ResponseTimeData[]
  topChatbots: TopChatbot[]
  recentConversations: RecentConversation[]
}

export interface LiveMetrics {
  active_conversations: number
  messages_last_hour: number
  avg_response_time_current: number
  operators_online: number
}
```

## Testing Implementation  
```tsx
// __tests__/components/analytics/analytics-dashboard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import AnalyticsPage from '@/app/dashboard/analytics/page'

const mockAnalyticsData = {
  overview: {
    total_conversations: 150,
    active_conversations: 25,
    avg_satisfaction_rating: 4.2,
    avg_response_time_minutes: 2.5
  },
  conversationVolume: [
    { date: '2024-01-01', conversations: 10, new_conversations: 8, ended_conversations: 2 },
    { date: '2024-01-02', conversations: 15, new_conversations: 12, ended_conversations: 3 }
  ],
  satisfaction: [
    { date: '2024-01-01', rating: 4.1, responses: 5 },
    { date: '2024-01-02', rating: 4.3, responses: 7 }
  ]
}

// Mock API calls
global.fetch = jest.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('AnalyticsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockAnalyticsData })
    })
  })

  it('renders analytics dashboard correctly', async () => {
    render(<AnalyticsPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Métricas y insights de rendimiento de tus chatbots')).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Conversaciones')).toBeInTheDocument()
      expect(screen.getByText('Conversaciones Activas')).toBeInTheDocument()
      expect(screen.getByText('Tiempo Resp. Promedio')).toBeInTheDocument()
      expect(screen.getByText('Satisfacción')).toBeInTheDocument()
    })
  })

  it('displays correct KPI values', async () => {
    render(<AnalyticsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument() // Total conversations
      expect(screen.getByText('25')).toBeInTheDocument() // Active conversations
      expect(screen.getByText('4.2')).toBeInTheDocument() // Satisfaction rating
    })
  })

  it('handles tab navigation', async () => {
    render(<AnalyticsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Resumen' })).toBeInTheDocument()
    })

    // Click on conversations tab
    const conversationsTab = screen.getByRole('tab', { name: 'Conversaciones' })
    fireEvent.click(conversationsTab)

    expect(screen.getByText('Conversaciones por Día')).toBeInTheDocument()
  })

  it('handles date range changes', async () => {
    render(<AnalyticsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      const dateRangeButton = screen.getByText('Últimos 7 días')
      expect(dateRangeButton).toBeInTheDocument()
    })

    // Click on different date range
    const lastMonthButton = screen.getByText('Últimos 30 días')
    fireEvent.click(lastMonthButton)

    // Should trigger new API call
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/conversations/analytics')
    )
  })

  it('handles export functionality', async () => {
    render(<AnalyticsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      const exportButton = screen.getByText('Exportar')
      expect(exportButton).toBeInTheDocument()
    })

    // Click export button to open dropdown
    const exportButton = screen.getByText('Exportar')
    fireEvent.click(exportButton)

    expect(screen.getByText('Exportar CSV')).toBeInTheDocument()
    expect(screen.getByText('Exportar Excel')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    ;(fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    )

    render(<AnalyticsPage />, { wrapper: createWrapper() })

    // Should show skeleton loaders
    expect(document.querySelectorAll('[data-testid="skeleton"]')).toHaveLength.greaterThan(0)
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<AnalyticsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      // Should show error state or retry functionality
      expect(screen.queryByText('150')).not.toBeInTheDocument()
    })
  })
})
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- UI Components implemented: AnalyticsDashboard, KPIGrid, MetricCard, ConversationVolumeChart
- Pages created: /dashboard/analytics (main), /dashboard/analytics/conversations, /dashboard/analytics/chatbots
- Charts: ✅ Recharts integration with responsive design y accesibilidad
- Real-time features: ✅ Live metrics updates cada 5 minutos
- Export functionality: ✅ CSV/Excel export con datos formateados
- Responsive design: ✅ Grid adaptativo mobile/tablet/desktop
- Accessibility: ✅ WCAG 2.1 AA con charts accesibles y keyboard navigation
- Performance: ✅ Lazy loading, data caching, optimized queries
- Testing: ✅ Comprehensive component tests con mocked data
- Integration: ✅ Complete API integration con error handling
- TaskManager Phase 1: ✅ COMPLETADO 100% (16/16 tareas definidas)
- Ready for Phase 2: ✅ Foundation complete, advanced features ready
```

## Troubleshooting Frontend
### Common Issues
- **Chart Rendering Issues:** Verificar data format y responsive container setup
- **Export Performance:** Monitor memory usage en large datasets
- **Real-time Updates:** Asegurar WebSocket connections y fallback polling
- **Mobile Charts:** Optimizar touch interactions y viewport sizing

### Debugging Commands
```bash
# Development server con analytics
npm run dev

# Chart component testing
npm run test -- --watch analytics

# Bundle size monitoring
npm run build:analyze

# Performance profiling
npm run lighthouse -- --url=/dashboard/analytics

# Data export testing
npm run test:export
```

---
*Tarea específica para implementar dashboard completo de analytics con KPIs, gráficos interactivos, exportación de datos, métricas en tiempo real y UI responsive con accesibilidad completa.*