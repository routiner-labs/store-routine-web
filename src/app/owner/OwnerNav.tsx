'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LiaHomeSolid,
  LiaClipboardListSolid,
  LiaInboxSolid,
  LiaCalendarSolid,
  LiaUsersSolid,
  LiaAngleDownSolid,
} from 'react-icons/lia'
import type { IconType } from 'react-icons'
import { useStore } from '@/context/StoreContext'
import StoreSwitcher from './StoreSwitcher'
import styles from './OwnerNav.module.css'

const navItems: { href: string; label: string; short: string; icon: IconType }[] = [
  { href: '/owner',             label: '홈',       short: '홈',   icon: LiaHomeSolid },
  { href: '/owner/checklists',  label: '체크리스트', short: '체크', icon: LiaClipboardListSolid },
  { href: '/owner/requests',    label: '요청함',    short: '요청', icon: LiaInboxSolid },
  { href: '/owner/attendance',  label: '출근현황',  short: '출근', icon: LiaCalendarSolid },
  { href: '/owner/employees',   label: '직원관리',  short: '직원', icon: LiaUsersSolid },
]

export default function OwnerNav() {
  const pathname = usePathname()
  const { currentStore } = useStore()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.brand}>루틴</div>
        <button className={styles.storeTrigger} onClick={() => setSwitcherOpen(true)}>
          <LiaAngleDownSolid className={styles.storeShort} />
          <span className={styles.storeFull}>{currentStore.name}</span>
          <LiaAngleDownSolid className={styles.storeChevron} />
        </button>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.item} ${isActive ? styles.active : ''}`}
            >
              <Icon className={styles.navIcon} />
              <span className={styles.shortLabel}>{item.short}</span>
              <span className={styles.fullLabel}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      {switcherOpen && <StoreSwitcher onClose={() => setSwitcherOpen(false)} />}
    </>
  )
}
