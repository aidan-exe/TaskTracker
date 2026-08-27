import { X, Users, Crown, Shield, User as UserIcon } from 'lucide-react'
import { useSupabaseStore } from '../hooks/useSupabaseStore'
import { UserAvatar } from './UserAvatar'

interface Props {
  onClose: () => void
}

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: UserIcon,
}

const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

const ROLE_COLORS = {
  owner: 'text-amber-500 dark:text-amber-400',
  admin: 'text-violet-500 dark:text-violet-400',
  member: 'text-slate-500 dark:text-slate-400',
}

export function UserManager({ onClose }: Props) {
  const { members, tasks } = useSupabaseStore()

  function taskCountFor(memberId: string) {
    return tasks.filter((t) => t.assigneeId === memberId).length
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Team members"
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
              {members.length}
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
          {members.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No team members yet</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Invite members to collaborate</p>
            </div>
          ) : (
            <ul className="space-y-2" aria-label="Team members">
              {members.map((member) => {
                const count = taskCountFor(member.id)
                const RoleIcon = ROLE_ICONS[member.role]
                const roleLabel = ROLE_LABELS[member.role]
                const roleColor = ROLE_COLORS[member.role]
                
                // Create a simple user object for UserAvatar
                const userForAvatar = {
                  id: member.id,
                  name: `Member ${member.id.slice(0, 4)}`,
                  email: '',
                  avatar: '',
                  avatarColor: '#6366f1',
                  points: member.points,
                  vouchers: [],
                  createdAt: '',
                }

                return (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3"
                  >
                    <UserAvatar user={userForAvatar} size="md" showTooltip={false} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                          Team Member
                        </p>
                        <div className={`flex items-center gap-1 ${roleColor}`}>
                          <RoleIcon className="h-3 w-3" aria-hidden="true" />
                          <span className="text-xs font-medium">{roleLabel}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {member.points} points
                        </p>
                        <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {count} {count === 1 ? 'task' : 'tasks'}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Team members are managed through workspace invitations. Contact your workspace admin to add new members.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
