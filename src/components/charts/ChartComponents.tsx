import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

// Color palette
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6'
}

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.purple,
  COLORS.pink,
  COLORS.indigo,
  COLORS.teal,
  COLORS.danger
]

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Line Chart Component
export const LineChartComponent: React.FC<{
  data: any[]
  xKey: string
  yKeys: string[]
  height?: number
  title?: string
}> = ({ data, xKey, yKeys, height = 300, title }) => {
  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xKey} stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {yKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Bar Chart Component
export const BarChartComponent: React.FC<{
  data: any[]
  xKey: string
  yKeys: string[]
  height?: number
  title?: string
  stacked?: boolean
}> = ({ data, xKey, yKeys, height = 300, title, stacked = false }) => {
  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xKey} stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {yKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Area Chart Component
export const AreaChartComponent: React.FC<{
  data: any[]
  xKey: string
  yKeys: string[]
  height?: number
  title?: string
  stacked?: boolean
}> = ({ data, xKey, yKeys, height = 300, title, stacked = false }) => {
  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {yKeys.map((key, index) => (
              <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={CHART_COLORS[index % CHART_COLORS.length]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={CHART_COLORS[index % CHART_COLORS.length]}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xKey} stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {yKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId={stacked ? 'stack' : undefined}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              fill={`url(#color${key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Pie Chart Component
export const PieChartComponent: React.FC<{
  data: any[]
  nameKey: string
  valueKey: string
  height?: number
  title?: string
}> = ({ data, nameKey, valueKey, height = 300, title }) => {
  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={valueKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Donut Chart Component
export const DonutChartComponent: React.FC<{
  data: any[]
  nameKey: string
  valueKey: string
  height?: number
  title?: string
}> = ({ data, nameKey, valueKey, height = 300, title }) => {
  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey={valueKey}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Scatter Chart Component
export const ScatterChartComponent: React.FC<{
  data: any[]
  xKey: string
  yKey: string
  height?: number
  title?: string
}> = ({ data, xKey, yKey, height = 300, title }) => {
  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xKey} stroke="#6b7280" name={xKey} />
          <YAxis dataKey={yKey} stroke="#6b7280" name={yKey} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          <Legend />
          <Scatter name="Data Points" data={data} fill={COLORS.primary} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

// Radar Chart Component
export const RadarChartComponent: React.FC<{
  data: any[]
  keys: string[]
  height?: number
  title?: string
}> = ({ data, keys, height = 300, title }) => {
  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" stroke="#6b7280" />
          <PolarRadiusAxis stroke="#6b7280" />
          <Radar
            name="Score"
            dataKey="value"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.6}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// KPI Card Component
export const KPICard: React.FC<{
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon?: React.ReactNode
  color?: string
}> = ({ label, value, change, trend, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              {trend === 'up' && (
                <span className="text-green-600 flex items-center">
                  ↑ {change}%
                </span>
              )}
              {trend === 'down' && (
                <span className="text-red-600 flex items-center">
                  ↓ {Math.abs(change)}%
                </span>
              )}
              {trend === 'stable' && (
                <span className="text-gray-600 flex items-center">
                  → {change}%
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// Mini Sparkline Component
export const SparklineChart: React.FC<{
  data: number[]
  color?: string
  height?: number
}> = ({ data, color = COLORS.primary, height = 40 }) => {
  const chartData = data.map((value, index) => ({ index, value }))
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Gauge Chart Component (Simple Circle Progress)
export const GaugeChart: React.FC<{
  value: number
  max?: number
  label?: string
  size?: number
  color?: string
}> = ({ value, max = 100, label, size = 120, color }) => {
  const percentage = (value / max) * 100
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  // Determine color based on percentage if not provided
  const gaugeColor = color || (
    percentage >= 80 ? COLORS.success :
    percentage >= 60 ? COLORS.primary :
    percentage >= 40 ? COLORS.warning :
    COLORS.danger
  )
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Center text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          className="text-2xl font-bold"
          fill="#111827"
        >
          {percentage.toFixed(0)}%
        </text>
      </svg>
      {label && <p className="mt-2 text-sm font-medium text-gray-600">{label}</p>}
    </div>
  )
}

// Heatmap Component (Simple Grid)
export const HeatmapChart: React.FC<{
  data: { x: string; y: string; value: number }[]
  title?: string
}> = ({ data, title }) => {
  // Get unique x and y values
  const xValues = Array.from(new Set(data.map(d => d.x)))
  const yValues = Array.from(new Set(data.map(d => d.y)))
  
  // Find min and max values for color scaling
  const values = data.map(d => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  
  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue)
    const hue = (1 - normalized) * 120 // 120 = green, 0 = red
    return `hsl(${hue}, 70%, 50%)`
  }
  
  const getValue = (x: string, y: string) => {
    const item = data.find(d => d.x === x && d.y === y)
    return item?.value || 0
  }
  
  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2"></th>
              {xValues.map(x => (
                <th key={x} className="border p-2 text-sm font-medium">{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yValues.map(y => (
              <tr key={y}>
                <td className="border p-2 text-sm font-medium">{y}</td>
                {xValues.map(x => {
                  const value = getValue(x, y)
                  return (
                    <td
                      key={`${x}-${y}`}
                      className="border p-4 text-center text-white font-semibold"
                      style={{ backgroundColor: getColor(value) }}
                    >
                      {value.toFixed(1)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
