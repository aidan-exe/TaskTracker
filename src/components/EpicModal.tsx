import { useEffect, useRef, useState } from 'react'
import { X, Trash2, Edit3, Check, Plus } from 'lucide-react'
import { useTaskStore } from '../store'
import { STATUSES, PRIORITIES, EPIC_COLORS } from '../constants'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { ProgressBar } from './ProgressBar'
import type { Status, Priority } from '../types'

const fieldClass =
  'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-400/20'
const labelClass =
  'block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1'

interface Props {
  epicId: string
  onClose: () => void
  onAddStory?: (epicId: string) => void
}

export function EpicModal({ epicId, onClose, onAddStory }: Props) {
  const {
    getEpicById, updateEpic, deleteEpic,
    storiesForEpic, tasksForEpic, epicProgress,
    setSelectedStoryId,
  } = useTaskStore()

  const epic = getEpicById(epicId)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('backlog')
  const [priority, setPriority] = useState<Priority>('medium')
  const [color, setColor] = useState(EPIC_COLORS[0].value)
  const [labelInput, setLabelInput] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (epic) {
      setTitle(epic.title)
      setDescription(epic.description)
      setStatus(epic.status)
      setPriority(epic.priority)
      setColor(epic.color)
      setLabels(epic.labels)
      setDueDate(epic.dueDate ? epic.dueDate.slice(0, 10) : '')
      setEditing(false)
    }
  }, [epic?.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!epic) return null

  const stories = storiesForEpic(epicId)
  const epicTasks = tasksForEpic(epicId)
  const progress = epicProgress(epicId)

  function handleSave() {
    updateEpic(epicId, { title, description, status, priority, color, labels, dueDate: dueDate ? new Date(dueDate).toISOString() : null })
    setEditing(false)
  }

  function handleDelete() {
    const storyCount = stories.length
    const taskCount = epicTasks.length
    const msg = `Delete epic "${epic!.title}"?\n\nThis will also delete ${storyCount} stor${storyCount !== 1 ? 'ies' : 'y'} and ${taskCount} task${taskCount !== 1 ? 's' : ''}. This cannot be undone.`
    if (window.confirm(msg)) { deleteEpic(epicId); onClose() }
  }

  function addLabel(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = labelInput.trim().toLowerCase()
      if (val && !labels.includes(val)) setLabels([...labels, val])
      setLabelInput('')
    }
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Epic: ${epic.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">
        {/* color accent bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: editing ? color : epic.color }} />

        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-md px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: editing ? color : epic.color }}>
              ◆ Epic
            </span>
            <StatusBadge status={editing ? status : epic.status} />
            <PriorityBadge priority={editing ? priority : epic.priority} />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {editing ? (
              <button type="button" onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40">
                <Check className="h-4 w-4" /> Save
              </button>
            ) : (
              <button type="button" onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <Edit3 className="h-4 w-4" /> Edit
              </button>
            )}
            <button type="button" onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              aria-label="Delete epic">
              <Trash2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-600 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* title */}
          {editing ? (
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className={fieldClass + ' text-lg font-semibold'} aria-label="Epic title" />
          ) : (
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{epic.title}</h2>
          )}

          {/* description */}
          <div>
            <label className={labelClass}>Description</label>
            {editing ? (
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={3} className={fieldClass} />
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {epic.description || <em className="text-slate-400 dark:text-slate-500">No description</em>}
              </p>
            )}
          </div>

          {/* progress */}
          {progress.total > 0 && (
            <div>
              <label className={labelClass}>Progress</label>
              <ProgressBar progress={progress} />
              <div className="mt-2 flex gap-4 text-xs text-slate-400 dark:text-slate-500">
                <span>{stories.length} stor{stories.length !== 1 ? 'ies' : 'y'}</span>
                <span>{epicTasks.length} task{epicTasks.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {/* metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              {editing ? (
                <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className={fieldClass}>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              ) : <StatusBadge status={epic.status} />}
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              {editing ? (
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={fieldClass}>
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              ) : <PriorityBadge priority={epic.priority} />}
            </div>
            <div>
              <label className={labelClass}>Due Date</label>
              {editing ? (
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
              ) : (
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {epic.dueDate ? new Date(epic.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>
              )}
            </div>
            {editing && (
              <div>
                <label className={labelClass}>Accent Color</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {EPIC_COLORS.map((c) => (
                    <button key={c.value} type="button" onClick={() => setColor(c.value)}
                      className={`h-6 w-6 rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${color === c.value ? 'scale-125 ring-2 ring-white dark:ring-slate-700 ring-offset-1' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c.value }} aria-label={c.label} aria-pressed={color === c.value} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* labels */}
          <div>
            <label className={labelClass}>Labels</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(editing ? labels : epic.labels).map((l) => (
                <span key={l} className="flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {l}
                  {editing && (
                    <button type="button" onClick={() => setLabels(labels.filter((x) => x !== l))}
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" aria-label={`Remove ${l}`}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <input value={labelInput} onChange={(e) => setLabelInput(e.target.value)} onKeyDown={addLabel}
                placeholder="Type a label and press Enter…" className={fieldClass} />
            )}
          </div>

          {/* child stories list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass}>User Stories ({stories.length})</label>
              {onAddStory && (
                <button type="button" onClick={() => { onClose(); onAddStory(epicId) }}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                  <Plus className="h-3.5 w-3.5" /> Add Story
                </button>
              )}
            </div>
            {stories.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No user stories yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {stories.map((st) => (
                  <li key={st.id}>
                    <button type="button"
                      onClick={() => { onClose(); setSelectedStoryId(st.id) }}
                      className="w-full text-left rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm hover:border-brand-200 dark:hover:border-brand-700 hover:bg-white dark:hover:bg-slate-750 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">◈ {st.title}</span>
                        <StatusBadge status={st.status} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
