'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LiaSearchSolid,
  LiaPlusSolid,
  LiaAngleRightSolid,
  LiaFileAltSolid,
  LiaCogSolid,
  LiaTimesSolid,
  LiaTrashAltSolid,
  LiaSlidersHSolid,
  LiaAngleDownSolid,
} from 'react-icons/lia'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES } from '@/mock/documents'
import type { StoreDocument, DocumentCategory } from '@/mock/documents'
import styles from './page.module.css'

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function DocumentRow({
  doc,
  categoryName,
  onClick,
}: {
  doc: StoreDocument
  categoryName: string
  onClick: () => void
}) {
  return (
    <button className={styles.listRow} onClick={onClick}>
      <div className={styles.listRowTop}>
        <span className={`${styles.catBadge} ${styles[`cat_${doc.category}`]}`}>{categoryName}</span>
        <span className={styles.listRowTitle}>{doc.title}</span>
      </div>
      <p className={styles.listRowPreview}>{stripHtml(doc.content)}</p>
      <div className={styles.listRowBottom}>
        <span className={styles.listRowMeta}>
          {doc.authorName} · {doc.updatedAt}
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
  const [catFilterOpen, setCatFilterOpen] = useState(false)
  const [filterAuthor, setFilterAuthor] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const [categories, setCategories] = useState<DocumentCategory[]>(DOCUMENT_CATEGORIES)
  const [fabOpen, setFabOpen] = useState(false)
  const [catManageOpen, setCatManageOpen] = useState(false)
  const [catDraft, setCatDraft] = useState('')
  const catSeqRef = useRef(0)

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '기타'

  const advActiveCount =
    (filterCategories.length > 0 ? 1 : 0) +
    (filterAuthor.trim() ? 1 : 0) +
    (filterDateFrom || filterDateTo ? 1 : 0)

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase()
    const author = filterAuthor.trim().toLowerCase()
    return DOCUMENT_CATALOG.filter((d) => filterCategories.length === 0 || filterCategories.includes(d.category))
      .filter((d) => !q || d.title.toLowerCase().includes(q) || stripHtml(d.content).toLowerCase().includes(q))
      .filter((d) => !author || d.authorName.toLowerCase().includes(author))
      .filter((d) => !filterDateFrom || d.createdAt >= filterDateFrom)
      .filter((d) => !filterDateTo || d.createdAt <= filterDateTo)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }, [filterCategories, appliedSearch, filterAuthor, filterDateFrom, filterDateTo])

  function resetAdv() {
    setFilterCategories([])
    setFilterAuthor('')
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  function toggleFilterCategory(id: string) {
    setFilterCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
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
    setCategories((prev) => [...prev, { id: `cat-${catSeqRef.current}`, name }])
    setCatDraft('')
    showToast('카테고리가 추가되었습니다')
  }

  function renameCategory(id: string, name: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
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
      </header>

      <div className={styles.toolbar}>
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
        <button
          className={`${styles.advBtn} ${advOpen || advActiveCount > 0 ? styles.advBtnActive : ''}`}
          onClick={() => setAdvOpen((v) => !v)}
        >
          <LiaSlidersHSolid />
          <span className={styles.advBtnLabel}>세부 검색</span>
        </button>
      </div>

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
          <span className={styles.advLabel}>카테고리</span>
          <div className={`${styles.advSearchWrap} ${styles.advSearchNarrow}`}>
            <button className={styles.catFilterBtn} onClick={() => setCatFilterOpen(true)}>
              <span className={styles.catFilterBtnLabel}>
                {filterCategories.length === 0 ? '전체 카테고리' : `카테고리 ${filterCategories.length}개 선택됨`}
              </span>
              <LiaAngleDownSolid />
            </button>
            {filterCategories.length > 0 && (
              <button className={styles.dateClear} onClick={() => setFilterCategories([])}>
                <LiaTimesSolid />
              </button>
            )}
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
              <button
                className={styles.dateClear}
                onClick={() => {
                  setFilterDateFrom('')
                  setFilterDateTo('')
                }}
              >
                <LiaTimesSolid />
              </button>
            )}
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

      {/* 카테고리 필터 선택 팝업 (체크박스 다중 선택) */}
      {catFilterOpen && (
        <div className={styles.catPopOverlay} onClick={() => setCatFilterOpen(false)}>
          <div className={styles.catPopCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.catPopHead}>
              <span className={styles.catPopTitle}>카테고리 선택</span>
              <button className={styles.modalClose} onClick={() => setCatFilterOpen(false)} aria-label="닫기">
                <LiaTimesSolid />
              </button>
            </div>
            <div className={styles.catFilterList}>
              {categories.map((c) => (
                <label key={c.id} className={styles.catFilterRow}>
                  <input
                    type="checkbox"
                    className={styles.catFilterCheckbox}
                    checked={filterCategories.includes(c.id)}
                    onChange={() => toggleFilterCategory(c.id)}
                  />
                  <span className={styles.catFilterName}>{c.name}</span>
                </label>
              ))}
            </div>
            <div className={styles.catFilterFoot}>
              <button className={styles.advResetBtn} onClick={() => setFilterCategories([])}>
                전체 해제
              </button>
            </div>
          </div>
        </div>
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
    </div>
  )
}
