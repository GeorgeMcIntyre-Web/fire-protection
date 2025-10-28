import { describe, it, expect } from 'vitest'
import { generateClientUpdate } from '../pm-workflow'

describe('pm-workflow helpers', () => {
  it('generates a professional client update message with progress and next action', () => {
    const msg = generateClientUpdate({
      project_id: 'p1',
      project_name: 'Warehouse Sprinklers',
      client_name: 'Acme',
      status: 'in_progress',
      last_update: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      days_since_update: 4,
      progress_percentage: 60,
      next_action: 'Complete: Pressure Testing',
    })

    expect(msg).toMatch(/Warehouse Sprinklers/)
    expect(msg).toMatch(/60%/)
    expect(msg).toMatch(/Next step: Complete: Pressure Testing/)
    expect(msg).toMatch(/4 days ago|Updated yesterday/)
  })
})
