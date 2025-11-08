# Testing Guide

Complete guide for writing and running tests in the Fire Protection Tracker application.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Test Structure](#test-structure)
3. [Writing Unit Tests](#writing-unit-tests)
4. [Writing Component Tests](#writing-component-tests)
5. [Writing Integration Tests](#writing-integration-tests)
6. [Running Tests](#running-tests)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

All testing dependencies are already installed. To verify:

```bash
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Generate coverage report
npm run coverage
```

---

## Test Structure

### Directory Structure

```
src/
├── __tests__/
│   ├── setup.ts                 # Global test setup
│   ├── utils/
│   │   ├── testUtils.tsx        # Test helpers
│   │   ├── mockSupabase.ts      # Supabase mocks
│   │   └── mockData.ts          # Mock data generators
│   ├── integration/
│   │   └── database.test.ts     # Integration tests
│   └── performance/
│       └── performance.test.ts   # Performance tests
├── lib/
│   └── __tests__/
│       ├── pm-workflow.test.ts
│       ├── project-planning.test.ts
│       ├── documents.test.ts
│       └── workflow-automation.test.ts
└── components/
    └── __tests__/
        ├── PMDashboard.test.tsx
        ├── BudgetTracker.test.tsx
        ├── DocumentLibrary.test.tsx
        ├── DocumentUpload.test.tsx
        └── Navigation.test.tsx
```

### Test File Naming

- **Unit tests**: `filename.test.ts` or `filename.test.tsx`
- **Component tests**: `ComponentName.test.tsx`
- **Integration tests**: `feature.test.ts`

---

## Writing Unit Tests

### Basic Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { functionToTest } from '../module'

describe('Module Name', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  describe('functionToTest', () => {
    it('should handle valid input', () => {
      const result = functionToTest('valid input')
      
      expect(result).toBeDefined()
      expect(result).toBe('expected output')
    })

    it('should handle edge cases', () => {
      const result = functionToTest('')
      
      expect(result).toBeNull()
    })

    it('should throw error on invalid input', () => {
      expect(() => functionToTest(null)).toThrow('Invalid input')
    })
  })
})
```

### Mocking Supabase

```typescript
import { vi } from 'vitest'
import { createMockSupabaseClient } from '../__tests__/utils/mockSupabase'

vi.mock('../lib/supabase', () => ({
  supabase: createMockSupabaseClient()
}))

// In your test
it('should fetch data from database', async () => {
  const { supabase } = await import('../lib/supabase')
  const mockFrom = supabase.from as any
  
  mockFrom.mockImplementation(() => ({
    select: vi.fn().mockResolvedValue({ 
      data: [{ id: '1', name: 'Test' }], 
      error: null 
    })
  }))

  const result = await fetchData()
  
  expect(result).toHaveLength(1)
  expect(mockFrom).toHaveBeenCalledWith('table_name')
})
```

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const promise = asyncFunction()
  
  await expect(promise).resolves.toBe('success')
})

it('should handle async errors', async () => {
  const promise = asyncFunctionThatFails()
  
  await expect(promise).rejects.toThrow('Error message')
})
```

---

## Writing Component Tests

### Basic Component Test

```typescript
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../__tests__/utils/testUtils'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />)
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const { user } = await import('../../__tests__/utils/testUtils')
    const userEvent = user.default

    renderWithProviders(<MyComponent />)
    
    const button = screen.getByRole('button', { name: 'Click Me' })
    await userEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Clicked!')).toBeInTheDocument()
    })
  })
})
```

### Testing with Props

```typescript
it('should render with custom props', () => {
  const mockCallback = vi.fn()
  
  renderWithProviders(
    <MyComponent 
      title="Custom Title"
      onSubmit={mockCallback}
    />
  )
  
  expect(screen.getByText('Custom Title')).toBeInTheDocument()
})
```

### Testing Forms

```typescript
it('should validate form input', async () => {
  const { user } = await import('../../__tests__/utils/testUtils')
  const userEvent = user.default
  const onSubmit = vi.fn()

  renderWithProviders(<MyForm onSubmit={onSubmit} />)
  
  const input = screen.getByLabelText('Name')
  await userEvent.type(input, 'John Doe')
  
  const submitButton = screen.getByRole('button', { name: 'Submit' })
  await userEvent.click(submitButton)
  
  expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' })
})
```

### Testing Conditional Rendering

```typescript
it('should show loading state', () => {
  renderWithProviders(<MyComponent loading={true} />)
  
  expect(screen.getByRole('status')).toBeInTheDocument()
})

it('should show content when loaded', async () => {
  renderWithProviders(<MyComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Content Loaded')).toBeInTheDocument()
  })
})
```

---

## Writing Integration Tests

### Database Integration

```typescript
import { supabase } from '../../lib/supabase'

describe('Database Integration', () => {
  it('should create and retrieve record', async () => {
    // Create
    const { data: created, error: createError } = await supabase
      .from('projects')
      .insert({ name: 'Test Project' })
      .select()
      .single()
    
    expect(createError).toBeNull()
    expect(created).toBeDefined()
    
    // Retrieve
    const { data: retrieved, error: retrieveError } = await supabase
      .from('projects')
      .select()
      .eq('id', created.id)
      .single()
    
    expect(retrieveError).toBeNull()
    expect(retrieved.name).toBe('Test Project')
    
    // Cleanup
    await supabase.from('projects').delete().eq('id', created.id)
  })
})
```

### Workflow Integration

```typescript
it('should complete full workflow', async () => {
  // Step 1: Create project
  const project = await createProject({ name: 'Test' })
  
  // Step 2: Add tasks
  const task = await createTask({ 
    project_id: project.id, 
    name: 'Task 1' 
  })
  
  // Step 3: Log time
  const timeLog = await createTimeLog({ 
    task_id: task.id, 
    hours: 2 
  })
  
  // Step 4: Verify project updated
  const updatedProject = await getProject(project.id)
  
  expect(updatedProject.total_hours).toBe(2)
})
```

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- pm-workflow.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --grep "should handle"
```

### Run with Coverage

```bash
npm run coverage
```

### Watch Mode

```bash
npm test -- --watch
```

### UI Mode

```bash
npm run test:ui
```

---

## Best Practices

### 1. Test Naming

✅ **Good**:
```typescript
it('should calculate total cost correctly', () => {})
it('should show error message when email is invalid', () => {})
it('should disable submit button while loading', () => {})
```

❌ **Bad**:
```typescript
it('test1', () => {})
it('works', () => {})
it('should test the function', () => {})
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should add two numbers', () => {
  // Arrange
  const a = 5
  const b = 3
  
  // Act
  const result = add(a, b)
  
  // Assert
  expect(result).toBe(8)
})
```

### 3. Test One Thing

✅ **Good**:
```typescript
it('should validate email format', () => {
  expect(validateEmail('test@test.com')).toBe(true)
})

it('should reject invalid email', () => {
  expect(validateEmail('invalid')).toBe(false)
})
```

❌ **Bad**:
```typescript
it('should validate email and password and username', () => {
  // Too much in one test
})
```

### 4. Use Descriptive Assertions

✅ **Good**:
```typescript
expect(user.email).toBe('test@test.com')
expect(projects).toHaveLength(5)
expect(mockCallback).toHaveBeenCalledWith('expected-arg')
```

❌ **Bad**:
```typescript
expect(result).toBeTruthy()
expect(data).toBeDefined()
```

### 5. Clean Up After Tests

```typescript
afterEach(() => {
  vi.clearAllMocks()
  cleanup() // For React components
})

afterAll(async () => {
  // Clean up database records
  await cleanupTestData()
})
```

### 6. Mock External Dependencies

```typescript
// Mock API calls
vi.mock('./api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: [] })
}))

// Mock browser APIs
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn()
  }
})
```

### 7. Test Edge Cases

```typescript
describe('calculateDiscount', () => {
  it('should handle zero price', () => {
    expect(calculateDiscount(0, 10)).toBe(0)
  })

  it('should handle 100% discount', () => {
    expect(calculateDiscount(100, 100)).toBe(0)
  })

  it('should handle negative values', () => {
    expect(() => calculateDiscount(-100, 10)).toThrow()
  })
})
```

---

## Troubleshooting

### Tests Fail Intermittently

**Problem**: Tests pass sometimes, fail other times.

**Solution**: 
- Use `waitFor` for async operations
- Avoid testing implementation details
- Clear mocks between tests

```typescript
beforeEach(() => {
  vi.clearAllMocks()
})
```

### Import Errors

**Problem**: `Cannot find module` errors.

**Solution**: Check `vitest.config.ts` alias configuration:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Mock Not Working

**Problem**: Mock not being used in test.

**Solution**: Ensure mock is defined before import:

```typescript
vi.mock('./module', () => ({
  functionName: vi.fn()
}))

// Then import
const { functionName } = await import('./module')
```

### Timeout Errors

**Problem**: Test times out waiting for async operation.

**Solution**: Increase timeout or check for infinite loops:

```typescript
it('should complete', async () => {
  await waitFor(() => {
    expect(screen.getByText('Done')).toBeInTheDocument()
  }, { timeout: 5000 }) // Increase timeout
})
```

### DOM Not Updating

**Problem**: Component state changes but test doesn't see it.

**Solution**: Use `waitFor` or `findBy` queries:

```typescript
// Instead of getBy
const element = await screen.findByText('New Text')

// Or use waitFor
await waitFor(() => {
  expect(screen.getByText('New Text')).toBeInTheDocument()
})
```

---

## Coverage Reports

### Viewing Coverage

After running `npm run coverage`:

1. Open `coverage/index.html` in browser
2. Navigate through files to see line coverage
3. Red lines = not covered
4. Green lines = covered

### Coverage Goals

- **Lines**: 80%+
- **Functions**: 80%+
- **Branches**: 80%+
- **Statements**: 80%+

### Improving Coverage

1. Identify uncovered lines in report
2. Write tests for those code paths
3. Test edge cases and error conditions
4. Test all conditional branches

---

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Pre-commit hooks (optional)

See `.github/workflows/test.yml` for configuration.

---

## Additional Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Useful Matchers

```typescript
// Basic
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()

// Numbers
expect(value).toBeGreaterThan(3)
expect(value).toBeLessThan(5)
expect(value).toBeCloseTo(0.3, 5)

// Strings
expect(string).toMatch(/pattern/)
expect(string).toContain('substring')

// Arrays
expect(array).toHaveLength(3)
expect(array).toContain(item)
expect(array).toEqual(expect.arrayContaining([1, 2]))

// Objects
expect(object).toHaveProperty('key')
expect(object).toMatchObject({ key: 'value' })

// Functions
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledWith(arg1, arg2)
expect(fn).toHaveBeenCalledTimes(1)

// Async
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()

// DOM
expect(element).toBeInTheDocument()
expect(element).toHaveTextContent('text')
expect(element).toHaveClass('className')
expect(element).toBeDisabled()
```

---

**Document Version**: 1.0  
**Last Updated**: 2024-10-31  
**Maintained By**: Development Team
