import { vi } from 'vitest'

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const mockSelect = vi.fn().mockReturnThis()
  const mockInsert = vi.fn().mockReturnThis()
  const mockUpdate = vi.fn().mockReturnThis()
  const mockDelete = vi.fn().mockReturnThis()
  const mockEq = vi.fn().mockReturnThis()
  const mockIn = vi.fn().mockReturnThis()
  const mockOrder = vi.fn().mockReturnThis()
  const mockSingle = vi.fn()
  const mockRange = vi.fn().mockReturnThis()
  const mockLimit = vi.fn().mockReturnThis()
  const mockOr = vi.fn().mockReturnThis()
  const mockFilter = vi.fn().mockReturnThis()

  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    in: mockIn,
    order: mockOrder,
    single: mockSingle,
    range: mockRange,
    limit: mockLimit,
    or: mockOr,
    filter: mockFilter
  }))

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
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn(() => ({ 
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  }

  return {
    from: mockFrom,
    storage: mockStorage,
    auth: mockAuth,
    // Helper to access mocks
    _mocks: {
      from: mockFrom,
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      in: mockIn,
      order: mockOrder,
      single: mockSingle,
      storage: mockStorage,
      auth: mockAuth
    }
  }
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>
