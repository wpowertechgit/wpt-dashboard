-- Office task board: tasks and comments

CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority    TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
  status      TEXT NOT NULL DEFAULT 'TODO'   CHECK (status IN ('TODO','IN_PROGRESS','DONE')),
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.task_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE OR REPLACE TRIGGER set_updated_at_tasks
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_created_by_idx  ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS task_comments_task_idx ON public.task_comments(task_id);

-- RLS
ALTER TABLE public.tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Tasks: any authenticated user with office access can read all tasks
CREATE POLICY tasks_read ON public.tasks
  FOR SELECT TO authenticated
  USING (private.can_read_office());

-- Insert: office-capable roles (frontend additionally checks create_tasks permission)
CREATE POLICY tasks_insert ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (private.can_write_office());

-- Update: users can update tasks assigned to them (status change) OR if they can_write_office
CREATE POLICY tasks_update ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    (select auth.uid()) = assigned_to
    OR (select auth.uid()) = created_by
    OR private.is_admin()
  )
  WITH CHECK (
    (select auth.uid()) = assigned_to
    OR (select auth.uid()) = created_by
    OR private.is_admin()
  );

-- Delete: admin only
CREATE POLICY tasks_delete ON public.tasks
  FOR DELETE TO authenticated
  USING (private.is_admin());

-- Comments: read if can read tasks
CREATE POLICY task_comments_read ON public.task_comments
  FOR SELECT TO authenticated
  USING (private.can_read_office());

-- Comment insert: any office-zone user
CREATE POLICY task_comments_insert ON public.task_comments
  FOR INSERT TO authenticated
  WITH CHECK (private.can_write_office() OR (select auth.uid()) IN (
    SELECT assigned_to FROM public.tasks WHERE id = task_id
    UNION
    SELECT created_by  FROM public.tasks WHERE id = task_id
  ));

-- Comment delete: own comment or admin
CREATE POLICY task_comments_delete ON public.task_comments
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = author_id OR private.is_admin());
