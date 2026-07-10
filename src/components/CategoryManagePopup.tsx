'use client'

import { useState } from 'react'
import { LiaTimesSolid, LiaTrashAltSolid, LiaPlusSolid, LiaPaintBrushSolid, LiaPenSolid, LiaCheckSolid, LiaSearchSolid } from 'react-icons/lia'
import { categoryBadgeStyle } from '@/lib/categoryColors'
import styles from './CategoryManagePopup.module.css'

export interface CategoryLike {
  id: string
  name: string
  color?: string
}

/**
 * 카테고리 관리 공통 팝업 (테스크·요청·문서 페이지 공용).
 * - 기본은 보기 모드: 색상·이름·할당된 글 수 표시. 연필 버튼을 눌러야 이름·색상 수정 가능.
 * - 상태(categories, 초안, 색상 선택)와 CategoryColorPicker는 페이지가 그대로 소유하고, 이 컴포넌트는 표현만 담당한다.
 */
export default function CategoryManagePopup({
  categories,
  getCount,
  draftName,
  onDraftNameChange,
  draftColor,
  onAdd,
  onRename,
  onDelete,
  onPickColor,
  onClose,
}: {
  categories: CategoryLike[]
  getCount: (cat: CategoryLike) => number
  draftName: string
  onDraftNameChange: (value: string) => void
  draftColor?: string
  onAdd: () => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onPickColor: (id: string) => void
  onClose: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.title}>카테고리 관리</span>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <LiaTimesSolid />
          </button>
        </div>
        <div className={styles.searchBar}>
          <LiaSearchSolid className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="카테고리 검색"
          />
          {query && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setQuery('')}
              aria-label="검색어 지우기"
            >
              <LiaTimesSolid />
            </button>
          )}
        </div>
        <div className={styles.body}>
          <div className={styles.list}>
          {filtered.length === 0 && <p className={styles.empty}>검색 결과가 없습니다.</p>}
          {filtered.map((c) => {
            const editing = editingId === c.id
            return (
              <div key={c.id} className={styles.row}>
                {editing ? (
                  <>
                    <button
                      type="button"
                      className={styles.colorBtn}
                      style={categoryBadgeStyle(c.color)}
                      onClick={() => onPickColor(c.id)}
                      aria-label={`${c.name} 색상 변경`}
                    >
                      <LiaPaintBrushSolid />
                    </button>
                    <input
                      className={styles.input}
                      value={c.name}
                      onChange={(e) => onRename(c.id, e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className={styles.doneBtn}
                      onClick={() => setEditingId(null)}
                      aria-label="수정 완료"
                    >
                      <LiaCheckSolid />
                    </button>
                  </>
                ) : (
                  <>
                    <span className={styles.swatch} style={categoryBadgeStyle(c.color)} />
                    <span className={styles.name}>{c.name}</span>
                    <span className={styles.count}>{getCount(c)}건</span>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => setEditingId(c.id)}
                      aria-label={`${c.name} 수정`}
                    >
                      <LiaPenSolid />
                    </button>
                    <button
                      type="button"
                      className={styles.del}
                      onClick={() => onDelete(c.id)}
                      aria-label={`${c.name} 삭제`}
                    >
                      <LiaTrashAltSolid />
                    </button>
                  </>
                )}
              </div>
            )
          })}
          </div>
          <div className={styles.addRow}>
            <button
              type="button"
              className={styles.colorBtn}
              style={categoryBadgeStyle(draftColor)}
              onClick={() => onPickColor('NEW')}
              aria-label="새 카테고리 색상 선택"
            >
              <LiaPaintBrushSolid />
            </button>
            <input
              className={styles.input}
              value={draftName}
              onChange={(e) => onDraftNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAdd()
              }}
              placeholder="새 카테고리 이름"
            />
            <button
              className={styles.addBtn}
              onClick={onAdd}
              disabled={!draftName.trim()}
              aria-label="카테고리 추가"
            >
              <LiaPlusSolid />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
