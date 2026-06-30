'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LiaThLargeSolid, LiaListSolid, LiaLockSolid, LiaUsersSolid,
  LiaSearchSolid, LiaSlidersHSolid, LiaTimesSolid,
} from 'react-icons/lia'
import { mockRequests } from '@/mock/data'
import { mockEmployees } from '@/mock/employees'
import type { EmployeeRequest, RequestType, RequestStatus, RequestVisibility } from '@/types'
import styles from './page.module.css'

type ViewMode = 'card' | 'list'
type VisibilityFilter = 'FILTER_ALL' | RequestVisibility

const statusLabel: Record<string, string> = {
  REQUESTED: '미확인',
  CONFIRMED: '확인됨',
  IN_PROGRESS: '처리 중',
  DONE: '완료',
  REJECTED: '반려',
}

const ALL_STATUSES: (RequestStatus | 'ALL')[] = ['ALL', 'REQUESTED', 'CONFIRMED', 'IN_PROGRESS', 'DONE', 'REJECTED']

const VISIBILITY_OPTIONS: Array<{ value: VisibilityFilter; label: string }> = [
  { value: 'FILTER_ALL', label: '전체' },
  { value: 'OWNER_ONLY', label: '사장만' },
  { value: 'ALL', label: '전체공개' },
]

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
      {statusLabel[status]}
    </span>
  )
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  if (visibility === 'OWNER_ONLY') {
    return <span className={styles.visibilityOwner}><LiaLockSolid /> 사장만</span>
  }
  return <span className={styles.visibilityAll}><LiaUsersSolid /> 전체공개</span>
}

function CardItem({ request, onClick }: { request: EmployeeRequest; onClick: () => void }) {
  const [date, time] = request.createdAt.split(' ')
  const isUnread = request.status === 'REQUESTED'
  return (
    <div
      className={`${styles.card} ${isUnread ? styles.cardUnread : ''}`}
      onClick={onClick}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardTags}>
          <span className={`${styles.typeTag} ${styles[`type_${request.type}`]}`}>
            {request.type}
          </span>
          <VisibilityBadge visibility={request.visibility} />
        </div>
        <StatusBadge status={request.status} />
      </div>
      <p className={styles.content}>{request.content}</p>
      <div className={styles.cardBottom}>
        <span className={styles.meta}>
          {request.employeeName} · {date} {time}
        </span>
        {request.hasPhoto && <span className={styles.photoBadge}>사진 있음</span>}
      </div>
    </div>
  )
}

function ListItem({ request, onClick }: { request: EmployeeRequest; onClick: () => void }) {
  const [date, time] = request.createdAt.split(' ')
  const isUnread = request.status === 'REQUESTED'
  return (
    <div
      className={`${styles.listRow} ${isUnread ? styles.listRowUnread : ''}`}
      onClick={onClick}
    >
      <span className={`${styles.listTypeBadge} ${styles[`type_${request.type}`]}`}>
        {request.type}
      </span>
      <p className={styles.listPreview}>{request.content}</p>
      <div className={styles.listMeta}>
        <span>{request.employeeName}</span>
        <span className={styles.listMetaDot} />
        <VisibilityBadge visibility={request.visibility} />
      </div>
      <div className={styles.listRight}>
        <span className={styles.listTime}>{date} {time}</span>
        <StatusBadge status={request.status} />
      </div>
    </div>
  )
}

export default function OwnerRequests() {
  const router = useRouter()
  const [view, setView] = useState<ViewMode>('list')
  const [searchText, setSearchText] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'ALL'>('ALL')

  // 세부 검색
  const [advOpen, setAdvOpen] = useState(false)
  const [filterType, setFilterType] = useState<RequestType | 'ALL'>('ALL')
  const [filterVisibility, setFilterVisibility] = useState<VisibilityFilter>('FILTER_ALL')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterAuthor, setFilterAuthor] = useState('')
  const [authorPopupOpen, setAuthorPopupOpen] = useState(false)
  const [empSearchText, setEmpSearchText] = useState('')

  const availableTypes: RequestType[] = [...new Set(mockRequests.map((r) => r.type))]

  const advActiveCount =
    (filterType !== 'ALL' ? 1 : 0) +
    (filterVisibility !== 'FILTER_ALL' ? 1 : 0) +
    (filterDateFrom || filterDateTo ? 1 : 0) +
    (filterStatus !== 'ALL' ? 1 : 0) +
    (filterAuthor.trim() ? 1 : 0)

  const filtered = mockRequests.filter((r) => {
    if (filterType !== 'ALL' && r.type !== filterType) return false
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false
    if (filterVisibility !== 'FILTER_ALL' && r.visibility !== filterVisibility) return false
    if (filterDateFrom && r.createdAt.split(' ')[0] < filterDateFrom) return false
    if (filterDateTo && r.createdAt.split(' ')[0] > filterDateTo) return false
    if (filterAuthor.trim() && !r.employeeName.toLowerCase().includes(filterAuthor.toLowerCase().trim())) return false
    if (appliedSearch.trim() && !r.content.toLowerCase().includes(appliedSearch.toLowerCase().trim())) return false
    return true
  })

  const pending = filtered.filter((r) => r.status === 'REQUESTED')
  const others = filtered.filter((r) => r.status !== 'REQUESTED')

  function resetAdv() {
    setFilterType('ALL')
    setFilterVisibility('FILTER_ALL')
    setFilterDateFrom('')
    setFilterDateTo('')
    setFilterStatus('ALL')
    setFilterAuthor('')
  }

  function goToDetail(id: string) {
    router.push(`/owner/requests/${id}`)
  }

  function renderItems(items: EmployeeRequest[]) {
    if (view === 'card') {
      return (
        <div className={styles.cardGrid}>
          {items.map((r) => <CardItem key={r.id} request={r} onClick={() => goToDetail(r.id)} />)}
        </div>
      )
    }
    return (
      <div className={styles.listGroup}>
        {items.map((r) => <ListItem key={r.id} request={r} onClick={() => goToDetail(r.id)} />)}
      </div>
    )
  }

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
          <button
            className={styles.searchBtn}
            onClick={() => setAppliedSearch(searchText)}
          >
            검색
          </button>
          <button
            className={`${styles.advBtn} ${advOpen || advActiveCount > 0 ? styles.advBtnActive : ''}`}
            onClick={() => setAdvOpen((v) => !v)}
          >
            <LiaSlidersHSolid />
            세부 검색
          </button>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === 'card' ? styles.viewBtnActive : ''}`}
            onClick={() => setView('card')}
          >
            <LiaThLargeSolid />
          </button>
          <button
            className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`}
            onClick={() => setView('list')}
          >
            <LiaListSolid />
          </button>
        </div>
      </header>

      {advOpen && (
        <div className={styles.advPanel}>
          <div className={styles.advRow}>
            <span className={styles.advLabel}>내용</span>
            <div className={styles.advSearchWrap}>
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
              <button
                className={styles.searchBtn}
                onClick={() => setAppliedSearch(searchText)}
              >
                검색
              </button>
              <button className={styles.advResetBtn} onClick={resetAdv}>
                <LiaTimesSolid /> 필터 초기화
              </button>
            </div>
          </div>

          <div className={styles.advRow}>
            <span className={styles.advLabel}>작성자</span>
            <div className={`${styles.advSearchWrap} ${styles.advSearchNarrow}`}>
              <div className={styles.searchWrap}>
                <LiaSearchSolid className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  placeholder="이름 검색"
                  value={filterAuthor}
                  onChange={(e) => setFilterAuthor(e.target.value)}
                />
              </div>
              {filterAuthor && (
                <button className={styles.dateClear} onClick={() => setFilterAuthor('')}>
                  <LiaTimesSolid />
                </button>
              )}
            </div>
            <div className={styles.authorPickerWrap}>
              <button
                className={styles.authorPickerBtn}
                onClick={() => setAuthorPopupOpen((v) => !v)}
              >
                <LiaUsersSolid />
              </button>
            </div>
          </div>

          <div className={styles.advRow}>
            <span className={styles.advLabel}>기간</span>
            <div className={styles.dateRange}>
              <input
                type="date"
                className={styles.dateInput}
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
              <span className={styles.dateSep}>~</span>
              <input
                type="date"
                className={styles.dateInput}
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
              {(filterDateFrom || filterDateTo) && (
                <button className={styles.dateClear} onClick={() => { setFilterDateFrom(''); setFilterDateTo('') }}>
                  <LiaTimesSolid />
                </button>
              )}
            </div>
          </div>

          <div className={styles.advRow}>
            <span className={styles.advLabel}>유형</span>
            <div className={styles.advChips}>
              <button
                className={`${styles.chip} ${filterType === 'ALL' ? styles.chipActive : ''}`}
                onClick={() => setFilterType('ALL')}
              >
                전체
              </button>
              {availableTypes.map((t) => (
                <button
                  key={t}
                  className={`${styles.chip} ${filterType === t ? styles.chipActive : ''}`}
                  onClick={() => setFilterType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.advRow}>
            <span className={styles.advLabel}>공개범위</span>
            <div className={styles.advChips}>
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.chip} ${filterVisibility === opt.value ? styles.chipActive : ''}`}
                  onClick={() => setFilterVisibility(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.advRow}>
            <span className={styles.advLabel}>상태</span>
            <div className={styles.advChips}>
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  className={`${styles.chip} ${filterStatus === s ? styles.chipActive : ''}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s === 'ALL' ? '전체' : statusLabel[s]}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {authorPopupOpen && (
        <div className={styles.authorPickerOverlay} onClick={() => { setAuthorPopupOpen(false); setEmpSearchText('') }}>
          <div className={styles.authorPickerModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.authorPickerHeader}>
              <span className={styles.authorPickerTitle}>직원 선택</span>
              <button className={styles.authorPickerClose} onClick={() => { setAuthorPopupOpen(false); setEmpSearchText('') }}>
                <LiaTimesSolid />
              </button>
            </div>
            <div className={styles.authorPickerSearch}>
              <LiaSearchSolid className={styles.authorPickerSearchIcon} />
              <input
                className={styles.authorPickerSearchInput}
                placeholder="이름 검색"
                value={empSearchText}
                onChange={(e) => setEmpSearchText(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.authorPickerList}>
              {mockEmployees
                .filter((emp) => !empSearchText.trim() || emp.name.includes(empSearchText.trim()))
                .map((emp) => (
                  <button
                    key={emp.id}
                    className={styles.authorPickerItem}
                    onClick={() => {
                      setFilterAuthor(emp.name)
                      setAuthorPopupOpen(false)
                      setEmpSearchText('')
                    }}
                  >
                    <span className={styles.authorPickerName}>{emp.name}</span>
                    <span className={styles.authorPickerPhone}>{emp.phone}</span>
                  </button>
                ))}
              {mockEmployees.filter((emp) => !empSearchText.trim() || emp.name.includes(empSearchText.trim())).length === 0 && (
                <p className={styles.authorPickerEmpty}>검색 결과가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.body}>
        {filtered.length === 0 ? (
          <p className={styles.emptyState}>검색 결과가 없습니다.</p>
        ) : (
          <>
            {pending.length > 0 && (
              <section className={styles.section}>
                <p className={styles.sectionLabel}>미확인 {pending.length}건</p>
                {renderItems(pending)}
              </section>
            )}
            {others.length > 0 && (
              <section className={styles.section}>
                <p className={styles.sectionLabel}>처리 중 / 완료</p>
                {renderItems(others)}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
