# End-to-End Test Scenarios

This document outlines comprehensive E2E test scenarios for manual testing of the Fire Protection Tracker application.

## Test Environment Setup

### Prerequisites
- Clean database state
- Test user account: `test@fireprotection.com` / `TestPassword123!`
- Test client: "Test Client Corp"
- Sample documents uploaded
- Browser: Latest Chrome/Firefox/Safari

### Test Data
```
Test User Email: test@fireprotection.com
Test Password: TestPassword123!
Test Client: Test Client Corp
Test Project: Sprinkler Installation - Test Warehouse
```

---

## Scenario 1: User Registration and Login

### Test Steps
1. Navigate to application URL
2. Click "Register" link
3. Fill in registration form:
   - Email: `newuser@test.com`
   - Password: `SecurePass123!`
   - Full Name: `John Smith`
   - Role: Manager
4. Submit registration form
5. Verify email confirmation message
6. Navigate to login page
7. Enter credentials
8. Click "Sign In"

### Expected Results
✅ Registration successful
✅ Redirect to email confirmation page
✅ Login successful
✅ Redirect to dashboard
✅ User email displayed in navigation
✅ Navigation menu visible

### Pass Criteria
- [ ] User can register with valid credentials
- [ ] Validation errors show for invalid input
- [ ] User can login after registration
- [ ] Dashboard loads successfully
- [ ] User session persists on page refresh

---

## Scenario 2: Complete Project Creation Flow

### Test Steps
1. Login as test user
2. Navigate to Projects page
3. Click "Create New Project"
4. Fill in project form:
   - Name: "Shoprite Warehouse Sprinkler System"
   - Client: Select "Test Client Corp"
   - Description: "Fire sprinkler installation for warehouse"
   - Start Date: Today
   - Due Date: 30 days from now
   - Status: In Progress
5. Click "Save Project"
6. Verify project appears in list
7. Click on newly created project
8. Add tasks to project:
   - Task 1: "Site Survey" (Priority: High)
   - Task 2: "System Design" (Priority: High)
   - Task 3: "Material Procurement" (Priority: Medium)
9. Assign tasks to user
10. Set task due dates

### Expected Results
✅ Project creation form validates inputs
✅ Project saved successfully
✅ Project visible in projects list
✅ Project detail page loads
✅ Tasks can be added
✅ Tasks display with correct priority

### Pass Criteria
- [ ] All form fields validate correctly
- [ ] Project saves to database
- [ ] Project list updates immediately
- [ ] Can navigate to project detail
- [ ] Tasks associate with project
- [ ] Task priorities display correctly

---

## Scenario 3: Time Tracking Workflow

### Test Steps
1. Navigate to Time Tracking page
2. Select project: "Shoprite Warehouse Sprinkler System"
3. Select task: "Site Survey"
4. Click "Start Timer"
5. Verify timer is running
6. Wait 5 seconds
7. Click "Stop Timer"
8. Add description: "Measured warehouse dimensions"
9. Submit time log
10. Verify time log appears in history
11. Check time displayed (should be ~5 seconds)
12. Navigate to project page
13. Verify time logged against task

### Expected Results
✅ Timer starts successfully
✅ Timer displays counting seconds
✅ Timer stops and calculates duration
✅ Time log saves with description
✅ Time log visible in history
✅ Project shows updated time

### Pass Criteria
- [ ] Timer starts/stops correctly
- [ ] Duration calculated accurately
- [ ] Time log saved to database
- [ ] Time appears in project view
- [ ] Can edit/delete time logs
- [ ] Total time updates on project

---

## Scenario 4: Document Upload and Linking

### Test Steps
1. Navigate to Documents page
2. Click "Upload Document"
3. Select file: "CFM-OPS-FRM-004 - Rev 14 - Site File Request.pdf"
4. Verify auto-parsed information:
   - Code: CFM-OPS-FRM-004
   - Version: 14
   - Name: Site File Request
5. Select category: "Forms"
6. Add description: "Request form for accessing site files"
7. Add tags: "form, site, access"
8. Click "Upload"
9. Verify upload progress
10. Verify document appears in library
11. Navigate to project "Shoprite Warehouse"
12. Click "Link Documents"
13. Search for "Site File Request"
14. Select and link to project
15. Verify document appears in project documents list

### Expected Results
✅ File upload works
✅ Document code parsed correctly
✅ Category auto-suggested
✅ Upload progress shown
✅ Document visible in library
✅ Document searchable
✅ Can link to project
✅ Linked documents visible on project

### Pass Criteria
- [ ] File uploads successfully
- [ ] Parsing extracts correct metadata
- [ ] Category suggestions work
- [ ] Progress indicator displays
- [ ] Document searchable in library
- [ ] Link/unlink works correctly
- [ ] Document preview/download works

---

## Scenario 5: Budget Calculation and Tracking

### Test Steps
1. Navigate to project "Shoprite Warehouse"
2. Go to Budget tab
3. Add estimated costs:
   - Labor: R 45,000
   - Materials: R 85,000
   - Equipment: R 15,000
   - Overhead: R 10,000
4. Save budget
5. Log time against tasks (from Scenario 3)
6. Navigate back to Budget tab
7. Verify actual costs calculated from time logs
8. Check variance percentage
9. Verify budget status (within/at risk/over)
10. View cost breakdown chart
11. Export budget report

### Expected Results
✅ Budget estimates save correctly
✅ Actual costs calculate from time logs
✅ Variance displayed accurately
✅ Status indicator shows correct color
✅ Charts display data correctly
✅ Report exports successfully

### Pass Criteria
- [ ] Budget estimates save
- [ ] Actual costs auto-calculate
- [ ] Variance calculation correct
- [ ] Status updates automatically
- [ ] Charts render properly
- [ ] Export functionality works

---

## Scenario 6: Client Update Generation

### Test Steps
1. Navigate to Dashboard
2. Find "Client Updates" section
3. Locate project with stale update (>3 days old)
4. Click "Generate Update"
5. Review auto-generated message
6. Verify message includes:
   - Project name
   - Progress percentage
   - Next action
   - Days since last update
7. Click "Copy to Clipboard"
8. Paste into notes app (verify copied correctly)
9. Edit message if needed
10. Click "Send Update" (simulated)
11. Verify project updated timestamp refreshes

### Expected Results
✅ Stale projects identified
✅ Update message generated
✅ Message includes all required info
✅ Copy to clipboard works
✅ Update timestamp refreshes

### Pass Criteria
- [ ] Algorithm identifies stale projects
- [ ] Message generation accurate
- [ ] All project details included
- [ ] Copy functionality works
- [ ] Update marks project as refreshed
- [ ] Update history recorded

---

## Scenario 7: PM Dashboard Workflow

### Test Steps
1. Login as Project Manager
2. View PM Dashboard
3. Check "Quick Actions" section
4. Verify urgent items display
5. Click on urgent task
6. Complete task
7. Return to dashboard
8. Verify urgent counter decrements
9. Check "Documentation Status"
10. Identify missing documents
11. Upload required document
12. Link to project
13. Verify documentation status updates
14. Check "Client Updates" count
15. Generate and send updates
16. Verify client updates counter decreases

### Expected Results
✅ Dashboard shows all sections
✅ Quick actions prioritize correctly
✅ Urgent items update in real-time
✅ Documentation status accurate
✅ Client update counter correct

### Pass Criteria
- [ ] All dashboard widgets load
- [ ] Data refreshes automatically
- [ ] Counters update when items resolved
- [ ] Navigation to details works
- [ ] Visual indicators clear
- [ ] Performance acceptable (<2s load)

---

## Scenario 8: Template-Based Project Creation

### Test Steps
1. Navigate to Templates page
2. Select template: "Fire Sprinkler Installation"
3. Click "Create Project from Template"
4. Fill in project details:
   - Client: Select existing
   - Project Name: Auto-generated, can edit
   - Start Date: Select date
5. Review auto-generated tasks
6. Adjust task dates if needed
7. Review cost estimation
8. Adjust complexity level (Standard/Complex/Highly Complex)
9. View updated cost estimates
10. Click "Create Project"
11. Verify project created with all tasks
12. Verify budget initialized
13. Check task dependencies set correctly

### Expected Results
✅ Template loads all default tasks
✅ Costs calculated automatically
✅ Complexity affects pricing
✅ Project creates with full structure
✅ Dependencies preserved

### Pass Criteria
- [ ] Template selection works
- [ ] Tasks auto-populate
- [ ] Cost calculation accurate
- [ ] Complexity multiplier applies
- [ ] Project creates successfully
- [ ] All relationships preserved

---

## Scenario 9: Multi-User Collaboration

### Test Steps
1. User A: Create project and tasks
2. User A: Assign task to User B
3. User B: Login and view assigned tasks
4. User B: Start timer on assigned task
5. User A: View project dashboard
6. User A: See User B's active timer
7. User B: Complete task and log time
8. User A: Receive notification (if implemented)
9. User A: Review completed task
10. User A: Update project status
11. Both users: Verify real-time updates

### Expected Results
✅ Task assignments visible to assignees
✅ Active work visible to managers
✅ Status updates reflect immediately
✅ No data conflicts occur

### Pass Criteria
- [ ] Task assignment notifications work
- [ ] Real-time updates functioning
- [ ] No permission errors
- [ ] Concurrent edits handled
- [ ] Audit trail maintained

---

## Scenario 10: Search and Filtering

### Test Steps
1. Navigate to Projects page
2. Use search: "Sprinkler"
3. Verify filtered results
4. Clear search
5. Apply filters:
   - Status: In Progress
   - Client: Test Client Corp
   - Date Range: Last 30 days
6. Verify results match filters
7. Sort by: Due Date (ascending)
8. Verify sort order correct
9. Navigate to Documents
10. Search by code: "CFM-OPS-FRM"
11. Filter by category: "Forms"
12. Verify combined search and filter works

### Expected Results
✅ Search returns relevant results
✅ Filters apply correctly
✅ Sorting works as expected
✅ Combined filters work
✅ Results update instantly

### Pass Criteria
- [ ] Search matches partial text
- [ ] Multiple filters combine properly
- [ ] Sort maintains filters
- [ ] Clear filters works
- [ ] Performance acceptable
- [ ] Result count displays

---

## Cross-Browser Testing

### Browsers to Test
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Mobile Testing
- ✅ iOS Safari
- ✅ Android Chrome

### Expected Results
All scenarios should work consistently across all browsers/devices.

---

## Performance Benchmarks

### Target Metrics
- **Page Load**: < 2 seconds
- **Search Results**: < 500ms
- **Document Upload**: Progress visible, < 30s for 10MB file
- **Dashboard Refresh**: < 1 second
- **Database Query**: < 200ms average

### Load Testing
- Test with 100+ projects
- Test with 1000+ tasks
- Test with 500+ documents
- Verify performance remains acceptable

---

## Accessibility Testing

### Keyboard Navigation
- [ ] All interactive elements accessible via Tab
- [ ] Forms submittable with Enter
- [ ] Modals closable with Escape
- [ ] Focus indicators visible

### Screen Reader
- [ ] All images have alt text
- [ ] Form labels associated correctly
- [ ] ARIA labels present
- [ ] Error messages announced

### Color Contrast
- [ ] Text meets WCAG AA standards
- [ ] UI elements distinguishable
- [ ] Status indicators not color-only

---

## Security Testing

### Authentication
- [ ] Cannot access app without login
- [ ] Session expires appropriately
- [ ] Password requirements enforced
- [ ] No tokens in URL

### Authorization
- [ ] Users see only their data
- [ ] Roles enforced correctly
- [ ] Cannot edit others' content
- [ ] API calls authenticated

### Data Protection
- [ ] Sensitive data not in logs
- [ ] SQL injection prevented
- [ ] XSS protection active
- [ ] CSRF tokens present

---

## Bug Report Template

When issues are found, report with:

```
**Title**: [Short description]

**Scenario**: [Which test scenario]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**: 

**Actual Result**: 

**Screenshots**: [Attach if applicable]

**Environment**:
- Browser: 
- OS: 
- Screen Size: 

**Severity**: Critical / High / Medium / Low

**Additional Notes**: 
```

---

## Test Completion Checklist

### Before Release
- [ ] All E2E scenarios pass
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete
- [ ] Performance benchmarks met
- [ ] Accessibility review done
- [ ] Security audit passed
- [ ] User acceptance testing done
- [ ] Documentation updated

### Sign-Off
- [ ] QA Team Lead: ________________
- [ ] Project Manager: ________________
- [ ] Product Owner: ________________
- [ ] Date: ________________

---

**Document Version**: 1.0  
**Last Updated**: 2024-10-31  
**Maintained By**: QA Team
