'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LiaSearchSolid, LiaAngleRightSolid, LiaPlusSolid, LiaSlidersHSolid, LiaTimesSolid } from 'react-icons/lia'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES } from '@/mock/documents'
import { categoryBadgeStyle } from '@/lib/categoryColors'
import { stripHtml } from '@/lib/htmlText'
import EmployeeName from '@/components/EmployeeName'
import MultiSelectFilter from '@/components/MultiSelectFilter'
import DateRangeFilter from '@/components/DateRangeFilter'
import styles from './page.module.css'

export default function EmployeeDocumentsPage() {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [advOpen, setAdvOpen] = useState(false)
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const advActiveCount =
    (filterCategories.length > 0 ? 1 : 0) +
    (filterDateFrom || filterDateTo ? 1 : 0)

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase()
    return DOCUMENT_CATALOG
      .filter((d) => filterCategories.length === 0 || filterCategories.includes(d.category))
      .filter((d) => !q || d.title.toLowerCase().includes(q) || stripHtml(d.content).toLowerCase().includes(q))
      .filter((d) => !filterDateFrom || d.createdAt >= filterDateFrom)
      .filter((d) => !filterDateTo || d.createdAt <= filterDateTo)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }, [appliedSearch, filterCategories, filterDateFrom, filterDateTo])

  const categoryName = (id: string) => DOCUMENT_CATEGORIES.find((c) => c.id === id)?.name ?? '湲고?'
  const categoryColor = (id: string) => DOCUMENT_CATEGORIES.find((c) => c.id === id)?.color

  function resetAdv() {
    setFilterCategories([])
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>臾몄꽌??</h1>
        <div className={styles.headerSearch}>
          <div className={styles.searchWrap}>
            <LiaSearchSolid className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="臾몄꽌 寃??"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setAppliedSearch(searchText)
              }}
            />
          </div>
          <button className={styles.searchBtn} onClick={() => setAppliedSearch(searchText)}>
            寃??
          </button>
        </div>
        <button
          className={`${styles.advBtn} ${advOpen || advActiveCount > 0 ? styles.advBtnActive : ''}`}
          onClick={() => setAdvOpen((prev) => !prev)}
        >
          <LiaSlidersHSolid />
          <span className={styles.advBtnLabel}>?몃? 寃??</span>
        </button>
      </header>

      <div className={`${styles.advPanel} ${advOpen ? styles.advPanelOpen : ''}`}>
        <div className={styles.advRow}>
          <span className={styles.advLabel}>?댁슜</span>
          <div className={styles.advSearchWrap}>
            <div className={styles.searchWrap}>
              <LiaSearchSolid className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="?쒕ぉ쨌?댁슜 寃??"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setAppliedSearch(searchText)
                }}
              />
            </div>
            <button className={styles.searchBtn} onClick={() => setAppliedSearch(searchText)}>
              寃??
            </button>
            <button className={styles.advResetBtn} onClick={resetAdv}>
              <LiaTimesSolid /> ?꾪꽣 珥덇린??
            </button>
          </div>
        </div>

        <div className={styles.advRow}>
          <span className={styles.advLabel}>湲곌컙</span>
          <div className={styles.advSearchNarrow}>
            <DateRangeFilter
              title="湲곌컙"
              placeholder="?꾩껜 湲곌컙"
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
          <span className={styles.advLabel}>移댄뀒怨좊━</span>
          <div className={styles.advSearchNarrow}>
            <MultiSelectFilter
              title="移댄뀒怨좊━"
              placeholder="?꾩껜 移댄뀒怨좊━"
              searchPlaceholder="移댄뀒怨좊━ 寃??"
              options={DOCUMENT_CATEGORIES.map((cat) => ({ id: cat.id, label: cat.name }))}
              selectedIds={filterCategories}
              onApply={setFilterCategories}
            />
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>
            {appliedSearch || advActiveCount > 0 ? '寃??寃곌낵媛 ?놁뒿?덈떎.' : '?깅줉??臾몄꽌媛 ?놁뒿?덈떎.'}
          </p>
        ) : (
          <div className={styles.list}>
            {filtered.map((doc) => (
              <Link key={doc.id} href={`/employee/documents/${doc.id}`} className={styles.row}>
                <div className={styles.rowTop}>
                  <span className={styles.catBadge} style={categoryBadgeStyle(categoryColor(doc.category))}>
                    {categoryName(doc.category)}
                  </span>
                  <span className={styles.rowTitle}>{doc.title}</span>
                </div>
                <p className={styles.rowPreview}>{stripHtml(doc.content)}</p>
                <div className={styles.rowBottom}>
                  <span className={styles.rowMeta}>
                    <EmployeeName name={doc.authorName} /> 쨌 {doc.updatedAt}
                  </span>
                  <LiaAngleRightSolid className={styles.chevron} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className={styles.fabWrap}>
        <button
          className={styles.fab}
          onClick={() => router.push('/employee/documents/new')}
          aria-label="??臾몄꽌 ?묒꽦"
        >
          <LiaPlusSolid />
        </button>
      </div>
    </div>
  )
}
