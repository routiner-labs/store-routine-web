'use client'

import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  LiaSearchSolid,
  LiaPlusSolid,
  LiaAngleRightSolid,
  LiaFileAltSolid,
  LiaCogSolid,
  LiaTimesSolid,
  LiaSlidersHSolid,
  LiaUsersSolid,
} from 'react-icons/lia'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import { useHoverTooltip } from '@/lib/useHoverTooltip'
import { categoryBadgeStyle } from '@/lib/categoryColors'
import EmployeeName from '@/components/EmployeeName'
import MultiSelectFilter from '@/components/MultiSelectFilter'
import DateRangeFilter from '@/components/DateRangeFilter'
import CategoryColorPicker from '@/components/CategoryColorPicker'
import CategoryManagePopup from '@/components/CategoryManagePopup'
import { mockEmployees } from '@/mock/employees'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES } from '@/mock/documents'
import type { StoreDocument, DocumentCategory } from '@/mock/documents'
import styles from './page.module.css'

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function DocumentRow({
  doc,
  categoryName,
  categoryColor,
  onClick,
}: {
  doc: StoreDocument
  categoryName: string
  categoryColor?: string
  onClick: () => void
}) {
  return (
    <button className={styles.listRow} onClick={onClick}>
      <div className={styles.listRowTop}>
        <span className={styles.catBadge} style={categoryBadgeStyle(categoryColor)}>{categoryName}</span>
        <span className={styles.listRowTitle}>{doc.title}</span>
      </div>
      <p className={styles.listRowPreview}>{stripHtml(doc.content)}</p>
      <div className={styles.listRowBottom}>
        <span className={styles.listRowMeta}>
          <EmployeeName name={doc.authorName} /> · {doc.updatedAt}
        </span>
        <LiaAngleRightSolid className={styles.listRowChevron} />
      </div>
    </button>
  )
}

export default function OwnerDocuments() {
  const router = useRouter()
  const { showToast } = useToast()
  const confirm = useConfirm()

  const [searchText, setSearchText] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [filterCategories, setFilterCategories] = useState<string[]>([])

  // 세부 검색
  const [advOpen, setAdvOpen] = useState(false)
  const [filterAuthor, setFilterAuthor] = useState<string[]>([])
  const [authorInputText, setAuthorInputText] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const [categories, setCategories] = useState<DocumentCategory[]>(DOCUMENT_CATEGORIES)
  const [fabOpen, setFabOpen] = useState(false)
  const [catManageOpen, setCatManageOpen] = useState(false)
  const [catDraft, setCatDraft] = useState('')
  const [catDraftColor, setCatDraftColor] = useState<string | undefined>(undefined)
  const [catColorPickingId, setCatColorPickingId] = useState<string | null>(null) // 카테고리 id 또는 'NEW'(추가 행)
  const catSeqRef = useRef(0)

  useScrollLock(catManageOpen)
  // 카테고리 관리 팝업 — 뷰어형(변경 즉시 반영, ESC 바로 닫힘)
  usePopupEsc(catManageOpen, 'viewer', () => setCatManageOpen(false))
  const {
    anchorRef: authorAnchorRef,
    rect: authorTooltipRect,
    anchorHandlers: authorAnchorHandlers,
    tooltipHandlers: authorTooltipHandlers,
  } = useHoverTooltip<HTMLSpanElement>()

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '기타'
  const categoryColor = (id: string) => categories.find((c) => c.id === id)?.color
  const knownAuthorNames = new Set(mockEmployees.map((e) => e.name))

  function addAuthorTag(name: string) {
    const v = name.trim()
    if (!v || filterAuthor.includes(v)) return
    setFilterAuthor((prev) => [...prev, v])
  }

  function removeAuthorTag(name: string) {
    setFilterAuthor((prev) => prev.filter((n) => n !== name))
  }

  const advActiveCount =
    (filterCategories.length > 0 ? 1 : 0) +
    (filterAuthor.length > 0 ? 1 : 0) +
    (filterDateFrom || filterDateTo ? 1 : 0)

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase()
    return DOCUMENT_CATALOG.filter((d) => filterCategories.length === 0 || filterCategories.includes(d.category))
      .filter((d) => !q || d.title.toLowerCase().includes(q) || stripHtml(d.content).toLowerCase().includes(q))
      .filter((d) => filterAuthor.length === 0 || filterAuthor.some((name) => d.authorName.toLowerCase().includes(name.toLowerCase())))
      .filter((d) => !filterDateFrom || d.createdAt >= filterDateFrom)
      .filter((d) => !filterDateTo || d.createdAt <= filterDateTo)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }, [filterCategories, appliedSearch, filterAuthor, filterDateFrom, filterDateTo])

  function resetAdv() {
    setFilterCategories([])
    setFilterAuthor([])
    setAuthorInputText('')
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  function goToDetail(id: string) {
    router.push(`/owner/documents/${id}`)
  }

  function goToNew() {
    setFabOpen(false)
    router.push('/owner/documents/new')
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
    setFilterCategories((prev) => prev.filter((c) => c !== id))
    showToast('카테고리가 삭제되었습니다')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>문서함</h1>
        <div className={styles.headerSearch}>
          <div className={styles.searchWrap}>
            <LiaSearchSolid className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="문서 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setAppliedSearch(searchText)
              }}
            />
          </div>
          <button className={styles.searchBtn} onClick={() => setAppliedSearch(searchText)}>
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
      </header>

      <div className={`${styles.advPanel} ${advOpen ? styles.advPanelOpen : ''}`}>
        <div className={styles.advRow}>
          <span className={styles.advLabel}>내용</span>
          <div className={styles.advSearchWrap}>
            <div className={styles.searchWrap}>
              <LiaSearchSolid className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="제목·내용 검색"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setAppliedSearch(searchText)
                }}
              />
            </div>
            <button className={styles.searchBtn} onClick={() => setAppliedSearch(searchText)}>
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
              options={categories.map((c) => ({ id: c.id, label: c.name }))}
              selectedIds={filterCategories}
              onApply={setFilterCategories}
            />
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {filtered.length === 0 ? (
          <p className={styles.emptyState}>
            {appliedSearch || advActiveCount > 0 ? '검색 결과가 없습니다.' : '등록된 문서가 없습니다.'}
          </p>
        ) : (
          <div className={styles.listGroup}>
            {filtered.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                categoryName={categoryName(doc.category)}
                categoryColor={categoryColor(doc.category)}
                onClick={() => goToDetail(doc.id)}
              />
            ))}
          </div>
        )}
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
              새 문서 작성
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
        <CategoryManagePopup
          categories={categories}
          getCount={(c) => DOCUMENT_CATALOG.filter((d) => d.category === c.id).length}
          draftName={catDraft}
          onDraftNameChange={setCatDraft}
          draftColor={catDraftColor}
          onAdd={addCategory}
          onRename={renameCategory}
          onDelete={deleteCategory}
          onPickColor={setCatColorPickingId}
          onClose={() => setCatManageOpen(false)}
        />
      )}

      {/* 뱃지 색상 RGB 조정 팝업 */}
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
              : categoryName(catColorPickingId)
          }
          onApply={(hex) => setCategoryColor(catColorPickingId, hex)}
          onClose={() => setCatColorPickingId(null)}
        />
      )}
    </div>
  )
}
