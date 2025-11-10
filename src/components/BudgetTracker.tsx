import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getProjectBudgets, type ProjectBudget } from '../lib/budget'
import { 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

export const BudgetTracker: React.FC = () => {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<ProjectBudget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchBudgetData()
    }
  }, [user])

  const fetchBudgetData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const data = await getProjectBudgets(user.id)
      setBudgets(data)
    } catch (err) {
      console.error('Failed to load budgets:', err)
      setError('Failed to load budget data. Please try again.')
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

  const getStatusColor = (status: ProjectBudget['status']) => {
    switch (status) {
      case 'green': return 'text-green-600'
      case 'yellow': return 'text-yellow-600'
      case 'red': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: ProjectBudget['status']) => {
    switch (status) {
      case 'green': return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'yellow': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case 'red': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      default: return null
    }
  }

  const getStatusLabel = (status: ProjectBudget['status']) => {
    switch (status) {
      case 'green': return 'On budget'
      case 'yellow': return 'At risk'
      case 'red': return 'Over budget'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchBudgetData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const totalEstimated = budgets.reduce((sum, b) => sum + b.budget, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalVariance = totalEstimated - totalSpent
  const overallStatus: ProjectBudget['status'] = totalVariance < -totalEstimated * 0.1 ? 'red' : totalVariance < 0 ? 'yellow' : 'green'

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
            <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
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
              overallStatus === 'green' ? 'bg-green-500/20 text-green-200' : 
              overallStatus === 'yellow' ? 'bg-yellow-500/20 text-yellow-200' : 
              'bg-red-500/20 text-red-200'
            }`}>
              {overallStatus === 'green' ? '✓ On Track' : overallStatus === 'yellow' ? '⚠️ At Risk' : '✗ Over Budget'}
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
                    <h4 className="font-semibold text-gray-900">{budget.name}</h4>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(budget.status)}
                      <span className={`ml-2 text-sm ${getStatusColor(budget.status)}`}>
                        {getStatusLabel(budget.status)}
                      </span>
                    </div>
                    {budget.taskCount > 0 && (
                      <span className="text-xs text-gray-500 mt-1">
                        {budget.taskCount} task{budget.taskCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    budget.variancePercent < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {budget.variancePercent < 0 ? '' : '+'}
                    {budget.variancePercent.toFixed(1)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Budget: {formatCurrency(budget.budget)}</span>
                    <span>Spent: {formatCurrency(budget.spent)}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        budget.status === 'green' ? 'bg-green-500' :
                        budget.status === 'yellow' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min((budget.spent / budget.budget) * 100, 100)}%` 
                      }}
                    />
                  </div>

                  {/* Variance */}
                  <div className="flex items-center text-xs text-gray-500">
                    {budget.variance < 0 ? (
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

