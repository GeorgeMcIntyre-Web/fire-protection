# Document Migration Guide

This guide explains how to migrate your existing documents from `fire-pro-docs` to Supabase.

## Overview

Your documents are currently stored in:
```
C:\Users\George\source\repos\fire-protection_data\fire-pro-docs\OneDrive_1_10-26-2025
```

They need to be uploaded to Supabase so they can be:
- Accessed through the web application
- Linked to specific projects
- Searchable and categorized
- Version controlled

## Migration Options

### Option 1: Web Interface (Recommended for Smaller Batches)

1. **Sign in to the application**
   - Open http://localhost:5175
   - Create an account or sign in

2. **Navigate to Documents**
   - Click "Documents" in the navigation menu
   - Click "Upload Documents" button

3. **Upload files**
   - Drag and drop files or click to browse
   - The system will auto-detect:
     - Document codes (e.g., CFM-OPS-FRM-004)
     - Version numbers (e.g., Rev 14)
     - Category (based on the code)
   - Review and adjust the information
   - Click "Upload"

4. **Repeat for each category**
   - Forms & Templates
   - Checklists
   - Certificates
   - etc.

### Option 2: Bulk Migration Script (For Large Numbers of Files)

**Note:** This script requires authentication and may need additional setup.

1. **Install TypeScript execution tool**
   ```bash
   npm install --save-dev tsx
   ```

2. **Sign in to get authentication**
   - You'll need to be signed in through the web app first
   - Or use a Supabase service role key

3. **Run the migration script**
   ```bash
   npx tsx scripts/migrate-documents.ts "C:\Users\George\source\repos\fire-protection_data\fire-pro-docs\OneDrive_1_10-26-2025"
   ```

The script will:
- Recursively scan all subdirectories
- Skip "Old Revs" and "Signed PDF" folders
- Auto-detect document codes and versions
- Determine category from folder structure
- Upload files to Supabase storage
- Create database records

## Document Categorization

The system uses 9 categories that match your folder structure:

| Category | Code | Folder Keywords |
|----------|------|----------------|
| Appointments & Organograms | appointment | "appointments", "organograms" |
| Certificates | certificate | "certificates" |
| Checklists | checklist | "checklists" |
| Forms & Templates | form | "forms", "templates" |
| Index & Registers | index | "index", "registers" |
| Policies | policy | "policies" |
| Processes | process | "processes" |
| Reports | report | "reports" |
| Work Instructions | work_instruction | "work instructions", "instructions" |

## Document Code Format

The system recognizes document codes in this format:
```
CFM-[DEPT]-[CATEGORY]-[NUMBER]
```

Examples:
- `CFM-OPS-FRM-004` - Operations Form #4
- `CFM-SHE-POL-002` - Safety Policy #2

Version numbers are extracted from:
- `Rev 14`
- `Rev. 14`
- `Revision 14`

## Priority Upload Order

For best results, upload in this order:

1. **Forms & Templates** - Most frequently used
2. **Checklists** - Daily operational use
3. **Processes** - Reference documentation
4. **Work Instructions** - Procedural guides
5. **Certificates** - Compliance documents
6. **Policies** - Company policies
7. **Reports** - Historical records
8. **Index & Registers** - Master lists
9. **Appointments & Organograms** - Organizational charts

## After Migration

Once documents are uploaded:

1. **Link to Projects**
   - Go to a specific project
   - Click "Link Documents"
   - Select relevant company documents
   - Add project-specific documents

2. **Tag and Organize**
   - Add tags for easier searching
   - Update descriptions as needed
   - Set correct versions

3. **Set Up Access Control**
   - Configure who can view/edit
   - Set document approvals
   - Manage revisions

## Storage Buckets

Documents are stored in these Supabase storage buckets:

- `company-documents` - General company docs, forms, templates
- `project-documents` - Project-specific files
- `forms` - Blank form templates
- `certificates` - Certifications and compliance
- `work-photos` - Field documentation photos

## Troubleshooting

### "Failed to upload" errors
- Check file size (max 50MB per file)
- Ensure supported format (PDF, DOC, DOCX, XLS, XLSX, TXT)
- Check your internet connection

### Files not appearing
- Refresh the page
- Check the selected category filter
- Look in "All Documents" view

### Duplicate documents
- The system prevents duplicate uploads
- You can update existing documents instead

### Permission errors
- Ensure you're signed in
- Check your user role (admin/manager/technician)
- Contact admin for access rights

## Best Practices

1. **Organize before uploading**
   - Review folder structure
   - Remove duplicates
   - Update old versions

2. **Use consistent naming**
   - Follow CFM code format
   - Include revision numbers
   - Use descriptive names

3. **Add metadata**
   - Fill in descriptions
   - Add relevant tags
   - Set version numbers

4. **Backup originals**
   - Keep original files
   - Don't delete from local storage yet
   - Verify uploads before cleanup

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review the server logs
3. Contact your system administrator
4. Refer to Supabase documentation

## Next Steps

After documents are migrated:
- Set up document approval workflows
- Configure automatic versioning
- Create document templates
- Set up periodic backups
- Train users on the system
