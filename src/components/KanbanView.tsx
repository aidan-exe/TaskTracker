import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { useState } from 'react'
import { useSupabaseStore } from '../hooks/useSupabaseStore'
import { KanbanColumn } from './KanbanColumn'
import { StoryCard } from './StoryCard'
import { STATUSES } from '../constants'
import type { Status, Story } from '../types'

export function KanbanView() {
  const { filteredStories, moveStory } = useSupabaseStore()
  const stories = filteredStories()
  const [activeStory, setActiveStory] = useState<Story | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  )

  function handleDragStart(event: any) {
    const story = stories.find((s) => s.id === event.active.id)
    if (story) setActiveStory(story)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveStory(null)

    if (!over) return

    const storyId = active.id as string
    const newStatus = over.id as Status

    // Move the story to the new status column
    moveStory(storyId, newStatus)
  }

  function handleDragCancel() {
    setActiveStory(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((s) => (
          <KanbanColumn
            key={s.value}
            status={s.value as Status}
            stories={stories.filter((story) => story.status === s.value)}
          />
        ))}
      </div>

      {/* Drag overlay - shows the story being dragged */}
      <DragOverlay>
        {activeStory ? (
          <div className="opacity-90 rotate-3 scale-105">
            <StoryCard story={activeStory} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
