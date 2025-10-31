import { describe, it, expect, beforeEach } from 'vitest'
import {
  createProjectFromTemplate,
  calculateAutomaticPricing,
  generateProjectTimeline,
  suggestSubcontractors,
  generateQuote,
  defaultSubcontractors,
  type ProjectTemplate
} from '../workflow-automation'
import { mockProjectTemplate, mockTemplateTasks, mockSubcontractors } from '../../__tests__/utils/mockData'

describe('workflow-automation', () => {
  describe('createProjectFromTemplate', () => {
    it('should create project from template', async () => {
      const result = await createProjectFromTemplate(
        mockProjectTemplate,
        'Test Client',
        'Custom Project Name'
      )

      expect(result).toBeDefined()
      expect(result.project).toBeDefined()
      expect(result.tasks).toBeDefined()
      expect(result.project.name).toBe('Custom Project Name')
    })

    it('should auto-generate project name when not provided', async () => {
      const result = await createProjectFromTemplate(
        mockProjectTemplate,
        'ABC Corp'
      )

      expect(result.project.name).toContain(mockProjectTemplate.name)
      expect(result.project.name).toContain('ABC Corp')
    })

    it('should include template metadata', async () => {
      const result = await createProjectFromTemplate(
        mockProjectTemplate,
        'Test Client'
      )

      expect(result.project.template_id).toBe(mockProjectTemplate.id)
      expect(result.project.estimated_hours).toBe(mockProjectTemplate.estimated_hours)
      expect(result.project.estimated_cost).toBe(mockProjectTemplate.estimated_cost)
      expect(result.project.description).toContain('Generated from template')
    })

    it('should generate tasks from template', async () => {
      const result = await createProjectFromTemplate(
        mockProjectTemplate,
        'Test Client'
      )

      expect(result.tasks.length).toBe(mockProjectTemplate.default_tasks.length)
      
      result.tasks.forEach((task, idx) => {
        const templateTask = mockProjectTemplate.default_tasks[idx]
        expect(task.name).toBe(templateTask.name)
        expect(task.priority).toBe(templateTask.priority)
        expect(task.estimated_hours).toBe(templateTask.estimated_hours)
      })
    })

    it('should include task descriptions with metadata', async () => {
      const result = await createProjectFromTemplate(
        mockProjectTemplate,
        'Test Client'
      )

      result.tasks.forEach((task, idx) => {
        const templateTask = mockProjectTemplate.default_tasks[idx]
        expect(task.description).toContain(templateTask.description)
        expect(task.description).toContain(`${templateTask.estimated_hours}h`)
      })
    })
  })

  describe('calculateAutomaticPricing', () => {
    it('should calculate pricing for standard complexity', () => {
      const result = calculateAutomaticPricing(mockProjectTemplate, undefined, 'standard')

      expect(result).toBeDefined()
      expect(result.base_cost).toBeGreaterThan(0)
      expect(result.labor_cost).toBeGreaterThan(0)
      expect(result.material_cost).toBeGreaterThan(0)
      expect(result.total_cost).toBeGreaterThan(0)
      expect(result.breakdown).toBeDefined()
      expect(result.breakdown.length).toBeGreaterThan(0)
    })

    it('should apply complexity multiplier correctly', () => {
      const standard = calculateAutomaticPricing(mockProjectTemplate, undefined, 'standard')
      const complex = calculateAutomaticPricing(mockProjectTemplate, undefined, 'complex')
      const highlyComplex = calculateAutomaticPricing(mockProjectTemplate, undefined, 'highly-complex')

      expect(complex.base_cost).toBeGreaterThan(standard.base_cost)
      expect(highlyComplex.base_cost).toBeGreaterThan(complex.base_cost)
    })

    it('should calculate labor cost based on hours and rate', () => {
      const result = calculateAutomaticPricing(mockProjectTemplate, undefined, 'standard')

      const expectedLaborCost = mockProjectTemplate.estimated_hours * 85 * 1.0
      expect(result.labor_cost).toBe(expectedLaborCost)
    })

    it('should include material markup', () => {
      const result = calculateAutomaticPricing(mockProjectTemplate, undefined, 'standard')

      expect(result.material_cost).toBeGreaterThan(0)
      // Material cost should be more than base due to markup
      const baseMaterialCost = mockProjectTemplate.estimated_cost * 0.4
      expect(result.material_cost).toBeGreaterThan(baseMaterialCost)
    })

    it('should include all breakdown items', () => {
      const result = calculateAutomaticPricing(mockProjectTemplate, undefined, 'standard')

      const expectedItems = ['Labor', 'Materials & Equipment', 'Permits & Compliance', 'Project Management']
      expectedItems.forEach(item => {
        const found = result.breakdown.find(b => b.item === item)
        expect(found).toBeDefined()
        expect(found!.cost).toBeGreaterThan(0)
      })
    })

    it('should calculate total from breakdown', () => {
      const result = calculateAutomaticPricing(mockProjectTemplate, undefined, 'standard')

      const calculatedTotal = result.breakdown.reduce((sum, item) => sum + item.cost, 0)
      expect(result.total_cost).toBeCloseTo(calculatedTotal, 2)
    })
  })

  describe('generateProjectTimeline', () => {
    it('should generate timeline for all tasks', () => {
      const startDate = new Date('2024-01-01')
      const result = generateProjectTimeline(mockProjectTemplate, startDate)

      expect(result).toBeDefined()
      expect(result.length).toBe(mockProjectTemplate.default_tasks.length)
    })

    it('should set correct start dates', () => {
      const startDate = new Date('2024-01-01')
      const result = generateProjectTimeline(mockProjectTemplate, startDate)

      expect(result[0].startDate.toISOString()).toBe(startDate.toISOString())
    })

    it('should calculate end dates based on duration', () => {
      const startDate = new Date('2024-01-01')
      const result = generateProjectTimeline(mockProjectTemplate, startDate)

      result.forEach(item => {
        const duration = item.duration
        const expectedEnd = new Date(item.startDate)
        expectedEnd.setHours(expectedEnd.getHours() + duration)
        
        expect(item.endDate.getTime()).toBe(expectedEnd.getTime())
      })
    })

    it('should add buffer time between tasks', () => {
      const startDate = new Date('2024-01-01')
      const result = generateProjectTimeline(mockProjectTemplate, startDate)

      if (result.length > 1) {
        // Second task should start after first task ends plus buffer
        const firstEnd = result[0].endDate
        const secondStart = result[1].startDate
        
        expect(secondStart.getTime()).toBeGreaterThan(firstEnd.getTime())
      }
    })

    it('should assign phases correctly', () => {
      const startDate = new Date('2024-01-01')
      const result = generateProjectTimeline(mockProjectTemplate, startDate)

      result.forEach(item => {
        expect(item.phase).toBeDefined()
        expect(['Planning', 'Installation', 'Commissioning', 'Completion', 'Preparation'])
          .toContain(item.phase)
      })
    })

    it('should handle high priority tasks with shorter buffer', () => {
      const template: ProjectTemplate = {
        ...mockProjectTemplate,
        default_tasks: [
          { ...mockTemplateTasks[0], priority: 'high' },
          { ...mockTemplateTasks[1], priority: 'low' }
        ]
      }

      const startDate = new Date('2024-01-01')
      const result = generateProjectTimeline(template, startDate)

      if (result.length > 1) {
        const firstTaskEnd = result[0].endDate
        const secondTaskStart = result[1].startDate
        const buffer = secondTaskStart.getTime() - firstTaskEnd.getTime()
        
        // High priority should have 2h buffer (7200000 ms)
        expect(buffer).toBeLessThanOrEqual(7200001)
      }
    })
  })

  describe('suggestSubcontractors', () => {
    it('should suggest matching subcontractors', () => {
      const requiredSkills = ['Fire Alarm']
      const result = suggestSubcontractors(requiredSkills, mockSubcontractors)

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].trade).toContain('Fire Alarm')
    })

    it('should filter by availability', () => {
      const unavailableSubcontractors = [
        { ...mockSubcontractors[0], availability: false }
      ]

      const result = suggestSubcontractors(['Fire Alarm'], unavailableSubcontractors)

      expect(result.length).toBe(0)
    })

    it('should match skills case-insensitively', () => {
      const requiredSkills = ['fire alarm']
      const result = suggestSubcontractors(requiredSkills, mockSubcontractors)

      expect(result.length).toBeGreaterThan(0)
    })

    it('should return empty array when no matches', () => {
      const requiredSkills = ['Underwater Welding']
      const result = suggestSubcontractors(requiredSkills, mockSubcontractors)

      expect(result).toEqual([])
    })

    it('should match multiple skills', () => {
      const requiredSkills = ['Fire Alarm', 'Sprinkler']
      const result = suggestSubcontractors(requiredSkills, mockSubcontractors)

      expect(result.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('generateQuote', () => {
    it('should generate complete quote', () => {
      const quote = generateQuote(mockProjectTemplate)

      expect(quote).toBeDefined()
      expect(typeof quote).toBe('string')
      expect(quote.length).toBeGreaterThan(0)
    })

    it('should include project information', () => {
      const quote = generateQuote(mockProjectTemplate)

      expect(quote).toContain(mockProjectTemplate.name)
      expect(quote).toContain(mockProjectTemplate.category)
      expect(quote).toContain(`${mockProjectTemplate.estimated_hours}`)
    })

    it('should include pricing breakdown', () => {
      const quote = generateQuote(mockProjectTemplate)

      expect(quote).toContain('PRICING BREAKDOWN')
      expect(quote).toContain('Labor')
      expect(quote).toContain('Materials')
      expect(quote).toContain('TOTAL PROJECT COST')
    })

    it('should include all tasks', () => {
      const quote = generateQuote(mockProjectTemplate)

      mockProjectTemplate.default_tasks.forEach(task => {
        expect(quote).toContain(task.name)
      })
    })

    it('should include terms and conditions', () => {
      const quote = generateQuote(mockProjectTemplate)

      expect(quote).toContain('TERMS')
      expect(quote).toContain('Payment')
      expect(quote).toContain('Validity')
      expect(quote).toContain('Warranty')
    })

    it('should format currency correctly', () => {
      const quote = generateQuote(mockProjectTemplate)

      expect(quote).toMatch(/R[\d,]+\.\d{2}/)
    })

    it('should include generation date', () => {
      const quote = generateQuote(mockProjectTemplate)

      expect(quote).toContain('Generated')
    })
  })

  describe('defaultSubcontractors', () => {
    it('should have predefined subcontractors', () => {
      expect(defaultSubcontractors).toBeDefined()
      expect(Array.isArray(defaultSubcontractors)).toBe(true)
      expect(defaultSubcontractors.length).toBeGreaterThan(0)
    })

    it('should have all required fields', () => {
      defaultSubcontractors.forEach(sub => {
        expect(sub.name).toBeDefined()
        expect(sub.trade).toBeDefined()
        expect(sub.hourly_rate).toBeGreaterThan(0)
        expect(typeof sub.availability).toBe('boolean')
      })
    })

    it('should cover common trades', () => {
      const trades = defaultSubcontractors.map(s => s.trade)
      
      expect(trades.some(t => t.includes('Fire Alarm'))).toBe(true)
      expect(trades.some(t => t.includes('Sprinkler'))).toBe(true)
    })
  })
})
