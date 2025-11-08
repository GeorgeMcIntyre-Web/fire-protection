# Fire Protection PM - Troubleshooting Guide

Solutions to common problems and issues.

---

## 🔧 Quick Fixes

### Page Won't Load
**Try these steps in order:**

1. **Refresh the page**
   - Windows/Linux: `Ctrl + R` or `F5`
   - Mac: `Cmd + R`

2. **Hard refresh (clear cache)**
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

3. **Clear browser cache**
   - Chrome: Settings → Privacy and Security → Clear browsing data
   - Firefox: Options → Privacy & Security → Clear Data
   - Safari: History → Clear History

4. **Try incognito/private mode**
   - This helps identify if extensions or cache are causing issues

5. **Try a different browser**
   - Chrome, Firefox, Safari, or Edge

### Can't Log In
**Check these common issues:**

1. **Verify credentials**
   - Email correct? (check for typos)
   - Password correct? (check caps lock)
   - Try copying/pasting password

2. **Reset password**
   - Click "Forgot Password"
   - Check email for reset link
   - Check spam folder if needed

3. **Account status**
   - Has your account been activated?
   - Check email for verification link
   - Contact admin if account is locked

4. **Browser issues**
   - Clear cookies
   - Enable cookies/JavaScript
   - Disable ad blockers temporarily

---

## 📱 User Interface Issues

### Dashboard Not Loading

**Symptoms:** Blank dashboard or spinning loader that never stops

**Solutions:**
1. Check your internet connection
2. Refresh the page (Ctrl/Cmd + R)
3. Clear browser cache
4. Disable browser extensions
5. Check browser console for errors (F12)
6. Contact support with error details

### Elements Not Displaying Correctly

**Symptoms:** Buttons, forms, or layouts look broken

**Solutions:**
1. Ensure browser is up-to-date
2. Clear browser cache
3. Disable custom browser themes
4. Check zoom level (should be 100%)
5. Try different browser
6. Disable browser extensions

### Navigation Menu Not Working

**Symptoms:** Can't click navigation items or menu doesn't open

**Solutions:**
1. Hard refresh the page
2. Check for JavaScript errors (F12 console)
3. Disable conflicting browser extensions
4. Try different browser
5. Check if cookies are enabled

### Search Not Working

**Symptoms:** Search returns no results or errors

**Solutions:**
1. Try simplifying search terms
2. Clear search filters
3. Refresh the page
4. Check spelling
5. Use different keywords
6. Try advanced search options

---

## 📁 Project & Task Issues

### Can't Create Project

**Symptoms:** Error when trying to create new project

**Possible causes & solutions:**

1. **Permission issues**
   - Verify you have permission to create projects
   - Contact your administrator

2. **Required fields missing**
   - Fill in all required fields (marked with *)
   - Check that dates are valid
   - Ensure budget is a number

3. **Duplicate project name**
   - Try a unique project name
   - Check if project already exists

4. **Browser issues**
   - Refresh and try again
   - Clear form and re-enter data
   - Try different browser

### Can't See Project

**Symptoms:** Project missing from your list

**Check these:**

1. **Filters active**
   - Clear all filters
   - Check status filter (might be hiding completed projects)
   - Check date range filter

2. **Permissions**
   - Verify you're assigned to the project
   - Contact project manager
   - Ask admin to check permissions

3. **Project status**
   - Project might be archived
   - Project might be deleted
   - Check with team members

4. **Wrong workspace**
   - Confirm you're in correct workspace/account
   - Check if you need to switch organizations

### Tasks Not Updating

**Symptoms:** Changes to tasks don't save or revert

**Solutions:**
1. Check internet connection
2. Wait a moment before closing (auto-save delay)
3. Click "Save" explicitly
4. Refresh to see if changes saved
5. Try editing in different browser
6. Check for error messages in console (F12)

### Task Notifications Not Received

**Symptoms:** Not getting notified about task assignments or updates

**Check these settings:**

1. **Profile notification settings**
   - Go to Profile → Notifications
   - Enable desired notification types
   - Save changes

2. **Email settings**
   - Verify email address is correct
   - Check spam/junk folder
   - Add sender to safe senders list
   - Check email filters/rules

3. **System settings**
   - Check with admin if notifications are enabled system-wide
   - Verify your account status is active

---

## 📄 Document Issues

### Can't Upload Documents

**Symptoms:** Upload fails or gets stuck

**Check these common issues:**

1. **File size too large**
   - Maximum: 50MB per file
   - Compress large files
   - Split large archives

2. **Unsupported file type**
   - Check supported formats list
   - Convert to supported format
   - ZIP unsupported files

3. **Network issues**
   - Check internet connection
   - Try uploading smaller file first
   - Upload during off-peak hours

4. **Browser issues**
   - Try different browser
   - Clear browser cache
   - Disable browser extensions

5. **Storage quota**
   - Check available storage
   - Delete unnecessary files
   - Contact admin about storage limits

### Can't Preview Document

**Symptoms:** Document won't preview in browser

**Solutions:**

1. **Unsupported preview format**
   - Download and open locally
   - Convert to supported format (PDF, images)

2. **File corrupted**
   - Try re-uploading
   - Verify file opens locally
   - Upload different version

3. **Browser compatibility**
   - Try different browser
   - Update your browser
   - Enable JavaScript

### Can't Download Document

**Symptoms:** Download fails or file is corrupted

**Try these:**

1. **Check internet connection**
   - Stable connection required for large files
   - Try downloading smaller file first

2. **Browser download settings**
   - Check browser download folder
   - Allow downloads in browser settings
   - Disable download manager extensions

3. **File permissions**
   - Verify you have download permission
   - Contact document owner
   - Ask admin to check permissions

4. **Try different method**
   - Right-click → Save As
   - Try different browser
   - Copy download link to new tab

---

## ⏱️ Time Tracking Issues

### Timer Won't Start

**Symptoms:** Can't start time tracking timer

**Solutions:**

1. **Existing timer running**
   - Check if another timer is already running
   - Stop other timer first
   - Only one timer can run at a time

2. **Permission issues**
   - Verify you have time tracking permission
   - Contact your administrator

3. **Browser issues**
   - Refresh the page
   - Clear browser cache
   - Try different browser

### Timer Won't Stop

**Symptoms:** Timer keeps running or won't stop

**Solutions:**

1. **Network delay**
   - Wait 5-10 seconds
   - Check internet connection
   - Try again

2. **Browser issues**
   - Refresh the page (timer will show last saved state)
   - Clear cache
   - Try different browser

3. **Manual entry**
   - Note your start time
   - Stop timer manually
   - Create manual time entry

### Time Entry Not Saved

**Symptoms:** Time entry disappears or doesn't appear in reports

**Check:**

1. **Required fields**
   - Date filled in?
   - Duration entered?
   - Project selected?

2. **Validation errors**
   - Check for error messages
   - Ensure time range is valid
   - No overlapping entries

3. **Network issues**
   - Check internet connection when submitting
   - Wait for confirmation message
   - Refresh to verify entry saved

### Incorrect Time Calculation

**Symptoms:** Time duration calculated wrong

**Common causes:**

1. **Timezone issues**
   - Check Profile → Timezone setting
   - Verify it matches your location
   - Entries might span daylight saving time change

2. **Entry spans multiple days**
   - Split into separate entries per day
   - System may calculate differently

3. **Browser clock wrong**
   - Check system time is accurate
   - Sync with time server
   - Manually edit entry if needed

---

## 💰 Budget & Financial Issues

### Budget Not Updating

**Symptoms:** Budget numbers don't reflect recent expenses

**Try:**

1. **Refresh the data**
   - Refresh the page
   - Clear browser cache
   - Wait a few minutes for calculations

2. **Check expense status**
   - Verify expenses are "approved"
   - Pending expenses might not count
   - Check expense dates

3. **Time-based costs**
   - Ensure hourly rates are set
   - Verify time entries are marked billable
   - Check project cost settings

### Budget Alerts Not Working

**Symptoms:** No alerts when approaching budget limit

**Check:**

1. **Notification settings**
   - Enable budget alerts in Profile
   - Set threshold percentages
   - Verify email notifications enabled

2. **Budget properly set**
   - Project has budget amount entered
   - Budget is greater than $0
   - Budget alerts configured

3. **Email delivery**
   - Check spam folder
   - Verify email address
   - Check email filters

---

## 👥 Collaboration Issues

### Can't Mention Team Members

**Symptoms:** @mention doesn't work or doesn't show suggestions

**Solutions:**

1. **User not in project**
   - Ensure user is added to the project
   - Check team member list
   - Add member if needed

2. **Browser autocomplete**
   - Type @ and wait for dropdown
   - Continue typing name
   - Select from list

3. **Permission issues**
   - Verify user has active account
   - Check with administrator

### Comments Not Posting

**Symptoms:** Comments don't appear after submitting

**Try:**

1. **Internet connection**
   - Check connection is stable
   - Wait and try again
   - Refresh to see if it posted

2. **Content issues**
   - Check for special characters
   - Remove very long links
   - Shorten comment if extremely long

3. **Permission issues**
   - Verify you can comment on this item
   - Check project permissions

### Not Receiving Notifications About Mentions

**Check:**

1. **Notification settings**
   - Enable @mention notifications
   - Check email preferences
   - Verify notification channels

2. **Email delivery**
   - Check spam folder
   - Verify email address
   - Check email filters

---

## 🔒 Permission & Access Issues

### "Access Denied" Error

**Symptoms:** Can't access project, document, or feature

**Possible reasons:**

1. **Insufficient permissions**
   - Contact project manager
   - Request access from admin
   - Verify correct role assigned

2. **Project permissions**
   - Not added to project team
   - Project is private
   - Ask project owner for access

3. **Account status**
   - Account might be inactive
   - Subscription might have lapsed
   - Contact administrator

### Can't Edit Item

**Symptoms:** Can view but can't make changes

**Check:**

1. **Edit permissions**
   - You might have read-only access
   - Request edit permission
   - Check your role

2. **Item locked**
   - Item might be locked by admin
   - Project might be archived
   - Contact project manager

3. **Ownership**
   - Some items can only be edited by creator
   - Ask owner to make changes
   - Have admin reassign ownership

---

## 🌐 Network & Connectivity Issues

### Slow Loading Times

**Symptoms:** App loads slowly or times out

**Try:**

1. **Check internet speed**
   - Run speed test
   - Restart router/modem
   - Contact ISP if speeds are low

2. **Browser optimization**
   - Close unnecessary tabs
   - Disable unused extensions
   - Clear browser cache
   - Update browser

3. **Server status**
   - Check status page (if available)
   - Contact support about outages
   - Try again during off-peak hours

### "Connection Lost" Errors

**Symptoms:** Intermittent connection errors

**Solutions:**

1. **Network stability**
   - Check WiFi signal strength
   - Switch to wired connection
   - Move closer to router
   - Restart network devices

2. **Firewall/proxy**
   - Check firewall settings
   - Whitelist application domain
   - Check proxy configuration
   - Contact IT department

3. **Browser issues**
   - Disable VPN temporarily
   - Clear browser cache
   - Try different browser

---

## 🖥️ Browser-Specific Issues

### Chrome Issues

**Common problems:**
- Extensions blocking features
- Memory usage too high
- Cache corruption

**Solutions:**
1. Disable extensions one by one
2. Clear cache: Settings → Privacy → Clear Data
3. Reset Chrome: Settings → Advanced → Reset
4. Update to latest version

### Firefox Issues

**Common problems:**
- Strict tracking protection blocking features
- Private browsing limitations
- Add-on conflicts

**Solutions:**
1. Adjust tracking protection: Shield icon → disable for this site
2. Disable add-ons temporarily
3. Clear cache: Options → Privacy → Clear Data
4. Try standard (not private) browsing

### Safari Issues

**Common problems:**
- Intelligent tracking prevention blocking cookies
- Cache not clearing properly
- iOS-specific issues

**Solutions:**
1. Disable tracking prevention for site
2. Safari → Clear History and Website Data
3. Update Safari/iOS to latest version
4. Enable JavaScript if disabled

### Edge Issues

**Common problems:**
- SmartScreen blocking features
- Compatibility mode issues
- Extension conflicts

**Solutions:**
1. Add site to trusted sites
2. Disable compatibility view
3. Clear browsing data
4. Reset Edge settings

---

## 📱 Mobile Device Issues

### Mobile Layout Problems

**Symptoms:** Layout looks broken on mobile

**Try:**
1. Rotate device (portrait/landscape)
2. Zoom to 100%
3. Clear mobile browser cache
4. Update mobile browser
5. Try different mobile browser

### Touch Interactions Not Working

**Symptoms:** Can't tap buttons or interact with elements

**Solutions:**
1. Remove screen protector temporarily
2. Clean screen
3. Close other apps
4. Restart device
5. Update device OS

### Mobile Upload Issues

**Symptoms:** Can't upload from mobile device

**Check:**
1. Allow camera/photo access in browser settings
2. Check available storage on device
3. Reduce photo size before uploading
4. Try uploading via desktop browser

---

## 🔧 Advanced Troubleshooting

### Check Browser Console for Errors

1. Open Developer Tools:
   - Windows/Linux: `F12` or `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`

2. Click "Console" tab
3. Look for red error messages
4. Copy error text
5. Send to support with screenshot

### Check Network Activity

1. Open Developer Tools (`F12`)
2. Click "Network" tab
3. Reproduce the issue
4. Look for failed requests (red)
5. Right-click failed request → Copy → Copy all as HAR
6. Send to support

### Clear All Application Data

**Warning:** This will log you out and clear all cached data

**Chrome:**
1. Open Developer Tools (F12)
2. Right-click the Refresh button
3. Select "Empty Cache and Hard Reload"

**All Browsers:**
1. Go to browser settings
2. Find Privacy/Security section
3. Clear all browsing data
4. Check all boxes
5. Select "All time"
6. Clear data
7. Restart browser

---

## 🆘 When to Contact Support

Contact support if:
- ✅ You've tried the troubleshooting steps above
- ✅ Problem persists across multiple browsers
- ✅ Multiple users are experiencing the same issue
- ✅ Data appears to be lost or corrupted
- ✅ Security concerns arise
- ✅ Critical features are completely non-functional

### What Information to Include

When contacting support, provide:

1. **Your details**
   - Account email
   - Organization name
   - User role

2. **Problem description**
   - What you were trying to do
   - What happened instead
   - When it started happening

3. **Steps to reproduce**
   - Step 1, Step 2, etc.
   - Specific pages/features affected

4. **Your environment**
   - Browser and version
   - Operating system
   - Device type

5. **Troubleshooting tried**
   - What you've already attempted
   - Any error messages seen

6. **Screenshots or videos**
   - Visual evidence of the problem
   - Console errors (if applicable)

---

## 📞 Getting Help

### Support Channels

1. **In-App Support**
   - Click Help (?) → Contact Support
   - Submit ticket with details

2. **Documentation**
   - [User Guide](./USER_GUIDE.md)
   - [FAQ](./FAQ.md)
   - [Getting Started](./GETTING_STARTED.md)

3. **Administrator**
   - Contact your system administrator
   - They may have organization-specific solutions

4. **Community** (if available)
   - User forums
   - Knowledge base
   - Video tutorials

---

## 🔍 Still Having Issues?

If your problem isn't covered here:

1. Check the [FAQ](./FAQ.md) for related questions
2. Search the knowledge base
3. Contact your administrator
4. Submit a support ticket with detailed information

We're here to help! Don't hesitate to reach out.

---

**Last Updated:** October 31, 2025
