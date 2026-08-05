import { useEffect, useRef, useState } from 'react'
import { X, Trash2, Edit3, Check } from 'lucide-react'
import { useTaskStore } from '../store'
import { STATUSES, PRIORITIES, TASK_TYPES } from '../constants'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { TypeBadge } from './TypeBadge'
import type { Status, Priority, TaskType } from '../types'

function formatDatetime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TaskModal() {
  const { tasks, selectedTaskId, setSelectedTaskId, updateTask, deleteTask, moveTask } =
    useTaskStore()

  const task = tasks.find((t) => t.id === selectedTaskId) ?? null
  const overlayRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('todo')
  const [priority, setPriority] = useState<Priority>('medium')
  const [type, setType] = useState<TaskType>('feature')
  const [storyPoints, setStoryPoints] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [labelInput, setLabelInput] = useState('')
  const [labels, setLabels] = useState<string[]>([])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setStatus(task.status)
      setPriority(task.priority)
      setType(task.type)
      setStoryPoints(task.storyPoints?.toString() ?? '')
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '')
      setLabels(task.labels)
      setEditing(false)
    }
  }, [task?.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedTaskId(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setSelectedTaskId])

  if (!task) return null

  function handleSave() {
    if (!task) return
    updateTask(task.id, {
      title,
      description,
      status,
      priority,
      type,
      storyPoints: storyPoints ? parseInt(storyPoints, 10) : null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      labels,
    })
    setEditing(false)
  }

  function handleDelete() {
    if (!task) return
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      deleteTask(task.id)
    }
  }

  function addLabel(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = labelInput.trim().toLowerCase()
      if (val && !labels.includes(val)) setLabels([...labels, val])
      setLabelInput('')
    }
  }

  function removeLabel(label: string) {
    setLabels(labels.filter((l) => l !== label))
  }

  const fieldClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Task: ${task.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) setSelectedTaskId(null)
      }}
    >
      <div className="relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={editing ? type : task.type} />
            <StatusBadge status={editing ? status : task.status} />
            <PriorityBadge priority={editing ? priority : task.priority} />
          </div>
          <div className="flex items-center gap-1.5">
            {editing ? (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedTaskId(null)}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* title */}
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass + ' text-lg font-semibold'}
              aria-label="Task title"
            />
          ) : (
            <h2 className="text-lg font-semibold text-slate-800">{task.title}</h2>
          )}

          {/* description */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Description
            </label>
            {editing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={fieldClass}
                aria-label="Task description"
              />
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {task.description || <em className="text-slate-400">No description</em>}
              </p>
            )}
          </div>

          {/* metadata grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Status
              </label>
              {editing ? (
                <select
                  value={status}
                  onChange={(e) => {
                    const s = e.target.value as Status
                    setStatus(s)
                    if (task) moveTask(task.id, s)
                  }}
                  className={fieldClass}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={task.status} />
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Priority
              </label>
              {editing ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className={fieldClass}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              ) : (
                <PriorityBadge priority={task.priority} />
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Type
              </label>
              {editing ? (
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                  className={fieldClass}
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              ) : (
                <TypeBadge type={task.type} />
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Story Points
              </label>
              {editing ? (
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  placeholder="—"
                  className={fieldClass}
                />
              ) : (
                <span className="text-sm font-medium text-slate-700">
                  {task.storyPoints ?? '—'}
                </span>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Due Date
              </label>
              {editing ? (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={fieldClass}
                />
              ) : (
                <span className="text-sm font-medium text-slate-700">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              )}
            </div>
          </div>

          {/* labels */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Labels
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(editing ? labels : task.labels).map((label) => (
                <span
                  key={label}
                  className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                >
                  {label}
                  {editing && (
                    <button
                      type="button"
                      onClick={() => removeLabel(label)}
                      className="ml-0.5 rounded-sm text-slate-400 hover:text-slate-700"
                      aria-label={`Remove label ${label}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={addLabel}
                placeholder="Type a label and press Enter…"
                className={fieldClass}
              />
            )}
          </div>

          {/* timestamps */}
          <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
            <span>Created {formatDatetime(task.createdAt)}</span>
            <span>Updated {formatDatetime(task.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
