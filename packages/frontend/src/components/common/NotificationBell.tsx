import { HeaderGlobalAction } from '@carbon/react'
import { Notification } from '@carbon/icons-react'
import { useState } from 'react'
import { useNotifications, useUnreadCount, useMarkAsRead } from '@/hooks/use-notifications'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: countData } = useUnreadCount()
  const { data: notifications } = useNotifications()
  const markAsRead = useMarkAsRead()
  const count = countData?.count ?? 0

  return (
    <div style={{ position: 'relative' }}>
      <HeaderGlobalAction aria-label="Notifications" onClick={() => setOpen(!open)} data-testid="notification-bell">
        <Notification size={20} />
        {count > 0 && (
          <span style={{ position: 'absolute', top: 6, right: 6, background: '#da1e28', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </HeaderGlobalAction>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', width: 320, maxHeight: 400, overflowY: 'auto', background: 'var(--cds-layer)', border: '1px solid var(--cds-border-subtle)', zIndex: 9000, boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--cds-border-subtle)', fontWeight: 600, fontSize: 14 }}>알림</div>
          {!notifications?.length ? (
            <div style={{ padding: '1rem', textAlign: 'center', fontSize: 14, color: 'var(--cds-text-secondary)' }}>알림이 없습니다</div>
          ) : notifications.map(n => (
            <button key={n.id} data-testid={`notification-item-${n.id}`}
              onClick={() => { if (!n.read) markAsRead.mutate(n.id) }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid var(--cds-border-subtle)', background: n.read ? 'transparent' : 'var(--cds-layer-selected)', cursor: 'pointer', border: 'none', fontSize: 14 }}>
              <div style={{ fontWeight: 500 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: 'var(--cds-text-secondary)', marginTop: 4 }}>{n.message}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
