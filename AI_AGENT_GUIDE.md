# 🤖 AI Agent Collaboration Guide

## 📋 Purpose

This document ensures **ANY AI agent** can pick up work on this project and continue effectively. It provides context, conventions, and collaboration patterns for seamless handoffs between AI agents and humans.

---

## 🎯 Project Quick Facts

**Project Name**: Fire Protection Tracker  
**Type**: Web Application (SPA)  
**Primary User**: Fire protection project managers  
**Status**: ✅ MVP Complete → 🚧 Enhancement Phase  
**Repository**: https://github.com/GeorgeMcIntyre-Web/fire-protection  
**Deployed URL**: https://fire-protection-tracker.pages.dev  
**Main Branch**: `main`  
**Current Branch**: `cursor/review-code-and-identify-immediate-value-add-a068`

---

## 🏗️ Architecture Overview

### Tech Stack
```
Frontend:
- React 18.3+ (UI library)
- TypeScript 5.6+ (Type safety)
- Vite 5.4+ (Build tool, fast HMR)
- Tailwind CSS 3.4+ (Styling)
- React Router 6.29+ (Routing)

Backend:
- Supabase (PostgreSQL database)
- Supabase Auth (Authentication)
- Supabase Storage (File storage)

Deployment:
- Cloudflare Pages (Hosting)
- GitHub (Version control)
- Git-based deployments (push to deploy)
```

### Project Structure
```
/workspace/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── BudgetTracker.tsx
│   │   ├── DocumentLibrary.tsx
│   │   ├── ErrorBoundary.tsx    ← NEW
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   ├── PMDashboard.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/         # React Context providers
│   │   └── AuthContext.tsx
│   ├── lib/             # Business logic & utilities
│   │   ├── api-errors.ts        ← NEW
│   │   ├── documents.ts
│   │   ├── env.ts               ← NEW
│   │   ├── pm-workflow.ts
│   │   ├── project-planning.ts
│   │   ├── supabase.ts
│   │   └── workflow-automation.ts
│   ├── pages/           # Page components (routes)
│   │   ├── ClientsPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DocumentsPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── TasksPage.tsx
│   │   ├── TemplatesPage.tsx
│   │   ├── TimeTrackingPage.tsx
│   │   └── WorkDocsPage.tsx
│   ├── App.tsx          # Main app component with routes
│   ├── main.tsx         # Entry point
│   └── style.css        # Global styles
├── public/              # Static assets
├── scripts/             # Utility scripts
│   ├── migrate-documents.ts
│   └── upload-documents.js
├── *.sql               # Database migrations
├── *.md                # Documentation
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite config
└── tailwind.config.js  # Tailwind config
```

---

## 📚 Essential Documents (READ FIRST)

### For Context
1. **PROJECT_ROADMAP.md** ← Current priorities, phases, timeline
2. **CODE_REVIEW.md** ← Known issues, improvements needed
3. **TECHNICAL_OVERVIEW.md** ← Architecture deep dive
4. **README.md** ← Project overview

### For Setup
5. **START_HERE.md** ← Getting started guide
6. **QUICK_SETUP.md** ← Fast setup instructions

### For Development
7. **WORKFLOW_SOLUTIONS.md** ← Feature explanations
8. **This file** ← AI collaboration patterns

---

## 🎯 Current Project Status

### What's Complete ✅
- Core application structure
- Authentication system
- PM Dashboard with daily workflow
- Budget tracking (with demo data)
- Document management
- Client update automation
- Project planning templates
- Time tracking
- Work documentation
- Error handling (ErrorBoundary)
- Environment validation
- API error utilities
- Deployed to Cloudflare Pages

### What's In Progress 🚧
- Performance optimizations
- Testing setup (Vitest)
- CI/CD pipeline (GitHub Actions)

### What's Next ⏳
- Connect real budget data
- Add comprehensive tests
- Implement CI/CD
- Accessibility improvements
- Mobile optimization

### Known Issues ⚠️
1. BudgetTracker uses hard-coded demo data (needs DB integration)
2. No test coverage yet (0%)
3. No CI/CD pipeline
4. Missing some accessibility features

---

## 🔧 Development Workflow

### Before Starting Any Work

1. **Check the roadmap**: Read `PROJECT_ROADMAP.md` to understand current phase
2. **Check for todos**: Look at existing TODO items
3. **Read recent commits**: `git log --oneline -10` to see latest changes
4. **Check current branch**: `git branch` to see where you are
5. **Read this guide**: You're doing it! 👍

### While Working

1. **Update TODOs**: Use TodoWrite tool to track progress
2. **Follow conventions**: See "Code Conventions" section below
3. **Test as you go**: Run `npm run dev` frequently
4. **Check for errors**: Run `npm run build` before committing
5. **Document changes**: Add comments, update docs

### After Completing Work

1. **Mark todos complete**: Update TODO status
2. **Test thoroughly**: Build succeeds, no console errors
3. **Update docs**: If you changed APIs or added features
4. **Git commit**: Clear, descriptive commit message
5. **Leave breadcrumbs**: Add comments in code if needed

---

## 📝 Code Conventions

### TypeScript
```typescript
// ✅ DO: Use explicit types
interface Project {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed'
}

// ✅ DO: Use nullish coalescing
const tasks = project.tasks ?? []

// ❌ DON'T: Use 'any' type
const data: any = await fetch() // Bad!

// ✅ DO: Type function parameters and returns
async function getProject(id: string): Promise<Project> {
  // ...
}
```

### React Components
```typescript
// ✅ DO: Use functional components with TypeScript
interface Props {
  projectId: string
  onUpdate?: (project: Project) => void
}

export const ProjectCard: React.FC<Props> = ({ projectId, onUpdate }) => {
  // Component logic
}

// ✅ DO: Use proper hooks
const [data, setData] = useState<Project | null>(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchData()
}, [projectId]) // Proper dependencies

// ✅ DO: Handle loading and error states
if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
```

### Error Handling
```typescript
// ✅ DO: Use new error handling utilities
import { handleApiError, getErrorMessage } from '@/lib/api-errors'

try {
  const { data, error } = await supabase.from('projects').select()
  if (error) throw error
} catch (error) {
  const apiError = handleApiError(error, { context: 'fetchProjects' })
  console.error(apiError)
}
```

### File Naming
- **Components**: PascalCase (`ProjectCard.tsx`)
- **Utils/Libs**: kebab-case (`api-errors.ts`)
- **Pages**: PascalCase with "Page" suffix (`DashboardPage.tsx`)
- **Tests**: Same name + `.test.ts` (`api-errors.test.ts`)

### Import Order
```typescript
// 1. External imports
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// 2. Internal imports - components
import { Button } from '@/components/Button'

// 3. Internal imports - lib/utils
import { supabase } from '@/lib/supabase'
import { handleApiError } from '@/lib/api-errors'

// 4. Internal imports - contexts
import { useAuth } from '@/contexts/AuthContext'

// 5. Types
import type { Project } from '@/lib/types'

// 6. Styles (if any)
import './styles.css'
```

### Component Structure
```typescript
import React, { useState, useEffect } from 'react'

// Types first
interface Props {
  // ...
}

interface State {
  // ...
}

// Component
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Hooks
  const [state, setState] = useState<State>()
  
  // 2. Effects
  useEffect(() => {
    // ...
  }, [])
  
  // 3. Event handlers
  const handleClick = () => {
    // ...
  }
  
  // 4. Helper functions
  const calculateTotal = () => {
    // ...
  }
  
  // 5. Early returns
  if (loading) return <Loading />
  if (error) return <Error />
  
  // 6. Main render
  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

---

## 🔄 Common Patterns

### Fetching Data from Supabase
```typescript
const [data, setData] = useState<Project[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
      
      if (error) throw error
      setData(data || [])
    } catch (err) {
      const apiError = handleApiError(err)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }
  
  fetchData()
}, [])
```

### Protected Routes
```typescript
// Already implemented in ProtectedRoute.tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Using Auth Context
```typescript
import { useAuth } from '@/contexts/AuthContext'

const MyComponent = () => {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <Loading />
  if (!user) return <Login />
  
  return <div>Welcome, {user.email}</div>
}
```

---

## 🛠️ Utility Functions

### Environment Variables
```typescript
import { getEnvConfig, isDemoMode } from '@/lib/env'

// Check if in demo mode
if (isDemoMode()) {
  console.log('Running in demo mode')
}

// Get config
const config = getEnvConfig()
console.log(config.app.name)
```

### Error Handling
```typescript
import { 
  handleApiError, 
  getErrorMessage, 
  withRetry,
  toApiResult 
} from '@/lib/api-errors'

// Basic error handling
try {
  // API call
} catch (error) {
  const apiError = handleApiError(error, { context: 'My operation' })
  console.error(apiError)
}

// With retry
const data = await withRetry(
  () => supabase.from('projects').select(),
  { maxRetries: 3 }
)

// Result type (no throws)
const result = await toApiResult(
  supabase.from('projects').select()
)

if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error)
}
```

---

## 🧪 Testing (When Implemented)

### Running Tests
```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report
```

### Writing Tests
```typescript
// my-function.test.ts
import { describe, it, expect } from 'vitest'
import { myFunction } from './my-function'

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
})
```

---

## 🚀 Deployment

### Automatic Deployment
- **Push to main** → Automatic deploy to Cloudflare Pages
- **Preview deploys** → Created for branches
- **Build command**: `npm run build`
- **Output directory**: `dist`

### Manual Deployment
```bash
# Build locally
npm run build

# Test build
npm run preview

# Deploy is automatic via Cloudflare Pages
```

### Environment Variables
Must be set in Cloudflare Pages dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 📊 TODO Management

### Using TODOs
```typescript
// When starting work on multiple tasks
TodoWrite([
  { id: "1", content: "Task 1", status: "in_progress" },
  { id: "2", content: "Task 2", status: "pending" },
  { id: "3", content: "Task 3", status: "pending" }
], merge: false)

// When completing a task
TodoWrite([
  { id: "1", status: "completed" },
  { id: "2", status: "in_progress" }
], merge: true)

// When cancelling a task
TodoWrite([
  { id: "3", status: "cancelled" }
], merge: true)
```

### TODO Best Practices
1. **Create TODOs upfront** for multi-step tasks
2. **Update status immediately** when starting/completing
3. **Use merge: true** when updating existing todos
4. **Use merge: false** when creating new todos
5. **Only one task in_progress** at a time

---

## 🤝 AI Agent Handoff Protocol

### When Taking Over from Another Agent

1. **Read these files in order**:
   - This file (`AI_AGENT_GUIDE.md`)
   - `PROJECT_ROADMAP.md`
   - `CODE_REVIEW.md`
   - Recent git commits (`git log -10`)

2. **Check current state**:
   - TODO list (check for in_progress items)
   - Git status (`git status`)
   - Current branch
   - Any uncommitted changes

3. **Understand context**:
   - What was the previous agent working on?
   - What's the current sprint/phase?
   - Any blockers or issues?

4. **Verify environment**:
   - Can the app build? (`npm run build`)
   - Are there linter errors? (There shouldn't be!)
   - Does dev mode work? (`npm run dev`)

### When Handing Off to Another Agent

1. **Complete current work**:
   - Finish the current task or reach a stopping point
   - Commit changes with clear message
   - Mark TODOs as completed or cancelled

2. **Document state**:
   - Update any relevant docs
   - Add code comments if needed
   - Leave notes in commit message

3. **Clean up**:
   - No uncommitted changes (or document why)
   - No broken builds
   - No linter errors

4. **Update tracking**:
   - Update TODO status
   - Update PROJECT_ROADMAP.md if needed
   - Note any blockers or decisions needed

---

## 💡 Decision-Making Guidelines

### When to Proceed vs. Ask User

#### ✅ PROCEED (Don't Ask)
- Bug fixes that don't change behavior
- Code style improvements
- Adding tests
- Performance optimizations
- Documentation updates
- Implementing items from TODO list
- Implementing items from roadmap
- Following established patterns

#### ❓ ASK USER FIRST
- Changing user-facing behavior
- Major architectural changes
- Adding new dependencies
- Changing database schema
- Changing API contracts
- Feature scope changes
- Deviating from roadmap

### Priority Decision Matrix

| Urgency | Importance | Action |
|---------|-----------|--------|
| High | High | Do immediately |
| High | Low | Do after high-importance |
| Low | High | Schedule soon |
| Low | Low | Add to backlog |

---

## 🔍 Debugging & Troubleshooting

### Common Issues

#### "Module not found"
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### "Supabase errors"
```bash
# Check environment variables
cat .env

# Make sure they're valid (not placeholders)
# Should start with https:// and eyJ respectively
```

#### "Build fails"
```bash
# Check TypeScript errors
npm run build

# Check for any red text, fix those files
```

#### "Demo mode when it shouldn't be"
```bash
# Verify .env file has real values
cat .env

# Should NOT contain:
# - "your_supabase_project_url"
# - "your-project-id"
# - "your_supabase_anon_key"
```

### Debug Mode
```typescript
// Enable verbose logging
localStorage.setItem('debug', 'true')

// Check if in demo mode
import { isDemoMode } from '@/lib/env'
console.log('Demo mode:', isDemoMode())
```

---

## 📋 Checklist for Common Tasks

### Adding a New Component
- [ ] Create file in `src/components/`
- [ ] Use TypeScript with proper types
- [ ] Follow component structure pattern
- [ ] Add prop validation
- [ ] Handle loading/error states
- [ ] Make it responsive (mobile-friendly)
- [ ] Test in dev mode
- [ ] Export from component file

### Adding a New Page
- [ ] Create file in `src/pages/` with "Page" suffix
- [ ] Add route in `src/App.tsx`
- [ ] Wrap in ProtectedRoute if needed
- [ ] Add to navigation if needed
- [ ] Test routing works
- [ ] Check mobile responsiveness

### Adding a New API Utility
- [ ] Create file in `src/lib/`
- [ ] Use TypeScript types
- [ ] Use error handling utilities
- [ ] Handle demo mode if needed
- [ ] Add JSDoc comments
- [ ] Export from file
- [ ] Consider adding tests

### Adding a Database Table
- [ ] Update `supabase-complete-setup.sql`
- [ ] Add RLS policies
- [ ] Update TypeScript types in `supabase.ts`
- [ ] Test in Supabase dashboard
- [ ] Document in TECHNICAL_OVERVIEW.md

---

## 🎨 UI/UX Guidelines

### Colors
- **Primary**: Blue (`bg-blue-600`, `text-blue-600`)
- **Success**: Green (`bg-green-600`, `text-green-600`)
- **Warning**: Yellow/Orange (`bg-yellow-600`, `text-yellow-600`)
- **Error**: Red (`bg-red-600`, `text-red-600`)
- **Gray scales**: Use Tailwind gray scale

### Component Patterns
```typescript
// Loading state
<div className="flex items-center justify-center h-64">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
</div>

// Empty state
<div className="text-center py-8 text-gray-500">
  <Icon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
  <p>No items found</p>
</div>

// Error message
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <p className="text-red-800">{error.message}</p>
</div>
```

### Responsive Design
- Always test mobile viewport
- Use Tailwind responsive classes (`sm:`, `md:`, `lg:`)
- Stack items vertically on mobile
- Make buttons/inputs touch-friendly (min 44px height)

---

## 📞 Questions to Ask Yourself

Before implementing anything, ask:

1. **Is this in the roadmap?** Check `PROJECT_ROADMAP.md`
2. **Does this follow conventions?** Check this guide
3. **Will this break existing features?** Test thoroughly
4. **Is this the right priority?** Check current sprint
5. **Do I need to ask the user?** Check decision guidelines
6. **Have I updated documentation?** Update as you go
7. **Have I updated TODOs?** Keep tracking current
8. **Can another agent continue this?** Leave clear breadcrumbs

---

## 🎯 Success Criteria for AI Agents

A successful AI agent session should:

✅ Make measurable progress on roadmap items  
✅ Follow established patterns and conventions  
✅ Leave no broken code or builds  
✅ Update documentation and TODOs  
✅ Provide clear commit messages  
✅ Leave breadcrumbs for next agent  
✅ Test changes before committing  
✅ Consider edge cases and errors  

---

## 🚨 Red Flags (Stop and Ask)

Stop and ask the user if you encounter:

🚩 Major architectural decision needed  
🚩 Database schema changes required  
🚩 Breaking changes to existing APIs  
🚩 Security concerns  
🚩 Performance degradation  
🚩 Scope creep beyond roadmap  
🚩 Conflicting requirements  
🚩 Missing critical information  

---

## 📚 Quick Reference Links

### Documentation
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Internal Docs
- `PROJECT_ROADMAP.md` - What to work on
- `CODE_REVIEW.md` - What needs fixing
- `TECHNICAL_OVERVIEW.md` - How it works
- `START_HERE.md` - How to set up

---

## 🎉 Summary

**Key Takeaways**:
1. Read roadmap and code review first
2. Follow established patterns
3. Update TODOs as you work
4. Test thoroughly before committing
5. Document decisions and changes
6. Leave breadcrumbs for next agent
7. When in doubt, ask!

**You're ready to contribute! 🚀**

---

**Last Updated**: 2025-10-28  
**Maintained By**: All AI Agents + Human Developers  
**Questions?**: Check docs or ask the user
