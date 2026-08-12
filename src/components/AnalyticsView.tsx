import { TrendingUp, Trophy, Target, Users, CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react'
import { useTaskStore } from '../store'
import type { Status, Priority } from '../types'

export function AnalyticsView() {
  const { epics, stories, tasks, users } = useTaskStore()

  // ── Status Distribution ─────────────────────────────────────────────────
  const statusCounts = {
    backlog: tasks.filter((t) => t.status === 'backlog').length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    in_review: tasks.filter((t) => t.status === 'in_review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((statusCounts.done / totalTasks) * 100) : 0

  // ── Priority Distribution ───────────────────────────────────────────────
  const priorityCounts = {
    critical: tasks.filter((t) => t.priority === 'critical').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  }

  // ── User Leaderboard ────────────────────────────────────────────────────
  const userStats = users
    .map((user) => {
      const userTasks = tasks.filter((t) => t.assigneeId === user.id)
      const completedTasks = userTasks.filter((t) => t.status === 'done').length
      const userStories = stories.filter((s) => s.assigneeId === user.id)
      const completedStories = userStories.filter((s) => s.status === 'done').length
      
      return {
        user,
        totalAssigned: userTasks.length + userStories.length,
        completedTasks,
        completedStories,
        completionRate: userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0,
      }
    })
    .sort((a, b) => b.user.points - a.user.points)

  // ── Epic Progress ───────────────────────────────────────────────────────
  const epicStats = epics.map((epic) => {
    const epicStories = stories.filter((s) => s.epicId === epic.id)
    const epicTasks = tasks.filter((t) => {
      const story = stories.find((s) => s.id === t.storyId)
      return story?.epicId === epic.id
    })
    const doneTasks = epicTasks.filter((t) => t.status === 'done').length
    const progress = epicTasks.length > 0 ? Math.round((doneTasks / epicTasks.length) * 100) : 0

    return {
      epic,
      storiesCount: epicStories.length,
      tasksCount: epicTasks.length,
      doneTasks,
      progress,
    }
  })

  // ── Story Points ────────────────────────────────────────────────────────
  const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
  const completedStoryPoints = tasks
    .filter((t) => t.status === 'done')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0)

  // ── Status Colors ───────────────────────────────────────────────────────
  const statusColors: Record<Status, string> = {
    backlog: 'bg-slate-200 dark:bg-slate-700',
    todo: 'bg-blue-200 dark:bg-blue-900',
    in_progress: 'bg-amber-200 dark:bg-amber-900',
    in_review: 'bg-purple-200 dark:bg-purple-900',
    done: 'bg-emerald-200 dark:bg-emerald-900',
  }

  const statusLabels: Record<Status, string> = {
    backlog: 'Backlog',
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
  }

  // ── Priority Colors ─────────────────────────────────────────────────────
  const priorityColors: Record<Priority, string> = {
    critical: 'bg-red-200 dark:bg-red-900',
    high: 'bg-orange-200 dark:bg-orange-900',
    medium: 'bg-yellow-200 dark:bg-yellow-900',
    low: 'bg-green-200 dark:bg-green-900',
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Target className="w-5 h-5" />}
          label="Total Tasks"
          value={totalTasks}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
        />
        <MetricCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Completed"
          value={statusCounts.done}
          subtitle={`${completionRate}% completion rate`}
          color="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          label="In Progress"
          value={statusCounts.in_progress}
          color="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-100 dark:bg-amber-900/30"
        />
        <MetricCard
          icon={<Trophy className="w-5 h-5" />}
          label="Story Points"
          value={`${completedStoryPoints}/${totalStoryPoints}`}
          color="text-purple-600 dark:text-purple-400"
          bgColor="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            Task Status Distribution
          </h3>
          <div className="space-y-3">
            {(Object.keys(statusCounts) as Status[]).map((status) => {
              const count = statusCounts[status]
              const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {statusLabels[status]}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColors[status]} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-brand-500" />
            Priority Distribution
          </h3>
          <div className="space-y-3">
            {(Object.keys(priorityCounts) as Priority[]).map((priority) => {
              const count = priorityCounts[priority]
              const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0
              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {priority}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${priorityColors[priority]} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Epic Progress */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-500" />
          Epic Progress
        </h3>
        <div className="space-y-4">
          {epicStats.map(({ epic, storiesCount, tasksCount, doneTasks, progress }) => (
            <div key={epic.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {epic.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {storiesCount} stories · {tasksCount} tasks · {doneTasks} completed
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {progress}%
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
          {epicStats.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No epics yet. Create one to start tracking progress.
            </p>
          )}
        </div>
      </div>

      {/* User Leaderboard */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-500" />
          Team Leaderboard
        </h3>
        <div className="space-y-3">
          {userStats.map((stat, index) => (
            <div
              key={stat.user.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50"
            >
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-lg font-bold text-slate-400 dark:text-slate-500">
                  #{index + 1}
                </span>
              </div>
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: stat.user.avatarColor }}
              >
                {stat.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {stat.user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stat.completedTasks} tasks · {stat.completedStories} stories · {stat.completionRate}% completion
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {stat.user.points}
                </span>
              </div>
            </div>
          ))}
          {userStats.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No team members yet. Add users to see the leaderboard.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MetricCard Component ──────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  subtitle?: string
  color: string
  bgColor: string
}

function MetricCard({ icon, label, value, subtitle, color, bgColor }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`${bgColor} ${color} p-2.5 rounded-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</h3>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
  )
}
