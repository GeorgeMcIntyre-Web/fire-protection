# Database Schema (Production)

This document describes the production database schema for Fire Protection Tracker.

## ER Diagram (Text-Based)

[profiles] --(1)---(n)--> [projects]
[profiles] --(1)---(n)--> [clients]
[profiles] --(1)---(n)--> [tasks]
[profiles] --(1)---(n)--> [time_logs]
[profiles] --(1)---(n)--> [work_documentation]

[clients] --(1)---(n)--> [projects]
[projects] --(1)---(n)--> [tasks]
[projects] --(1)---(n)--> [time_logs]
[projects] --(1)---(n)--> [work_documentation]

[document_categories] --(1)---(n)--> [document_library]
[projects] --(n)---(n)--> [document_library] via [project_documents]

## Tables

- profiles
  - id (uuid, pk, fk -> auth.users)
  - email (text, not null)
  - full_name (text)
  - role (enum via check: admin|manager|technician)
  - created_at, updated_at

- clients
  - id (uuid, pk)
  - name (text, not null)
  - contact_person, email, phone, address
  - created_by (uuid, fk -> auth.users)
  - created_at, updated_at

- projects
  - id (uuid, pk)
  - name, description
  - status (pending|in_progress|completed|cancelled)
  - client_id (uuid, fk -> clients, set null)
  - created_by (uuid, fk -> auth.users)
  - due_date (date)
  - created_at, updated_at

- tasks
  - id (uuid, pk)
  - project_id (uuid, fk -> projects, cascade)
  - name, description
  - status (pending|in_progress|completed)
  - priority (low|medium|high)
  - assigned_to (uuid, fk -> auth.users, set null)
  - created_by (uuid, fk -> auth.users)
  - due_date (date)
  - created_at, updated_at

- time_logs
  - id (uuid, pk)
  - task_id (uuid, fk -> tasks, cascade)
  - project_id (uuid, fk -> projects, cascade)
  - user_id (uuid, fk -> auth.users)
  - start_time, end_time (check end_time > start_time)
  - description
  - created_at, updated_at

- work_documentation
  - id (uuid, pk)
  - task_id (uuid, fk -> tasks, cascade)
  - project_id (uuid, fk -> projects, cascade)
  - user_id (uuid, fk -> auth.users)
  - photo_url, notes
  - created_at, updated_at

- document_categories
  - id (serial, pk)
  - name (text, unique)
  - description
  - created_at

- document_library
  - id (bigserial, pk)
  - name (text, not null)
  - document_code (text)
  - version (text)
  - file_url (text, not null)
  - file_type (text, not null)
  - category_id (int, fk -> document_categories)
  - created_by (uuid, fk -> auth.users)
  - created_at

- project_documents
  - id (bigserial, pk)
  - project_id (uuid, fk -> projects)
  - document_id (bigint, fk -> document_library)
  - uploaded_by (uuid, fk -> auth.users)
  - created_at

## Indexes (Key)

- projects: client_id, status, created_at
- tasks: project_id, status, priority, due_date, assigned_to
- time_logs: project_id, user_id, task_id, start_time
- document_library: category_id, created_at, created_by
- project_documents: project_id, document_id, uploaded_by

All foreign key columns are indexed.

## RLS

RLS is enabled on all tables. Application uses anon/service role accordingly. More granular policies can be added per role as needed.
