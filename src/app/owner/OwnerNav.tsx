'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/context/StoreContext'
import StoreSwitcher from './StoreSwitcher'
import styles from './OwnerNav.module.css'

const navItems = [
  { href: '/owner', label: '홈', short: '홈' },
  { href: '/owner/checklists', label: '체크리스트', short: '체크' },
  { href: '/owner/requests', label: '요청함', short: '요청' },
  { href: '/owner/attendance', label: '출근현황', short: '출근' },
  { href: '/owner/employees', label: '직원관리', short: '직원' },
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
          <span className={styles.storeShort}>▾</span>
          <span className={styles.storeFull}>{currentStore.name}</span>
          <span className={styles.storeChevron}>▾</span>
        </button>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.item} ${pathname === item.href ? styles.active : ''}`}
          >
            <span className={styles.shortLabel}>{item.short}</span>
            <span className={styles.fullLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>
      {switcherOpen && <StoreSwitcher onClose={() => setSwitcherOpen(false)} />}
    </>
  )
}
