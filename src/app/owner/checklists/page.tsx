import { mockChecklists } from '@/mock/data'
import type { Checklist } from '@/types'
import styles from './page.module.css'

const typeLabel: Record<string, string> = {
  OPEN: '오픈',
  CLOSE: '마감',
  CLEANING: '청소',
  INVENTORY: '재고',
  SPECIAL: '특별',
}

const statusLabel: Record<string, string> = {
  DONE: '완료',
  PENDING: '미완료',
  NEEDS_REVIEW: '검토 필요',
  SKIPPED: '건너뜀',
}

function completionTypeText(type: string) {
  const map: Record<string, string> = {
    CHECK: '확인',
    PHOTO: '사진',
    NUMBER: '숫자',
    MEMO: '메모',
    SELECT: '선택',
    OWNER_CONFIRM: '사장확인',
  }
  return map[type] ?? '•'
}

function ChecklistCard({ checklist }: { checklist: Checklist }) {
  const done = checklist.items.filter((i) => i.status === 'DONE').length
  const total = checklist.items.length
  const needsReview = checklist.items.filter((i) => i.status === 'NEEDS_REVIEW').length
  const percent = Math.round((done / total) * 100)

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <span className={styles.typeTag}>{typeLabel[checklist.type]}</span>
          <h3 className={styles.cardTitle}>{checklist.title}</h3>
          {needsReview > 0 && (
            <span className={styles.reviewBadge}>검토 {needsReview}건</span>
          )}
        </div>
        <div className={styles.progressRow}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${percent}%` }} />
          </div>
          <span className={styles.progressText}>{done}/{total}</span>
        </div>
      </div>

      <div className={styles.itemList}>
        {checklist.items.map((item) => (
          <div key={item.id} className={`${styles.item} ${styles[`item_${item.status}`]}`}>
            <span className={styles.completionIcon}>{completionTypeText(item.completionType)}</span>
            <span className={styles.itemTitle}>{item.title}</span>
            <div className={styles.itemRight}>
              {item.value !== undefined && (
                <span className={styles.itemValue}>{item.value}</span>
              )}
              <span className={`${styles.itemStatus} ${styles[`itemStatus_${item.status}`]}`}>
                {statusLabel[item.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OwnerChecklists() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>체크리스트</h1>
      </header>
      <div className={styles.list}>
        {mockChecklists.map((checklist) => (
          <ChecklistCard key={checklist.id} checklist={checklist} />
        ))}
      </div>
    </div>
  )
}
