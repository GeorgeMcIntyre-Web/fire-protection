import { supabase } from './supabase'

/**
 * PM Workflow - Daily tasks and priorities
 */

export interface DailyWorkItem {
  id: string
  type: 'urgent' | 'today' | 'upcoming'
  title: string
  project_name: string
  client_name: string
  status: string
  priority: 'high' | 'medium' | 'low'
  due_date?: string
  description?: string
}

export interface ClientUpdate {
  project_id: string
  project_name: string
  client_name: string
  status: string
  last_update: string
  days_since_update: number
  progress_percentage: number
  next_action?: string
}

export interface DocumentationStatus {
  document_type: string
  document_name: string
  project_id: string
  project_name: string
  status: 'required' | 'in_progress' | 'completed' | 'overdue'
  due_date?: string
  file_url?: string
}

/**
 * Get daily work items for PM
 */
export async function getDailyWorkItems(_userId: string): Promise<DailyWorkItem[]> {
  // Fetch projects with tasks
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(name),
      tasks(*)
    `)
    .in('status', ['pending', 'in_progress'])

  if (error) throw error

  const workItems: DailyWorkItem[] = []

  for (const project of projects || []) {
    const today = new Date()
    const dueDate = project.due_date ? new Date(project.due_date) : null
    const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null

    // Categorize projects
    if (daysUntilDue !== null && daysUntilDue <= 1 && project.status === 'in_progress') {
      workItems.push({
        id: project.id,
        type: 'urgent',
        title: `Project deadline in ${daysUntilDue === 0 ? 'TODAY' : daysUntilDue + ' days'}`,
        project_name: project.name,
        client_name: project.client?.name || 'Unknown Client',
        status: project.status,
        priority: 'high' as const,
        due_date: project.due_date || undefined
      })
    } else if (project.status === 'in_progress') {
      workItems.push({
        id: project.id,
        type: 'today',
        title: 'Active project',
        project_name: project.name,
        client_name: project.client?.name || 'Unknown Client',
        status: project.status,
        priority: 'medium' as const
      })
    }

    // Add high priority tasks
    const urgentTasks = project.tasks?.filter((task: any) => 
      task.priority === 'high' && task.status !== 'completed'
    ) || []

    for (const task of urgentTasks) {
      workItems.push({
        id: task.id,
        type: 'urgent',
        title: task.name,
        project_name: project.name,
        client_name: project.client?.name || 'Unknown Client',
        status: task.status,
        priority: 'high' as const,
        description: task.description
      })
    }
  }

  return workItems.sort((a, b) => {
    const typeOrder = { urgent: 0, today: 1, upcoming: 2 }
    return typeOrder[a.type] - typeOrder[b.type]
  })
}

/**
 * Get projects needing client updates
 */
export async function getProjectsNeedingClientUpdates(): Promise<ClientUpdate[]> {
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(name),
      tasks(*)
    `)
    .in('status', ['in_progress'])
    .order('updated_at', { ascending: true })

  if (error) throw error

  const clientUpdates: ClientUpdate[] = []

  for (const project of projects || []) {
    const updatedAt = new Date(project.updated_at)
    const now = new Date()
    const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))

    // Check if update is needed (more than 3 days old)
    if (daysSinceUpdate >= 3) {
      const tasks = project.tasks || []
      const completedTasks = tasks.filter((task: any) => task.status === 'completed').length
      const progressPercentage = tasks.length > 0 
        ? Math.round((completedTasks / tasks.length) * 100) 
        : 0

      // Determine next action
      let nextAction = 'Update client on progress'
      const pendingTasks = tasks.filter((task: any) => task.status === 'pending')
      if (pendingTasks.length > 0) {
        nextAction = `Complete: ${pendingTasks[0].name}`
      }

      clientUpdates.push({
        project_id: project.id,
        project_name: project.name,
        client_name: project.client?.name || 'Unknown Client',
        status: project.status,
        last_update: project.updated_at,
        days_since_update: daysSinceUpdate,
        progress_percentage: progressPercentage,
        next_action: nextAction
      })
    }
  }

  return clientUpdates.sort((a, b) => b.days_since_update - a.days_since_update)
}

/**
 * Get documentation status for projects
 */
export async function getDocumentationStatus(projectId?: string): Promise<DocumentationStatus[]> {
  let query = supabase
    .from('projects')
    .select('id, name, status')

  if (projectId) {
    query = query.eq('id', projectId)
  } else {
    query = query.in('status', ['in_progress', 'completed'])
  }

  const { data: projects, error } = await query

  if (error) throw error

  const docStatuses: DocumentationStatus[] = []

  for (const project of projects || []) {
    // Required documents checklist
    const requiredDocs = [
      { name: 'Work Appointment Schedule', type: 'form', required_phase: 'start' },
      { name: 'Site File Request', type: 'form', required_phase: 'start' },
      { name: 'ASIB Inspection Request', type: 'form', required_phase: 'mid' },
      { name: 'Pressure Test Certificate', type: 'certificate', required_phase: 'installation' },
      { name: 'Installation QCP', type: 'checklist', required_phase: 'installation' },
      { name: 'Site Daily Diary', type: 'form', required_phase: 'ongoing' },
      { name: 'Commissioning Certificate', type: 'certificate', required_phase: 'completion' }
    ]

    // Check if documents exist
    const { data: linkedDocs } = await supabase
      .from('project_documents')
      .select('document:document_library(*)')
      .eq('project_id', project.id)
      .eq('status', 'active')

    const linkedDocNames = (linkedDocs || []).map((link: any) => link.document?.name || '')

    for (const reqDoc of requiredDocs) {
      const exists = linkedDocNames.some(name => 
        name.toLowerCase().includes(reqDoc.name.toLowerCase())
      )

      const status = exists ? 'completed' as const : 
                     project.status === 'completed' ? 'overdue' as const :
                     'required' as const

      docStatuses.push({
        document_type: reqDoc.type,
        document_name: reqDoc.name,
        project_id: project.id,
        project_name: project.name,
        status: status
      })
    }
  }

  return docStatuses
}

/**
 * Generate client update message
 */
export function generateClientUpdate(project: ClientUpdate): string {
  const days = project.days_since_update
  let message = `Hi, just an update on the ${project.project_name} project. `
  
  message += `Progress is at ${project.progress_percentage}% completion. `
  
  if (project.next_action) {
    message += `Next step: ${project.next_action}. `
  }
  
  message += days === 1 ? 'Updated yesterday.' : `Last update was ${days} days ago. ` 
  message += `Should have it completed soon. Will keep you posted.`

  return message
}

/**
 * Get quick action suggestions
 */
export function getQuickActions(workItems: DailyWorkItem[], clientUpdates: ClientUpdate[]): {
  title: string
  action: string
  urgency: 'high' | 'medium' | 'low'
}[] {
  const actions = []

  // Urgent items
  const urgentCount = workItems.filter(item => item.type === 'urgent').length
  if (urgentCount > 0) {
    actions.push({
      title: `${urgentCount} urgent ${urgentCount === 1 ? 'item' : 'items'} need attention`,
      action: 'Review urgent tasks',
      urgency: 'high' as const
    })
  }

  // Client updates needed
  if (clientUpdates.length > 0) {
    actions.push({
      title: `${clientUpdates.length} ${clientUpdates.length === 1 ? 'client needs' : 'clients need'} an update`,
      action: 'Send client updates',
      urgency: 'high' as const
    })
  }

  // Active projects
  const activeProjects = workItems.filter(item => item.type === 'today').length
  if (activeProjects > 0) {
    actions.push({
      title: `${activeProjects} active ${activeProjects === 1 ? 'project' : 'projects'} in progress`,
      action: 'Review project status',
      urgency: 'medium' as const
    })
  }

  return actions
}

