import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useTaskStore } from '../store'
import { STATUSES, PRIORITIES, TASK_TYPES } from '../constants'
import { UserAvatar } from './UserAvatar'
import type { Status, Priority, TaskType } from '../types'

interface Props {
  onClose: () => void
}

export function NewTaskModal({ onClose }: Props) {
  const addTask = useTaskStore((s) => s.addTask)
  const users = useTaskStore((s) => s.users)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('todo')
  const [priority, setPriority] = useState<Priority>('medium')
  const [type, setType] = useState<TaskType>('feature')
  const [storyPoints, setStoryPoints] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [labelInput, setLabelInput] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [error, setError] = useState('')

  function handleAddLabel(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = labelInput.trim().toLowerCase()
      if (val && !labels.includes(val)) setLabels([...labels, val])
      setLabelInput('')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    addTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      type,
      labels,
      storyPoints: storyPoints ? parseInt(storyPoints, 10) : null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assigneeId: assigneeId || null,
    })
    onClose()
  }

  const fieldClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'
  const labelClass = 'block text-xs font-medium uppercase tracking-wide text-slate-400 mb-1'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create new task"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">New Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {/* title */}
          <div>
            <label htmlFor="new-title" className={labelClass}>
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="new-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError('')
              }}
              placeholder="What needs to be done?"
              className={fieldClass}
              aria-required="true"
              aria-describedby={error ? 'title-error' : undefined}
            />
            {error && (
              <p id="title-error" role="alert" className="mt-1 text-xs text-red-500">
                {error}
              </p>
            )}
          </div>

          {/* description */}
          <div>
            <label htmlFor="new-desc" className={labelClass}>
              Description
            </label>
            <textarea
              id="new-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add more context…"
              className={fieldClass}
            />
          </div>

          {/* status + priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-status" className={labelClass}>Status</label>
              <select
                id="new-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className={fieldClass}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-priority" className={labelClass}>Priority</label>
              <select
                id="new-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={fieldClass}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* type + story points */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-type" className={labelClass}>Type</label>
              <select
                id="new-type"
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className={fieldClass}
              >
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-sp" className={labelClass}>Story Points</label>
              <input
                id="new-sp"
                type="number"
                min={0}
                max={100}
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                placeholder="—"
                className={fieldClass}
              />
            </div>
          </div>

          {/* due date */}
          <div>
            <label htmlFor="new-due" className={labelClass}>Due Date</label>
            <input
              id="new-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={fieldClass}
            />
          </div>

          {/* assignee */}
          <div>
            <label htmlFor="new-assignee" className={labelClass}>Assignee</label>
            {users.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No team members yet — add users via the Team button in the header.
              </p>
            ) : (
              <div className="flex items-center gap-2">
                {assigneeId && (() => {
                  const user = users.find((u) => u.id === assigneeId)
                  return user ? <UserAvatar user={user} size="sm" showTooltip={false} /> : null
                })()}
                <select
                  id="new-assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* labels */}
          <div>
            <label htmlFor="new-labels" className={labelClass}>Labels</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {labels.map((label) => (
                <span
                  key={label}
                  className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => setLabels(labels.filter((l) => l !== label))}
                    className="text-slate-400 hover:text-slate-700"
                    aria-label={`Remove label ${label}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <input
              id="new-labels"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleAddLabel}
              placeholder="Type a label and press Enter…"
              className={fieldClass}
            />
          </div>

          {/* actions */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
