'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LiaBellSolid,
  LiaInboxSolid,
  LiaCalendarSolid,
  LiaClipboardListSolid,
  LiaInfoCircleSolid,
  LiaCheckSolid,
} from 'react-icons/lia'
import { useNotification } from '@/context/NotificationContext'
import type { NotificationType } from '@/context/NotificationContext'
import styles from './NotificationBell.module.css'

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  REQUEST:    <LiaInboxSolid />,
  ATTENDANCE: <LiaCalendarSolid />,
  CHECKLIST:  <LiaClipboardListSolid />,
  SYSTEM:     <LiaInfoCircleSolid />,
}

export default function NotificationBell({ diamond }: { diamond?: boolean }) {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification()
  const router = useRouter()

  function handleItemClick(id: string, href?: string) {
    markAsRead(id)
    setOpen(false)
    if (href) router.push(href)
  }

  return (
    <div className={`${styles.wrap} ${diamond ? styles.wrapDiamond : ''}`}>
      <button
        className={styles.bell}
        onClick={() => setOpen((v) => !v)}
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개 미읽음)` : ''}`}
      >
        <LiaBellSolid className={styles.bellIcon} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>알림</span>
              {unreadCount > 0 && (
                <button className={styles.markAllBtn} onClick={markAllAsRead}>
                  <LiaCheckSolid /> 모두 읽음
                </button>
              )}
            </div>

            <div className={styles.list}>
              {notifications.length === 0 ? (
                <p className={styles.empty}>새로운 알림이 없습니다.</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    className={`${styles.item} ${!n.isRead ? styles.itemUnread : ''}`}
                    onClick={() => handleItemClick(n.id, n.href)}
                  >
                    <span className={`${styles.itemIcon} ${styles[`icon_${n.type}`]}`}>
                      {TYPE_ICON[n.type]}
                    </span>
                    <div className={styles.itemBody}>
                      <span className={styles.itemTitle}>{n.title}</span>
                      {n.body && <span className={styles.itemDesc}>{n.body}</span>}
                      <span className={styles.itemTime}>{n.createdAt}</span>
                    </div>
                    {!n.isRead && <span className={styles.unreadDot} />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
