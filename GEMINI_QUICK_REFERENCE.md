# Quick Reference for Gemini AI

**This project has ~222 actual source files. The high file count warning is from `node_modules/` which is excluded.**

## Project Structure (Key Files Only)

### Entry Points
- `src/main.tsx` - App initialization with providers
- `src/App.tsx` - Route definitions
- `src/components/Layout.tsx` - Main layout wrapper

### Fire Consultancy Module (NEW - Just Added)
- `src/pages/FireConsult/` - 4 page components
- `src/contexts/FireConsultContext.tsx` - State management
- `src/lib/fireconsult*.ts` - Business logic (3 files)
- `src/components/FireConsultDashboard.tsx` - Dashboard UI
- `src/components/AccreditationTracker.tsx` - Accreditation alerts

### Core Modules
- `src/pages/` - All page components (17 files)
- `src/components/` - Reusable components (19 files)
- `src/lib/` - Utility functions (22 files)
- `src/contexts/` - React contexts (2 files)

### Database
- `database/migrations/` - SQL migration files (9 files)

### Documentation
- `PROJECT_SUMMARY.md` - Full project overview
- `docs/modules/fireconsult/` - Fire Consultancy docs (9 files)
- `docs/` - Other documentation organized by category

## Total File Count
- **Source files:** ~222
- **Documentation:** ~100 markdown files
- **Config files:** ~10
- **Total relevant:** ~332 files (well under 1000 limit)

## Ignored (Not Counted)
- `node_modules/` - 16,719 files (excluded via .geminiignore)
- `dist/` - Build output (excluded)
- `.git/` - Version control (excluded)

## For Gemini: Start Here
1. Read `PROJECT_SUMMARY.md` for full context
2. Check `docs/modules/fireconsult/README.md` for Fire Consultancy details
3. Source code is in `src/` directory
4. All files in `node_modules/` are excluded

