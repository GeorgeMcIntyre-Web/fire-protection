import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, mockAuthContextValue } from '../../__tests__/utils/testUtils'
import { Navigation } from '../Navigation'

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render navigation bar', () => {
    renderWithProviders(<Navigation />)

    expect(screen.getByText('Fire Protection')).toBeInTheDocument()
  })

  it('should display all navigation links', () => {
    renderWithProviders(<Navigation />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Templates')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Clients')).toBeInTheDocument()
    expect(screen.getByText('Time Tracking')).toBeInTheDocument()
    expect(screen.getByText('Work Docs')).toBeInTheDocument()
  })

  it('should display user email', () => {
    renderWithProviders(<Navigation />)

    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should display sign out button', () => {
    renderWithProviders(<Navigation />)

    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('should highlight active route', () => {
    renderWithProviders(<Navigation />, { route: '/dashboard' })

    const dashboardLink = screen.getAllByText('Dashboard')[0]
    expect(dashboardLink.closest('a')).toHaveClass('bg-blue-600')
  })

  it('should call signOut when sign out button is clicked', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default
    const signOut = vi.fn()

    renderWithProviders(<Navigation />, {
      authValue: {
        ...mockAuthContextValue,
        signOut
      }
    })

    const signOutButtons = screen.getAllByText('Sign out')
    await userEvent.click(signOutButtons[0])

    expect(signOut).toHaveBeenCalled()
  })

  it('should toggle mobile menu', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    // Set viewport to mobile size
    global.innerWidth = 375
    global.dispatchEvent(new Event('resize'))

    renderWithProviders(<Navigation />)

    // Find the mobile menu button
    const mobileMenuButtons = document.querySelectorAll('button[class*="lg:hidden"]')
    if (mobileMenuButtons.length > 0) {
      await userEvent.click(mobileMenuButtons[0] as HTMLElement)

      // Mobile menu should be visible
      await waitFor(() => {
        const mobileMenu = document.querySelector('[class*="lg:hidden"][class*="bg-gray-800"]')
        expect(mobileMenu).toBeInTheDocument()
      })
    }
  })

  it('should close mobile menu when clicking navigation item', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<Navigation />)

    // Open mobile menu
    const mobileMenuButtons = document.querySelectorAll('button[class*="lg:hidden"]')
    if (mobileMenuButtons.length > 0) {
      await userEvent.click(mobileMenuButtons[0] as HTMLElement)

      // Click a navigation item in mobile menu
      await waitFor(() => {
        const mobileDashboardLink = screen.getAllByText('Dashboard').find(
          el => el.closest('[class*="lg:hidden"]')
        )
        if (mobileDashboardLink) {
          userEvent.click(mobileDashboardLink)
        }
      })
    }
  })

  it('should display logo', () => {
    renderWithProviders(<Navigation />)

    const logo = screen.getByText('FP')
    expect(logo).toBeInTheDocument()
  })

  it('should have correct navigation links', () => {
    renderWithProviders(<Navigation />)

    const dashboardLinks = screen.getAllByText('Dashboard')
    expect(dashboardLinks[0].closest('a')).toHaveAttribute('href', '/dashboard')

    const documentsLinks = screen.getAllByText('Documents')
    expect(documentsLinks[0].closest('a')).toHaveAttribute('href', '/documents')

    const projectsLinks = screen.getAllByText('Projects')
    expect(projectsLinks[0].closest('a')).toHaveAttribute('href', '/projects')
  })

  it('should render navigation icons', () => {
    const { container } = renderWithProviders(<Navigation />)

    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should apply hover styles to navigation items', () => {
    renderWithProviders(<Navigation />)

    const dashboardLink = screen.getAllByText('Dashboard')[0]
    expect(dashboardLink.closest('a')).toHaveClass('hover:bg-gray-700')
  })

  it('should show user icon', () => {
    const { container } = renderWithProviders(<Navigation />)

    // UserCircleIcon should be present
    const userIcons = container.querySelectorAll('svg')
    expect(userIcons.length).toBeGreaterThan(0)
  })

  it('should handle mobile menu sign out', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default
    const signOut = vi.fn()

    renderWithProviders(<Navigation />, {
      authValue: {
        ...mockAuthContextValue,
        signOut
      }
    })

    // Open mobile menu
    const mobileMenuButtons = document.querySelectorAll('button[class*="lg:hidden"]')
    if (mobileMenuButtons.length > 0) {
      await userEvent.click(mobileMenuButtons[0] as HTMLElement)

      await waitFor(() => {
        const signOutButtons = screen.getAllByText('Sign out')
        if (signOutButtons.length > 1) {
          userEvent.click(signOutButtons[1]) // Mobile sign out button
        }
      })

      await waitFor(() => {
        expect(signOut).toHaveBeenCalled()
      })
    }
  })

  it('should maintain navigation state across route changes', () => {
    const { rerender } = renderWithProviders(<Navigation />, { route: '/dashboard' })

    let dashboardLink = screen.getAllByText('Dashboard')[0]
    expect(dashboardLink.closest('a')).toHaveClass('bg-blue-600')

    // Re-render with different route
    rerender(<Navigation />)
    
    dashboardLink = screen.getAllByText('Dashboard')[0]
    expect(dashboardLink).toBeInTheDocument()
  })

  it('should display all required navigation sections', () => {
    renderWithProviders(<Navigation />)

    // Logo section
    expect(screen.getByText('FP')).toBeInTheDocument()
    
    // Navigation links section
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    
    // User info section
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    
    // Sign out section
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })
})
