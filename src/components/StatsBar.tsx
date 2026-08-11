import { useTaskStore } from '../store'

export function StatsBar() {
  const { epics, stories, tasks } = useTaskStore()

  const totalEpics = epics.length
  const totalStories = stories.length
  const totalTasks = tasks.length

  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const doneStories = stories.filter((s) => s.status === 'done').length
  const doneEpics = epics.filter((e) => e.status === 'done').length

  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length
  const criticalTasks = tasks.filter((t) => t.priority === 'critical' && t.status !== 'done').length
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length

  const overallProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-6">
        {/* hierarchy counts */}
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalEpics}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Epics</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{totalStories}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Stories</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{totalTasks}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Tasks</span>
        </div>

        {/* vertical divider */}
        <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />

        {/* task metrics */}
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{inProgressTasks}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">In Progress</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{doneTasks}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Done</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalTasks}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Critical</span>
        </div>
        {overdueTasks > 0 && (
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-red-500 dark:text-red-400">{overdueTasks}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Overdue</span>
          </div>
        )}

        {/* progress */}
        {totalTasks > 0 && (
          <>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="ml-auto flex min-w-[180px] flex-col gap-1.5">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Overall progress</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{overallProgress}%</span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="bg-emerald-500 dark:bg-emerald-400 transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="flex gap-3 text-[10px] text-slate-400 dark:text-slate-500">
                <span>{doneEpics}/{totalEpics} epics</span>
                <span>{doneStories}/{totalStories} stories</span>
                <span>{doneTasks}/{totalTasks} tasks</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
