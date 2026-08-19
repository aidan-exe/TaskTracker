import { useState } from 'react'
import { Plus, Zap, Users, Moon, Sun, Gift, LogOut } from 'lucide-react'
import { useTaskStore } from './store'
import { useAuth } from './components/AuthProvider'
import { AuthPage } from './components/AuthPage'
import { ThemeProvider } from './components/ThemeProvider'
import { FilterBar } from './components/FilterBar'
import { HierarchyView } from './components/HierarchyView'
import { KanbanView } from './components/KanbanView'
import { ListView } from './components/ListView'
import { AnalyticsView } from './components/AnalyticsView'
import { TaskModal } from './components/TaskModal'
import { EpicModal } from './components/EpicModal'
import { StoryModal } from './components/StoryModal'
import { CreateModal, type CreateMode } from './components/CreateModal'
import { UserManager } from './components/UserManager'
import { StatsBar } from './components/StatsBar'
import { PointsBadge } from './components/PointsBadge'
import { VoucherRewards } from './components/VoucherRewards'
import { NotificationToast } from './components/NotificationToast'
import { CelebrationAnimation } from './components/CelebrationAnimation'

export default function App() {
  const { user, loading, signOut } = useAuth()
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Show login page if not authenticated
  if (!user) {
    return <AuthPage />
  }
  
  // User is authenticated - show main app
  const view = useTaskStore((s) => s.view)
  const darkMode = useTaskStore((s) => s.darkMode)
  const toggleDarkMode = useTaskStore((s) => s.toggleDarkMode)
  const selectedEpicId = useTaskStore((s) => s.selectedEpicId)
  const selectedStoryId = useTaskStore((s) => s.selectedStoryId)
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const setSelectedEpicId = useTaskStore((s) => s.setSelectedEpicId)
  const setSelectedStoryId = useTaskStore((s) => s.setSelectedStoryId)
  const setSelectedTaskId = useTaskStore((s) => s.setSelectedTaskId)
  const users = useTaskStore((s) => s.users)
  const notifications = useTaskStore((s) => s.notifications)

  const [showCreate, setShowCreate] = useState<{ mode: CreateMode; epicId?: string; storyId?: string } | null>(null)
  const [showUserManager, setShowUserManager] = useState(false)
  const [showVoucherRewards, setShowVoucherRewards] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Get current user (first user for demo purposes)
  const currentUser = users[0]

  function openCreateStory(epicId: string) {
    setShowCreate({ mode: 'story', epicId })
  }

  function openCreateTask(storyId: string) {
    setShowCreate({ mode: 'task', storyId })
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans transition-colors">
        {/* top nav */}
        <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
                <Zap className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">TaskTracker</h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">Engineering Team</p>
              </div>
            </div>

            <nav className="flex items-center gap-3" aria-label="Main navigation">
              <span className="hidden text-xs text-slate-400 dark:text-slate-500 sm:block">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {currentUser && (
                <>
                  <PointsBadge points={currentUser.points} size="sm" showLabel={false} />
                  <button
                    type="button"
                    onClick={() => setShowVoucherRewards(true)}
                    className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors"
                    aria-label="View rewards"
                  >
                    <Gift className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setShowUserManager(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors"
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
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
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
          {view === 'analytics' && <AnalyticsView />}
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
        {showVoucherRewards && currentUser && (
          <VoucherRewards user={currentUser} onClose={() => setShowVoucherRewards(false)} />
        )}

        {/* Notification toasts - bottom-right corner */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
          {notifications
            .filter((n) => !n.dismissed)
            .slice(-3) // Show max 3 notifications
            .map((notification) => (
              <div key={notification.id} className="pointer-events-auto">
                <NotificationToast notification={notification} />
              </div>
            ))}
        </div>

        {/* Celebration animation */}
        <CelebrationAnimation show={showCelebration} onComplete={() => setShowCelebration(false)} />
      </div>
    </ThemeProvider>
  )
}
