-- Remove All Demo Data - Start Fresh
-- Run this script in your Supabase SQL Editor to clean out demo/test data

-- Delete all work documentation
DELETE FROM work_documentation;

-- Delete all time logs
DELETE FROM time_logs;

-- Delete all tasks
DELETE FROM tasks;

-- Delete all project documents
DELETE FROM project_documents;

-- Delete all projects
DELETE FROM projects;

-- Delete all clients
DELETE FROM clients;

-- Delete all documents from library
DELETE FROM document_library;

-- Note: We keep document_categories (the 9 standard categories)
-- Note: We keep user profiles (your account will remain)

-- Verify cleanup
SELECT
  'work_documentation' as table_name, COUNT(*) as remaining_rows FROM work_documentation
UNION ALL
SELECT 'time_logs', COUNT(*) FROM time_logs
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'project_documents', COUNT(*) FROM project_documents
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'document_library', COUNT(*) FROM document_library
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'document_categories', COUNT(*) FROM document_categories;

-- Success message
SELECT 'Demo data cleaned! Ready to add real data.' as status;
