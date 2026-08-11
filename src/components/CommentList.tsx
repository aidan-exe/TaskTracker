import { Trash2 } from 'lucide-react'
import { useTaskStore } from '../store'
import type { Comment } from '../types'

interface CommentListProps {
  comments: Comment[]
  onDelete: (commentId: string) => void
}

export function CommentList({ comments, onDelete }: CommentListProps) {
  const getUserById = useTaskStore((s) => s.getUserById)

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 dark:text-slate-500">
        No comments yet. Be the first to add one!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const author = getUserById(comment.authorId)
        const timestamp = new Date(comment.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })

        return (
          <div
            key={comment.id}
            className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold"
              style={{ backgroundColor: author?.avatarColor || '#94a3b8' }}
            >
              {author?.name.slice(0, 2).toUpperCase() || '??'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {author?.name || 'Unknown User'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {timestamp}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={() => onDelete(comment.id)}
              className="flex-shrink-0 p-1.5 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
              title="Delete comment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
