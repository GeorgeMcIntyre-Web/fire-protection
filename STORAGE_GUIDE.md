# Storage Guide

This guide describes the production storage configuration for Supabase Storage.

## Buckets

- company-documents
  - Purpose: Stores company documents uploaded via the Document Library
  - Public: true (read-only)
  - Writes: Authenticated users only
  - Retention: Indefinite

## Policies

- Read: Public read (bucket public = true)
- Write/Update/Delete: Allowed only for authenticated users via policy

Configured via `supabase-production-migration.sql`:
- Bucket creation if not exists
- Policy: "Allow authenticated uploads to company-documents" with insert/update/delete

## File Validation

Use `src/lib/storage-policies.ts` utilities:
- `validateFileUpload(file, allowedExtensions?)`
- `getMimeType(fileName)`
- `generateStoragePath(fileName, prefix?, userId?)`

Supported types include: pdf, doc, docx, xls, xlsx, txt, jpg, jpeg, png, gif, csv

Size limits:
- Images: 10MB
- Documents: 50MB
- Default: 50MB

## Cleanup

- Rolling back uploads: `scripts/migrate-documents.ts` deletes the uploaded file if DB insert fails
- For manual cleanup, list objects in the bucket and remove by path

## Retention Policy

- Keep documents indefinitely due to compliance needs
- Consider periodic review for obsolete files
