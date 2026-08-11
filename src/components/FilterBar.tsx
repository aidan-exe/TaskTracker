import { Search, X, Layers, Kanban, List } from 'lucide-react'
import { PRIORITIES } from '../constants'
import { useTaskStore } from '../store'
import { UserAvatar } from './UserAvatar'

export function FilterBar() {
  const { filters, view, setFilters, resetFilters, setView, users, epics } = useTaskStore()

  const hasActiveFilters =
    filters.search !== '' ||
    filters.priority !== 'all' ||
    filters.epicId !== 'all' ||
    filters.assigneeId !== 'all'

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* search */}
      <div className="relative min-w-[220px] flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-400/20"
          aria-label="Search tasks"
        />
      </div>

      {/* epic filter */}
      {epics.length > 0 && (
        <select
          value={filters.epicId}
          onChange={(e) => setFilters({ epicId: e.target.value })}
          className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 pl-3 pr-8 text-sm text-slate-700 dark:text-slate-200 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-400/20"
          aria-label="Filter by epic"
        >
          <option value="all">All epics</option>
          {epics.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      )}

      {/* priority filter */}
      <select
        value={filters.priority}
        onChange={(e) =>
          setFilters({ priority: e.target.value as typeof filters.priority })
        }
        className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 pl-3 pr-8 text-sm text-slate-700 dark:text-slate-200 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-400/20"
        aria-label="Filter by priority"
      >
        <option value="all">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      {/* assignee filter */}
      {users.length > 0 && (
        <div className="flex items-center gap-1.5">
          {filters.assigneeId !== 'all' && filters.assigneeId !== 'unassigned' && (() => {
            const user = users.find((u) => u.id === filters.assigneeId)
            return user ? <UserAvatar user={user} size="sm" /> : null
          })()}
          <select
            value={filters.assigneeId}
            onChange={(e) =>
              setFilters({ assigneeId: e.target.value as typeof filters.assigneeId })
            }
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 pl-3 pr-8 text-sm text-slate-700 dark:text-slate-200 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-400/20"
            aria-label="Filter by assignee"
          >
            <option value="all">All assignees</option>
            <option value="unassigned">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      )}

      {/* spacer */}
      <div className="flex-1" />

      {/* view toggle */}
      <div
        className="flex rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-0.5"
        role="group"
        aria-label="View toggle"
      >
        <button
          type="button"
          onClick={() => setView('hierarchy')}
          aria-pressed={view === 'hierarchy'}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
            view === 'hierarchy' ? 'bg-brand-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
          }`}
        >
          <Layers className="h-4 w-4" aria-hidden="true" />
          Hierarchy
        </button>
        <button
          type="button"
          onClick={() => setView('kanban')}
          aria-pressed={view === 'kanban'}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
            view === 'kanban' ? 'bg-brand-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
          }`}
        >
          <Kanban className="h-4 w-4" aria-hidden="true" />
          Kanban
        </button>
        <button
          type="button"
          onClick={() => setView('list')}
          aria-pressed={view === 'list'}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
            view === 'list' ? 'bg-brand-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
          }`}
        >
          <List className="h-4 w-4" aria-hidden="true" />
          List
        </button>
      </div>
    </div>
  )
}
