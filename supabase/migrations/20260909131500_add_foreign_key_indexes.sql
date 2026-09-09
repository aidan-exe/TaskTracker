-- SCRUM-37 / TASK-026: Add indexes on all foreign keys
--
-- Source of truth for tables/columns (do not invent):
--   - src/lib/database.types.ts (current TypeScript schema)
--   - SUPABASE_SETUP.sql from git history (commit be070c5), which defined the
--     actual PostgreSQL FKs. That file was later removed from the repo and is
--     not applied by this migration.
--
-- Scope: CREATE INDEX only. No RLS, policies, tables, or column changes
-- (RLS is SCRUM-29).
--
-- Idempotent: CREATE INDEX IF NOT EXISTS. Safe to re-run.
--
-- How to apply (this PR does not apply indexes to a live Supabase project):
--   1. Supabase Dashboard > SQL Editor > paste this file > Run
--   2. Or, if the Supabase CLI is linked to the project:
--        supabase db push
--        -- or: supabase migration up
--
-- user_profiles.id REFERENCES auth.users(id) is the table's PRIMARY KEY, so it
-- is already indexed. No extra index is created for that FK.
-- notifications.item_id and activity_log.entity_id are not foreign keys
-- (polymorphic / untyped UUIDs) and are not indexed here.
-- activity_log exists in SUPABASE_SETUP.sql but not in database.types.ts; it
-- is indexed only if the table is present.

-- ============================================================================
-- workspace_members
--   workspace_id -> workspaces(id)
--   user_id      -> auth.users(id)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace
  ON public.workspace_members (workspace_id);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user
  ON public.workspace_members (user_id);

-- ============================================================================
-- epics
--   workspace_id -> workspaces(id)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_epics_workspace
  ON public.epics (workspace_id);

-- ============================================================================
-- stories
--   workspace_id -> workspaces(id)
--   epic_id      -> epics(id)
--   assignee_id  -> workspace_members(id)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_stories_workspace
  ON public.stories (workspace_id);

CREATE INDEX IF NOT EXISTS idx_stories_epic
  ON public.stories (epic_id);

CREATE INDEX IF NOT EXISTS idx_stories_assignee
  ON public.stories (assignee_id);

-- ============================================================================
-- tasks
--   workspace_id -> workspaces(id)
--   story_id     -> stories(id)
--   assignee_id  -> workspace_members(id)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_workspace
  ON public.tasks (workspace_id);

CREATE INDEX IF NOT EXISTS idx_tasks_story
  ON public.tasks (story_id);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee
  ON public.tasks (assignee_id);

-- ============================================================================
-- comments
--   workspace_id -> workspaces(id)
--   author_id    -> workspace_members(id)
--   story_id     -> stories(id)
--   task_id      -> tasks(id)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_comments_workspace
  ON public.comments (workspace_id);

CREATE INDEX IF NOT EXISTS idx_comments_author
  ON public.comments (author_id);

CREATE INDEX IF NOT EXISTS idx_comments_story
  ON public.comments (story_id);

CREATE INDEX IF NOT EXISTS idx_comments_task
  ON public.comments (task_id);

-- ============================================================================
-- vouchers
--   workspace_id -> workspaces(id)
--   member_id    -> workspace_members(id)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_vouchers_workspace
  ON public.vouchers (workspace_id);

CREATE INDEX IF NOT EXISTS idx_vouchers_member
  ON public.vouchers (member_id);

-- ============================================================================
-- notifications
--   workspace_id -> workspaces(id)
--   recipient_id -> workspace_members(id)
--   actor_id     -> workspace_members(id)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_notifications_workspace
  ON public.notifications (workspace_id);

-- Original schema used a composite on (recipient_id, dismissed) for inbox
-- queries. That still covers the recipient_id FK as the leading column.
CREATE INDEX IF NOT EXISTS idx_notifications_recipient
  ON public.notifications (recipient_id, dismissed);

CREATE INDEX IF NOT EXISTS idx_notifications_actor
  ON public.notifications (actor_id);

-- ============================================================================
-- activity_log (present in original SQL schema; skipped if the table is absent)
--   workspace_id -> workspaces(id)
--   user_id      -> workspace_members(id)
-- ============================================================================
DO $$
BEGIN
  IF to_regclass('public.activity_log') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_activity_log_workspace ON public.activity_log (workspace_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.activity_log (user_id)';
  END IF;
END $$;

-- After applying, you can verify with:
--   SELECT tablename, indexname
--   FROM pg_indexes
--   WHERE schemaname = 'public'
--     AND indexname LIKE 'idx_%'
--   ORDER BY tablename, indexname;
