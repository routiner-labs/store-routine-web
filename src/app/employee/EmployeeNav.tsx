'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './EmployeeNav.module.css'

const navItems = [
  { href: '/employee', label: '홈', short: '홈' },
  { href: '/employee/requests/new', label: '요청하기', short: '요청' },
]

export default function EmployeeNav() {
  const pathname = usePathname()
  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>루틴</div>
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
  )
}
