import { useState } from 'react'
import { Plus, Zap, Users } from 'lucide-react'
import { useTaskStore } from './store'
import { FilterBar } from './components/FilterBar'
import { HierarchyView } from './components/HierarchyView'
import { KanbanView } from './components/KanbanView'
import { ListView } from './components/ListView'
import { TaskModal } from './components/TaskModal'
import { EpicModal } from './components/EpicModal'
import { StoryModal } from './components/StoryModal'
import { CreateModal, type CreateMode } from './components/CreateModal'
import { UserManager } from './components/UserManager'
import { StatsBar } from './components/StatsBar'

export default function App() {
  const view = useTaskStore((s) => s.view)
  const selectedEpicId = useTaskStore((s) => s.selectedEpicId)
  const selectedStoryId = useTaskStore((s) => s.selectedStoryId)
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const setSelectedEpicId = useTaskStore((s) => s.setSelectedEpicId)
  const setSelectedStoryId = useTaskStore((s) => s.setSelectedStoryId)
  const setSelectedTaskId = useTaskStore((s) => s.setSelectedTaskId)

  const [showCreate, setShowCreate] = useState<{ mode: CreateMode; epicId?: string; storyId?: string } | null>(null)
  const [showUserManager, setShowUserManager] = useState(false)

  function openCreateStory(epicId: string) {
    setShowCreate({ mode: 'story', epicId })
  }

  function openCreateTask(storyId: string) {
    setShowCreate({ mode: 'task', storyId })
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* top nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Zap className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">TaskTracker</h1>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">Engineering Team</p>
            </div>
          </div>

          <nav className="flex items-center gap-3" aria-label="Main navigation">
            <span className="hidden text-xs text-slate-400 sm:block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <button
              type="button"
              onClick={() => setShowUserManager(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors"
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              Team
            </button>
            <button
              type="button"
              onClick={() => setShowCreate({ mode: 'task' })}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New
            </button>
          </nav>
        </div>
      </header>

      {/* main content */}
      <main className="mx-auto max-w-screen-2xl px-6 py-6 space-y-5">
        {/* stats */}
        <StatsBar />

        {/* filters + view toggle */}
        <FilterBar />

        {/* view */}
        {view === 'hierarchy' && <HierarchyView />}
        {view === 'kanban' && <KanbanView />}
        {view === 'list' && <ListView />}
      </main>

      {/* modals */}
      {selectedEpicId && (
        <EpicModal
          epicId={selectedEpicId}
          onClose={() => setSelectedEpicId(null)}
          onAddStory={openCreateStory}
        />
      )}
      {selectedStoryId && (
        <StoryModal
          storyId={selectedStoryId}
          onClose={() => setSelectedStoryId(null)}
          onAddTask={openCreateTask}
        />
      )}
      {selectedTaskId && (
        <TaskModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
      {showCreate && (
        <CreateModal
          initialMode={showCreate.mode}
          initialEpicId={showCreate.epicId}
          initialStoryId={showCreate.storyId}
          onClose={() => setShowCreate(null)}
        />
      )}
      {showUserManager && <UserManager onClose={() => setShowUserManager(false)} />}
    </div>
  )
}
