import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTaskStore } from '../store'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { UserAvatar } from './UserAvatar'
import { ProgressBar } from './ProgressBar'

export function HierarchyView() {
  const {
    filteredEpics,
    storiesForEpic, tasksForStory,
    epicProgress, storyProgress,
    setSelectedEpicId, setSelectedStoryId, setSelectedTaskId,
    getUserById,
  } = useTaskStore()

  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set())
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set())

  const epics = filteredEpics()

  function toggleEpic(id: string) {
    setExpandedEpics((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleStory(id: string) {
    setExpandedStories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (epics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-4xl">◆</span>
          <span className="text-4xl">◈</span>
          <span className="text-4xl">✦</span>
        </div>
        <p className="text-lg font-medium">No epics found</p>
        <p className="text-sm mt-1">Try adjusting your filters or create a new epic.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {epics.map((epic) => {
        const isExpanded = expandedEpics.has(epic.id)
        const stories = storiesForEpic(epic.id)
        const progress = epicProgress(epic.id)

        return (
          <div key={epic.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            {/* Epic header */}
            <div
              className="group flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              style={{ borderLeft: `4px solid ${epic.color}` }}
            >
              <button
                type="button"
                onClick={() => toggleEpic(epic.id)}
                className="shrink-0 rounded p-0.5 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              <div className="flex-1 min-w-0" onClick={() => setSelectedEpicId(epic.id)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-md px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: epic.color }}>
                    ◆ Epic
                  </span>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">{epic.title}</h3>
                  <StatusBadge status={epic.status} />
                  <PriorityBadge priority={epic.priority} />
                </div>
                {progress.total > 0 && (
                  <div className="mt-2">
                    <ProgressBar progress={progress} size="sm" />
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{stories.length} {stories.length === 1 ? 'story' : 'stories'}</span>
              </div>
            </div>

            {/* Stories (when epic expanded) */}
            {isExpanded && (
              <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-3 space-y-2">
                {stories.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic py-2">No stories in this epic yet.</p>
                ) : (
                  stories.map((story) => {
                    const storyExpanded = expandedStories.has(story.id)
                    const tasks = tasksForStory(story.id)
                    const storyProg = storyProgress(story.id)
                    const assignee = getUserById(story.assigneeId)

                    return (
                      <div key={story.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                        {/* Story header */}
                        <div className="group flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <button
                            type="button"
                            onClick={() => toggleStory(story.id)}
                            className="shrink-0 rounded p-0.5 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                            aria-label={storyExpanded ? 'Collapse' : 'Expand'}
                          >
                            {storyExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>

                          <div className="flex-1 min-w-0" onClick={() => setSelectedStoryId(story.id)}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="rounded-md bg-violet-100 dark:bg-violet-900 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                                ◈ Story
                              </span>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{story.title}</p>
                              <StatusBadge status={story.status} />
                              <PriorityBadge priority={story.priority} />
                            </div>
                            {storyProg.total > 0 && (
                              <div className="mt-1.5">
                                <ProgressBar progress={storyProg} size="sm" />
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {assignee && <UserAvatar user={assignee} size="sm" />}
                            <span className="text-xs text-slate-500 dark:text-slate-400">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
                          </div>
                        </div>

                        {/* Tasks (when story expanded) */}
                        {storyExpanded && (
                          <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-2 space-y-1.5">
                            {tasks.length === 0 ? (
                              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">No tasks in this story yet.</p>
                            ) : (
                              tasks.map((task) => {
                                const taskAssignee = getUserById(task.assigneeId)
                                return (
                                  <button
                                    key={task.id}
                                    type="button"
                                    onClick={() => setSelectedTaskId(task.id)}
                                    className="w-full text-left flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                                  >
                                    <span className="text-slate-400 dark:text-slate-500 text-xs">✦</span>
                                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 truncate">{task.title}</span>
                                    <div className="shrink-0 flex items-center gap-2">
                                      {taskAssignee && <UserAvatar user={taskAssignee} size="sm" />}
                                      <StatusBadge status={task.status} />
                                      {task.storyPoints !== null && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                          {task.storyPoints}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                )
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
