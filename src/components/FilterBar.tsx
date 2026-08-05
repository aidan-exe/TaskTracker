import { Search, X, Kanban, List } from 'lucide-react'
import { PRIORITIES, TASK_TYPES } from '../constants'
import { useTaskStore } from '../store'

export function FilterBar() {
  const { filters, view, setFilters, resetFilters, setView } = useTaskStore()
  const hasActiveFilters =
    filters.search !== '' ||
    filters.priority !== 'all' ||
    filters.type !== 'all'

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* search */}
      <div className="relative min-w-[220px] flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          aria-label="Search tasks"
        />
      </div>

      {/* priority filter */}
      <select
        value={filters.priority}
        onChange={(e) =>
          setFilters({ priority: e.target.value as typeof filters.priority })
        }
        className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        aria-label="Filter by priority"
      >
        <option value="all">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {/* type filter */}
      <select
        value={filters.type}
        onChange={(e) =>
          setFilters({ type: e.target.value as typeof filters.type })
        }
        className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        aria-label="Filter by type"
      >
        <option value="all">All types</option>
        {TASK_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      )}

      {/* spacer */}
      <div className="flex-1" />

      {/* view toggle */}
      <div
        className="flex rounded-lg border border-slate-200 bg-white p-0.5"
        role="group"
        aria-label="View toggle"
      >
        <button
          type="button"
          onClick={() => setView('kanban')}
          aria-pressed={view === 'kanban'}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
            view === 'kanban'
              ? 'bg-brand-500 text-white'
              : 'text-slate-600 hover:bg-slate-50'
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
            view === 'list'
              ? 'bg-brand-500 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <List className="h-4 w-4" aria-hidden="true" />
          List
        </button>
      </div>
    </div>
  )
}
