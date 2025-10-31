import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'

// Mock user for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'admin' as const,
  full_name: 'Test User'
}

// Mock auth context value
export const mockAuthContextValue = {
  user: mockUser,
  loading: false,
  signIn: async (email: string, password: string) => ({ error: null }),
  signUp: async (email: string, password: string, fullName: string) => ({ error: null }),
  signOut: async () => {},
  updateProfile: async (data: any) => {}
}

// Custom render with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: typeof mockAuthContextValue
  route?: string
}

export function renderWithProviders(
  ui: ReactElement,
  {
    authValue = mockAuthContextValue,
    route = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', route)

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
