'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LiaHomeSolid,
  LiaInboxSolid,
  LiaFolderOpenSolid,
  LiaCalendarSolid,
  LiaClipboardListSolid,
  LiaAngleLeftSolid,
  LiaBarsSolid,
  LiaBellSolid,
  LiaCheckSolid,
  LiaTimesSolid,
  LiaInfoCircleSolid,
} from 'react-icons/lia'
import type { IconType } from 'react-icons'
import { useNotification } from '@/context/NotificationContext'
import type { NotificationType } from '@/context/NotificationContext'
import SystemSettings from '@/components/SystemSettings'
import styles from '../owner/OwnerNav.module.css'

type NavItem = { href: string; label: string; icon: IconType; exact?: boolean }

const homeItem: NavItem = { href: '/employee', label: '홈', icon: LiaHomeSolid, exact: true }

const navGroups: { category: string; items: NavItem[] }[] = [
  {
    category: '업무',
    items: [
      { href: '/employee/requests',  label: '요청함', icon: LiaInboxSolid },
      { href: '/employee/documents', label: '문서함', icon: LiaFolderOpenSolid },
    ],
  },
  {
    category: '스케줄',
    items: [
      { href: '/employee/schedule', label: '내 스케줄', icon: LiaCalendarSolid },
    ],
  },
]

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  REQUEST:    <LiaInboxSolid />,
  ATTENDANCE: <LiaCalendarSolid />,
  CHECKLIST:  <LiaClipboardListSolid />,
  SYSTEM:     <LiaInfoCircleSolid />,
}

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href)
}

export default function EmployeeNav() {
  const pathname = usePathname()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <>
      {/* ── 태블릿+: 좌측 사이드바 ── */}
      <nav className={styles.nav}>
        <div className={styles.storeTrigger}>
          <span className={styles.storeFull}>스타벅스 강남점</span>
        </div>

        <Link
          href={homeItem.href}
          className={`${styles.item} ${isActive(pathname, homeItem) ? styles.active : ''}`}
        >
          <homeItem.icon className={styles.navIcon} />
          <span className={styles.fullLabel}>{homeItem.label}</span>
        </Link>

        {navGroups.map((group) => (
          <div key={group.category} className={styles.navGroup}>
            <span className={styles.navGroupLabel}>{group.category}</span>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.item} ${isActive(pathname, item) ? styles.active : ''}`}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.fullLabel}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}

        <div className={styles.userSection}>
          <span className={styles.userAvatar}>이</span>
          <span className={styles.userName}>이지은</span>
          <SystemSettings />
        </div>
      </nav>

      {/* ── 모바일: 3등분 하단 바 ── */}
      <div className={styles.mobileBar}>
        <button className={styles.mobileBtn} onClick={() => setNotifOpen(true)}>
          <span className={styles.mobileBellWrap}>
            <LiaBellSolid className={styles.mobileBtnIcon} />
            {unreadCount > 0 && (
              <span className={styles.mobileBellBadge}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </span>
          <span className={styles.mobileBtnLabel}>알림</span>
        </button>

        <div className={styles.mobileDiamondArea}>
          <button
            className={styles.menuDiamond}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="메뉴"
          >
            <LiaBarsSolid className={styles.menuDiamondIcon} />
          </button>
        </div>

        <button className={styles.mobileBtn}>
          <span className={styles.mobileAvatar}>이</span>
          <span className={styles.mobileBtnLabel}>이지은</span>
        </button>
      </div>

      {/* ── 모바일: 알림 전체화면 ── */}
      {notifOpen && (
        <div className={styles.notifScreen}>
          <div className={styles.notifHeader}>
            <button className={styles.notifClose} onClick={() => setNotifOpen(false)}>
              <LiaAngleLeftSolid />
            </button>
            <span className={styles.notifTitle}>알림</span>
            {unreadCount > 0 && (
              <button className={styles.notifMarkAll} onClick={markAllAsRead}>
                <LiaCheckSolid />
                <span>모두 읽음</span>
              </button>
            )}
          </div>

          <div className={styles.notifList}>
            {notifications.length === 0 ? (
              <p className={styles.notifEmpty}>새로운 알림이 없습니다.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  className={`${styles.notifItem} ${!n.isRead ? styles.notifItemUnread : ''}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <span className={`${styles.notifIcon} ${styles[`notifType_${n.type}`]}`}>
                    {TYPE_ICON[n.type]}
                  </span>
                  <div className={styles.notifBody}>
                    <span className={styles.notifItemTitle}>{n.title}</span>
                    {n.body && <span className={styles.notifItemDesc}>{n.body}</span>}
                    <span className={styles.notifItemTime}>{n.createdAt}</span>
                  </div>
                  {!n.isRead && <span className={styles.notifDot} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── 모바일: 메뉴 드로어 ── */}
      {mobileMenuOpen && (
        <>
          <div
            className={styles.drawerOverlay}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={styles.drawer}>
            <div className={styles.drawerHandle} />
            <div className={styles.drawerHeader}>
              <span className={styles.drawerStoreName}>스타벅스 강남점</span>
              <button
                className={styles.drawerClose}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LiaTimesSolid />
              </button>
            </div>
            <Link
              href={homeItem.href}
              className={`${styles.drawerItem} ${isActive(pathname, homeItem) ? styles.drawerItemActive : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <homeItem.icon className={styles.drawerIcon} />
              <span className={styles.drawerLabel}>{homeItem.label}</span>
            </Link>

            {navGroups.map((group) => (
              <div key={group.category}>
                <span className={styles.drawerGroupLabel}>{group.category}</span>
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.drawerItem} ${isActive(pathname, item) ? styles.drawerItemActive : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className={styles.drawerIcon} />
                      <span className={styles.drawerLabel}>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
