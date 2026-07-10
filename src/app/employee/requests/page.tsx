'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LiaPlusSolid, LiaAngleRightSolid, LiaLockSolid, LiaUsersSolid, LiaCameraSolid, LiaSearchSolid } from 'react-icons/lia'
import { mockRequests, REQUEST_CATEGORIES } from '@/mock/data'
import { categoryBadgeStyle } from '@/lib/categoryColors'
import type { RequestStatus } from '@/types'
import styles from './page.module.css'

// 데모 직원 페르소나
const ME = '이지은'

const statusLabel: Record<string, string> = {
  REQUESTED: '미확인',
  CONFIRMED: '확인됨',
  IN_PROGRESS: '처리 중',
  DONE: '완료',
  REJECTED: '반려',
}

const STATUS_FILTERS: (RequestStatus | 'ALL')[] = ['ALL', 'REQUESTED', 'CONFIRMED', 'IN_PROGRESS', 'DONE', 'REJECTED']

export default function EmployeeRequestsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('ALL')
  const [searchText, setSearchText] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const q = appliedSearch.trim().toLowerCase()

  const myRequests = mockRequests
    .filter((r) => r.employeeName === ME)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const filtered = myRequests
    .filter((r) => filter === 'ALL' || r.status === filter)
    .filter((r) => !q || r.content.toLowerCase().includes(q))

  const countOf = (s: RequestStatus | 'ALL') =>
    s === 'ALL' ? myRequests.length : myRequests.filter((r) => r.status === s).length

  // 유형 뱃지 색 — 사장 요청함과 동일하게 카테고리 데이터 색을 inline으로 적용
  const typeStyleOf = (typeName: string) =>
    categoryBadgeStyle(REQUEST_CATEGORIES.find((c) => c.name === typeName)?.color)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>요청함</h1>
        <div className={styles.headerSearch}>
          <div className={styles.searchWrap}>
            <LiaSearchSolid className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="내용 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setAppliedSearch(searchText) }}
            />
          </div>
          <button className={styles.searchBtn} onClick={() => setAppliedSearch(searchText)}>
            검색
          </button>
        </div>
      </header>

      <div className={styles.chips}>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            className={`${styles.chip} ${filter === s ? styles.chipActive : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? '전체' : statusLabel[s]}
            <span className={styles.chipCount}>{countOf(s)}</span>
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>
            {q || filter !== 'ALL' ? '검색 결과가 없습니다.' : '보낸 요청이 없습니다.'}
          </p>
        ) : (
          filtered.map((req) => {
            const [date, time] = req.createdAt.split(' ')
            return (
              <Link key={req.id} href={`/employee/requests/${req.id}`} className={styles.row}>
                <div className={styles.rowTop}>
                  <span className={styles.typeTag} style={typeStyleOf(req.type)}>{req.type}</span>
                  <span className={`${styles.statusBadge} ${styles[`status_${req.status}`]}`}>
                    {statusLabel[req.status]}
                  </span>
                </div>
                <p className={styles.rowContent}>{req.content}</p>
                <div className={styles.rowBottom}>
                  <span className={styles.rowMeta}>{date} {time}</span>
                  <span className={styles.rowIcons}>
                    {req.hasPhoto && <LiaCameraSolid className={styles.metaIcon} />}
                    {req.visibility === 'OWNER_ONLY'
                      ? <LiaLockSolid className={styles.metaIcon} />
                      : <LiaUsersSolid className={styles.metaIcon} />}
                    <LiaAngleRightSolid className={styles.chevron} />
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* 새 요청 작성 FAB */}
      <div className={styles.fabWrap}>
        <button
          className={styles.fab}
          onClick={() => router.push('/employee/requests/new')}
          aria-label="새 요청 작성"
        >
          <LiaPlusSolid />
        </button>
      </div>
    </div>
  )
}
