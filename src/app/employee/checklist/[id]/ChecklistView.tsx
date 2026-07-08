'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Checklist, ChecklistItem, TaskStatus } from '@/types'
import styles from './ChecklistView.module.css'

function ItemInput({
  item,
  onComplete,
}: {
  item: ChecklistItem
  onComplete: (id: string, value?: string | number) => void
}) {
  const [inputValue, setInputValue] = useState<string>(
    item.value !== undefined ? String(item.value) : ''
  )
  const [photoAttached, setPhotoAttached] = useState(
    item.status === 'DONE' || item.status === 'NEEDS_REVIEW'
  )

  const isDone = item.status === 'DONE' || item.status === 'NEEDS_REVIEW'

  if (item.completionType === 'CHECK') {
    return (
      <button
        className={`${styles.checkBtn} ${isDone ? styles.checked : ''}`}
        onClick={() => !isDone && onComplete(item.id)}
      >
        {isDone ? '✓' : ''}
      </button>
    )
  }

  if (item.completionType === 'NUMBER') {
    return (
      <div className={styles.numberInput}>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="숫자 입력"
          disabled={isDone}
          className={styles.input}
        />
        {!isDone && (
          <button
            className={styles.confirmBtn}
            onClick={() => inputValue && onComplete(item.id, Number(inputValue))}
          >
            확인
          </button>
        )}
      </div>
    )
  }

  if (item.completionType === 'MEMO') {
    return (
      <div className={styles.memoInput}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="내용을 입력하세요"
          disabled={isDone}
          className={styles.textarea}
          rows={3}
        />
        {!isDone && (
          <button
            className={styles.confirmBtn}
            onClick={() => inputValue && onComplete(item.id, inputValue)}
          >
            저장
          </button>
        )}
      </div>
    )
  }

  if (item.completionType === 'PHOTO') {
    return (
      <button
        className={`${styles.photoBtn} ${photoAttached ? styles.photoAttached : ''}`}
        onClick={() => {
          if (!photoAttached) {
            setPhotoAttached(true)
            onComplete(item.id, '사진 첨부됨')
          }
        }}
      >
        {photoAttached ? '사진 첨부됨' : '사진 첨부하기'}
      </button>
    )
  }

  return null
}

export default function ChecklistView({ checklist }: { checklist: Checklist }) {
  const [items, setItems] = useState<ChecklistItem[]>(checklist.items)

  const done = items.filter((i) => i.status === 'DONE' || i.status === 'NEEDS_REVIEW').length
  const total = items.length
  const percent = Math.round((done / total) * 100)

  function completeItem(id: string, value?: string | number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'DONE' as TaskStatus, value: value ?? item.value }
          : item
      )
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/employee" className={styles.backBtn}>‹ 뒤로</Link>
        <h1 className={styles.title}>{checklist.title}</h1>
      </header>

      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${percent}%` }} />
        </div>
        <div className={styles.progressMeta}>
          <span>{percent}% 완료</span>
          <span>{done}/{total} 항목</span>
        </div>
      </div>

      <div className={styles.itemList}>
        {items.map((item) => {
          const isDone = item.status === 'DONE' || item.status === 'NEEDS_REVIEW'
          return (
            <div
              key={item.id}
              className={`${styles.item} ${isDone ? styles.itemDone : ''} ${item.status === 'NEEDS_REVIEW' ? styles.itemReview : ''}`}
            >
              <div className={styles.itemHeader}>
                <div className={styles.itemMeta}>
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.itemDesc}>{item.description}</p>
                </div>
              </div>
              <div className={styles.itemAction}>
                <ItemInput item={item} onComplete={completeItem} />
              </div>
            </div>
          )
        })}
      </div>

      {done === total && (
        <div className={styles.completeSection}>
          <p className={styles.completeText}>모든 항목을 완료했습니다</p>
          <Link href="/employee" className={styles.completeBtn}>홈으로 돌아가기</Link>
        </div>
      )}
    </div>
  )
}
