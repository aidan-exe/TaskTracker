-- ============================================================================
-- SCRUM-29 / TASK-018: Fix circular RLS policies causing 500 errors
-- ============================================================================
--
-- WHAT WAS WRONG
--   Policies on public.workspace_members used FOR ALL with a subquery
--   against workspace_members itself. Postgres re-evaluates RLS on that
--   subquery, which re-enters the same policy → infinite recursion.
--   PostgREST surfaces this as HTTP 500 on almost every app query
--   (workspaces, members, epics, stories, tasks, comments), because those
--   tables' policies also read workspace_members.
--
--   The original helper is_workspace_member() was SECURITY DEFINER (good),
--   but the overlapping FOR ALL policy did NOT use it, so recursion still
--   happened on SELECT.
--
-- HOW THIS FIX WORKS
--   1. Drop every policy on the app tables (covers leftover ad-hoc scripts).
--   2. Recreate membership checks as SECURITY DEFINER SQL functions with a
--      fixed search_path so they read workspace_members WITHOUT RLS.
--   3. Never subquery workspace_members from a workspace_members policy.
--   4. Let users always SELECT their own membership rows (user_id = auth.uid())
--      so listing workspaces cannot recurse.
--
-- HOW TO APPLY (pick one)
--   A. Supabase Dashboard → SQL Editor → paste this entire file → Run.
--   B. Supabase CLI (if the project is linked):
--        supabase db push
--      or apply this file as a migration.
--
-- Safe to re-run: drops policies by name/discovery, CREATE OR REPLACE
-- functions, DROP TRIGGER IF EXISTS.
-- ============================================================================

-- Membership helpers must bypass RLS. Do not add table-qualifying subqueries
-- of workspace_members inside policies on workspace_members.

CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = workspace_uuid
      AND user_id = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(workspace_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = workspace_uuid
      AND user_id = (SELECT auth.uid())
      AND role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_own_membership(member_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE id = member_uuid
      AND user_id = (SELECT auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION public.is_workspace_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_workspace_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_own_membership(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_workspace_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_own_membership(uuid) TO authenticated;

-- Auto-add the creator as workspace owner. Runs as definer so the INSERT
-- into workspace_members does not require an existing membership (chicken/egg).
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Client-created workspaces: attach the signed-in user as owner.
  -- SQL Editor / service-role inserts have no JWT; skip so seeds still work.
  IF (SELECT auth.uid()) IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, (SELECT auth.uid()), 'owner');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_workspace();

-- Members may update points (gamification) but must not change role / identity
-- unless they are an owner or admin. Enforced here so RLS UPDATE can stay
-- non-recursive.
CREATE OR REPLACE FUNCTION public.prevent_member_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id THEN
    IF NOT public.is_workspace_admin(OLD.workspace_id) THEN
      RAISE EXCEPTION 'Only workspace owners/admins can change membership role or identity';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workspace_members_prevent_role_escalation ON public.workspace_members;
CREATE TRIGGER workspace_members_prevent_role_escalation
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_member_role_escalation();

-- Drop every existing policy on app tables (broken + leftover experiments).
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
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
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      pol.policyname,
      pol.schemaname,
      pol.tablename
    );
  END LOOP;
END
$$;

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------------------------
CREATE POLICY workspaces_select
  ON public.workspaces
  FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(id));

CREATE POLICY workspaces_insert
  ON public.workspaces
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY workspaces_update
  ON public.workspaces
  FOR UPDATE
  TO authenticated
  USING (public.is_workspace_admin(id))
  WITH CHECK (public.is_workspace_admin(id));

CREATE POLICY workspaces_delete
  ON public.workspaces
  FOR DELETE
  TO authenticated
  USING (public.is_workspace_admin(id));

-- ---------------------------------------------------------------------------
-- workspace_members
-- Own-row SELECT has no subquery (bootstrap for useWorkspaces).
-- Teammate SELECT uses SECURITY DEFINER helper — not a direct table scan.
-- ---------------------------------------------------------------------------
CREATE POLICY workspace_members_select_own
  ON public.workspace_members
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY workspace_members_select_teammates
  ON public.workspace_members
  FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY workspace_members_insert
  ON public.workspace_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_admin(workspace_id));

CREATE POLICY workspace_members_update
  ON public.workspace_members
  FOR UPDATE
  TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY workspace_members_delete
  ON public.workspace_members
  FOR DELETE
  TO authenticated
  USING (
    public.is_workspace_admin(workspace_id)
    OR user_id = (SELECT auth.uid())
  );

-- ---------------------------------------------------------------------------
-- user_profiles
-- ---------------------------------------------------------------------------
CREATE POLICY user_profiles_select
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY user_profiles_insert
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY user_profiles_update
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- epics / stories / tasks — workspace members have full CRUD
-- ---------------------------------------------------------------------------
CREATE POLICY epics_select
  ON public.epics FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY epics_insert
  ON public.epics FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY epics_update
  ON public.epics FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY epics_delete
  ON public.epics FOR DELETE TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY stories_select
  ON public.stories FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY stories_insert
  ON public.stories FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY stories_update
  ON public.stories FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY stories_delete
  ON public.stories FOR DELETE TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY tasks_select
  ON public.tasks FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY tasks_insert
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY tasks_update
  ON public.tasks FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY tasks_delete
  ON public.tasks FOR DELETE TO authenticated
  USING (public.is_workspace_member(workspace_id));

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
CREATE POLICY comments_select
  ON public.comments FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY comments_insert
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (
    public.is_workspace_member(workspace_id)
    AND public.is_own_membership(author_id)
  );

CREATE POLICY comments_delete
  ON public.comments FOR DELETE TO authenticated
  USING (
    public.is_own_membership(author_id)
    OR public.is_workspace_admin(workspace_id)
  );

-- ---------------------------------------------------------------------------
-- vouchers
-- ---------------------------------------------------------------------------
CREATE POLICY vouchers_select
  ON public.vouchers FOR SELECT TO authenticated
  USING (public.is_own_membership(member_id));

CREATE POLICY vouchers_insert
  ON public.vouchers FOR INSERT TO authenticated
  WITH CHECK (
    public.is_workspace_member(workspace_id)
    AND public.is_own_membership(member_id)
  );

CREATE POLICY vouchers_update
  ON public.vouchers FOR UPDATE TO authenticated
  USING (public.is_own_membership(member_id))
  WITH CHECK (public.is_own_membership(member_id));

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
CREATE POLICY notifications_select
  ON public.notifications FOR SELECT TO authenticated
  USING (public.is_own_membership(recipient_id));

CREATE POLICY notifications_insert
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY notifications_update
  ON public.notifications FOR UPDATE TO authenticated
  USING (public.is_own_membership(recipient_id))
  WITH CHECK (public.is_own_membership(recipient_id));

-- ---------------------------------------------------------------------------
-- activity_log (present in original schema; skip if the table was never created)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.activity_log') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY';

    EXECUTE $sql$
      CREATE POLICY activity_log_select
        ON public.activity_log FOR SELECT TO authenticated
        USING (public.is_workspace_member(workspace_id))
    $sql$;

    EXECUTE $sql$
      CREATE POLICY activity_log_insert
        ON public.activity_log FOR INSERT TO authenticated
        WITH CHECK (public.is_workspace_member(workspace_id))
    $sql$;
  END IF;
END
$$;
