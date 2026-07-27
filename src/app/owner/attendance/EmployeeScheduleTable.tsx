import type { ReactNode } from 'react'
import styles from './EmployeeScheduleTable.module.css'

export default function EmployeeScheduleTable({
  mode,
  children,
}: {
  mode: 'base' | 'adjust'
  children: ReactNode
}) {
  const label = mode === 'base' ? '기본 스케줄 편집표' : '일자별 조정 편집표'

  return (
    <div
      role="table"
      aria-label={label}
      className={`${styles.table} ${mode === 'base' ? styles.base : styles.adjust}`}
    >
      <div role="row" className={styles.head}>
        <span role="columnheader">직원</span>
        <span role="columnheader">{mode === 'base' ? '근무 요일' : '근무 여부'}</span>
        <span role="columnheader">근무 시간</span>
        <span role="columnheader">관리</span>
      </div>
      {children}
    </div>
  )
}
