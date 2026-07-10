'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LiaSearchSolid, LiaAngleRightSolid, LiaPlusSolid } from 'react-icons/lia'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES } from '@/mock/documents'
import { categoryBadgeStyle } from '@/lib/categoryColors'
import EmployeeName from '@/components/EmployeeName'
import styles from './page.module.css'

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function EmployeeDocumentsPage() {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  const q = appliedSearch.trim().toLowerCase()
  const filtered = DOCUMENT_CATALOG
    .filter((d) => !filterCategory || d.category === filterCategory)
    .filter((d) => !q || d.title.toLowerCase().includes(q) || stripHtml(d.content).toLowerCase().includes(q))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  const categoryName = (id: string) => DOCUMENT_CATEGORIES.find((c) => c.id === id)?.name ?? '기타'
  const categoryColor = (id: string) => DOCUMENT_CATEGORIES.find((c) => c.id === id)?.color

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
              onKeyDown={(e) => { if (e.key === 'Enter') setAppliedSearch(searchText) }}
            />
          </div>
          <button className={styles.searchBtn} onClick={() => setAppliedSearch(searchText)}>
            검색
          </button>
        </div>
      </header>

      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${filterCategory === null ? styles.chipActive : ''}`}
          onClick={() => setFilterCategory(null)}
        >
          전체
        </button>
        {DOCUMENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.chip} ${filterCategory === cat.id ? styles.chipActive : ''}`}
            onClick={() => setFilterCategory(filterCategory === cat.id ? null : cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>검색 결과가 없습니다.</p>
        ) : (
          filtered.map((doc) => (
            <Link key={doc.id} href={`/employee/documents/${doc.id}`} className={styles.row}>
              <div className={styles.rowTop}>
                <span className={styles.catBadge} style={categoryBadgeStyle(categoryColor(doc.category))}>
                  {categoryName(doc.category)}
                </span>
                <span className={styles.rowTitle}>{doc.title}</span>
              </div>
              <p className={styles.rowPreview}>{stripHtml(doc.content)}</p>
              <div className={styles.rowBottom}>
                <span className={styles.rowMeta}><EmployeeName name={doc.authorName} /> · {doc.updatedAt}</span>
                <LiaAngleRightSolid className={styles.chevron} />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* 새 문서 작성 FAB */}
      <div className={styles.fabWrap}>
        <button
          className={styles.fab}
          onClick={() => router.push('/employee/documents/new')}
          aria-label="새 문서 작성"
        >
          <LiaPlusSolid />
        </button>
      </div>
    </div>
  )
}
