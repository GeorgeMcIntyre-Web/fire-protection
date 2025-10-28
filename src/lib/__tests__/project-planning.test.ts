import { describe, it, expect } from 'vitest'
import { suggestCostSavings } from '../project-planning'

describe('project planning', () => {
  it('suggests cost savings for sprinkler_system', () => {
    const suggestions = suggestCostSavings('sprinkler_system')
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions.join(' ')).toMatch(/order|install|negotiate|schedule|pre-fabricated/i)
  })
})
