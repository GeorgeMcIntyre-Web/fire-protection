import React, { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  ArrowDownTrayIcon,
  FunnelIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { analyticsService } from '../lib/analytics/analytics-service'
import { exportService } from '../lib/exports/export-service'
import { 
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  AreaChartComponent,
  KPICard,
  GaugeChart,
  HeatmapChart
} from '../components/charts/ChartComponents'
import type { KPI } from '../types/analytics'

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days
  const [filterCategory, setFilterCategory] = useState('all')
  
  // Chart data states
  const [revenueData, setRevenueData] = useState<any>(null)
  const [projectStatusData, setProjectStatusData] = useState<any>(null)
  const [teamPerformanceData, setTeamPerformanceData] = useState<any>(null)
  
  useEffect(() => {
    loadAnalytics()
  }, [dateRange, filterCategory])
  
  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Load KPIs
      const kpiData = await analyticsService.calculateBusinessKPIs()
      setKpis(kpiData)
      
      // Load chart data
      const revenue = await analyticsService.getRevenueTrendData(parseInt(dateRange) / 30)
      setRevenueData(revenue)
      
      const projectStatus = await analyticsService.getProjectStatusData()
      setProjectStatusData(projectStatus)
      
      const teamPerf = await analyticsService.getTeamPerformanceData()
      setTeamPerformanceData(teamPerf)
      
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    const exportData = {
      kpis,
      chartElements: [
        document.getElementById('revenue-chart'),
        document.getElementById('project-status-chart')
      ].filter(Boolean)
    }
    
    const result = await exportService.exportData(exportData, format, {
      includeCharts: format === 'pdf'
    })
    
    if (result.success) {
      alert(`Export successful! File: ${result.filename}`)
    } else {
      alert(`Export failed: ${result.error}`)
    }
  }
  
  // Organize KPIs by category
  const financialKPIs = kpis.filter(k => 
    ['Total Revenue', 'Total Costs', 'Profit Margin', 'Gross Profit', 'ROI'].includes(k.label)
  )
  
  const projectKPIs = kpis.filter(k =>
    ['Total Projects', 'Active Projects', 'Completed Projects', 'Projects At Risk', 'On-Time Rate'].includes(k.label)
  )
  
  const teamKPIs = kpis.filter(k =>
    ['Team Members', 'Active Members', 'Tasks Completed', 'Team Velocity', 'Team Utilization'].includes(k.label)
  )
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="h-8 w-8 text-red-600" />
                Advanced Analytics
              </h1>
              <p className="mt-2 text-gray-600">
                Comprehensive business intelligence and performance metrics
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Export PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Export Excel
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mt-6 flex gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Categories</option>
                <option value="financial">Financial</option>
                <option value="projects">Projects</option>
                <option value="team">Team</option>
                <option value="quality">Quality</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Financial KPIs */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {financialKPIs.slice(0, 5).map((kpi, index) => (
              <KPICard
                key={index}
                label={kpi.label}
                value={kpi.value}
                change={kpi.change}
                trend={kpi.trend}
                color={kpi.color || 'blue'}
              />
            ))}
          </div>
        </section>
        
        {/* Revenue & Profit Trends Chart */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow p-6" id="revenue-chart">
            {revenueData && (
              <AreaChartComponent
                data={revenueData.labels.map((label: string, i: number) => ({
                  month: label,
                  Revenue: revenueData.datasets[0].data[i],
                  Costs: revenueData.datasets[1].data[i]
                }))}
                xKey="month"
                yKeys={['Revenue', 'Costs']}
                height={350}
                title="Revenue & Cost Trends"
              />
            )}
          </div>
        </section>
        
        {/* Project Performance KPIs */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {projectKPIs.slice(0, 5).map((kpi, index) => (
              <KPICard
                key={index}
                label={kpi.label}
                value={kpi.value}
                change={kpi.change}
                trend={kpi.trend}
                color={kpi.color || 'blue'}
              />
            ))}
          </div>
        </section>
        
        {/* Project Status & Team Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Project Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6" id="project-status-chart">
            {projectStatusData && (
              <PieChartComponent
                data={projectStatusData.labels.map((label: string, i: number) => ({
                  name: label,
                  value: projectStatusData.datasets[0].data[i]
                }))}
                nameKey="name"
                valueKey="value"
                height={350}
                title="Project Status Distribution"
              />
            )}
          </div>
          
          {/* Team Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            {teamPerformanceData && (
              <BarChartComponent
                data={teamPerformanceData.labels.map((label: string, i: number) => ({
                  name: label,
                  Completed: teamPerformanceData.datasets[0].data[i],
                  Pending: teamPerformanceData.datasets[1].data[i]
                }))}
                xKey="name"
                yKeys={['Completed', 'Pending']}
                height={350}
                title="Team Member Performance"
                stacked
              />
            )}
          </div>
        </div>
        
        {/* Team KPIs */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {teamKPIs.slice(0, 5).map((kpi, index) => (
              <KPICard
                key={index}
                label={kpi.label}
                value={kpi.value}
                change={kpi.change}
                trend={kpi.trend}
                color={kpi.color || 'purple'}
              />
            ))}
          </div>
        </section>
        
        {/* Performance Gauges */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Indicators</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center">
              <GaugeChart 
                value={75} 
                label="Budget Health" 
                size={120}
              />
            </div>
            <div className="flex flex-col items-center">
              <GaugeChart 
                value={85} 
                label="Schedule Health" 
                size={120}
              />
            </div>
            <div className="flex flex-col items-center">
              <GaugeChart 
                value={90} 
                label="Quality Score" 
                size={120}
              />
            </div>
            <div className="flex flex-col items-center">
              <GaugeChart 
                value={70} 
                label="Team Utilization" 
                size={120}
              />
            </div>
          </div>
        </section>
        
        {/* Task Completion Trends */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <LineChartComponent
              data={[
                { week: 'Week 1', tasks: 12, velocity: 15 },
                { week: 'Week 2', tasks: 18, velocity: 16 },
                { week: 'Week 3', tasks: 15, velocity: 14 },
                { week: 'Week 4', tasks: 22, velocity: 18 }
              ]}
              xKey="week"
              yKeys={['tasks', 'velocity']}
              height={300}
              title="Task Completion & Team Velocity Trends"
            />
          </div>
        </section>
        
        {/* Risk Heatmap */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <HeatmapChart
              data={[
                { x: 'Budget', y: 'Project A', value: 75 },
                { x: 'Schedule', y: 'Project A', value: 45 },
                { x: 'Quality', y: 'Project A', value: 30 },
                { x: 'Budget', y: 'Project B', value: 20 },
                { x: 'Schedule', y: 'Project B', value: 60 },
                { x: 'Quality', y: 'Project B', value: 25 },
                { x: 'Budget', y: 'Project C', value: 85 },
                { x: 'Schedule', y: 'Project C', value: 70 },
                { x: 'Quality', y: 'Project C', value: 55 }
              ]}
              title="Project Risk Heatmap"
            />
          </div>
        </section>
        
        {/* All KPIs Table */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">All Metrics</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Metric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kpis.map((kpi, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {kpi.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {kpi.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {kpi.change !== undefined ? `${kpi.change}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {kpi.trend === 'up' && <span className="text-green-600">↑</span>}
                        {kpi.trend === 'down' && <span className="text-red-600">↓</span>}
                        {kpi.trend === 'stable' && <span className="text-gray-600">→</span>}
                        {!kpi.trend && <span className="text-gray-400">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
