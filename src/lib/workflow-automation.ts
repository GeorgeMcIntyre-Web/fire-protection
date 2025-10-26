// Workflow automation for template-based project creation
export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: 'residential' | 'commercial' | 'industrial'
  estimated_hours: number
  estimated_cost: number
  default_tasks: TemplateTask[]
  required_resources: string[]
  subcontractors?: SubcontractorInfo[]
}

export interface TemplateTask {
  name: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimated_hours: number
  required_skills?: string[]
  equipment?: string[]
  dependencies?: string[] // Other task names this depends on
}

export interface SubcontractorInfo {
  name: string
  trade: string
  hourly_rate: number
  availability: boolean
}

export interface GeneratedProject {
  name: string
  description: string
  client_id?: string
  template_id: string
  estimated_hours: number
  estimated_cost: number
  start_date?: string
  due_date?: string
}

export interface GeneratedTask {
  name: string
  description: string
  project_id: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  estimated_hours: number
}

/**
 * Create a project from a template with all automated tasks and resources
 */
export async function createProjectFromTemplate(
  template: ProjectTemplate,
  clientName: string,
  projectName?: string
): Promise<{
  project: GeneratedProject
  tasks: GeneratedTask[]
}> {
  // Auto-generate project name if not provided
  const finalProjectName = projectName || `${template.name} - ${clientName}`
  
  const project: GeneratedProject = {
    name: finalProjectName,
    description: `${template.description}\n\nGenerated from template: ${template.name}`,
    template_id: template.id,
    estimated_hours: template.estimated_hours,
    estimated_cost: template.estimated_cost
  }

  // Auto-generate tasks from template
  const tasks: GeneratedTask[] = template.default_tasks.map((task) => ({
    name: task.name,
    description: `${task.description}\n\nEstimated hours: ${task.estimated_hours}h\nRequired skills: ${task.required_skills?.join(', ') || 'General'}`,
    project_id: 'project-placeholder', // Will be replaced with actual project ID
    priority: task.priority,
    estimated_hours: task.estimated_hours
  }))

  return { project, tasks }
}

/**
 * Calculate automatic pricing for a template-based project
 */
export function calculateAutomaticPricing(
  template: ProjectTemplate,
  _location?: string,
  complexity?: 'standard' | 'complex' | 'highly-complex'
): {
  base_cost: number
  labor_cost: number
  material_cost: number
  total_cost: number
  breakdown: Array<{ item: string; cost: number }>
} {
  const complexityMultiplier = {
    'standard': 1.0,
    'complex': 1.3,
    'highly-complex': 1.6
  }[complexity || 'standard']

  const hourlyRate = 85 // Fire protection technician hourly rate
  const materialOverhead = 1.25 // 25% markup on materials

  const labor_cost = template.estimated_hours * hourlyRate * complexityMultiplier
  const base_material_cost = template.estimated_cost * 0.4 // Assume 40% materials
  const material_cost = base_material_cost * materialOverhead
  const base_cost = template.estimated_cost * complexityMultiplier

  const breakdown = [
    { item: 'Labor', cost: labor_cost },
    { item: 'Materials & Equipment', cost: material_cost },
    { item: 'Permits & Compliance', cost: base_cost * 0.1 },
    { item: 'Project Management', cost: base_cost * 0.15 }
  ]

  const total_cost = breakdown.reduce((sum, item) => sum + item.cost, 0)

  return {
    base_cost,
    labor_cost,
    material_cost,
    total_cost,
    breakdown
  }
}

/**
 * Generate automatic project timeline
 */
export function generateProjectTimeline(
  template: ProjectTemplate,
  startDate: Date
): Array<{ 
  task: string
  startDate: Date
  endDate: Date
  duration: number
  phase: string
}> {
  const timeline: Array<{ 
    task: string
    startDate: Date
    endDate: Date
    duration: number
    phase: string
  }> = []
  let currentDate = new Date(startDate)
  
  template.default_tasks.forEach((task) => {
    const duration = task.estimated_hours
    const endDate = new Date(currentDate)
    endDate.setHours(endDate.getHours() + duration)
    
    timeline.push({
      task: task.name,
      startDate: currentDate,
      endDate: endDate,
      duration,
      phase: determinePhase(task.name)
    })
    
    // Add buffer time between tasks
    currentDate = new Date(endDate)
    if (task.priority === 'high') {
      currentDate.setHours(currentDate.getHours() + 2) // 2h buffer for high priority
    } else {
      currentDate.setHours(currentDate.getHours() + 4) // 4h buffer for normal priority
    }
  })
  
  return timeline
}

function determinePhase(taskName: string): string {
  const lowerName = taskName.toLowerCase()
  
  if (lowerName.includes('survey') || lowerName.includes('design') || lowerName.includes('planning')) {
    return 'Planning'
  }
  if (lowerName.includes('install') || lowerName.includes('mount')) {
    return 'Installation'
  }
  if (lowerName.includes('test') || lowerName.includes('commission')) {
    return 'Commissioning'
  }
  if (lowerName.includes('train') || lowerName.includes('documentation')) {
    return 'Completion'
  }
  
  return 'Preparation'
}

/**
 * Auto-assign subcontractors based on required skills
 */
export function suggestSubcontractors(
  requiredSkills: string[],
  availableSubcontractors: SubcontractorInfo[]
): SubcontractorInfo[] {
  return availableSubcontractors.filter(
    (subcontractor) => 
      requiredSkills.some(skill => 
        subcontractor.trade.toLowerCase().includes(skill.toLowerCase())
      ) && subcontractor.availability
  )
}

/**
 * Generate project quote document
 */
export function generateQuote(template: ProjectTemplate): string {
  const pricing = calculateAutomaticPricing(template)
  
  return `
FIRE PROTECTION PROJECT QUOTE
Generated: ${new Date().toLocaleDateString()}

Project: ${template.name}
Category: ${template.category}
Estimated Duration: ${template.estimated_hours} hours

PRICING BREAKDOWN:
${pricing.breakdown.map(item => `  ${item.item}: R${item.cost.toFixed(2)}`).join('\n')}

TOTAL PROJECT COST: R${pricing.total_cost.toFixed(2)}

INCLUDED SERVICES:
- ${template.default_tasks.map(t => t.name).join('\n- ')}

TERMS:
- Payment: 50% on start, 50% on completion
- Validity: 30 days
- Warranty: 1 year on all equipment
`
}

export const defaultSubcontractors: SubcontractorInfo[] = [
  { name: 'John Smith', trade: 'Fire Alarm Technician', hourly_rate: 120, availability: true },
  { name: 'Mike Johnson', trade: 'Sprinkler Systems Specialist', hourly_rate: 150, availability: true },
  { name: 'Sarah Williams', trade: 'Electrical Installer', hourly_rate: 100, availability: true },
  { name: 'David Brown', trade: 'Control Systems Engineer', hourly_rate: 180, availability: true }
]

