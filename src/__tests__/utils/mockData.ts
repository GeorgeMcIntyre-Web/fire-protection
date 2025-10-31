import type { DailyWorkItem, ClientUpdate, DocumentationStatus } from '../../lib/pm-workflow'
import type { ProjectTemplate, TemplateTask, SubcontractorInfo } from '../../lib/workflow-automation'
import type { Document, DocumentCategory, ProjectDocument } from '../../lib/documents'

// Mock Daily Work Items
export const mockDailyWorkItems: DailyWorkItem[] = [
  {
    id: '1',
    type: 'urgent',
    title: 'Project deadline in TODAY',
    project_name: 'Test Project 1',
    client_name: 'Test Client 1',
    status: 'in_progress',
    priority: 'high',
    due_date: new Date().toISOString()
  },
  {
    id: '2',
    type: 'today',
    title: 'Active project',
    project_name: 'Test Project 2',
    client_name: 'Test Client 2',
    status: 'in_progress',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'urgent',
    title: 'High Priority Task',
    project_name: 'Test Project 3',
    client_name: 'Test Client 3',
    status: 'pending',
    priority: 'high',
    description: 'This is a high priority task'
  }
]

// Mock Client Updates
export const mockClientUpdates: ClientUpdate[] = [
  {
    project_id: 'proj-1',
    project_name: 'Shoprite Warehouse',
    client_name: 'Shoprite',
    status: 'in_progress',
    last_update: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    days_since_update: 5,
    progress_percentage: 65,
    next_action: 'Complete installation phase'
  },
  {
    project_id: 'proj-2',
    project_name: 'Office Complex',
    client_name: 'ABC Corp',
    status: 'in_progress',
    last_update: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    days_since_update: 7,
    progress_percentage: 40,
    next_action: 'ASIB inspection'
  }
]

// Mock Documentation Status
export const mockDocumentationStatus: DocumentationStatus[] = [
  {
    document_type: 'form',
    document_name: 'Work Appointment Schedule',
    project_id: 'proj-1',
    project_name: 'Test Project',
    status: 'required'
  },
  {
    document_type: 'certificate',
    document_name: 'Pressure Test Certificate',
    project_id: 'proj-1',
    project_name: 'Test Project',
    status: 'overdue'
  }
]

// Mock Document Categories
export const mockDocumentCategories: DocumentCategory[] = [
  {
    id: 1,
    name: 'Forms',
    code: 'FRM',
    display_order: 1,
    description: 'Standard company forms'
  },
  {
    id: 2,
    name: 'Certificates',
    code: 'CER',
    display_order: 2,
    description: 'Certificates and compliance documents'
  },
  {
    id: 3,
    name: 'Checklists',
    code: 'CKL',
    display_order: 3,
    description: 'Quality control checklists'
  }
]

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Site File Request',
    document_code: 'CFM-OPS-FRM-001',
    category_id: 1,
    description: 'Request form for site file access',
    file_url: 'https://test.com/doc1.pdf',
    file_type: 'application/pdf',
    version: '14',
    tags: ['form', 'site'],
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'doc-2',
    name: 'Pressure Test Certificate',
    document_code: 'CFM-OPS-CER-002',
    category_id: 2,
    description: 'Certificate for pressure testing',
    file_url: 'https://test.com/doc2.pdf',
    file_type: 'application/pdf',
    version: '8',
    tags: ['certificate', 'testing'],
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Mock Project Templates
export const mockTemplateTasks: TemplateTask[] = [
  {
    name: 'Site Survey',
    description: 'Initial site survey and assessment',
    priority: 'high',
    estimated_hours: 4,
    required_skills: ['surveying'],
    equipment: ['measuring tape', 'camera']
  },
  {
    name: 'System Design',
    description: 'Design fire protection system',
    priority: 'high',
    estimated_hours: 8,
    required_skills: ['design', 'CAD'],
    dependencies: ['Site Survey']
  }
]

export const mockProjectTemplate: ProjectTemplate = {
  id: 'template-1',
  name: 'Fire Sprinkler Installation',
  description: 'Standard fire sprinkler system installation',
  category: 'commercial',
  estimated_hours: 120,
  estimated_cost: 50000,
  default_tasks: mockTemplateTasks,
  required_resources: ['Pipes', 'Sprinkler heads', 'Valves']
}

// Mock Subcontractors
export const mockSubcontractors: SubcontractorInfo[] = [
  {
    name: 'John Smith',
    trade: 'Fire Alarm Technician',
    hourly_rate: 120,
    availability: true
  },
  {
    name: 'Jane Doe',
    trade: 'Sprinkler Systems Specialist',
    hourly_rate: 150,
    availability: true
  }
]

// Mock Projects
export const mockProjects = [
  {
    id: 'proj-1',
    name: 'Test Project 1',
    description: 'Test project description',
    status: 'in_progress',
    client_id: 'client-1',
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    client: { name: 'Test Client' },
    tasks: [
      {
        id: 'task-1',
        name: 'Task 1',
        status: 'pending',
        priority: 'high',
        description: 'Test task',
        estimated_hours: 8
      }
    ]
  }
]

// Mock Tasks
export const mockTasks = [
  {
    id: 'task-1',
    project_id: 'proj-1',
    name: 'Installation Task',
    description: 'Install sprinkler system',
    status: 'pending',
    priority: 'high',
    assigned_to: 'user-1',
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    estimated_hours: 8
  }
]

// Mock Time Logs
export const mockTimeLogs = [
  {
    id: 'time-1',
    task_id: 'task-1',
    project_id: 'proj-1',
    user_id: 'user-1',
    start_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    end_time: new Date().toISOString(),
    description: 'Worked on installation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Helper to generate large datasets for performance testing
export const generateMockProjects = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `proj-${i}`,
    name: `Project ${i}`,
    description: `Description for project ${i}`,
    status: ['pending', 'in_progress', 'completed'][i % 3] as 'pending' | 'in_progress' | 'completed',
    client_id: `client-${i % 10}`,
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString()
  }))
}

export const generateMockTasks = (count: number, projectId: string = 'proj-1') => {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i}`,
    project_id: projectId,
    name: `Task ${i}`,
    description: `Description for task ${i}`,
    status: ['pending', 'in_progress', 'completed'][i % 3] as 'pending' | 'in_progress' | 'completed',
    priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high',
    assigned_to: `user-${i % 5}`,
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
}
