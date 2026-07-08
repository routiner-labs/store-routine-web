'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  LiaThLargeSolid, LiaListSolid, LiaLockSolid, LiaUsersSolid,
  LiaSearchSolid, LiaSlidersHSolid, LiaTimesSolid, LiaInfoCircleSolid,
  LiaPlusSolid, LiaCogSolid, LiaFileAltSolid, LiaTrashAltSolid, LiaPaintBrushSolid,
} from 'react-icons/lia'
import { mockRequests, REQUEST_CATEGORIES } from '@/mock/data'
import type { RequestCategory } from '@/mock/data'
import { mockEmployees } from '@/mock/employees'
import { useScrollLock } from '@/lib/useScrollLock'
import { useHoverTooltip } from '@/lib/useHoverTooltip'
import { categoryBadgeStyle } from '@/lib/categoryColors'
import { useConfirm } from '@/context/ConfirmContext'
import { useToast } from '@/context/ToastContext'
import EmployeeName from '@/components/EmployeeName'
import MultiSelectFilter from '@/components/MultiSelectFilter'
import DateRangeFilter from '@/components/DateRangeFilter'
import CategoryColorPicker from '@/components/CategoryColorPicker'
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

const KANBAN_STATUSES: RequestStatus[] = ['REQUESTED', 'CONFIRMED', 'IN_PROGRESS', 'DONE', 'REJECTED']

const THIRTY_DAYS_AGO = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
})()

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

function VisibilityIcon({ visibility }: { visibility: string }) {
  const isOwnerOnly = visibility === 'OWNER_ONLY'
  return (
    <span className={styles.visIcon} data-tooltip={isOwnerOnly ? '사장만' : '전체공개'}>
      {isOwnerOnly ? <LiaLockSolid /> : <LiaUsersSolid />}
    </span>
  )
}

function CardItem({ request, typeStyle, onClick }: { request: EmployeeRequest; typeStyle: React.CSSProperties; onClick: () => void }) {
  const [date, time] = request.createdAt.split(' ')
  const isUnread = request.status === 'REQUESTED'
  return (
    <div
      className={`${styles.card} ${isUnread ? styles.cardUnread : ''}`}
      onClick={onClick}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardTags}>
          <span className={styles.typeTag} style={typeStyle}>
            {request.type}
          </span>
        </div>
        <div className={styles.cardTopRight}>
          <VisibilityIcon visibility={request.visibility} />
          <StatusBadge status={request.status} />
        </div>
      </div>
      <p className={styles.content}>{request.content}</p>
      <div className={styles.cardBottom}>
        <span className={styles.meta}>
          <EmployeeName name={request.employeeName} /> · {date} {time}
        </span>
        {request.hasPhoto && <span className={styles.photoBadge}>사진 있음</span>}
      </div>
    </div>
  )
}

function ListItem({ request, typeStyle, onClick }: { request: EmployeeRequest; typeStyle: React.CSSProperties; onClick: () => void }) {
  const [date, time] = request.createdAt.split(' ')
  const isUnread = request.status === 'REQUESTED'
  return (
    <div
      className={`${styles.listRow} ${isUnread ? styles.listRowUnread : ''}`}
      onClick={onClick}
    >
      <span className={styles.listTypeBadge} style={typeStyle}>
        {request.type}
      </span>
      <p className={styles.listPreview}>{request.content}</p>
      <div className={styles.listMeta}>
        <EmployeeName name={request.employeeName} />
      </div>
      <div className={styles.listRight}>
        <div className={styles.listRightTop}>
          <VisibilityIcon visibility={request.visibility} />
          <span className={styles.listTime}>{date} {time}</span>
        </div>
        <StatusBadge status={request.status} />
      </div>
    </div>
  )
}

function KanbanCard({ request, typeStyle, onClick, onDragStart, onDragEnd, dragging }: {
  request: EmployeeRequest
  typeStyle: React.CSSProperties
  onClick: () => void
  onDragStart: () => void
  onDragEnd: () => void
  dragging: boolean
}) {
  const [date] = request.createdAt.split(' ')
  return (
    <div
      className={`${styles.kanbanCard} ${dragging ? styles.kanbanCardDragging : ''}`}
      draggable
      onClick={onClick}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
    >
      <div className={styles.kanbanCardTop}>
        <span className={styles.typeTag} style={typeStyle}>{request.type}</span>
        <VisibilityIcon visibility={request.visibility} />
      </div>
      <p className={styles.kanbanCardContent}>{request.content}</p>
      <div className={styles.kanbanCardMeta}>
        <EmployeeName name={request.employeeName} />
        <span>{date}</span>
      </div>
    </div>
  )
}

export default function OwnerRequests() {
  const router = useRouter()
  const [view, setView] = useState<ViewMode>('list')
  const [searchText, setSearchText] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<RequestStatus[]>([])

  // 세부 검색
  const [advOpen, setAdvOpen] = useState(false)
  const [filterType, setFilterType] = useState<RequestType[]>([])
  const [filterVisibility, setFilterVisibility] = useState<VisibilityFilter>('FILTER_ALL')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterAuthor, setFilterAuthor] = useState<string[]>([])
  const [authorInputText, setAuthorInputText] = useState('')

  const [requests, setRequests] = useState(mockRequests)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<RequestStatus | null>(null)

  const [categories, setCategories] = useState<RequestCategory[]>(REQUEST_CATEGORIES)
  const [fabOpen, setFabOpen] = useState(false)
  const [catManageOpen, setCatManageOpen] = useState(false)
  const [catDraft, setCatDraft] = useState('')
  const [catDraftColor, setCatDraftColor] = useState<string | undefined>(undefined)
  const [catColorPickingId, setCatColorPickingId] = useState<string | null>(null) // 카테고리 id 또는 'NEW'(추가 행)
  const catSeqRef = useRef(0)
  const confirm = useConfirm()
  const { showToast } = useToast()

  useScrollLock(catManageOpen)
  const {
    anchorRef: authorAnchorRef,
    rect: authorTooltipRect,
    anchorHandlers: authorAnchorHandlers,
    tooltipHandlers: authorTooltipHandlers,
  } = useHoverTooltip<HTMLSpanElement>()

  const availableTypes: RequestType[] = [...new Set(requests.map((r) => r.type))]
  const knownAuthorNames = new Set(mockEmployees.map((e) => e.name))

  // 요청은 카테고리 "이름"을 저장하므로 이름으로 색을 찾는다. 목록에 없는 이름(삭제된 카테고리 등)은 중립 스타일.
  const typeStyleOf = (typeName: string) => categoryBadgeStyle(categories.find((c) => c.name === typeName)?.color)

  function addAuthorTag(name: string) {
    const v = name.trim()
    if (!v || filterAuthor.includes(v)) return
    setFilterAuthor((prev) => [...prev, v])
  }

  function removeAuthorTag(name: string) {
    setFilterAuthor((prev) => prev.filter((n) => n !== name))
  }

  const advActiveCount =
    (filterType.length > 0 ? 1 : 0) +
    (filterVisibility !== 'FILTER_ALL' ? 1 : 0) +
    (filterDateFrom || filterDateTo ? 1 : 0) +
    (filterStatus.length > 0 ? 1 : 0) +
    (filterAuthor.length > 0 ? 1 : 0)

  const filtered = requests.filter((r) => {
    if (filterType.length > 0 && !filterType.includes(r.type)) return false
    if (filterStatus.length > 0 && !filterStatus.includes(r.status)) return false
    if (filterVisibility !== 'FILTER_ALL' && r.visibility !== filterVisibility) return false
    if (filterDateFrom && r.createdAt.split(' ')[0] < filterDateFrom) return false
    if (filterDateTo && r.createdAt.split(' ')[0] > filterDateTo) return false
    if (filterAuthor.length > 0 && !filterAuthor.some((name) => r.employeeName.toLowerCase().includes(name.toLowerCase()))) return false
    if (appliedSearch.trim() && !r.content.toLowerCase().includes(appliedSearch.toLowerCase().trim())) return false
    return true
  })

  const pending = filtered.filter((r) => r.status === 'REQUESTED')
  const others = filtered.filter((r) => r.status !== 'REQUESTED')

  function handleDragStart(id: string) {
    setDraggingId(id)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverStatus(null)
  }

  function handleDrop(status: RequestStatus) {
    if (!draggingId) return
    setRequests((prev) => prev.map((r) => r.id === draggingId ? { ...r, status } : r))
    setDraggingId(null)
    setDragOverStatus(null)
  }

  function resetAdv() {
    setFilterType([])
    setFilterVisibility('FILTER_ALL')
    setFilterDateFrom('')
    setFilterDateTo('')
    setFilterStatus([])
    setFilterAuthor([])
    setAuthorInputText('')
  }

  function goToDetail(id: string) {
    router.push(`/owner/requests/${id}`)
  }

  function goToNew() {
    setFabOpen(false)
    router.push('/owner/requests/new')
  }

  function openCatManage() {
    setFabOpen(false)
    setCatManageOpen(true)
  }

  function addCategory() {
    const name = catDraft.trim()
    if (!name) return
    catSeqRef.current += 1
    setCategories((prev) => [...prev, { id: `cat-${catSeqRef.current}`, name, color: catDraftColor }])
    setCatDraft('')
    setCatDraftColor(undefined)
    showToast('카테고리가 추가되었습니다')
  }

  function renameCategory(id: string, name: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
  }

  function setCategoryColor(id: string, color: string) {
    if (id === 'NEW') {
      setCatDraftColor(color)
      return
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, color } : c)))
  }

  async function deleteCategory(id: string) {
    const cat = categories.find((c) => c.id === id)
    const ok = await confirm({
      title: '카테고리를 삭제할까요?',
      message: `'${cat?.name ?? ''}' 카테고리가 삭제됩니다.`,
    })
    if (!ok) return
    setCategories((prev) => prev.filter((c) => c.id !== id))
    showToast('카테고리가 삭제되었습니다')
  }

  function renderItems(items: EmployeeRequest[]) {
    if (view === 'card') {
      return (
        <div className={styles.cardGrid}>
          {items.map((r) => <CardItem key={r.id} request={r} typeStyle={typeStyleOf(r.type)} onClick={() => goToDetail(r.id)} />)}
        </div>
      )
    }
    return (
      <div className={styles.listGroup}>
        {items.map((r) => <ListItem key={r.id} request={r} typeStyle={typeStyleOf(r.type)} onClick={() => goToDetail(r.id)} />)}
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
        </div>
        <button
          className={`${styles.advBtn} ${advOpen || advActiveCount > 0 ? styles.advBtnActive : ''}`}
          onClick={() => setAdvOpen((v) => !v)}
        >
          <LiaSlidersHSolid />
          <span className={styles.advBtnLabel}>세부 검색</span>
        </button>
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

      <div className={`${styles.advPanel} ${advOpen ? styles.advPanelOpen : ''}`}>
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
            <div className={styles.advSearchNarrow}>
              <div className={styles.authorField}>
                <div className={styles.authorTagList}>
                  <input
                    className={styles.authorTagInput}
                    placeholder={filterAuthor.length === 0 ? '이름 입력 후 Enter' : ''}
                    value={authorInputText}
                    onChange={(e) => setAuthorInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addAuthorTag(authorInputText)
                        setAuthorInputText('')
                      } else if (e.key === 'Backspace' && !authorInputText && filterAuthor.length > 0) {
                        removeAuthorTag(filterAuthor[filterAuthor.length - 1])
                      }
                    }}
                  />
                  {filterAuthor.length > 0 && (
                    <span
                      className={styles.authorSummaryBadge}
                      ref={authorAnchorRef}
                      {...authorAnchorHandlers}
                    >
                      {filterAuthor.length === 1 ? filterAuthor[0] : `${filterAuthor[0]} 외 ${filterAuthor.length - 1}`}
                      <button
                        type="button"
                        onClick={() => setFilterAuthor([])}
                        aria-label="작성자 선택 해제"
                      >
                        <LiaTimesSolid />
                      </button>
                    </span>
                  )}
                </div>
                <MultiSelectFilter
                  title="작성자"
                  searchPlaceholder="이름 검색"
                  options={mockEmployees.map((emp) => ({ id: emp.name, label: emp.name, sublabel: emp.phone }))}
                  selectedIds={filterAuthor.filter((n) => knownAuthorNames.has(n))}
                  onApply={(ids) => {
                    const freeTags = filterAuthor.filter((n) => !knownAuthorNames.has(n))
                    setFilterAuthor([...freeTags, ...ids])
                  }}
                  renderTrigger={({ open }) => (
                    <button
                      type="button"
                      className={styles.authorFieldIcon}
                      onClick={open}
                      aria-label="직원 선택"
                    >
                      <LiaUsersSolid />
                    </button>
                  )}
                />
              </div>
            </div>
          </div>

          <div className={styles.advRow}>
            <span className={styles.advLabel}>기간</span>
            <div className={styles.advSearchNarrow}>
              <DateRangeFilter
                title="기간"
                placeholder="전체 기간"
                startDate={filterDateFrom}
                endDate={filterDateTo}
                onApply={(start, end) => {
                  setFilterDateFrom(start)
                  setFilterDateTo(end)
                }}
              />
            </div>
          </div>

          <div className={styles.advRow}>
            <span className={styles.advLabel}>카테고리</span>
            <div className={styles.advSearchNarrow}>
              <MultiSelectFilter
                title="카테고리"
                placeholder="전체 카테고리"
                searchPlaceholder="카테고리 검색"
                options={availableTypes.map((t) => ({ id: t, label: t }))}
                selectedIds={filterType}
                onApply={setFilterType}
              />
            </div>
          </div>

          <div className={styles.advRow}>
            <span className={styles.advLabel}>상태</span>
            <div className={styles.advSearchNarrow}>
              <MultiSelectFilter
                title="상태"
                placeholder="전체 상태"
                searchPlaceholder="상태 검색"
                options={KANBAN_STATUSES.map((s) => ({ id: s, label: statusLabel[s] }))}
                selectedIds={filterStatus}
                onApply={(ids) => setFilterStatus(ids as RequestStatus[])}
              />
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

      </div>

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

      <div className={styles.kanban}>
        {KANBAN_STATUSES.map((status) => {
          const colItems = filtered.filter((r) => {
            if (r.status !== status) return false
            if ((status === 'DONE' || status === 'REJECTED') && r.createdAt.split(' ')[0] < THIRTY_DAYS_AGO) return false
            return true
          })
          const isOver = dragOverStatus === status && draggingId !== null
          return (
            <div
              key={status}
              className={`${styles.kanbanCol} ${isOver ? styles.kanbanColOver : ''}`}
              onDragEnter={(e) => { e.preventDefault(); if (draggingId) setDragOverStatus(status) }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => {
                if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverStatus(null)
                }
              }}
              onDrop={(e) => { e.preventDefault(); handleDrop(status) }}
            >
              <div className={styles.kanbanColHeader}>
                {(status === 'DONE' || status === 'REJECTED') ? (
                  <span className={styles.kanbanColTitleWrap} data-tooltip="최근 30일 데이터만 표시됩니다">
                    <span className={styles.kanbanColTitle}>{statusLabel[status]}</span>
                    <LiaInfoCircleSolid className={styles.kanbanColInfoIcon} />
                  </span>
                ) : (
                  <span className={styles.kanbanColTitle}>{statusLabel[status]}</span>
                )}
                <span className={styles.kanbanColCount}>{colItems.length}</span>
              </div>
              <div className={styles.kanbanColBody}>
                {colItems.length === 0 ? (
                  <p className={styles.kanbanEmpty}>요청 없음</p>
                ) : (
                  colItems.map((r) => (
                    <KanbanCard
                      key={r.id}
                      request={r}
                      typeStyle={typeStyleOf(r.type)}
                      onClick={() => goToDetail(r.id)}
                      onDragStart={() => handleDragStart(r.id)}
                      onDragEnd={handleDragEnd}
                      dragging={draggingId === r.id}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 우측 하단 FAB + 메뉴 */}
      {fabOpen && <div className={styles.fabOverlay} onClick={() => setFabOpen(false)} />}
      <div className={styles.fabWrap}>
        {fabOpen && (
          <div className={styles.fabMenu}>
            <button className={styles.fabMenuItem} onClick={openCatManage}>
              <LiaCogSolid className={styles.fabMenuIcon} />
              카테고리 관리
            </button>
            <button className={styles.fabMenuItem} onClick={goToNew}>
              <LiaFileAltSolid className={styles.fabMenuIcon} />
              요청 작성하기
            </button>
          </div>
        )}
        <button
          className={`${styles.fab} ${fabOpen ? styles.fabActive : ''}`}
          onClick={() => setFabOpen((o) => !o)}
          aria-label="추가 메뉴"
        >
          <LiaPlusSolid />
        </button>
      </div>

      {/* 작성자 선택 목록 툴팁 (document.body 포털) */}
      {authorTooltipRect && filterAuthor.length >= 1 && createPortal(
        <div
          className={styles.authorSummaryTooltip}
          style={{ top: authorTooltipRect.top, right: authorTooltipRect.right }}
          {...authorTooltipHandlers}
        >
          <div className={styles.authorSummaryTooltipCard}>
            {filterAuthor.map((name) => (
              <span key={name} className={styles.tooltipRow}>
                <span className={styles.tooltipAvatar}>{name[0]}</span>
                <span className={styles.tooltipName}>{name}</span>
                <button
                  type="button"
                  className={styles.tooltipRemove}
                  onClick={() => removeAuthorTag(name)}
                  aria-label={`${name} 제거`}
                >
                  <LiaTimesSolid />
                </button>
              </span>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* 카테고리 관리 팝업 */}
      {catManageOpen && (
        <div className={styles.catPopOverlay} onClick={() => setCatManageOpen(false)}>
          <div className={styles.catPopCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.catPopHead}>
              <span className={styles.catPopTitle}>카테고리 관리</span>
              <button
                className={styles.modalClose}
                onClick={() => setCatManageOpen(false)}
                aria-label="닫기"
              >
                <LiaTimesSolid />
              </button>
            </div>
            <div className={styles.catManageBody}>
              {categories.map((c) => (
                <div key={c.id} className={styles.catManageRow}>
                  <button
                    type="button"
                    className={styles.catColorBtn}
                    style={categoryBadgeStyle(c.color)}
                    onClick={() => setCatColorPickingId(c.id)}
                    aria-label={`${c.name} 뱃지 색상 변경`}
                  >
                    <LiaPaintBrushSolid />
                  </button>
                  <input
                    className={styles.catManageInput}
                    value={c.name}
                    onChange={(e) => renameCategory(c.id, e.target.value)}
                  />
                  <button
                    className={styles.catManageDel}
                    onClick={() => deleteCategory(c.id)}
                    aria-label={`${c.name} 삭제`}
                  >
                    <LiaTrashAltSolid />
                  </button>
                </div>
              ))}
              <div className={styles.catAddRow}>
                <button
                  type="button"
                  className={styles.catColorBtn}
                  style={categoryBadgeStyle(catDraftColor)}
                  onClick={() => setCatColorPickingId('NEW')}
                  aria-label="새 카테고리 뱃지 색상 선택"
                >
                  <LiaPaintBrushSolid />
                </button>
                <input
                  className={styles.catManageInput}
                  value={catDraft}
                  onChange={(e) => setCatDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addCategory()
                  }}
                  placeholder="새 카테고리 이름"
                />
                <button
                  className={styles.catAddBtn}
                  onClick={addCategory}
                  disabled={!catDraft.trim()}
                  aria-label="카테고리 추가"
                >
                  <LiaPlusSolid />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 뱃지 색상 선택 팝업 (스펙트럼 + RGB) */}
      {catColorPickingId && (
        <CategoryColorPicker
          initialColor={
            catColorPickingId === 'NEW'
              ? catDraftColor
              : categories.find((c) => c.id === catColorPickingId)?.color
          }
          previewText={
            catColorPickingId === 'NEW'
              ? catDraft.trim() || '새 카테고리'
              : categories.find((c) => c.id === catColorPickingId)?.name ?? ''
          }
          onApply={(hex) => setCategoryColor(catColorPickingId, hex)}
          onClose={() => setCatColorPickingId(null)}
        />
      )}
    </div>
  )
}
