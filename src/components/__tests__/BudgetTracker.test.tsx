import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

// Mock supabase and DEMO_MODE to use demo pathway
vi.mock('../../lib/supabase', async () => {
  return {
    supabase: { from: vi.fn() },
    DEMO_MODE: true,
  }
})

import { BudgetTracker } from '../BudgetTracker'

describe('BudgetTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders demo budget overview and individual projects', async () => {
    render(<BudgetTracker />)

    await waitFor(() => {
      expect(screen.getByText(/Budget Overview/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Shoprite Warehouse/)).toBeInTheDocument()
    expect(screen.getByText(/Residential Complex/)).toBeInTheDocument()
    expect(screen.getByText(/Office Building/)).toBeInTheDocument()
  })
})
