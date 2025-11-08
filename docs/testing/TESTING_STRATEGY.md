# 🧪 Testing Strategy - Fire Protection Tracker

**Version:** 1.0  
**Last Updated:** October 31, 2024

---

## 📋 Overview

This document outlines the comprehensive testing strategy to ensure production readiness. Our goal is to achieve **80%+ code coverage** and **zero critical bugs** before launch.

---

## 🎯 Testing Objectives

1. **Reliability:** Application works consistently without crashes
2. **Security:** No security vulnerabilities
3. **Performance:** Meets performance benchmarks
4. **Usability:** User experience is smooth and intuitive
5. **Data Integrity:** Data is accurate and properly stored

---

## 📊 Testing Pyramid

```
                    /\
                   /  \  Manual Testing (10%)
                  /____\
                 /      \  E2E Tests (20%)
                /________\
               /          \  Integration Tests (30%)
              /____________\
             /              \  Unit Tests (40%)
            /__________________\
```

---

## 🔬 1. Unit Testing

**Target Coverage:** 80%+  
**Priority:** 🔴 CRITICAL

### What to Test

#### Business Logic (`src/lib/`)

**File: `pm-workflow.ts`**
```typescript
✅ Test Cases:
- getDailyWorkItems() returns correct urgent tasks
- getDailyWorkItems() returns correct today tasks
- getProjectsNeedingClientUpdates() identifies projects >3 days
- generateClientUpdate() generates correct message format
- calculateProjectProgress() calculates correctly
- documentationStatus() returns accurate status
```

**File: `project-planning.ts`**
```typescript
✅ Test Cases:
- calculateLaborCost() with various hours and rates
- calculateMaterialCost() with markup
- calculateTotalProjectCost() includes all components
- createProjectFromTemplate() creates correct structure
- validateProjectPhases() catches invalid phases
- calculateBudgetVariance() accurate percentage
```

**File: `documents.ts`**
```typescript
✅ Test Cases:
- parseDocumentCode() extracts correct parts
- getDocumentVersion() parses version correctly
- validateFileType() accepts valid files only
- validateFileSize() enforces size limits
- categorizeDocument() assigns correct category
```

**File: `workflow-automation.ts`**
```typescript
✅ Test Cases:
- Auto-task generation from templates
- Dependency resolution
- Priority assignment logic
- Due date calculations
```

### How to Write Unit Tests

**Example: Testing Budget Calculation**

```typescript
// src/lib/__tests__/project-planning.test.ts

import { describe, it, expect } from 'vitest';
import { calculateBudgetVariance, calculateLaborCost } from '../project-planning';

describe('Project Planning', () => {
  describe('calculateLaborCost', () => {
    it('should calculate labor cost correctly', () => {
      const hours = 10;
      const rate = 500;
      const result = calculateLaborCost(hours, rate);
      expect(result).toBe(5000);
    });
    
    it('should handle zero hours', () => {
      const result = calculateLaborCost(0, 500);
      expect(result).toBe(0);
    });
    
    it('should handle decimal hours', () => {
      const result = calculateLaborCost(7.5, 500);
      expect(result).toBe(3750);
    });
  });
  
  describe('calculateBudgetVariance', () => {
    it('should calculate positive variance', () => {
      const estimated = 10000;
      const actual = 12000;
      const result = calculateBudgetVariance(estimated, actual);
      expect(result).toEqual({
        variance: 2000,
        percentage: 20,
        status: 'over_budget'
      });
    });
    
    it('should calculate negative variance', () => {
      const estimated = 10000;
      const actual = 9000;
      const result = calculateBudgetVariance(estimated, actual);
      expect(result).toEqual({
        variance: -1000,
        percentage: -10,
        status: 'under_budget'
      });
    });
    
    it('should detect at-risk status', () => {
      const estimated = 10000;
      const actual = 10600;
      const result = calculateBudgetVariance(estimated, actual);
      expect(result.status).toBe('at_risk');
    });
  });
});
```

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run coverage

# Run specific test file
npm test -- pm-workflow.test.ts
```

---

## 🔗 2. Integration Testing

**Target Coverage:** Key workflows  
**Priority:** 🟡 HIGH

### What to Test

#### Supabase Integration

**Database Operations:**
```typescript
✅ Test Cases:
- Creating a new project
- Updating project status
- Deleting a project (soft delete)
- Querying projects with filters
- Creating and linking tasks
- Time log CRUD operations
- Document CRUD operations
```

**Authentication:**
```typescript
✅ Test Cases:
- User registration
- User login with correct credentials
- User login with incorrect credentials
- Password reset flow
- Email verification
- Session persistence
- Session expiration
```

**Storage:**
```typescript
✅ Test Cases:
- Upload document to storage
- Download document from storage
- Delete document from storage
- List documents in bucket
- Access control on private buckets
```

### Example Integration Test

```typescript
// src/lib/__tests__/documents.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { uploadDocumentToStorage, createDocumentRecord } from '../documents';

describe('Document Integration Tests', () => {
  let supabase: any;
  let testDocumentId: string;
  
  beforeEach(() => {
    // Setup: Create Supabase client
    supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
  });
  
  afterEach(async () => {
    // Cleanup: Delete test documents
    if (testDocumentId) {
      await supabase
        .from('document_library')
        .delete()
        .eq('id', testDocumentId);
    }
  });
  
  it('should create document record in database', async () => {
    const documentData = {
      name: 'Test Document',
      document_code: 'TEST-001',
      category_id: 1,
      file_url: 'test.pdf',
    };
    
    const result = await createDocumentRecord(documentData);
    
    expect(result).toBeDefined();
    expect(result.name).toBe('Test Document');
    
    testDocumentId = result.id;
  });
  
  it('should upload file to storage', async () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    const result = await uploadDocumentToStorage(file, 'test.pdf');
    
    expect(result).toBeDefined();
    expect(result.error).toBeNull();
  });
});
```

---

## 🎭 3. Component Testing

**Target:** Critical UI components  
**Priority:** 🟡 HIGH

### What to Test

#### Key Components

**PMDashboard.tsx:**
```typescript
✅ Test Cases:
- Renders urgent tasks correctly
- Shows empty state when no tasks
- Displays client update notifications
- Clicking task navigates to project
- Refresh button updates data
```

**BudgetTracker.tsx:**
```typescript
✅ Test Cases:
- Displays budget summary correctly
- Shows correct status colors (green/yellow/red)
- Calculates variance percentage
- Handles loading state
- Handles error state
```

**DocumentLibrary.tsx:**
```typescript
✅ Test Cases:
- Renders document list
- Search filters documents
- Category filter works
- Download button triggers download
- Empty state when no documents
```

### Example Component Test

```typescript
// src/components/__tests__/BudgetTracker.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BudgetTracker } from '../BudgetTracker';

describe('BudgetTracker', () => {
  it('renders budget summary', async () => {
    render(<BudgetTracker />);
    
    await waitFor(() => {
      expect(screen.getByText(/total budget/i)).toBeInTheDocument();
    });
  });
  
  it('shows over budget warning in red', async () => {
    // Mock data with over budget status
    const mockData = {
      estimated: 10000,
      actual: 12000,
      variance: 2000,
      status: 'over_budget'
    };
    
    render(<BudgetTracker data={mockData} />);
    
    const statusElement = screen.getByTestId('budget-status');
    expect(statusElement).toHaveClass('text-red-500');
  });
  
  it('handles loading state', () => {
    render(<BudgetTracker loading={true} />);
    
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });
});
```

---

## 🌐 4. End-to-End (E2E) Testing

**Priority:** 🟢 MEDIUM  
**Tool:** Manual testing initially, Playwright/Cypress later

### Critical User Journeys

#### Journey 1: New User Registration & First Project

```
1. Navigate to registration page
2. Fill in registration form
3. Submit and verify email
4. Log in with credentials
5. See welcome screen
6. Navigate to Projects
7. Click "New Project"
8. Select template (Fire Alarm Installation)
9. Fill in project details
10. Submit project
11. Verify project appears in dashboard
12. Verify tasks were created
13. Verify budget was calculated
```

**Expected Results:**
- ✅ User account created
- ✅ Email verification sent
- ✅ Login successful
- ✅ Project created with correct template
- ✅ All tasks generated
- ✅ Budget calculated correctly

#### Journey 2: Complete Daily Workflow

```
1. Log in as existing user
2. View dashboard
3. See urgent tasks highlighted
4. Click on urgent task
5. Mark task as complete
6. Log time for task
7. Upload work documentation (photo)
8. Check if client update is needed
9. Generate and copy client update message
10. Verify budget updated with actual time
```

**Expected Results:**
- ✅ Urgent tasks visible
- ✅ Task marked complete
- ✅ Time logged correctly
- ✅ Photo uploaded successfully
- ✅ Client update message generated
- ✅ Budget updated automatically

#### Journey 3: Document Management

```
1. Navigate to Documents page
2. Browse document library
3. Use search to find specific document
4. Filter by category
5. Download document
6. Upload new document
7. Link document to project
8. Verify document appears in project
```

**Expected Results:**
- ✅ All documents visible
- ✅ Search works correctly
- ✅ Filter works correctly
- ✅ Download successful
- ✅ Upload successful
- ✅ Document linked to project

---

## 📱 5. Mobile Testing

**Priority:** 🟡 HIGH

### Devices to Test

- **iOS:** iPhone 12/13 (Safari)
- **Android:** Samsung Galaxy S21 (Chrome)
- **Tablet:** iPad (Safari)

### Test Cases

```typescript
✅ Mobile-Specific Tests:
- Touch targets are at least 44x44px
- Forms are easy to fill on mobile keyboard
- Navigation menu works on mobile
- Document upload from camera works
- Images are optimized for mobile
- Text is readable without zooming
- No horizontal scrolling
- Responsive breakpoints work correctly
```

### Testing Tools

- Chrome DevTools Device Mode
- Real devices (if available)
- BrowserStack (optional)

---

## ⚡ 6. Performance Testing

**Priority:** 🟡 HIGH

### Performance Benchmarks

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint (FCP) | < 1.8s | < 3s |
| Largest Contentful Paint (LCP) | < 2.5s | < 4s |
| Time to Interactive (TTI) | < 3.8s | < 7.3s |
| Total Blocking Time (TBT) | < 200ms | < 600ms |
| Cumulative Layout Shift (CLS) | < 0.1 | < 0.25 |

### Load Testing

**Test Scenarios:**

1. **Concurrent Users:**
   - 10 concurrent users
   - 50 concurrent users (stress test)
   - 100 concurrent users (extreme)

2. **Data Volume:**
   - 100 projects
   - 1,000 tasks
   - 100 documents
   - 1,000 time logs

3. **Operations:**
   - Dashboard load time
   - Project creation time
   - Document search time
   - Report generation time

### Tools

- Lighthouse (Chrome DevTools)
- WebPageTest
- Google PageSpeed Insights

### Running Performance Tests

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Open Chrome DevTools > Lighthouse
# Run audit on: http://localhost:4173
```

---

## 🔒 7. Security Testing

**Priority:** 🔴 CRITICAL

### Security Test Cases

#### Authentication Tests

```typescript
✅ Test Cases:
- Brute force protection (rate limiting)
- SQL injection attempts
- XSS attempts
- CSRF protection
- Session hijacking prevention
- Password strength enforcement
- Unauthorized access attempts
```

#### Authorization Tests

```typescript
✅ Test Cases:
- User can only see their own data
- User cannot access admin functions
- User cannot modify others' data
- RLS policies prevent data leaks
- API endpoints check permissions
```

#### Data Security Tests

```typescript
✅ Test Cases:
- Sensitive data is encrypted
- Passwords are hashed
- API keys are not exposed
- File uploads are validated
- HTTPS is enforced
- CORS is properly configured
```

### Running Security Tests

```bash
# Run security audit script
npm run security-audit

# Run npm audit for vulnerable dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

---

## 🎨 8. Usability Testing

**Priority:** 🟢 MEDIUM

### Usability Test Plan

**Participants:** 3-5 fire protection professionals

**Tasks:**
1. Register for an account
2. Create a new project
3. Add a task to project
4. Log time worked
5. Find and download a document
6. Generate client update
7. Check budget status

**Metrics to Measure:**
- Task completion rate
- Time to complete tasks
- Number of errors
- User satisfaction (1-10 scale)

**Questions to Ask:**
- Was the interface intuitive?
- Did you encounter any confusion?
- What features did you like most?
- What could be improved?
- Would you use this daily?

---

## ♿ 9. Accessibility Testing

**Priority:** 🟢 MEDIUM  
**Standard:** WCAG 2.1 Level AA

### Accessibility Checklist

```typescript
✅ Keyboard Navigation:
- All interactive elements accessible via keyboard
- Logical tab order
- Visible focus indicators
- No keyboard traps

✅ Screen Reader Support:
- Semantic HTML used
- ARIA labels where needed
- Alternative text for images
- Form labels properly associated

✅ Visual Design:
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- No information conveyed by color alone
- Text can be resized to 200%

✅ Forms:
- Clear labels for all inputs
- Error messages are descriptive
- Required fields indicated
- Validation messages are announced
```

### Testing Tools

- Lighthouse accessibility audit
- axe DevTools browser extension
- WAVE browser extension
- Screen reader (NVDA/VoiceOver)

---

## 📋 10. Test Data Management

### Test Data Requirements

**Users:**
```typescript
- Admin user (full access)
- PM user (project management)
- Field worker (limited access)
- Read-only user (view only)
```

**Projects:**
```typescript
- Active projects (various stages)
- Completed projects
- Overdue projects
- Projects with budget issues
```

**Documents:**
```typescript
- All 9 categories represented
- Various file types (PDF, Excel, Word)
- Various file sizes
- Some linked to projects
```

### Test Data Script

```typescript
// scripts/seed-test-data.ts

export async function seedTestData() {
  // Create test users
  // Create test clients
  // Create test projects
  // Create test tasks
  // Create test time logs
  // Upload test documents
}
```

---

## 🚀 Test Execution Plan

### Phase 1: Unit Testing (Week 3, Days 1-4)

**Day 1-2:**
- Write unit tests for `pm-workflow.ts`
- Write unit tests for `project-planning.ts`

**Day 3-4:**
- Write unit tests for `documents.ts`
- Write unit tests for `workflow-automation.ts`
- Achieve 80% coverage

### Phase 2: Integration Testing (Week 3, Days 5-7)

**Day 5:**
- Test Supabase CRUD operations
- Test authentication flows

**Day 6:**
- Test storage operations
- Test RLS policies

**Day 7:**
- Test complex workflows
- Fix integration issues

### Phase 3: Manual Testing (Week 3, ongoing)

**Throughout Week 3:**
- Test all user journeys
- Mobile testing
- Cross-browser testing
- Performance testing
- Security testing

---

## 📊 Test Reporting

### Daily Test Report

```markdown
## Test Report - [Date]

### Tests Run: X
### Tests Passed: Y
### Tests Failed: Z
### Code Coverage: XX%

### Issues Found:
1. [P0] Critical issue description
2. [P1] High priority issue
3. [P2] Medium priority issue

### Next Steps:
- Fix critical issues
- Retest failed scenarios
- Continue with next test suite
```

### Pre-Launch Test Summary

```markdown
## Pre-Launch Test Summary

### Coverage:
- Unit Tests: XX%
- Integration Tests: YY% of workflows
- E2E Tests: ZZ critical journeys

### Performance:
- Page Load: X.Xs (Target: 2s)
- API Response: XXXms (Target: 500ms)
- Lighthouse Score: XX/100

### Security:
- ✅ All security tests passed
- ✅ No critical vulnerabilities
- ✅ RLS policies verified

### Accessibility:
- WCAG 2.1 Level AA: XX% compliant

### Recommendation:
- ✅ Ready for production
- ⏸️ Not ready (issues to fix)
```

---

## 🛠️ Testing Tools & Setup

### Required Tools

```json
{
  "dependencies": {
    "vitest": "^1.6.0",
    "@testing-library/react": "^14.2.1",
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/user-event": "^14.5.2"
  }
}
```

### Configuration Files

**vitest.config.ts** - Already configured ✅
**vitest.setup.ts** - Already configured ✅

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run coverage
        run: npm run coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## ✅ Definition of Done

A feature is considered "done" when:

- ✅ Code is written and reviewed
- ✅ Unit tests written and passing
- ✅ Integration tests passing (if applicable)
- ✅ Manual testing completed
- ✅ No critical or high-priority bugs
- ✅ Code coverage meets target (80%)
- ✅ Performance benchmarks met
- ✅ Security review completed
- ✅ Accessibility requirements met
- ✅ Documentation updated
- ✅ Deployed to staging and tested
- ✅ Product owner approval received

---

## 📞 Support

**Questions about testing?**
- Review this document
- Check existing tests in `src/**/__tests__/`
- Consult Vitest documentation: https://vitest.dev
- Consult React Testing Library: https://testing-library.com/react

---

**Last Updated:** October 31, 2024  
**Next Review:** Weekly during testing phase

