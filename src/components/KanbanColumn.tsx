import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { StoryCard } from './StoryCard'
import { STATUS_HEADER_COLORS, STATUSES } from '../constants'
import type { Status, Story } from '../types'

interface Props {
  status: Status
  stories: Story[]
}

export function KanbanColumn({ status, stories }: Props) {
  const label = STATUSES.find((s) => s.value === status)?.label ?? status
  
  const { setNodeRef } = useDroppable({
    id: status,
  })

  const storyIds = stories.map((s) => s.id)

  return (
    <div
      className={`flex min-w-[280px] max-w-[320px] flex-1 flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 border-t-4 ${STATUS_HEADER_COLORS[status]}`}
    >
      {/* column header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</h2>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {stories.length}
        </span>
      </div>

      {/* cards - drop zone */}
      <SortableContext items={storyIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-3 overflow-y-auto p-3 pt-0 min-h-[200px]">
          {stories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No stories
            </div>
          ) : (
            stories.map((story) => <StoryCard key={story.id} story={story} />)
          )}
        </div>
      </SortableContext>
    </div>
  )
}
