import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useTaskStore } from '../store'
import { STATUSES, PRIORITIES, EPIC_COLORS } from '../constants'
import { UserAvatar } from './UserAvatar'
import type { Status, Priority } from '../types'

export type CreateMode = 'epic' | 'story' | 'task'

interface Props {
  initialMode?: CreateMode
  /** Pre-select an epic when opening in story mode */
  initialEpicId?: string
  /** Pre-select a story when opening in task mode */
  initialStoryId?: string
  onClose: () => void
}

const fieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'
const labelClass =
  'block text-xs font-medium uppercase tracking-wide text-slate-400 mb-1'

const TABS: { mode: CreateMode; icon: string; label: string; color: string }[] = [
  { mode: 'epic',  icon: '◆', label: 'Epic',  color: 'text-indigo-600' },
  { mode: 'story', icon: '◈', label: 'Story', color: 'text-violet-600' },
  { mode: 'task',  icon: '✦', label: 'Task',  color: 'text-slate-600'  },
]

export function CreateModal({ initialMode = 'task', initialEpicId, initialStoryId, onClose }: Props) {
  const { epics, stories, users, addEpic, addStory, addTask, setSelectedEpicId, setSelectedStoryId, setSelectedTaskId } = useTaskStore()

  const [mode, setMode] = useState<CreateMode>(initialMode)

  // shared fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('backlog')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [labelInput, setLabelInput] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [error, setError] = useState('')

  // epic-specific
  const [epicColor, setEpicColor] = useState(EPIC_COLORS[0].value)

  // story-specific
  const [epicId, setEpicId] = useState(initialEpicId ?? '')
  const [storyPoints, setStoryPoints] = useState('')
  const [assigneeId, setAssigneeId] = useState('')

  // task-specific
  const [storyId, setStoryId] = useState(initialStoryId ?? '')

  // stories filtered by selected epic (for task creation)
  const storiesForEpic = epicId ? stories.filter((s) => s.epicId === epicId) : stories

  function handleAddLabel(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = labelInput.trim().toLowerCase()
      if (val && !labels.includes(val)) setLabels([...labels, val])
      setLabelInput('')
    }
  }

  function handleModeChange(m: CreateMode) {
    setMode(m)
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }

    if (mode === 'epic') {
      const id = addEpic({
        title: title.trim(), description, status, priority,
        color: epicColor, labels,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      })
      onClose()
      setSelectedEpicId(id)
      return
    }

    if (mode === 'story') {
      if (!epicId) { setError('Please select an Epic.'); return }
      const id = addStory({
        epicId, title: title.trim(), description, status, priority,
        storyPoints: storyPoints ? parseInt(storyPoints, 10) : null,
        assigneeId: assigneeId || null, labels,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      })
      onClose()
      setSelectedStoryId(id)
      return
    }

    if (mode === 'task') {
      if (!storyId) { setError('Please select a User Story.'); return }
      const id = addTask({
        storyId, title: title.trim(), description, status, priority,
        storyPoints: storyPoints ? parseInt(storyPoints, 10) : null,
        assigneeId: assigneeId || null, labels,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      })
      onClose()
      setSelectedTaskId(id)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Create new ${mode}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Create New</h2>
          <button type="button" onClick={onClose}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* type tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.mode}
              type="button"
              onClick={() => handleModeChange(tab.mode)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus:outline-none ${
                mode === tab.mode
                  ? `border-brand-500 ${tab.color}`
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {/* parent selectors */}
          {mode === 'story' && (
            <div>
              <label htmlFor="create-epic" className={labelClass}>
                Epic <span className="text-red-400">*</span>
              </label>
              <select id="create-epic" value={epicId}
                onChange={(e) => { setEpicId(e.target.value); setError('') }}
                className={fieldClass}>
                <option value="">— Select an Epic —</option>
                {epics.map((ep) => <option key={ep.id} value={ep.id}>{ep.title}</option>)}
              </select>
              {epics.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">No epics yet — create one first.</p>
              )}
            </div>
          )}

          {mode === 'task' && (
            <div className="space-y-3">
              {/* epic picker to narrow story list */}
              <div>
                <label htmlFor="create-task-epic" className={labelClass}>Epic (optional filter)</label>
                <select id="create-task-epic" value={epicId}
                  onChange={(e) => { setEpicId(e.target.value); setStoryId('') }}
                  className={fieldClass}>
                  <option value="">All Epics</option>
                  {epics.map((ep) => <option key={ep.id} value={ep.id}>{ep.title}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="create-story" className={labelClass}>
                  User Story <span className="text-red-400">*</span>
                </label>
                <select id="create-story" value={storyId}
                  onChange={(e) => { setStoryId(e.target.value); setError('') }}
                  className={fieldClass}>
                  <option value="">— Select a Story —</option>
                  {storiesForEpic.map((st) => <option key={st.id} value={st.id}>{st.title}</option>)}
                </select>
                {stories.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">No stories yet — create a story first.</p>
                )}
              </div>
            </div>
          )}

          {/* title */}
          <div>
            <label htmlFor="create-title" className={labelClass}>
              Title <span className="text-red-400">*</span>
            </label>
            <input id="create-title" value={title}
              onChange={(e) => { setTitle(e.target.value); if (error) setError('') }}
              placeholder={
                mode === 'epic'  ? 'e.g. Payment System' :
                mode === 'story' ? 'e.g. As a user, I can pay by card' :
                'e.g. Integrate Stripe API'
              }
              className={fieldClass} aria-required="true"
              aria-describedby={error ? 'create-error' : undefined} />
            {error && (
              <p id="create-error" role="alert" className="mt-1 text-xs text-red-500">{error}</p>
            )}
          </div>

          {/* description */}
          <div>
            <label htmlFor="create-desc" className={labelClass}>Description</label>
            <textarea id="create-desc" value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3} placeholder="Add more context…" className={fieldClass} />
          </div>

          {/* status + priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="create-status" className={labelClass}>Status</label>
              <select id="create-status" value={status}
                onChange={(e) => setStatus(e.target.value as Status)} className={fieldClass}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="create-priority" className={labelClass}>Priority</label>
              <select id="create-priority" value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)} className={fieldClass}>
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* story points + assignee (story & task only) */}
          {(mode === 'story' || mode === 'task') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="create-sp" className={labelClass}>Story Points</label>
                <input id="create-sp" type="number" min={0} max={100} value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  placeholder="—" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="create-assignee" className={labelClass}>Assignee</label>
                {users.length === 0 ? (
                  <p className="text-xs text-slate-400 italic mt-2">No users yet.</p>
                ) : (
                  <div className="flex items-center gap-2">
                    {assigneeId && users.find((u) => u.id === assigneeId) && (
                      <UserAvatar user={users.find((u) => u.id === assigneeId)!} size="sm" showTooltip={false} />
                    )}
                    <select id="create-assignee" value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)} className={fieldClass}>
                      <option value="">Unassigned</option>
                      {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* epic color picker */}
          {mode === 'epic' && (
            <div>
              <label className={labelClass}>Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {EPIC_COLORS.map((c) => (
                  <button key={c.value} type="button" onClick={() => setEpicColor(c.value)}
                    className={`h-7 w-7 rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
                      epicColor === c.value ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-50' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.label} aria-pressed={epicColor === c.value} />
                ))}
              </div>
            </div>
          )}

          {/* due date */}
          <div>
            <label htmlFor="create-due" className={labelClass}>Due Date</label>
            <input id="create-due" type="date" value={dueDate}
              onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
          </div>

          {/* labels */}
          <div>
            <label htmlFor="create-labels" className={labelClass}>Labels</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {labels.map((l) => (
                <span key={l} className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {l}
                  <button type="button" onClick={() => setLabels(labels.filter((x) => x !== l))}
                    className="text-slate-400 hover:text-slate-700" aria-label={`Remove ${l}`}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <input id="create-labels" value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleAddLabel}
              placeholder="Type a label and press Enter…" className={fieldClass} />
          </div>

          {/* actions */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              Cancel
            </button>
            <button type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
              <Plus className="h-4 w-4" />
              Create {mode === 'epic' ? 'Epic' : mode === 'story' ? 'Story' : 'Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
