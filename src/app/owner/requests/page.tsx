import { mockRequests } from '@/mock/data'
import type { EmployeeRequest } from '@/types'
import styles from './page.module.css'

const requestStatusLabel: Record<string, string> = {
  REQUESTED: '미확인',
  CONFIRMED: '확인됨',
  IN_PROGRESS: '처리 중',
  DONE: '완료',
  REJECTED: '반려',
}

function RequestCard({ request }: { request: EmployeeRequest }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.typeTag}>{request.type}</span>
        <span className={`${styles.statusBadge} ${styles[`status_${request.status}`]}`}>
          {requestStatusLabel[request.status]}
        </span>
      </div>
      <p className={styles.content}>{request.content}</p>
      <div className={styles.cardBottom}>
        <span className={styles.meta}>
          {request.employeeName} · {request.createdAt}
        </span>
        {request.hasPhoto && <span className={styles.photoBadge}>사진 있음</span>}
      </div>
    </div>
  )
}

export default function OwnerRequests() {
  const pending = mockRequests.filter((r) => r.status === 'REQUESTED')
  const others = mockRequests.filter((r) => r.status !== 'REQUESTED')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>요청함</h1>
      </header>

      {pending.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>미확인 {pending.length}건</h2>
          <div className={styles.list}>
            {pending.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>처리 중 / 완료</h2>
        <div className={styles.list}>
          {others.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      </section>
    </div>
  )
}
