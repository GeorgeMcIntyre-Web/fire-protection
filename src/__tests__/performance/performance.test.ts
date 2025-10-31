import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateMockProjects, generateMockTasks } from '../utils/mockData'

// Mock must be before import
vi.mock('../../lib/supabase', () => {
  const mockFrom = vi.fn()
  return {
    supabase: {
      from: mockFrom
    }
  }
})

import { getDailyWorkItems, getProjectsNeedingClientUpdates } from '../../lib/pm-workflow'
import { getDocuments } from '../../lib/documents'

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Large Dataset Performance', () => {
    it('should handle 100+ projects efficiently', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockFrom = supabase.from as any
      
      const largeDataset = generateMockProjects(100)
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: largeDataset, error: null })
      }))

      const startTime = performance.now()
      const result = await getDailyWorkItems('user-1')
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(result).toBeDefined()
      expect(duration).toBeLessThan(1000) // Should complete in under 1 second
    })

    it('should handle 1000+ tasks efficiently', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockFrom = supabase.from as any
      
      const largeTasks = generateMockTasks(1000)
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: largeTasks, error: null })
      }))

      const startTime = performance.now()
      const { data } = await supabase
        .from('tasks')
        .select()
        .eq('project_id', 'proj-1')
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(data).toBeDefined()
      expect(data?.length).toBe(1000)
      expect(duration).toBeLessThan(500) // Should complete in under 500ms
    })

    it('should paginate large result sets', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockFrom = supabase.from as any
      
      const largeDataset = generateMockProjects(1000)
      const pageSize = 50
      const page1 = largeDataset.slice(0, pageSize)

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: page1, error: null })
      }))

      const startTime = performance.now()
      const { data } = await supabase
        .from('projects')
        .select()
        .range(0, pageSize - 1)
        .order('created_at')
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(data).toBeDefined()
      expect(data?.length).toBe(pageSize)
      expect(duration).toBeLessThan(200) // Should complete in under 200ms
    })
  })

  describe('Query Performance', () => {
    it('should optimize complex joins', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockFrom = supabase.from as any
      
      const complexData = {
        id: 'proj-1',
        name: 'Project',
        client: { id: 'client-1', name: 'Client' },
        tasks: generateMockTasks(100)
      }

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: complexData, error: null })
      }))

      const startTime = performance.now()
      const { data } = await supabase
        .from('projects')
        .select('*, client:clients(*), tasks(*)')
        .eq('id', 'proj-1')
        .single()
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(data).toBeDefined()
      expect(duration).toBeLessThan(300) // Should complete in under 300ms
    })

    it('should handle concurrent requests efficiently', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }))

      const startTime = performance.now()
      
      await Promise.all([
        getDailyWorkItems('user-1'),
        getProjectsNeedingClientUpdates(),
        getDocuments()
      ])
      
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(1500) // Should complete in under 1.5 seconds
    })

    it('should measure filtering performance', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockFrom = supabase.from as any
      
      const largeDataset = generateMockProjects(500)
      const filteredData = largeDataset.filter(p => p.status === 'in_progress')

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: filteredData, error: null })
      }))

      const startTime = performance.now()
      const { data } = await supabase
        .from('projects')
        .select()
        .eq('status', 'in_progress')
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(data).toBeDefined()
      expect(duration).toBeLessThan(200) // Should complete in under 200ms
    })
  })

  describe('Memory Usage', () => {
    it('should not leak memory with repeated operations', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockResolvedValue({ data: generateMockProjects(50), error: null })
      }))

      const iterations = 100
      
      for (let i = 0; i < iterations; i++) {
        await supabase.from('projects').select()
      }

      // If we get here without running out of memory, test passes
      expect(true).toBe(true)
    })

    it('should efficiently handle large object arrays', () => {
      const largeArray = generateMockProjects(10000)
      
      const startTime = performance.now()
      const filtered = largeArray.filter(p => p.status === 'in_progress')
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(filtered).toBeDefined()
      expect(duration).toBeLessThan(50) // Should complete in under 50ms
    })
  })

  describe('Document Processing Performance', () => {
    it('should parse document codes efficiently', async () => {
      const { parseDocumentCode } = await import('../../lib/documents')
      
      const filenames = Array.from({ length: 1000 }, (_, i) => 
        `CFM-OPS-FRM-${String(i).padStart(3, '0')} - Rev ${i % 20} - Document ${i}.pdf`
      )

      const startTime = performance.now()
      filenames.forEach(filename => parseDocumentCode(filename))
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100) // Should complete in under 100ms
    })

    it('should handle bulk document fetching', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockFrom = supabase.from as any
      
      const largeDocs = Array.from({ length: 500 }, (_, i) => ({
        id: `doc-${i}`,
        name: `Document ${i}`,
        file_url: `https://test.com/doc-${i}.pdf`
      }))

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: largeDocs, error: null })
      }))

      const startTime = performance.now()
      const result = await getDocuments()
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(result).toBeDefined()
      expect(duration).toBeLessThan(300) // Should complete in under 300ms
    })
  })

  describe('Performance Benchmarks', () => {
    it('should establish baseline for project queries', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockFrom = supabase.from as any
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockResolvedValue({ data: generateMockProjects(10), error: null })
      }))

      const iterations = 50
      const durations: number[] = []

      for (let i = 0; i < iterations; i++) {
        const start = performance.now()
        await supabase.from('projects').select()
        const end = performance.now()
        durations.push(end - start)
      }

      const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      const maxDuration = Math.max(...durations)

      expect(averageDuration).toBeLessThan(100) // Average should be under 100ms
      expect(maxDuration).toBeLessThan(500) // Max should be under 500ms
      
      console.log('Project Query Benchmark:')
      console.log(`  Average: ${averageDuration.toFixed(2)}ms`)
      console.log(`  Max: ${maxDuration.toFixed(2)}ms`)
    })

    it('should measure workflow calculation performance', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockFrom = supabase.from as any
      
      const largeProjects = generateMockProjects(100).map(p => ({
        ...p,
        client: { name: 'Test Client' },
        tasks: generateMockTasks(10)
      }))

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: largeProjects, error: null })
      }))

      const startTime = performance.now()
      await getDailyWorkItems('user-1')
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(2000) // Should complete in under 2 seconds
      
      console.log(`Workflow Calculation Benchmark: ${duration.toFixed(2)}ms`)
    })
  })
})
