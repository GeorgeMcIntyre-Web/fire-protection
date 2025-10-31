# QA Manual Testing Checklist

Quick reference checklist for manual testing before release.

---

## Pre-Release Checklist

**Release Version**: ___________  
**Test Date**: ___________  
**Tester**: ___________

---

## 1. Authentication & Authorization

### User Registration
- [ ] Can register with valid email
- [ ] Password requirements enforced (8+ chars, uppercase, number)
- [ ] Duplicate email rejected
- [ ] Email format validated
- [ ] Confirmation email sent (if applicable)

### User Login
- [ ] Can login with correct credentials
- [ ] Invalid credentials show error
- [ ] Email is case-insensitive
- [ ] Password is case-sensitive
- [ ] "Remember me" functionality works
- [ ] Session persists on page refresh
- [ ] Session expires after timeout

### Password Reset
- [ ] Reset link sent to email
- [ ] Reset link expires appropriately
- [ ] Can set new password
- [ ] Old password no longer works
- [ ] New password meets requirements

### Sign Out
- [ ] Sign out clears session
- [ ] Cannot access protected pages after sign out
- [ ] Redirects to login page

---

## 2. Dashboard

### PM Dashboard
- [ ] Loads within 2 seconds
- [ ] Displays urgent work items
- [ ] Shows client updates needed
- [ ] Documentation status visible
- [ ] Quick actions display correctly
- [ ] All data is current (not stale)
- [ ] Click actions navigate correctly

### General Dashboard
- [ ] Project statistics accurate
- [ ] Recent activity displays
- [ ] Charts render properly
- [ ] No console errors

---

## 3. Project Management

### Create Project
- [ ] Form validates all required fields
- [ ] Can select existing client
- [ ] Can create new client inline
- [ ] Date picker works correctly
- [ ] Status dropdown functions
- [ ] Project saves successfully
- [ ] Appears in project list immediately

### View Project
- [ ] Project details display correctly
- [ ] All fields visible and accurate
- [ ] Related tasks load
- [ ] Related documents load
- [ ] Time logs display
- [ ] Budget information shows

### Edit Project
- [ ] Can update all fields
- [ ] Changes save successfully
- [ ] Updated data displays immediately
- [ ] Validation works on edit
- [ ] Can cancel without saving

### Delete Project
- [ ] Confirmation dialog appears
- [ ] Can cancel deletion
- [ ] Project deleted successfully
- [ ] Related data handled correctly
- [ ] Project removed from list

### Project List
- [ ] All projects display
- [ ] Search filters results
- [ ] Status filter works
- [ ] Client filter works
- [ ] Date range filter works
- [ ] Sort by name works
- [ ] Sort by date works
- [ ] Pagination works (if applicable)

---

## 4. Task Management

### Create Task
- [ ] Can create task for project
- [ ] Priority levels selectable
- [ ] Status options available
- [ ] Can assign to user
- [ ] Due date picker works
- [ ] Estimated hours accepts numbers
- [ ] Task saves successfully

### View Task
- [ ] Task details display
- [ ] Project context shown
- [ ] Assignment visible
- [ ] Comments load (if applicable)
- [ ] History visible

### Edit Task
- [ ] Can update all fields
- [ ] Status change persists
- [ ] Priority change persists
- [ ] Reassignment works
- [ ] Saves successfully

### Complete Task
- [ ] Can mark as complete
- [ ] Completion date recorded
- [ ] Visual indication changes
- [ ] Project progress updates

### Task List
- [ ] Filter by project
- [ ] Filter by assignee
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Sort options work

---

## 5. Time Tracking

### Start Timer
- [ ] Timer starts immediately
- [ ] Timer counts seconds
- [ ] Can select project
- [ ] Can select task
- [ ] Timer visible while running

### Stop Timer
- [ ] Timer stops correctly
- [ ] Duration calculated accurately
- [ ] Can add description
- [ ] Time log saves
- [ ] Timer resets for next entry

### Manual Time Entry
- [ ] Can enter start/end times
- [ ] Duration auto-calculates
- [ ] Validation prevents invalid times
- [ ] Can select project/task
- [ ] Entry saves successfully

### Time Log History
- [ ] All logs display
- [ ] Filter by date range
- [ ] Filter by project
- [ ] Can edit past entries
- [ ] Can delete entries
- [ ] Total time calculates correctly

---

## 6. Document Management

### Upload Document
- [ ] File picker opens
- [ ] Can select multiple files
- [ ] File size validation works
- [ ] File type validation works
- [ ] Auto-parse document code works
- [ ] Category auto-suggests
- [ ] Can enter metadata
- [ ] Upload progress shows
- [ ] Upload completes successfully
- [ ] Document appears in library

### Document Library
- [ ] All documents display
- [ ] Search works
- [ ] Filter by category works
- [ ] Can view document details
- [ ] Can download document
- [ ] Can preview document (if supported)
- [ ] Tags display correctly

### Link to Project
- [ ] Can search documents
- [ ] Can select multiple
- [ ] Link saves successfully
- [ ] Documents appear on project
- [ ] Can add notes on link

### Document Management
- [ ] Can edit metadata
- [ ] Can update version
- [ ] Can add tags
- [ ] Can archive document
- [ ] Can delete document (with confirmation)

---

## 7. Client Management

### Create Client
- [ ] Form validates required fields
- [ ] Email format validated
- [ ] Phone format accepted
- [ ] Address field works
- [ ] Client saves successfully

### View Client
- [ ] Contact details display
- [ ] Related projects shown
- [ ] Project statistics accurate
- [ ] Document count correct

### Edit Client
- [ ] Can update all fields
- [ ] Changes save
- [ ] Validation on edit works

### Client List
- [ ] All clients display
- [ ] Search works
- [ ] Sort by name works
- [ ] Click navigates to detail

---

## 8. Budget Tracking

### View Budget
- [ ] Estimated costs display
- [ ] Actual costs display
- [ ] Variance calculated correctly
- [ ] Status indicator correct
- [ ] Breakdown shows all categories
- [ ] Charts render properly

### Edit Budget
- [ ] Can update estimates
- [ ] Changes save
- [ ] Recalculation works
- [ ] Alerts update

### Budget Alerts
- [ ] Over budget shows red
- [ ] At risk shows yellow
- [ ] Within budget shows green
- [ ] Alert messages helpful

---

## 9. Templates

### View Templates
- [ ] All templates display
- [ ] Categories visible
- [ ] Can preview template

### Create from Template
- [ ] Template loads correctly
- [ ] All tasks populate
- [ ] Cost estimates calculate
- [ ] Can customize before creating
- [ ] Project creates successfully

---

## 10. Navigation & UI

### Navigation Bar
- [ ] Logo/brand visible
- [ ] All menu items present
- [ ] Active page highlighted
- [ ] Mobile menu works
- [ ] User info displays
- [ ] Sign out works

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Menu collapses on mobile
- [ ] Touch interactions work

### Accessibility
- [ ] Can navigate with keyboard
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] Screen reader friendly (test with NVDA/JAWS)
- [ ] Color contrast sufficient
- [ ] Text scalable

---

## 11. Search & Filters

### Global Search
- [ ] Search box accessible
- [ ] Returns relevant results
- [ ] Highlights matches
- [ ] Can search all entities

### Project Search
- [ ] Searches by name
- [ ] Searches by client
- [ ] Searches by description

### Document Search
- [ ] Searches by name
- [ ] Searches by code
- [ ] Searches by description
- [ ] Searches by tags

---

## 12. Data Validation

### Form Validation
- [ ] Required fields marked
- [ ] Inline validation works
- [ ] Error messages clear
- [ ] Can't submit invalid form
- [ ] Validation errors display

### Data Integrity
- [ ] No duplicate entries created
- [ ] Foreign key relationships maintained
- [ ] Cascade deletes work correctly
- [ ] Data constraints enforced

---

## 13. Performance

### Page Load Times
- [ ] Dashboard loads <2s
- [ ] Project list loads <2s
- [ ] Document library loads <2s
- [ ] Search results <500ms

### Large Data Sets
- [ ] Handles 100+ projects
- [ ] Handles 1000+ tasks
- [ ] Handles 500+ documents
- [ ] No lag or freezing

---

## 14. Error Handling

### Network Errors
- [ ] Offline mode message shows
- [ ] Retry mechanism works
- [ ] No data loss on reconnect

### Server Errors
- [ ] 500 error handled gracefully
- [ ] User-friendly error message
- [ ] Can recover without refresh

### Client Errors
- [ ] 404 page displays
- [ ] Invalid URLs handled
- [ ] Back button works

---

## 15. Security

### Authentication
- [ ] Cannot access app without login
- [ ] Session timeout works
- [ ] No auth tokens in URL
- [ ] No sensitive data in logs

### Authorization
- [ ] Users see only their data
- [ ] Cannot access other user URLs
- [ ] Role permissions enforced
- [ ] Admin features protected

### Data Protection
- [ ] Passwords not visible
- [ ] No SQL injection possible
- [ ] No XSS vulnerabilities
- [ ] HTTPS enforced

---

## 16. Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Samsung Internet

---

## 17. Integration Testing

### Database
- [ ] Data persists correctly
- [ ] Queries perform well
- [ ] No orphaned records
- [ ] Backup/restore works

### File Storage
- [ ] Files upload successfully
- [ ] Files download correctly
- [ ] Storage limits enforced
- [ ] File cleanup works

### Email
- [ ] Notifications sent
- [ ] Email format correct
- [ ] Links work in emails
- [ ] Unsubscribe works

---

## 18. User Experience

### Feedback
- [ ] Success messages show
- [ ] Error messages helpful
- [ ] Loading indicators present
- [ ] Progress bars accurate

### Consistency
- [ ] UI consistent across pages
- [ ] Terminology consistent
- [ ] Button styles consistent
- [ ] Icons meaningful

### Usability
- [ ] Actions intuitive
- [ ] Help text available
- [ ] Error recovery possible
- [ ] Undo available where needed

---

## 19. Edge Cases

### Boundary Conditions
- [ ] Handles empty states
- [ ] Handles maximum values
- [ ] Handles minimum values
- [ ] Handles special characters

### Unusual Inputs
- [ ] Very long text
- [ ] Emoji in text fields
- [ ] Copy/paste formatted text
- [ ] File with no extension

---

## 20. Final Checks

### Before Release
- [ ] All critical bugs fixed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Release notes prepared
- [ ] Backup taken
- [ ] Rollback plan ready

### After Release
- [ ] Monitor error logs
- [ ] Check user feedback
- [ ] Verify metrics
- [ ] Document any issues

---

## Sign-Off

### Test Results

**Total Tests**: ______  
**Passed**: ______  
**Failed**: ______  
**Blocked**: ______

### Severity Breakdown

**Critical Issues**: ______  
**High Priority**: ______  
**Medium Priority**: ______  
**Low Priority**: ______

### Approval

- [ ] All critical issues resolved
- [ ] High priority issues reviewed
- [ ] Release criteria met
- [ ] Ready for production

**QA Lead**: ________________ Date: ______  
**Tech Lead**: ________________ Date: ______  
**Product Owner**: ________________ Date: ______

---

**Version**: 1.0  
**Last Updated**: 2024-10-31  
**Next Review**: Before each release
