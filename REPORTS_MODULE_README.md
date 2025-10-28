# Reports & Analytics Module

## Overview
The Reports & Analytics module provides comprehensive insights into project progress, budget tracking, and client communications for your fire protection PM application.

## Features

### 1. Project Progress Report
- **Visual Progress Tracking**: See completion percentages with color-coded progress bars
- **Task Management**: View completed vs. total tasks for each project
- **Status Indicators**: Quick status badges (pending, in progress, completed, cancelled)
- **On-Track Analysis**: Visual indicators showing if projects are on schedule
- **Client Information**: See which client each project belongs to
- **Due Date Tracking**: Monitor project deadlines

### 2. Budget Summary Report
- **Financial Overview**: Total estimated vs. actual costs across all projects
- **Variance Analysis**: Identify over-budget and at-risk projects
- **Color-Coded Alerts**: Red highlighting for over-budget projects
- **Percentage Tracking**: Monitor variance percentages
- **Budget Status**: Clear categorization (within budget, at risk, over budget)
- **Summary Cards**: Quick financial metrics at a glance

### 3. Client Communications Log
- **Communication History**: Complete record of all client updates
- **Timestamp Tracking**: Precise date and time of each communication
- **Message Preview**: Full message content displayed
- **Project Association**: See which project each communication relates to
- **Sender Information**: Track who sent each update

## CSV Export Functionality

Each report tab includes a "Export CSV" button that:
- Generates a CSV file with all visible data
- Automatically names files with current date
- Handles special characters and commas in data
- Opens download dialog in browser

**Export formats:**
- `project_progress_report_YYYY-MM-DD.csv`
- `budget_summary_report_YYYY-MM-DD.csv`
- `client_communications_report_YYYY-MM-DD.csv`

## Database Setup

### Required Table: client_communications

Run the SQL migration file to create the communications table:

```bash
# Apply the migration in Supabase SQL Editor
cat supabase-client-communications.sql
```

The table stores:
- Project ID and name
- Client name
- Message content
- Send date and sender
- Communication type (update, alert, milestone, completion)

### Row Level Security (RLS)
The table includes RLS policies to ensure:
- Users can only view their own communications
- Users can only modify their own communications
- Project creators can view communications for their projects

## Usage

### Accessing Reports
1. Navigate to the "Reports" menu item in the navigation bar
2. Select from three tabs: Project Progress, Budget Summary, or Client Communications
3. Click "Export CSV" to download data
4. Click "Refresh Data" to reload all reports

### Understanding Metrics

#### Project Progress
- **Progress %**: Calculated as (completed tasks / total tasks) × 100
- **On Track**: Compares actual progress to expected progress based on timeline
  - ✓ Green checkmark = on schedule
  - ⚠️ Red warning = behind schedule

#### Budget Status
- **Within Budget**: Variance ≤ 5%
- **At Risk**: Variance between 5-10%
- **Over Budget**: Variance > 10%

#### Budget Alerts
The system automatically generates alerts for:
- Projects exceeding budget by more than 10%
- Projects at risk (5-10% variance)
- Recommendations for cost management

## Integration with Existing Systems

The Reports module integrates with:

### From `src/lib/project-planning.ts`:
- `calculateProjectCosts()` - Provides budget calculations
- `getBudgetAlerts()` - Generates budget warnings

### From `src/lib/pm-workflow.ts`:
- `getProjectsNeedingClientUpdates()` - Identifies projects needing updates
- `generateClientUpdate()` - Creates client update messages

### From Supabase:
- `projects` table - Project information and status
- `tasks` table - Task completion data
- `clients` table - Client information
- `time_logs` table - Actual hours worked
- `client_communications` table - Communication history

## PDF Export (Optional Enhancement)

To add PDF export functionality:

1. Install jsPDF:
```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

2. The ReportsPage component is ready to integrate PDF export
3. Uncomment PDF export sections in the code
4. Customize PDF styling with company branding

## Customization

### Adding Custom Metrics
To add new columns to reports:

1. Modify the data interface in `ReportsPage.tsx`
2. Update the data loading function
3. Add table columns in the JSX
4. Update CSV export headers

### Changing Color Schemes
Budget status colors can be modified in the table row className:
```tsx
${budget.status === 'over_budget' ? 'bg-red-50' : ''}
```

### Custom Date Ranges
Add date filters to the report queries:
```tsx
.gte('created_at', startDate)
.lte('created_at', endDate)
```

## Performance Considerations

### Data Loading
- Reports load all data on mount
- Use "Refresh Data" button to reload
- Consider pagination for large datasets (100+ projects)

### Optimization Tips
1. Add indexes to frequently queried columns
2. Limit initial data load to recent projects
3. Implement lazy loading for communications
4. Cache calculated values in the database

## Troubleshooting

### "No data available" messages
- Ensure Supabase credentials are configured
- Check that tables have data
- Verify RLS policies allow data access

### CSV export not working
- Check browser permissions for downloads
- Ensure data is loaded before exporting
- Verify CSV generation function syntax

### Budget calculations showing $0.00
- Verify tasks have time logs
- Check that hourly rates are configured
- Ensure time_logs table is populated

## Future Enhancements

Potential additions to the Reports module:
- [ ] PDF export with company branding
- [ ] Custom date range filters
- [ ] Scheduled email reports
- [ ] Dashboard widgets with key metrics
- [ ] Chart visualizations (bar charts, pie charts)
- [ ] Export to Excel format
- [ ] Custom report builder
- [ ] Print-friendly layouts

## API Reference

### Key Functions

```typescript
// Load project progress data
loadProjectProgress(): Promise<void>

// Load budget summaries
loadBudgetSummaries(): Promise<void>

// Load client communications
loadClientCommunications(): Promise<void>

// Export reports to CSV
exportToCSV(data: any[], filename: string, headers: string[]): void

// Calculate expected progress
calculateExpectedProgress(startDate: Date, dueDate: Date, currentDate: Date): number
```

## Support

For issues or feature requests related to the Reports module:
1. Check this documentation
2. Review Supabase logs for database errors
3. Verify data is present in all required tables
4. Check browser console for JavaScript errors

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-28  
**Module Type**: Reporting & Analytics
