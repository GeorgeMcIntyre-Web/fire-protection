# 🔥 Fire Protection Project Manager

A comprehensive project management system for fire protection contractors.

## 🎯 Features

### **Daily Workflow Management**
- Track urgent and today's tasks
- Auto-prioritization
- Client update automation
- Documentation status tracking

### **Budget Tracking**
- Estimated vs actual costs per project
- Variance percentage calculations
- Budget alerts (green/yellow/red)
- Cost breakdown views

### **Document Management**
- 50+ company documents organized by category
- 9-category system (Appointments, Certificates, Checklists, etc.)
- Search and filter
- Version control
- Project document linking

### **Project Planning**
- Template-based project creation
- 4-phase structured workflows
- Task dependencies
- Auto-cost estimation

### **Client Communication**
- Automatic update reminders
- One-click message copy
- Professional message templates
- Progress tracking

## 🚀 Quick Start

### **1. Setup Backend** (20 min)

**Get Supabase credentials:**
1. Go to https://supabase.com/dashboard
2. Create/select project
3. Settings → API → Copy URL and anon key

**Update .env:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Add to Cloudflare:**
- Workers & Pages → Pages → fire-protection-tracker → Settings
- Environment Variables → Add the 2 values
- Retry deployment

**Run SQL migration:**
- Supabase SQL Editor → Paste COPY_PASTE_READY.md → Run

**Upload documents:**
```bash
npm run upload-docs
```

### **2. Start Using**

Visit: https://fire-protection-tracker.pages.dev

Or locally:
```bash
npm run dev
```

## 📚 Documentation

- **START_HERE.md** - Complete setup guide
- **TECHNICAL_OVERVIEW.md** - Architecture details
- **WORKFLOW_SOLUTIONS.md** - Feature explanations
- **QUINTEN_PERSONALIZED_FEATURES.md** - PM-specific features

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Deployment:** Cloudflare Pages
- **State:** React Context API

## 📊 Project Structure

```
src/
├── components/      # UI components
│   ├── PMDashboard.tsx      # PM workflow
│   ├── BudgetTracker.tsx    # Budget tracking
│   └── DocumentLibrary.tsx  # Document browser
├── lib/            # Business logic
│   ├── pm-workflow.ts       # Daily workflows
│   ├── project-planning.ts  # Project structures
│   └── documents.ts         # Document CRUD
├── pages/          # Route components
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx
│   └── WorkDocsPage.tsx
└── contexts/       # State management
    └── AuthContext.tsx
```

## ✅ Features Complete

- [x] Daily workflow dashboard
- [x] Budget tracking with alerts
- [x] Client update automation
- [x] Document management system
- [x] Project templates
- [x] Task management
- [x] Time tracking
- [x] Work documentation
- [x] Upload automation
- [x] Version control

## 🎯 Built For Quinten

**Addresses:**
- ✅ Need for structure → Phased project plans
- ✅ Need for planning → Daily workflow dashboard
- ✅ Need for budgeting → Budget tracker with alerts

**Leverages strengths:**
- ✅ People skills → One-click client updates
- ✅ Experience → Template-based workflows
- ✅ Problem solving → Issue tracking built-in

## 📖 Usage

### **Daily Morning:**
1. Open dashboard
2. See urgent tasks (red badges)
3. Check client updates needed
4. Review budget status
5. Plan day

### **During Work:**
1. Complete tasks
2. Log time
3. Upload photos/notes
4. Update documentation

### **End of Day:**
1. Send client updates (one-click!)
2. Check budget variances
3. Mark tasks complete
4. Plan tomorrow

## 🔗 Links

- **App:** https://fire-protection-tracker.pages.dev
- **GitHub:** https://github.com/GeorgeMcIntyre-Web/fire-protection
- **Documentation:** See files in project root

## 📞 Support

- Read START_HERE.md for setup
- Read WORKFLOW_SOLUTIONS.md for usage
- Read TECHNICAL_OVERVIEW.md for architecture

---

**Built with ❤️ for fire protection professionals**
