import { useEffect } from 'react'
import { X, CheckCircle, Trophy, Gift, TrendingUp } from 'lucide-react'
import { useTaskStore } from '../store'
import type { Notification } from '../types'

interface Props {
  notification: Notification
}

export function NotificationToast({ notification }: Props) {
  const { dismissNotification, getUserById } = useTaskStore()

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      dismissNotification(notification.id)
    }, 5000)
    return () => clearTimeout(timer)
  }, [notification.id, dismissNotification])

  const user = getUserById(notification.userId)

  // Determine icon and colors based on notification type
  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'status_change':
        return {
          icon: <TrendingUp className="w-5 h-5" />,
          bgColor: 'bg-blue-500 dark:bg-blue-600',
          borderColor: 'border-blue-400 dark:border-blue-500',
        }
      case 'points_awarded':
        return {
          icon: <Trophy className="w-5 h-5" />,
          bgColor: 'bg-amber-500 dark:bg-amber-600',
          borderColor: 'border-amber-400 dark:border-amber-500',
        }
      case 'voucher_redeemed':
        return {
          icon: <Gift className="w-5 h-5" />,
          bgColor: 'bg-emerald-500 dark:bg-emerald-600',
          borderColor: 'border-emerald-400 dark:border-emerald-500',
        }
      default:
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-slate-500 dark:bg-slate-600',
          borderColor: 'border-slate-400 dark:border-slate-500',
        }
    }
  }

  const style = getNotificationStyle()

  return (
    <div
      className="flex items-start gap-3 rounded-lg border-2 bg-white dark:bg-slate-900 p-4 shadow-lg min-w-[320px] max-w-md animate-slide-in-right"
      style={{ borderLeftColor: style.borderColor.split(' ')[0].replace('border-', '') }}
    >
      {/* Icon */}
      <div className={`${style.bgColor} rounded-full p-2 text-white shrink-0`}>
        {style.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
              {notification.message}
            </p>
            {user && notification.type === 'status_change' && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Changed by {user.name}
              </p>
            )}
            {notification.oldStatus && notification.newStatus && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {notification.oldStatus}
                </span>
                <span className="text-slate-400 dark:text-slate-500">→</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-medium">
                  {notification.newStatus}
                </span>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => dismissNotification(notification.id)}
            className="shrink-0 rounded p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
