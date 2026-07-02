'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiaSearchSolid, LiaPlusSolid, LiaAngleRightSolid } from 'react-icons/lia'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES } from '@/mock/documents'
import type { StoreDocument } from '@/mock/documents'
import styles from './page.module.css'

function categoryName(id: string): string {
  return DOCUMENT_CATEGORIES.find((c) => c.id === id)?.name ?? '기타'
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function DocumentRow({ doc, onClick }: { doc: StoreDocument; onClick: () => void }) {
  return (
    <button className={styles.listRow} onClick={onClick}>
      <div className={styles.listRowTop}>
        <span className={`${styles.catBadge} ${styles[`cat_${doc.category}`]}`}>
          {categoryName(doc.category)}
        </span>
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
  const [searchText, setSearchText] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase()
    return DOCUMENT_CATALOG.filter((d) => filterCategory === 'ALL' || d.category === filterCategory)
      .filter((d) => !q || d.title.toLowerCase().includes(q) || stripHtml(d.content).toLowerCase().includes(q))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }, [filterCategory, appliedSearch])

  function goToDetail(id: string) {
    router.push(`/owner/documents/${id}`)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>문서함</h1>
        <button className={styles.newBtn} onClick={() => router.push('/owner/documents/new')}>
          <LiaPlusSolid />
          <span className={styles.newBtnLabel}>새 문서</span>
        </button>
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
        {DOCUMENT_CATEGORIES.map((c) => (
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
              <DocumentRow key={doc.id} doc={doc} onClick={() => goToDetail(doc.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
