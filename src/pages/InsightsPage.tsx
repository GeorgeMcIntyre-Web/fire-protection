import React, { useState, useEffect } from 'react'
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { insightGenerator } from '../lib/ai/insight-generator'
import type { AIInsight } from '../types/analytics'

export default function InsightsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [showAcknowledged, setShowAcknowledged] = useState(false)
  
  useEffect(() => {
    loadInsights()
  }, [])
  
  const loadInsights = async () => {
    setLoading(true)
    try {
      // Load insights from database
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setInsights(data || [])
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleAcknowledge = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', insightId)
      
      if (error) throw error
      
      // Reload insights
      await loadInsights()
    } catch (error) {
      console.error('Error acknowledging insight:', error)
    }
  }
  
  const handleDismiss = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({ status: 'dismissed' })
        .eq('id', insightId)
      
      if (error) throw error
      
      // Reload insights
      await loadInsights()
    } catch (error) {
      console.error('Error dismissing insight:', error)
    }
  }
  
  const handleResolve = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', insightId)
      
      if (error) throw error
      
      // Reload insights
      await loadInsights()
    } catch (error) {
      console.error('Error resolving insight:', error)
    }
  }
  
  // Filter insights
  const filteredInsights = insights.filter(insight => {
    if (filterType !== 'all' && insight.insight_type !== filterType) return false
    if (filterSeverity !== 'all' && insight.severity !== filterSeverity) return false
    if (!showAcknowledged && insight.status !== 'active') return false
    return true
  })
  
  // Group insights by date
  const groupedInsights = filteredInsights.reduce((groups: Record<string, AIInsight[]>, insight) => {
    const date = new Date(insight.created_at)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    let key = 'Older'
    if (date.toDateString() === today.toDateString()) {
      key = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday'
    } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      key = 'This Week'
    }
    
    if (!groups[key]) groups[key] = []
    groups[key].push(insight)
    return groups
  }, {})
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red'
      case 'high': return 'orange'
      case 'medium': return 'yellow'
      case 'low': return 'blue'
      default: return 'gray'
    }
  }
  
  const getSeverityBadge = (severity: string) => {
    const color = getSeverityColor(severity)
    const bgColors: Record<string, string> = {
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColors[color]}`}>
        {severity.toUpperCase()}
      </span>
    )
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk_alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'recommendation':
        return <LightBulbIcon className="h-5 w-5 text-yellow-600" />
      case 'prediction':
        return <ClockIcon className="h-5 w-5 text-blue-600" />
      default:
        return <LightBulbIcon className="h-5 w-5 text-purple-600" />
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insights...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <LightBulbIcon className="h-8 w-8 text-yellow-600" />
            AI Insights & Recommendations
          </h1>
          <p className="mt-2 text-gray-600">
            Intelligent recommendations and insights powered by advanced analytics
          </p>
        </div>
        
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Types</option>
              <option value="risk_alert">Risk Alerts</option>
              <option value="recommendation">Recommendations</option>
              <option value="prediction">Predictions</option>
              <option value="optimization">Optimizations</option>
              <option value="budget_alert">Budget Alerts</option>
              <option value="quality_alert">Quality Alerts</option>
            </select>
          </div>
          
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAcknowledged}
              onChange={(e) => setShowAcknowledged(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Show acknowledged</span>
          </label>
          
          <div className="ml-auto text-sm text-gray-600">
            {filteredInsights.length} insight{filteredInsights.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-700">
                  {insights.filter(i => i.severity === 'critical' && i.status === 'active').length}
                </div>
                <div className="text-sm text-red-600">Critical</div>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-700">
                  {insights.filter(i => i.severity === 'high' && i.status === 'active').length}
                </div>
                <div className="text-sm text-orange-600">High Priority</div>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-700">
                  {insights.filter(i => i.insight_type === 'recommendation').length}
                </div>
                <div className="text-sm text-blue-600">Recommendations</div>
              </div>
              <LightBulbIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {insights.filter(i => i.status === 'resolved').length}
                </div>
                <div className="text-sm text-green-600">Resolved</div>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
        
        {/* Insights Timeline */}
        {filteredInsights.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <LightBulbIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No insights found</h3>
            <p className="text-gray-600 mt-2">
              Try adjusting your filters or generate new insights from your project data
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedInsights).map(([dateGroup, groupInsights]) => (
              <div key={dateGroup}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{dateGroup}</h2>
                <div className="space-y-4">
                  {groupInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`bg-white rounded-lg shadow-sm border-l-4 ${
                        getSeverityColor(insight.severity) === 'red' ? 'border-red-500' :
                        getSeverityColor(insight.severity) === 'orange' ? 'border-orange-500' :
                        getSeverityColor(insight.severity) === 'yellow' ? 'border-yellow-500' :
                        'border-blue-500'
                      } p-6 hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="mt-1">
                            {getTypeIcon(insight.insight_type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {insight.title}
                              </h3>
                              {getSeverityBadge(insight.severity)}
                              <span className="text-xs text-gray-500">
                                {insight.confidence_score}% confidence
                              </span>
                            </div>
                            
                            <p className="text-gray-700 mb-3">
                              {insight.description}
                            </p>
                            
                            {insight.impact && (
                              <div className="bg-gray-50 rounded p-3 mb-3">
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">Impact:</span> {insight.impact}
                                </p>
                              </div>
                            )}
                            
                            {insight.suggested_action && (
                              <div className="bg-blue-50 rounded p-3 mb-3">
                                <p className="text-sm text-blue-900">
                                  <span className="font-semibold">Recommended Action:</span> {insight.suggested_action}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="capitalize">{insight.insight_type.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{new Date(insight.created_at).toLocaleString()}</span>
                              {insight.status !== 'active' && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{insight.status}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        {insight.status === 'active' && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleAcknowledge(insight.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Acknowledge"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleResolve(insight.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Resolve"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDismiss(insight.id)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Dismiss"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
