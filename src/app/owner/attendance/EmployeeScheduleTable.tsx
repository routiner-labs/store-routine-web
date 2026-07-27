import type { ReactNode } from 'react'
import { LiaSearchSolid, LiaTimesSolid } from 'react-icons/lia'
import styles from './EmployeeScheduleTable.module.css'

export default function EmployeeScheduleTable({
  mode,
  children,
  query,
  onQueryChange,
  empty,
}: {
  mode: 'base' | 'adjust'
  children: ReactNode
  query: string
  onQueryChange: (value: string) => void
  empty: boolean
}) {
  const label = mode === 'base' ? '기본 스케줄 편집표' : '일자별 조정 편집표'

  return (
    <>
      <div className={styles.searchToolbar}>
        <label className={styles.search}>
          <LiaSearchSolid className={styles.searchIcon} aria-hidden="true" />
          <input type="text" aria-label="직원 이름 검색" placeholder="직원 이름 검색" value={query} onChange={(event) => onQueryChange(event.target.value)} />
          {query && <button type="button" aria-label="직원 검색어 지우기" onClick={() => onQueryChange('')}><LiaTimesSolid aria-hidden="true" /></button>}
        </label>
      </div>
      <div role="table" aria-label={label} className={`${styles.table} ${mode === 'base' ? styles.base : styles.adjust}`}>
        <div role="row" className={styles.head}>
          <span role="columnheader">직원</span>
          <span role="columnheader">{mode === 'base' ? '근무 요일' : '근무 여부'}</span>
          <span role="columnheader">근무 시간</span>
          <span role="columnheader">관리</span>
        </div>
        {empty ? <div role="row" className={styles.emptyRow}><span role="cell" aria-colspan={4}>검색 결과가 없습니다.</span></div> : children}
      </div>
    </>
  )
}
