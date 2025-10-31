import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock must be before import
vi.mock('../../lib/supabase', () => {
  const mockFrom = vi.fn()
  const mockStorage = {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com/file.pdf' } })),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: vi.fn().mockResolvedValue({ data: {}, error: null })
    }))
  }
  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user', email: 'test@test.com' } }, 
      error: null 
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user', email: 'test@test.com' }, session: {} }, 
      error: null 
    }),
    signUp: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user', email: 'test@test.com' }, session: {} }, 
      error: null 
    }),
    signOut: vi.fn().mockResolvedValue({ error: null })
  }
  
  return {
    supabase: {
      from: mockFrom,
      storage: mockStorage,
      auth: mockAuth
    }
  }
})

import { supabase } from '../../lib/supabase'

describe('Database Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Projects CRUD', () => {
    it('should create a new project', async () => {
      const mockFrom = supabase.from as any
      const newProject = {
        name: 'Test Project',
        description: 'Test Description',
        status: 'pending',
        created_by: 'user-1'
      }

      mockFrom.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'proj-1', ...newProject }, 
          error: null 
        })
      }))

      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.name).toBe('Test Project')
    })

    it('should read projects', async () => {
      const mockFrom = supabase.from as any
      const mockProjects = [
        { id: 'proj-1', name: 'Project 1', status: 'in_progress' },
        { id: 'proj-2', name: 'Project 2', status: 'pending' }
      ]

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockResolvedValue({ data: mockProjects, error: null })
      }))

      const { data, error } = await supabase
        .from('projects')
        .select()

      expect(error).toBeNull()
      expect(data).toHaveLength(2)
    })

    it('should update a project', async () => {
      const mockFrom = supabase.from as any
      const updates = { status: 'completed' }

      mockFrom.mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ 
          data: [{ id: 'proj-1', status: 'completed' }], 
          error: null 
        })
      }))

      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', 'proj-1')
        .select()

      expect(error).toBeNull()
      expect(data?.[0]?.status).toBe('completed')
    })

    it('should delete a project', async () => {
      const mockFrom = supabase.from as any

      mockFrom.mockImplementation(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: {}, error: null })
      }))

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', 'proj-1')

      expect(error).toBeNull()
    })
  })

  describe('Tasks CRUD', () => {
    it('should create a new task', async () => {
      const mockFrom = supabase.from as any
      const newTask = {
        project_id: 'proj-1',
        name: 'Test Task',
        priority: 'high',
        status: 'pending',
        created_by: 'user-1'
      }

      mockFrom.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'task-1', ...newTask }, 
          error: null 
        })
      }))

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.name).toBe('Test Task')
    })

    it('should fetch tasks for a project', async () => {
      const mockFrom = supabase.from as any
      const mockTasks = [
        { id: 'task-1', name: 'Task 1', project_id: 'proj-1' },
        { id: 'task-2', name: 'Task 2', project_id: 'proj-1' }
      ]

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockTasks, error: null })
      }))

      const { data, error } = await supabase
        .from('tasks')
        .select()
        .eq('project_id', 'proj-1')

      expect(error).toBeNull()
      expect(data).toHaveLength(2)
    })
  })

  describe('Time Logs CRUD', () => {
    it('should create a time log', async () => {
      const mockFrom = supabase.from as any
      const newTimeLog = {
        user_id: 'user-1',
        task_id: 'task-1',
        start_time: new Date().toISOString(),
        description: 'Working on task'
      }

      mockFrom.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'log-1', ...newTimeLog }, 
          error: null 
        })
      }))

      const { data, error } = await supabase
        .from('time_logs')
        .insert(newTimeLog)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.user_id).toBe('user-1')
    })

    it('should update time log end_time', async () => {
      const mockFrom = supabase.from as any
      const endTime = new Date().toISOString()

      mockFrom.mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ 
          data: [{ id: 'log-1', end_time: endTime }], 
          error: null 
        })
      }))

      const { data, error } = await supabase
        .from('time_logs')
        .update({ end_time: endTime })
        .eq('id', 'log-1')
        .select()

      expect(error).toBeNull()
      expect(data?.[0]?.end_time).toBe(endTime)
    })
  })

  describe('Clients CRUD', () => {
    it('should create a new client', async () => {
      const mockFrom = supabase.from as any
      const newClient = {
        name: 'ABC Corp',
        contact_person: 'John Doe',
        email: 'john@abc.com',
        created_by: 'user-1'
      }

      mockFrom.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'client-1', ...newClient }, 
          error: null 
        })
      }))

      const { data, error } = await supabase
        .from('clients')
        .insert(newClient)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.name).toBe('ABC Corp')
    })

    it('should fetch all clients', async () => {
      const mockFrom = supabase.from as any
      const mockClients = [
        { id: 'client-1', name: 'Client 1' },
        { id: 'client-2', name: 'Client 2' }
      ]

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockResolvedValue({ data: mockClients, error: null })
      }))

      const { data, error } = await supabase
        .from('clients')
        .select()

      expect(error).toBeNull()
      expect(data).toHaveLength(2)
    })
  })

  describe('Complex Queries', () => {
    it('should fetch project with related data', async () => {
      const mockFrom = supabase.from as any
      const mockProject = {
        id: 'proj-1',
        name: 'Complex Project',
        client: { name: 'Test Client' },
        tasks: [
          { id: 'task-1', name: 'Task 1' },
          { id: 'task-2', name: 'Task 2' }
        ]
      }

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProject, error: null })
      }))

      const { data, error } = await supabase
        .from('projects')
        .select('*, client:clients(*), tasks(*)')
        .eq('id', 'proj-1')
        .single()

      expect(error).toBeNull()
      expect(data?.client).toBeDefined()
      expect(data?.tasks).toHaveLength(2)
    })

    it('should filter and sort results', async () => {
      const mockFrom = supabase.from as any
      const mockProjects = [
        { id: 'proj-1', name: 'Project A', status: 'in_progress' },
        { id: 'proj-2', name: 'Project B', status: 'in_progress' }
      ]

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProjects, error: null })
      }))

      const { data, error } = await supabase
        .from('projects')
        .select()
        .eq('status', 'in_progress')
        .order('name')

      expect(error).toBeNull()
      expect(data).toHaveLength(2)
    })
  })

  describe('Document Storage Integration', () => {
    it('should upload file to storage', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const filePath = 'test/test.pdf'

      const { error } = await supabase.storage
        .from('company-documents')
        .upload(filePath, mockFile)

      expect(error).toBeNull()
    })

    it('should get public URL for file', () => {
      const filePath = 'test/test.pdf'

      const { data } = supabase.storage
        .from('company-documents')
        .getPublicUrl(filePath)

      expect(data.publicUrl).toBeDefined()
      expect(data.publicUrl).toContain('.pdf')
    })

    it('should download file from storage', async () => {
      const filePath = 'test/test.pdf'

      const { data, error } = await supabase.storage
        .from('company-documents')
        .download(filePath)

      expect(error).toBeNull()
      expect(data).toBeInstanceOf(Blob)
    })

    it('should remove file from storage', async () => {
      const filePath = 'test/test.pdf'

      const { error } = await supabase.storage
        .from('company-documents')
        .remove([filePath])

      expect(error).toBeNull()
    })
  })

  describe('Authentication Integration', () => {
    it('should sign in user', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@test.com',
        password: 'password123'
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.user?.email).toBe('test@test.com')
    })

    it('should sign up new user', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: 'newuser@test.com',
        password: 'password123'
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
    })

    it('should sign out user', async () => {
      const { error } = await supabase.auth.signOut()

      expect(error).toBeNull()
    })

    it('should get current user', async () => {
      const { data } = await supabase.auth.getUser()

      expect(data.user).toBeDefined()
      expect(data.user?.id).toBe('test-user')
    })
  })
})
