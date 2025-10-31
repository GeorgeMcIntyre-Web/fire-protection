import React, { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { analyticsService } from '../lib/analytics/analytics-service'
import { exportService } from '../lib/exports/export-service'
import { 
  LineChartComponent,
  AreaChartComponent,
  KPICard,
  GaugeChart
} from '../components/charts/ChartComponents'
import type { KPI } from '../types/analytics'

export default function ExecutiveDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month') // month, quarter, year
  
  useEffect(() => {
    loadExecutiveMetrics()
  }, [period])
  
  const loadExecutiveMetrics = async () => {
    setLoading(true)
    try {
      const kpiData = await analyticsService.calculateBusinessKPIs()
      setKpis(kpiData)
    } catch (error) {
      console.error('Error loading executive metrics:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleExport = async () => {
    const result = await exportService.quickExportPage('executive-dashboard', 'Executive Dashboard')
    if (result.success) {
      alert(`Dashboard exported: ${result.filename}`)
    }
  }
  
  // Get key metrics
  const revenueKPI = kpis.find(k => k.label === 'Total Revenue')
  const profitMarginKPI = kpis.find(k => k.label === 'Profit Margin')
  const activeProjectsKPI = kpis.find(k => k.label === 'Active Projects')
  const projectsAtRiskKPI = kpis.find(k => k.label === 'Projects At Risk')
  const onTimeRateKPI = kpis.find(k => k.label === 'On-Time Rate')
  const teamVelocityKPI = kpis.find(k => k.label === 'Team Velocity')
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading executive dashboard...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8" id="executive-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="h-8 w-8 text-red-600" />
                Executive Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                High-level overview of business performance and strategic metrics
              </p>
            </div>
            
            <div className="flex gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        {/* Financial Overview */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BanknotesIcon className="h-6 w-6 text-green-600" />
            Financial Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-2">
              <KPICard
                label="Total Revenue"
                value={revenueKPI?.value || '$0'}
                change={revenueKPI?.change}
                trend={revenueKPI?.trend}
                color="green"
                icon={<BanknotesIcon className="h-6 w-6" />}
              />
            </div>
            <div className="col-span-2">
              <KPICard
                label="Profit Margin"
                value={profitMarginKPI?.value || '0%'}
                change={profitMarginKPI?.change}
                trend={profitMarginKPI?.trend}
                color="blue"
                icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
              />
            </div>
          </div>
          
          {/* Revenue Trend */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <AreaChartComponent
              data={[
                { month: 'Jan', revenue: 85000, profit: 17000 },
                { month: 'Feb', revenue: 92000, profit: 19500 },
                { month: 'Mar', revenue: 88000, profit: 18000 },
                { month: 'Apr', revenue: 105000, profit: 23000 },
                { month: 'May', revenue: 98000, profit: 21000 },
                { month: 'Jun', revenue: 115000, profit: 26000 }
              ]}
              xKey="month"
              yKeys={['revenue', 'profit']}
              height={250}
              title={`Revenue & Profit Trend - ${period === 'month' ? 'Last 6 Months' : period === 'quarter' ? 'This Quarter' : 'This Year'}`}
            />
          </div>
        </section>
        
        {/* Portfolio Health */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            Portfolio Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              label="Active Projects"
              value={activeProjectsKPI?.value || 0}
              change={activeProjectsKPI?.change}
              trend={activeProjectsKPI?.trend}
              color="blue"
            />
            <KPICard
              label="Projects At Risk"
              value={projectsAtRiskKPI?.value || 0}
              color="red"
            />
            <KPICard
              label="On-Time Completion Rate"
              value={onTimeRateKPI?.value || '0%'}
              change={onTimeRateKPI?.change}
              trend={onTimeRateKPI?.trend}
              color="green"
            />
          </div>
          
          {/* Project Pipeline */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Project Pipeline & Conversion</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 rounded-lg p-6 mb-2">
                  <div className="text-3xl font-bold text-blue-700">24</div>
                </div>
                <div className="text-sm text-gray-600">Leads</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-2xl text-gray-400">→</div>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-lg p-6 mb-2">
                  <div className="text-3xl font-bold text-purple-700">18</div>
                </div>
                <div className="text-sm text-gray-600">Proposals</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-2xl text-gray-400">→</div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-lg p-6 mb-2">
                  <div className="text-3xl font-bold text-green-700">12</div>
                </div>
                <div className="text-sm text-gray-600">Won</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              Conversion Rate: <span className="font-semibold text-green-600">50%</span> | 
              Average Deal Size: <span className="font-semibold">$45,000</span>
            </div>
          </div>
        </section>
        
        {/* Strategic Indicators */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Strategic Performance Indicators</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <GaugeChart value={85} label="Overall Health" size={120} />
              <p className="mt-2 text-sm text-gray-600 text-center">
                Excellent performance across all metrics
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <GaugeChart value={92} label="Client Satisfaction" size={120} color="#10b981" />
              <p className="mt-2 text-sm text-gray-600 text-center">
                NPS Score: 72 (Excellent)
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <GaugeChart value={78} label="Financial Health" size={120} color="#f59e0b" />
              <p className="mt-2 text-sm text-gray-600 text-center">
                Cash flow positive, healthy margins
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <GaugeChart value={88} label="Operational Excellence" size={120} color="#8b5cf6" />
              <p className="mt-2 text-sm text-gray-600 text-center">
                Efficient processes, low rework
              </p>
            </div>
          </div>
        </section>
        
        {/* Team Performance */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6 text-purple-600" />
            Team Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              label="Team Velocity"
              value={teamVelocityKPI?.value || '0'}
              change={teamVelocityKPI?.change}
              trend={teamVelocityKPI?.trend}
              color="purple"
            />
            <KPICard
              label="Average Utilization"
              value="72%"
              trend="stable"
              color="blue"
            />
            <KPICard
              label="Employee Satisfaction"
              value="4.3/5"
              trend="up"
              color="green"
            />
          </div>
        </section>
        
        {/* Growth Metrics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Growth & Market Position</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 border-r border-gray-200">
                <div className="text-3xl font-bold text-blue-600">+22%</div>
                <div className="text-sm text-gray-600 mt-1">YoY Growth</div>
              </div>
              <div className="text-center p-4 border-r border-gray-200">
                <div className="text-3xl font-bold text-green-600">$1.2M</div>
                <div className="text-sm text-gray-600 mt-1">Annual Revenue</div>
              </div>
              <div className="text-center p-4 border-r border-gray-200">
                <div className="text-3xl font-bold text-purple-600">15%</div>
                <div className="text-sm text-gray-600 mt-1">Market Share</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-orange-600">$8.5k</div>
                <div className="text-sm text-gray-600 mt-1">Customer Acq. Cost</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Key Insights */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full p-2">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Strong Financial Performance</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Revenue up 22% YoY with improving profit margins. On track to exceed annual targets by 15%.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-500 rounded-full p-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900">Resource Constraints</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    3 projects at risk due to team capacity issues. Consider hiring 2 additional technicians.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 rounded-full p-2">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Market Opportunity</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Strong demand in commercial sector. Pipeline shows 40% increase in Q4 opportunities.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500 rounded-full p-2">
                  <UserGroupIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Team Excellence</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Team velocity increased 18% this quarter. High employee satisfaction scores maintained.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Recommendations */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Strategic Recommendations</h2>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 rounded-full p-1 mt-0.5">
                  <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">Hire 2 additional fire protection technicians by Q4</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Current capacity constraints risking 3 projects worth $135K. ROI: 3 months
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-red-100 rounded-full p-1 mt-0.5">
                  <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">Increase marketing spend in commercial sector</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    40% of pipeline from commercial. Opportunity to capture additional market share
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium">Continue quality improvement initiatives</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Quality scores up 12% YoY. Maintain momentum with ongoing training programs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
