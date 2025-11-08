# Infrastructure Setup (Production)

This guide sets up production infrastructure for the Fire Protection Tracker.

## Prerequisites

- Supabase project created
- Service role key (secure)
- Anon key
- Supabase CLI optional (for SQL execution)

## 1) Database Migration

- File: `supabase-production-migration.sql`
- Run via Supabase SQL editor or CLI
- Idempotent: safe to run multiple times

Indexes added:
- `projects`: client_id, status, created_at
- `tasks`: project_id, status, priority, due_date
- `time_logs`: project_id, user_id, task_id, start_time
- `document_library`: category_id, created_at, created_by
- `project_documents`: project_id, document_id, uploaded_by

## 2) Environment Configuration

- File: `.env` (based on `env.example`)
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_ENVIRONMENT` = development|staging|production

- Validation module: `src/lib/env-validation.ts`
  - Provides `getEnvConfig`, `checkEnvironmentHealth`, `logEnvironmentHealth`

- Client wiring: `src/lib/supabase.ts` uses validated config

## 3) Storage Configuration

- Bucket: `company-documents` (public read, authenticated write)
- Policies applied by migration
- Frontend validation: `src/lib/storage-policies.ts`

## 4) Tools

- Backup: `scripts/database-backup.ts`
- Validate migration: `scripts/validate-migration.ts`
- Enhanced migration: `scripts/migrate-documents.ts` (supports `--dry-run` and rollback)

## 5) Verification Checklist

- Apply migration in Supabase
- Run `npx tsx scripts/validate-migration.ts`
- Test uploads via app (uses validation utils)
- Run a backup: `npx tsx scripts/database-backup.ts`

## 6) Troubleshooting

- Validation script cannot query catalog: ensure service role key is used
- RLS errors: sign in or use service role for administrative scripts
- Missing bucket: re-run migration; confirm storage enabled

## 7) Security Notes

- Keep service role key out of frontend envs
- Use `.env` only in local dev; configure production secrets via host
