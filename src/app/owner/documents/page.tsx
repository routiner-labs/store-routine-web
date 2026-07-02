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
  const [filterCategory, setFilterCategory] = useState('ALL')

  const [categories, setCategories] = useState<DocumentCategory[]>(DOCUMENT_CATEGORIES)
  const [fabOpen, setFabOpen] = useState(false)
  const [catManageOpen, setCatManageOpen] = useState(false)
  const [catDraft, setCatDraft] = useState('')
  const catSeqRef = useRef(0)

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '기타'

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase()
    return DOCUMENT_CATALOG.filter((d) => filterCategory === 'ALL' || d.category === filterCategory)
      .filter((d) => !q || d.title.toLowerCase().includes(q) || stripHtml(d.content).toLowerCase().includes(q))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }, [filterCategory, appliedSearch])

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
    if (filterCategory === id) setFilterCategory('ALL')
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
      </div>

      <div className={styles.catRow}>
        <button
          className={`${styles.chip} ${filterCategory === 'ALL' ? styles.chipActive : ''}`}
          onClick={() => setFilterCategory('ALL')}
        >
          전체
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`${styles.chip} ${filterCategory === c.id ? styles.chipActive : ''}`}
            onClick={() => setFilterCategory(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {filtered.length === 0 ? (
          <p className={styles.emptyState}>
            {appliedSearch || filterCategory !== 'ALL' ? '검색 결과가 없습니다.' : '등록된 문서가 없습니다.'}
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
