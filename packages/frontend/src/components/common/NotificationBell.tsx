import { useState } from 'react'
import { useNotifications, useUnreadCount, useMarkAsRead } from '@/hooks/use-notifications'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: countData } = useUnreadCount()
  const { data: notifications } = useNotifications()
  const markAsRead = useMarkAsRead()
  const count = countData?.count ?? 0

  return (
    <div className="relative">
      <button data-testid="notification-bell" onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/20 transition-colors" aria-label="Notifications">
        🔔
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{count > 9 ? '9+' : count}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-sm text-gray-900 dark:text-gray-100">알림</div>
          {!notifications?.length ? (
            <div className="p-4 text-sm text-gray-500 text-center">알림이 없습니다</div>
          ) : (
            notifications.map(n => (
              <button key={n.id} data-testid={`notification-item-${n.id}`}
                onClick={() => { if (!n.read) markAsRead.mutate(n.id) }}
                className={`w-full text-left p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                <p className="text-xs text-gray-500 mt-1">{n.message}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
