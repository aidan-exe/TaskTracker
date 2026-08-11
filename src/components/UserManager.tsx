import { useState } from 'react'
import { X, Plus, Trash2, Edit3, Check, Users } from 'lucide-react'
import { useTaskStore } from '../store'
import { UserAvatar } from './UserAvatar'
import type { NewUser } from '../types'

interface Props {
  onClose: () => void
}

const AVATAR_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
]

const fieldClass =
  'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-400/20'
const labelClass =
  'block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1'

function UserForm({
  initial,
  existingEmails,
  onSave,
  onCancel,
  submitLabel,
}: {
  initial: Partial<NewUser>
  existingEmails: string[]
  onSave: (u: NewUser) => void
  onCancel: () => void
  submitLabel: string
}) {
  const [name, setName] = useState(initial.name ?? '')
  const [email, setEmail] = useState(initial.email ?? '')
  const [avatarColor, setAvatarColor] = useState(initial.avatarColor ?? AVATAR_COLORS[0])
  const [error, setError] = useState('')

  function validate() {
    if (!name.trim()) return 'Name is required.'
    if (!email.trim()) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email.'
    if (
      existingEmails.includes(email.trim().toLowerCase()) &&
      email.trim().toLowerCase() !== initial.email?.toLowerCase()
    )
      return 'A user with that email already exists.'
    return ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    onSave({ name: name.trim(), email: email.trim().toLowerCase(), avatarColor })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* preview */}
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3">
        <UserAvatar
          user={{ id: '', name: name || 'Preview', email, avatarColor, createdAt: '', points: 0, vouchers: [] }}
          size="md"
          showTooltip={false}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{name || 'Preview'}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{email || 'email@example.com'}</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Name <span className="text-red-400">*</span></label>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="Full name"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Email <span className="text-red-400">*</span></label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          placeholder="user@example.com"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Avatar Color</label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setAvatarColor(c)}
              className={`h-7 w-7 rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
                avatarColor === c ? 'scale-125 ring-2 ring-white dark:ring-slate-700 ring-offset-1 ring-offset-slate-100 dark:ring-offset-slate-900' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
              aria-pressed={avatarColor === c}
            />
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export function UserManager({ onClose }: Props) {
  const { users, tasks, addUser, updateUser, deleteUser } = useTaskStore()
  const [view, setView] = useState<'list' | 'add' | { type: 'edit'; id: string }>('list')

  const existingEmails = users.map((u) => u.email)

  function taskCountFor(userId: string) {
    return tasks.filter((t) => t.assigneeId === userId).length
  }

  const editingUser =
    typeof view === 'object' && view.type === 'edit'
      ? users.find((u) => u.id === view.id)
      : null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Manage team members"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-500" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Team Members</h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              {users.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 dark:border-slate-600 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* list view */}
          {view === 'list' && (
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="py-10 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No team members yet</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Add your first member below</p>
                </div>
              ) : (
                <ul className="space-y-2" aria-label="Team members">
                  {users.map((user) => {
                    const count = taskCountFor(user.id)
                    return (
                      <li
                        key={user.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3"
                      >
                        <UserAvatar user={user} size="md" showTooltip={false} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                        </div>
                        <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                          {count} {count === 1 ? 'task' : 'tasks'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setView({ type: 'edit', id: user.id })}
                          className="rounded-lg border border-slate-200 dark:border-slate-600 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          aria-label={`Edit ${user.name}`}
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Remove ${user.name}? Their ${count} assigned task${count !== 1 ? 's' : ''} will become unassigned.`
                              )
                            ) {
                              deleteUser(user.id)
                            }
                          }}
                          className="rounded-lg border border-red-200 dark:border-red-900 p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          aria-label={`Remove ${user.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              <button
                type="button"
                onClick={() => setView('add')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Member
              </button>
            </div>
          )}

          {/* add view */}
          {view === 'add' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add Member</h3>
              <UserForm
                initial={{ avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length] }}
                existingEmails={existingEmails}
                onSave={(u) => { addUser(u); setView('list') }}
                onCancel={() => setView('list')}
                submitLabel="Add Member"
              />
            </div>
          )}

          {/* edit view */}
          {typeof view === 'object' && view.type === 'edit' && editingUser && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Edit Member</h3>
              <UserForm
                initial={editingUser}
                existingEmails={existingEmails}
                onSave={(u) => { updateUser(editingUser.id, u); setView('list') }}
                onCancel={() => setView('list')}
                submitLabel="Save Changes"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
