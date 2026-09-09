import { useState } from 'react'
import { Plus, Zap, Users, Moon, Sun, Gift, LogOut } from 'lucide-react'
import { useTaskStore } from './store'
import { useAuth } from './components/AuthProvider'
import { useWorkspace } from './components/WorkspaceProvider'
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
  const { user, loading: authLoading, signOut } = useAuth()
  const {
    workspace,
    workspaceMember,
    loading: workspaceLoading,
    error: workspaceError,
  } = useWorkspace()
  
  // Show loading state while checking auth
  if (authLoading) {
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
  
  // Show loading while workspace data loads
  if (workspaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading workspace...</p>
        </div>
      </div>
    )
  }
  
  // Show error if workspace failed to load
  if (workspaceError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Failed to Load Workspace</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{workspaceError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  // Show empty state if no workspace
  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Workspace Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            You don't have access to any workspaces yet. Contact your administrator to get added to a workspace.
          </p>
        </div>
      </div>
    )
  }
  
  // User is authenticated and workspace is loaded - show main app
  const view = useTaskStore((s) => s.view)
  const darkMode = useTaskStore((s) => s.darkMode)
  const toggleDarkMode = useTaskStore((s) => s.toggleDarkMode)
  const selectedEpicId = useTaskStore((s) => s.selectedEpicId)
  const selectedStoryId = useTaskStore((s) => s.selectedStoryId)
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const setSelectedEpicId = useTaskStore((s) => s.setSelectedEpicId)
  const setSelectedStoryId = useTaskStore((s) => s.setSelectedStoryId)
  const setSelectedTaskId = useTaskStore((s) => s.setSelectedTaskId)
  const notifications = useTaskStore((s) => s.notifications)

  const [showCreate, setShowCreate] = useState<{ mode: CreateMode; epicId?: string; storyId?: string } | null>(null)
  const [showUserManager, setShowUserManager] = useState(false)
  const [showVoucherRewards, setShowVoucherRewards] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

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
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">{workspace.name}</p>
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
              {workspaceMember && (
                <>
                  <PointsBadge points={workspaceMember.points || 0} size="sm" showLabel={false} />
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
        {showVoucherRewards && workspaceMember && (
          <VoucherRewards
            user={{
              id: workspaceMember.id,
              name: user.email || 'User',
              email: user.email || '',
              avatarColor: '#6366f1',
              points: workspaceMember.points || 0,
              vouchers: [], // TODO: Load vouchers from database
              createdAt: workspaceMember.created_at ?? '',
            }}
            onClose={() => setShowVoucherRewards(false)}
          />
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