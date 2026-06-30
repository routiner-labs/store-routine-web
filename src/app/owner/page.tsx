'use client'

import Link from 'next/link'
import { useStore } from '@/context/StoreContext'
import { mockAttendance, mockChecklists, mockSpecialInstructions, mockRequests } from '@/mock/data'
import styles from './page.module.css'

function attendanceLabel(status: string) {
  const map: Record<string, string> = {
    CLOCKED_IN: '출근 완료',
    SCHEDULED: '출근 예정',
    LATE: '지각',
    ABSENT: '결근',
    CLOCKED_OUT: '퇴근',
  }
  return map[status] ?? status
}

export default function OwnerHome() {
  const { currentStore } = useStore()

  const openChecklist = mockChecklists.find((c) => c.id === '1')!
  const openDone = openChecklist.items.filter((i) => i.status === 'DONE').length
  const openTotal = openChecklist.items.length

  const instructionsDone = mockSpecialInstructions.filter((i) => i.status === 'DONE').length
  const instructionsTotal = mockSpecialInstructions.length

  const alertItems = [
    ...mockChecklists.flatMap((c) =>
      c.items
        .filter((i) => i.status === 'NEEDS_REVIEW')
        .map((i) => `${i.title}${i.value !== undefined ? ` · ${i.value}` : ''}`)
    ),
    ...mockChecklists.flatMap((c) =>
      c.items
        .filter((i) => i.completionType === 'PHOTO' && i.status === 'PENDING')
        .map((i) => `${i.title} 사진 미첨부`)
    ),
  ]

  const pendingCount = mockRequests.filter((r) => r.status === 'REQUESTED').length
  const inProgressCount = mockRequests.filter((r) => r.status === 'IN_PROGRESS').length
  const equipmentIssueCount = mockRequests.filter(
    (r) => r.type === '장비고장' && r.status !== 'DONE'
  ).length

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.storeName}>{currentStore.name}</h1>
          <p className={styles.date}>오늘 운영 현황</p>
        </div>
        <span className={styles.operatingBadge}>운영 중</span>
      </header>

      {alertItems.length > 0 && (
        <section className={styles.alertSection}>
          <h2 className={styles.alertTitle}>확인 필요</h2>
          <div className={styles.alertList}>
            {alertItems.map((text, i) => (
              <div key={i} className={styles.alertItem}>
                <span className={styles.alertDot} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={styles.mainGrid}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>출근 현황</h2>
          <div className={styles.card}>
            {mockAttendance.map((record) => (
              <div key={record.employeeId} className={styles.attendanceRow}>
                <div>
                  <p className={styles.employeeName}>{record.employeeName}</p>
                  <p className={styles.scheduleTime}>
                    {record.scheduledStart} ~ {record.scheduledEnd}
                    {record.clockedIn && ` · ${record.clockedIn} 출근`}
                  </p>
                </div>
                <span className={`${styles.statusBadge} ${styles[`status_${record.status}`]}`}>
                  {attendanceLabel(record.status)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>업무 현황</h2>
          <div className={styles.card}>
            <div className={styles.taskRow}>
              <span className={styles.taskLabel}>오픈 체크리스트</span>
              <div className={styles.taskRight}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(openDone / openTotal) * 100}%` }}
                  />
                </div>
                <span className={styles.progressText}>{openDone}/{openTotal}</span>
              </div>
            </div>
            <div className={styles.taskRow}>
              <span className={styles.taskLabel}>특별 지시</span>
              <div className={styles.taskRight}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(instructionsDone / instructionsTotal) * 100}%` }}
                  />
                </div>
                <span className={styles.progressText}>{instructionsDone}/{instructionsTotal}</span>
              </div>
            </div>
            <div className={styles.taskRow}>
              <span className={styles.taskLabel}>마감 체크리스트</span>
              <span className={styles.waitingText}>대기 중</span>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>요청 현황</h2>
          <Link href="/owner/requests" className={styles.sectionLink}>전체 보기</Link>
        </div>
        <div className={styles.requestGrid}>
          <div className={styles.requestStat}>
            <span className={`${styles.requestCount} ${pendingCount > 0 ? styles.countAlert : ''}`}>
              {pendingCount}
            </span>
            <span className={styles.requestLabel}>미확인</span>
          </div>
          <div className={styles.requestStat}>
            <span className={styles.requestCount}>{inProgressCount}</span>
            <span className={styles.requestLabel}>처리 중</span>
          </div>
          <div className={styles.requestStat}>
            <span className={`${styles.requestCount} ${equipmentIssueCount > 0 ? styles.countAlert : ''}`}>
              {equipmentIssueCount}
            </span>
            <span className={styles.requestLabel}>장비 이상</span>
          </div>
        </div>
      </section>
    </div>
  )
}
