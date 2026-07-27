import type { ReactNode } from 'react'
import styles from './EmployeeScheduleTable.module.css'

export default function EmployeeScheduleTable({
  mode,
  children,
}: {
  mode: 'base' | 'adjust'
  children: ReactNode
}) {
  return (
    <div className={`${styles.table} ${mode === 'base' ? styles.base : styles.adjust}`}>
      <div className={styles.head}>
        <span>직원</span>
        <span>{mode === 'base' ? '근무 요일' : '근무 여부'}</span>
        <span>근무 시간</span>
        <span>관리</span>
      </div>
      {children}
    </div>
  )
}
