import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, DEMO_MODE } from '../lib/supabase'
import { calculateProjectCosts } from '../lib/project-planning'
import { 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

interface BudgetSummary {
  project_name: string
  estimated: number
  actual: number
  variance: number
  variance_percentage: number
  status: 'within_budget' | 'over_budget' | 'at_risk'
}

export const BudgetTracker: React.FC = () => {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<BudgetSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgetData()
  }, [user])

  const fetchBudgetData = async () => {
    setLoading(true)
    try {
      // Fallback to demo data in DEMO_MODE
      if (DEMO_MODE) {
        const demoData: BudgetSummary[] = [
          {
            project_name: 'Shoprite Warehouse',
            estimated: 85000,
            actual: 92000,
            variance: 7000,
            variance_percentage: 8.2,
            status: 'at_risk'
          },
          {
            project_name: 'Residential Complex',
            estimated: 45000,
            actual: 43500,
            variance: -1500,
            variance_percentage: -3.3,
            status: 'within_budget'
          },
          {
            project_name: 'Office Building',
            estimated: 120000,
            actual: 110000,
            variance: -10000,
            variance_percentage: -8.3,
            status: 'within_budget'
          }
        ]
        setBudgets(demoData)
        return
      }

      // Fetch projects and compute budgets from Supabase
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('created_at', { ascending: false })

      if (error) throw error

      const budgetsFromDb: BudgetSummary[] = await Promise.all(
        (projects || []).map(async (project) => {
          const costs = await calculateProjectCosts(project.id)
          return {
            project_name: project.name,
            estimated: costs.estimated,
            actual: costs.actual,
            variance: costs.variance,
            variance_percentage: costs.variance_percentage,
            status: costs.status,
          }
        })
      )

      setBudgets(budgetsFromDb)
    } catch (err) {
      console.error('Error fetching budget data:', err)
      setBudgets([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'within_budget': return 'text-green-600'
      case 'at_risk': return 'text-yellow-600'
      case 'over_budget': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'within_budget': return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'at_risk': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case 'over_budget': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalEstimated = budgets.reduce((sum, b) => sum + b.estimated, 0)
  const totalActual = budgets.reduce((sum, b) => sum + b.actual, 0)
  const totalVariance = totalActual - totalEstimated
  const overallStatus = totalVariance > 0 ? 'at_risk' : 'within_budget'

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Budget Overview</h3>
          <ChartBarIcon className="h-6 w-6" />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-blue-200">Total Estimated</p>
            <p className="text-2xl font-bold">{formatCurrency(totalEstimated)}</p>
          </div>
          <div>
            <p className="text-sm text-blue-200">Total Actual</p>
            <p className="text-2xl font-bold">{formatCurrency(totalActual)}</p>
          </div>
          <div>
            <p className="text-sm text-blue-200">Variance</p>
            <p className={`text-2xl font-bold ${totalVariance > 0 ? 'text-yellow-300' : 'text-green-300'}`}>
              {totalVariance > 0 ? '+' : ''}{formatCurrency(totalVariance)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-sm">Overall Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              overallStatus === 'within_budget' ? 'bg-green-500/20 text-green-200' : 'bg-yellow-500/20 text-yellow-200'
            }`}>
              {overallStatus === 'within_budget' ? '✓ On Track' : '⚠️ Over Budget'}
            </span>
          </div>
        </div>
      </div>

      {/* Individual Project Budgets */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Project Budgets</h3>
        </div>
        <div className="p-6 space-y-4">
          {budgets.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No active projects</p>
          ) : (
            budgets.map((budget, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{budget.project_name}</h4>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(budget.status)}
                      <span className={`ml-2 text-sm ${getStatusColor(budget.status)}`}>
                        {budget.status === 'within_budget' ? 'On budget' : 
                         budget.status === 'at_risk' ? 'At risk' : 'Over budget'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    budget.variance_percentage > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {budget.variance_percentage > 0 ? '+' : ''}
                    {budget.variance_percentage.toFixed(1)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Estimated: {formatCurrency(budget.estimated)}</span>
                    <span>Actual: {formatCurrency(budget.actual)}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        budget.status === 'within_budget' ? 'bg-green-500' :
                        budget.status === 'at_risk' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min((budget.actual / budget.estimated) * 100, 100)}%` 
                      }}
                    />
                  </div>

                  {/* Variance */}
                  <div className="flex items-center text-xs text-gray-500">
                    {budget.variance > 0 ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1 text-red-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 mr-1 text-green-600" />
                    )}
                    Variance: {formatCurrency(budget.variance)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <CurrencyDollarIcon className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">Budget Tips</h4>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• Track costs daily, not weekly</li>
              <li>• Always include 15% contingency</li>
              <li>• Bulk order materials at project start</li>
              <li>• Monitor time logs against estimates</li>
              <li>• Review variances weekly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

