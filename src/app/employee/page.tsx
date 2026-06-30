import Link from 'next/link'
import { mockChecklists, mockSpecialInstructions } from '@/mock/data'
import styles from './page.module.css'

export default function EmployeeHome() {
  const myChecklists = mockChecklists.filter((c) => c.id === '1' || c.id === '3')
  const myInstruction = mockSpecialInstructions.find((i) => i.assignedTo === '이지은')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.greeting}>안녕하세요</p>
          <h1 className={styles.name}>이지은 님</h1>
        </div>
        <div className={styles.storeBadge}>스타벅스 강남점</div>
      </header>

      <section className={styles.shiftSection}>
        <div className={styles.shiftInfo}>
          <div>
            <p className={styles.shiftLabel}>오늘 근무</p>
            <p className={styles.shiftTime}>16:00 ~ 22:00</p>
          </div>
          <button className={styles.clockInBtn}>출근하기</button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>오늘 할 일</h2>
        <div className={styles.taskList}>
          {myChecklists.map((checklist) => {
            const done = checklist.items.filter((i) => i.status === 'DONE').length
            const total = checklist.items.length
            const percent = Math.round((done / total) * 100)
            return (
              <Link
                key={checklist.id}
                href={`/employee/checklist/${checklist.id}`}
                className={styles.taskCard}
              >
                <div className={styles.taskInfo}>
                  <p className={styles.taskTitle}>{checklist.title}</p>
                  <div className={styles.taskProgressRow}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${percent}%` }} />
                    </div>
                    <span className={styles.progressText}>{done}/{total}</span>
                  </div>
                </div>
                <span className={styles.taskArrow}>›</span>
              </Link>
            )
          })}

          {myInstruction && (
            <div className={styles.instructionCard}>
              <div className={styles.taskInfo}>
                <p className={styles.instructionLabel}>특별 지시</p>
                <p className={styles.instructionTitle}>{myInstruction.title}</p>
              </div>
              <span className={`${styles.instructionStatus} ${styles[`ist_${myInstruction.status}`]}`}>
                {myInstruction.status === 'DONE' ? '완료' : '확인함'}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>요청하기</h2>
        <div className={styles.requestGrid}>
          {[
            { label: '재료 부족', type: '재료부족' },
            { label: '장비 고장', type: '장비고장' },
            { label: '대타 요청', type: '근무변경' },
            { label: '기타', type: '기타' },
          ].map((item) => (
            <Link
              key={item.type}
              href={`/employee/requests/new?type=${item.type}`}
              className={styles.requestBtn}
            >
              <span className={styles.requestLabel}>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
