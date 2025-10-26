import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Template {
  id: string
  name: string
  description: string
  category: 'residential' | 'commercial' | 'industrial'
  estimated_hours: number
  default_tasks: Array<{
    name: string
    description: string
    priority: 'low' | 'medium' | 'high'
    estimated_hours: number
  }>
  required_resources: string[]
  created_at: string
}

export const TemplatesPage: React.FC = () => {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [creatingProject, setCreatingProject] = useState(false)
  
  // Form data for project creation
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    clientName: '',
    startDate: '',
    dueDate: ''
  })

  const defaultTemplates: Template[] = [
    {
      id: '1',
      name: 'Standard Fire Alarm Installation',
      description: 'Complete fire alarm system installation for commercial properties',
      category: 'commercial',
      estimated_hours: 24,
      default_tasks: [
        { name: 'Site Survey', description: 'Assess building layout and requirements', priority: 'high' as const, estimated_hours: 2 },
        { name: 'Install Smoke Detectors', description: 'Install smoke detectors in all required areas', priority: 'high' as const, estimated_hours: 6 },
        { name: 'Install Heat Detectors', description: 'Install heat detectors in kitchens and mechanical rooms', priority: 'high' as const, estimated_hours: 4 },
        { name: 'Install Control Panel', description: 'Install and configure main control panel', priority: 'high' as const, estimated_hours: 4 },
        { name: 'System Testing', description: 'Test entire system and generate compliance report', priority: 'high' as const, estimated_hours: 4 },
        { name: 'Client Training', description: 'Train staff on system operation', priority: 'medium' as const, estimated_hours: 2 },
        { name: 'Final Documentation', description: 'Complete and submit all documentation', priority: 'medium' as const, estimated_hours: 2 }
      ],
      required_resources: [
        'Fire alarm technician',
        'Smoke detectors',
        'Heat detectors',
        'Control panel',
        'Cable and accessories',
        'Testing equipment'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Sprinkler System Installation',
      description: 'Full sprinkler system installation for new construction',
      category: 'commercial',
      estimated_hours: 80,
      default_tasks: [
        { name: 'Site Preparation', description: 'Prepare area and coordinate with other trades', priority: 'high' as const, estimated_hours: 8 },
        { name: 'Pipe Installation', description: 'Install main and branch pipework', priority: 'high' as const, estimated_hours: 40 },
        { name: 'Sprinkler Head Installation', description: 'Install and position all sprinkler heads', priority: 'high' as const, estimated_hours: 16 },
        { name: 'Pump Installation', description: 'Install fire pump and associated equipment', priority: 'high' as const, estimated_hours: 8 },
        { name: 'System Commissioning', description: 'Test and commission complete system', priority: 'high' as const, estimated_hours: 8 }
      ],
      required_resources: [
        'Sprinkler fitter',
        'Fire pump specialist',
        'Pipe and fittings',
        'Sprinkler heads',
        'Pump and tank',
        'Testing equipment'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Residential Fire Detection System',
      description: 'Fire alarm system for residential homes and apartments',
      category: 'residential',
      estimated_hours: 8,
      default_tasks: [
        { name: 'Home Assessment', description: 'Visit and assess property requirements', priority: 'high' as const, estimated_hours: 1 },
        { name: 'Install Detectors', description: 'Install smoke detectors in bedrooms and hallways', priority: 'high' as const, estimated_hours: 3 },
        { name: 'Install Control Unit', description: 'Install and configure control panel', priority: 'high' as const, estimated_hours: 2 },
        { name: 'System Testing', description: 'Test system and provide user training', priority: 'high' as const, estimated_hours: 1 },
        { name: 'Documentation', description: 'Complete installation documentation', priority: 'medium' as const, estimated_hours: 1 }
      ],
      required_resources: [
        'Fire technician',
        'Residential detectors',
        'Control unit',
        'Backup battery'
      ],
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Industrial Fire Suppression System',
      description: 'Specialty suppression system for industrial facilities',
      category: 'industrial',
      estimated_hours: 120,
      default_tasks: [
        { name: 'Engineering Design', description: 'Develop system design and specifications', priority: 'high' as const, estimated_hours: 16 },
        { name: 'Equipment Procurement', description: 'Order all required equipment and materials', priority: 'high' as const, estimated_hours: 8 },
        { name: 'Main Installation', description: 'Install suppression system components', priority: 'high' as const, estimated_hours: 64 },
        { name: 'Detection System', description: 'Install detection and control systems', priority: 'high' as const, estimated_hours: 24 },
        { name: 'Commissioning', description: 'System testing and commissioning', priority: 'high' as const, estimated_hours: 8 }
      ],
      required_resources: [
        'Fire engineer',
        'Suppression equipment',
        'Detection system',
        'Control panel',
        'Installation crew'
      ],
      created_at: new Date().toISOString()
    }
  ]

  useEffect(() => {
    setTemplates(defaultTemplates)
    setLoading(false)
  }, [user])

  const handleCreateProject = async () => {
    if (!selectedTemplate) return

    setCreatingProject(true)
    try {
      // First create the client if needed
      let clientId = null
      if (projectForm.clientName) {
        const { data: existingClients } = await supabase
          .from('clients')
          .select('id')
          .eq('name', projectForm.clientName)
          .limit(1)

        if (existingClients && existingClients.length > 0) {
          clientId = existingClients[0].id
        } else {
          // Create new client
          const { data: newClient } = await supabase
            .from('clients')
            .insert({
              name: projectForm.clientName,
              created_by: user?.id
            })
            .select()
            .single()

          if (newClient) clientId = newClient.id
        }
      }

      // Create the project
      const projectName = projectForm.projectName || selectedTemplate.name
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          description: selectedTemplate.description,
          client_id: clientId,
          status: 'pending',
          created_by: user?.id,
          due_date: projectForm.dueDate || null
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Create all tasks from template
      const taskPromises = selectedTemplate.default_tasks.map((task) =>
        supabase.from('tasks').insert({
          name: task.name,
          description: task.description,
          project_id: newProject.id,
          priority: task.priority,
          status: 'pending',
          created_by: user?.id,
          due_date: projectForm.dueDate || null
        })
      )

      await Promise.all(taskPromises)

      // Success!
      alert(`Project "${projectName}" created successfully with ${selectedTemplate.default_tasks.length} tasks!`)
      
      // Reset form
      setSelectedTemplate(null)
      setProjectForm({ projectName: '', clientName: '', startDate: '', dueDate: '' })
      
      // Optionally redirect to the new project
      window.location.href = '/projects'
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setCreatingProject(false)
    }
  }

  const filteredTemplates = templates.filter(template => 
    filterCategory === 'all' || template.category === filterCategory
  )

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'residential': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'commercial': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'industrial': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Templates</h1>
          <p className="mt-1 text-sm text-gray-400">
            Choose a template to quickly create projects with pre-defined tasks
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Templates
          </button>
          <button
            onClick={() => setFilterCategory('residential')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterCategory === 'residential'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Residential
          </button>
          <button
            onClick={() => setFilterCategory('commercial')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterCategory === 'commercial'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Commercial
          </button>
          <button
            onClick={() => setFilterCategory('industrial')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterCategory === 'industrial'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Industrial
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6 hover:border-blue-500 transition-all duration-300 group cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(template.category)}`}>
                {template.category}
              </div>
              <DocumentTextIcon className="h-8 w-8 text-gray-500 group-hover:text-blue-500 transition-colors" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {template.name}
            </h3>
            
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {template.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-400">
                <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                {template.default_tasks.length} tasks
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <ClockIcon className="h-4 w-4 mr-2" />
                {template.estimated_hours} hours estimated
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center text-xs text-gray-500">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                {template.required_resources.length} resources
              </div>
              <button className="text-blue-400 hover:text-blue-300 font-medium text-sm group-hover:translate-x-1 transition-transform">
                Use Template →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(selectedTemplate.category)} mb-2`}>
                    {selectedTemplate.category}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedTemplate.name}</h2>
                  <p className="text-gray-400 mt-1">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Project Overview */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="font-semibold text-white mb-3">Project Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Estimated Hours</p>
                    <p className="text-lg font-bold text-white">{selectedTemplate.estimated_hours}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Tasks</p>
                    <p className="text-lg font-bold text-white">{selectedTemplate.default_tasks.length}</p>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="font-semibold text-white mb-3">Default Tasks</h3>
                <div className="space-y-2">
                  {selectedTemplate.default_tasks.map((task, index) => (
                    <div key={index} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{task.name}</h4>
                          <p className="text-sm text-gray-400">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-green-500/10 text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{task.estimated_hours}h estimated</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Resources */}
              <div>
                <h3 className="font-semibold text-white mb-3">Required Resources</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.required_resources.map((resource, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm border border-blue-500/20"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Creation Form */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="font-semibold text-white mb-4">Create Project</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      placeholder={selectedTemplate.name}
                      value={projectForm.projectName}
                      onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Client Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter or select existing client"
                      value={projectForm.clientName}
                      onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={projectForm.startDate}
                        onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={projectForm.dueDate}
                        onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleCreateProject}
                  disabled={creatingProject}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {creatingProject ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate(null)
                    setProjectForm({ projectName: '', clientName: '', startDate: '', dueDate: '' })
                  }}
                  className="btn-secondary"
                  disabled={creatingProject}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

