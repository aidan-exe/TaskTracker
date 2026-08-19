-- TaskTracker Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- WORKSPACES (Teams/Organizations)
-- ============================================================================
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WORKSPACE MEMBERS (Who belongs to which workspace)
-- ============================================================================
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- ============================================================================
-- USER PROFILES (Extended user info)
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  avatar_color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EPICS
-- ============================================================================
CREATE TABLE epics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  color TEXT DEFAULT '#6366f1',
  labels TEXT[] DEFAULT '{}',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STORIES
-- ============================================================================
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  epic_id UUID REFERENCES epics(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  labels TEXT[] DEFAULT '{}',
  story_points INTEGER,
  assignee_id UUID REFERENCES workspace_members(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TASKS
-- ============================================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  labels TEXT[] DEFAULT '{}',
  story_points INTEGER,
  assignee_id UUID REFERENCES workspace_members(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMMENTS (for both stories and tasks)
-- ============================================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES workspace_members(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((story_id IS NOT NULL AND task_id IS NULL) OR (story_id IS NULL AND task_id IS NOT NULL))
);

-- ============================================================================
-- VOUCHERS
-- ============================================================================
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES workspace_members(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('coffee', 'cappuccino')),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES workspace_members(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES workspace_members(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('status_change', 'points_awarded', 'voucher_redeemed', 'comment_added', 'assigned')),
  message TEXT NOT NULL,
  item_type TEXT CHECK (item_type IN ('story', 'task', 'voucher', 'epic')),
  item_id UUID,
  old_status TEXT,
  new_status TEXT,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY LOG (Audit trail)
-- ============================================================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES workspace_members(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_epics_workspace ON epics(workspace_id);
CREATE INDEX idx_stories_workspace ON stories(workspace_id);
CREATE INDEX idx_stories_epic ON stories(epic_id);
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_story ON tasks(story_id);
CREATE INDEX idx_comments_story ON comments(story_id);
CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, dismissed);
CREATE INDEX idx_activity_log_workspace ON activity_log(workspace_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is workspace member
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- WORKSPACES: Users can only see workspaces they're members of
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Workspace owners can update"
  ON workspaces FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- WORKSPACE MEMBERS: Users can see members of their workspaces
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace owners can manage members"
  ON workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- USER PROFILES: Users can view all profiles, but only update their own
CREATE POLICY "Anyone can view user profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- EPICS, STORIES, TASKS: Users can only see items in their workspaces
CREATE POLICY "Users can view workspace epics"
  ON epics FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Users can manage workspace epics"
  ON epics FOR ALL
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Users can view workspace stories"
  ON stories FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Users can manage workspace stories"
  ON stories FOR ALL
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Users can view workspace tasks"
  ON tasks FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Users can manage workspace tasks"
  ON tasks FOR ALL
  USING (is_workspace_member(workspace_id));

-- COMMENTS: Users can see and manage comments in their workspaces
CREATE POLICY "Users can view workspace comments"
  ON comments FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Users can create comments in their workspaces"
  ON comments FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (
    is_workspace_member(workspace_id)
    AND EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.id = comments.author_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- VOUCHERS: Users can only see their own vouchers
CREATE POLICY "Users can view their vouchers"
  ON vouchers FOR SELECT
  USING (
    is_workspace_member(workspace_id)
    AND EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.id = vouchers.member_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create vouchers"
  ON vouchers FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

-- NOTIFICATIONS: Users can only see their own notifications
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.id = notifications.recipient_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.id = notifications.recipient_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

-- ACTIVITY LOG: Users can view their workspace activity
CREATE POLICY "Users can view workspace activity"
  ON activity_log FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "System can log activity"
  ON activity_log FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, avatar_color)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    '#6366f1'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: Auto-update updated_at
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_epics_updated_at BEFORE UPDATE ON epics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REALTIME SUBSCRIPTIONS (Enable realtime for tables)
-- ============================================================================
-- Run this in SQL Editor OR enable via Supabase Dashboard > Database > Replication

ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE epics;
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE vouchers;

-- ============================================================================
-- DONE! 🎉
-- ============================================================================
-- Next steps:
-- 1. Go to Supabase Dashboard > Authentication > Providers
-- 2. Enable Google OAuth
-- 3. Copy your Supabase URL and anon key
-- 4. Add them to your .env.local file
