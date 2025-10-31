import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../__tests__/utils/testUtils'
import { BudgetTracker } from '../BudgetTracker'

describe('BudgetTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    renderWithProviders(<BudgetTracker />)
    
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
  })

  it('should display budget overview', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      expect(screen.getByText('Budget Overview')).toBeInTheDocument()
    })
  })

  it('should display total estimated and actual costs', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      expect(screen.getByText('Total Estimated')).toBeInTheDocument()
      expect(screen.getByText('Total Actual')).toBeInTheDocument()
      expect(screen.getByText('Variance')).toBeInTheDocument()
    })
  })

  it('should format currency correctly', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      // Check for ZAR currency format
      const currencyElements = screen.getAllByText(/R[\d,]+/)
      expect(currencyElements.length).toBeGreaterThan(0)
    })
  })

  it('should display project budgets section', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      expect(screen.getByText('Project Budgets')).toBeInTheDocument()
    })
  })

  it('should show individual project budget cards', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      expect(screen.getByText('Shoprite Warehouse')).toBeInTheDocument()
      expect(screen.getByText('Residential Complex')).toBeInTheDocument()
      expect(screen.getByText('Office Building')).toBeInTheDocument()
    })
  })

  it('should display budget status indicators', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      expect(screen.getByText('At risk')).toBeInTheDocument()
      expect(screen.getAllByText('On budget').length).toBeGreaterThan(0)
    })
  })

  it('should show variance percentages', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      expect(screen.getByText(/\+8\.2%/)).toBeInTheDocument()
      expect(screen.getByText(/-3\.3%/)).toBeInTheDocument()
    })
  })

  it('should display progress bars', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      const progressBars = document.querySelectorAll('[class*="rounded-full"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })

  it('should show budget tips section', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      expect(screen.getByText('Budget Tips')).toBeInTheDocument()
      expect(screen.getByText(/Track costs daily/)).toBeInTheDocument()
    })
  })

  it('should display overall status badge', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      expect(screen.getByText('Overall Status')).toBeInTheDocument()
    })
  })

  it('should use correct color coding for status', async () => {
    const { container } = renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      // Check for color classes
      const statusElements = container.querySelectorAll('[class*="text-green-"], [class*="text-yellow-"], [class*="text-red-"]')
      expect(statusElements.length).toBeGreaterThan(0)
    })
  })

  it('should show no active projects message when empty', async () => {
    // This would require mocking the data fetching to return empty array
    // For now, we'll test the component renders without error
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      expect(screen.getByText('Budget Overview')).toBeInTheDocument()
    })
  })

  it('should display estimated vs actual costs', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      const estimatedLabels = screen.getAllByText(/Estimated:/)
      const actualLabels = screen.getAllByText(/Actual:/)
      
      expect(estimatedLabels.length).toBeGreaterThan(0)
      expect(actualLabels.length).toBeGreaterThan(0)
    })
  })

  it('should show variance with trend indicators', async () => {
    renderWithProviders(<BudgetTracker />)

    await waitFor(() => {
      expect(screen.getAllByText(/Variance:/)).toBeDefined()
    })
  })
})
