-- ============================================================================
-- SCRUM-29 smoke tests — run AFTER applying the RLS migration
-- ============================================================================
--
-- This file does not invent a green database state. It only inspects catalog
-- metadata (safe) and lists the authenticated-user checks to run in the app
-- or SQL editor as a signed-in user.
--
-- Apply order:
--   1. supabase/migrations/20260909131600_fix_rls_policies_no_recursion.sql
--   2. This file (section A in SQL Editor as postgres / dashboard)
--   3. Section B in the running TaskTracker app as two Google-auth users
-- ============================================================================

-- A. Catalog checks (SQL Editor, no end-user JWT required)
-- Expect: 0 rows. Any hit means a policy still subqueries workspace_members
-- as the invoker and can recurse.
SELECT
  tablename,
  policyname,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'workspace_members'
  AND (
    COALESCE(qual, '') ~* 'from[[:space:]]+workspace_members'
    OR COALESCE(with_check, '') ~* 'from[[:space:]]+workspace_members'
  );

-- Expect: prosecdef = true, and search_path pinned to public.
SELECT
  p.proname,
  p.prosecdef AS security_definer,
  pg_get_function_identity_arguments(p.oid) AS args,
  array_to_string(p.proconfig, ', ') AS config
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'is_workspace_member',
    'is_workspace_admin',
    'is_own_membership'
  )
ORDER BY p.proname;

-- Expect: RLS enabled on all app tables that exist.
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'workspaces',
    'workspace_members',
    'user_profiles',
    'epics',
    'stories',
    'tasks',
    'comments',
    'vouchers',
    'notifications',
    'activity_log'
  )
ORDER BY c.relname;

-- Expect: policies exist for the tables the app queries.
SELECT tablename, cmd, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'workspaces',
    'workspace_members',
    'epics',
    'stories',
    'tasks',
    'comments'
  )
ORDER BY tablename, cmd, policyname;

-- B. App smoke tests (cannot be executed here — no live Supabase credentials)
-- As authenticated workspace member A:
--   1. Sign in. Home should load without "Failed to Load Workspace" / 500s.
--   2. Confirm epics, stories, tasks, comments lists return 200 (empty is OK).
--   3. Create an epic, a story under it, a task under the story, a comment.
--   4. Update each; delete the comment; confirm no 500s.
-- As authenticated user B (not a member of A's workspace):
--   5. Must not see A's workspace in the workspace list.
--   6. Direct reads of A's epic/story/task ids must return empty / 0 rows,
--      not 500.
-- As workspace admin:
--   7. Insert a workspace_members row for user B; B can then load the workspace.
