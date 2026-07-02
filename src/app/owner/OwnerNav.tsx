'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {
  LiaHomeSolid,
  LiaClipboardListSolid,
  LiaInboxSolid,
  LiaFolderOpenSolid,
  LiaCalendarSolid,
  LiaUsersSolid,
  LiaAngleDownSolid,
  LiaAngleLeftSolid,
  LiaBarsSolid,
  LiaBellSolid,
  LiaCheckSolid,
  LiaTimesSolid,
  LiaInfoCircleSolid,
} from 'react-icons/lia'
import type { IconType } from 'react-icons'
import { useStore } from '@/context/StoreContext'
import { useNotification } from '@/context/NotificationContext'
import type { NotificationType } from '@/context/NotificationContext'
import StoreSwitcher from './StoreSwitcher'
import NotificationBell from '@/components/NotificationBell'
import styles from './OwnerNav.module.css'

type NavItem = { href: string; label: string; icon: IconType }

const homeItem: NavItem = { href: '/owner', label: '홈', icon: LiaHomeSolid }

const navGroups: { category: string; items: NavItem[] }[] = [
  {
    category: '업무',
    items: [
      { href: '/owner/checklists', label: '업무리스트', icon: LiaClipboardListSolid },
      { href: '/owner/requests',   label: '요청함',    icon: LiaInboxSolid },
      { href: '/owner/documents',  label: '문서함',    icon: LiaFolderOpenSolid },
    ],
  },
  {
    category: '스케줄',
    items: [
      { href: '/owner/attendance', label: '현황', icon: LiaCalendarSolid },
    ],
  },
  {
    category: '관리',
    items: [
      { href: '/owner/employees', label: '직원관리', icon: LiaUsersSolid },
    ],
  },
]

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  REQUEST:    <LiaInboxSolid />,
  ATTENDANCE: <LiaCalendarSolid />,
  CHECKLIST:  <LiaClipboardListSolid />,
  SYSTEM:     <LiaInfoCircleSolid />,
}

export default function OwnerNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentStore } = useStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  function handleNotifItem(id: string, href?: string) {
    markAsRead(id)
    setNotifOpen(false)
    if (href) router.push(href)
  }

  return (
    <>
      {/* ── 태블릿+: 좌측 사이드바 ── */}
      <nav className={styles.nav}>
        <button className={styles.storeTrigger} onClick={() => setSwitcherOpen(true)}>
          <LiaAngleDownSolid className={styles.storeShort} />
          <span className={styles.storeFull}>{currentStore.name}</span>
          <LiaAngleDownSolid className={styles.storeChevron} />
        </button>

        <Link
          href={homeItem.href}
          className={`${styles.item} ${pathname === homeItem.href ? styles.active : ''}`}
        >
          <homeItem.icon className={styles.navIcon} />
          <span className={styles.fullLabel}>{homeItem.label}</span>
        </Link>

        {navGroups.map((group) => (
          <div key={group.category} className={styles.navGroup}>
            <span className={styles.navGroupLabel}>{group.category}</span>
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.item} ${isActive ? styles.active : ''}`}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.fullLabel}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}

        <div className={styles.userSection}>
          <span className={styles.userAvatar}>사</span>
          <span className={styles.userName}>사장님</span>
          <NotificationBell />
        </div>
      </nav>

      {/* ── 모바일: 3등분 하단 바 ── */}
      <div className={styles.mobileBar}>
        {/* 왼쪽: 알림 */}
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

        {/* 중앙: 메뉴 (다이아몬드) */}
        <div className={styles.mobileDiamondArea}>
          <button
            className={styles.menuDiamond}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="메뉴"
          >
            <LiaBarsSolid className={styles.menuDiamondIcon} />
          </button>
        </div>

        {/* 오른쪽: 계정 */}
        <button className={styles.mobileBtn}>
          <span className={styles.mobileAvatar}>사</span>
          <span className={styles.mobileBtnLabel}>사장님</span>
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
                  onClick={() => handleNotifItem(n.id, n.href)}
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
              <span className={styles.drawerStoreName}>{currentStore.name}</span>
              <button
                className={styles.drawerClose}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LiaTimesSolid />
              </button>
            </div>
            <Link
              href={homeItem.href}
              className={`${styles.drawerItem} ${pathname === homeItem.href ? styles.drawerItemActive : ''}`}
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
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.drawerItem} ${isActive ? styles.drawerItemActive : ''}`}
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

      {switcherOpen && <StoreSwitcher onClose={() => setSwitcherOpen(false)} />}
    </>
  )
}
