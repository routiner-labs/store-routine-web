'use client'

import { mockEmployees } from '@/mock/employees'
import styles from './page.module.css'

// 데모 직원 페르소나
const ME_ID = 'emp2'
const TODAY = '2026-06-30'

const DOW = ['월', '화', '수', '목', '금', '토', '일']

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekDays(base: Date): Date[] {
  const off = (base.getDay() + 6) % 7
  const monday = new Date(base)
  monday.setDate(base.getDate() - off)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function hoursOf(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em - sh * 60 - sm) / 60
}

export default function EmployeeSchedulePage() {
  const me = mockEmployees.find((e) => e.id === ME_ID)
  const schedule = me?.schedule

  if (!me || !schedule) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.heading}>내 스케줄</h1>
        </header>
        <p className={styles.empty}>등록된 스케줄이 없습니다. 사장님에게 문의하세요.</p>
      </div>
    )
  }

  const [ty, tm, td] = TODAY.split('-').map(Number)
  const weekDays = getWeekDays(new Date(ty, tm - 1, td))
  const dailyHours = hoursOf(schedule.startTime, schedule.endTime)
  const weeklyDays = schedule.days.length
  const weeklyHours = dailyHours * weeklyDays

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>내 스케줄</h1>
      </header>

      <div className={styles.body}>
        {/* 요약 */}
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNum}>{weeklyDays}일</span>
            <span className={styles.summaryLabel}>주 근무일</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNum}>{weeklyHours}시간</span>
            <span className={styles.summaryLabel}>주 근무시간</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNum}>{schedule.startTime}</span>
            <span className={styles.summaryLabel}>출근 시각</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNum}>{schedule.endTime}</span>
            <span className={styles.summaryLabel}>퇴근 시각</span>
          </div>
        </div>

        {/* 이번 주 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>이번 주 근무</h2>
          <div className={styles.weekGrid}>
            {weekDays.map((d, i) => {
              const ds = formatDate(d)
              const working = schedule.days.includes(i)
              const isToday = ds === TODAY
              return (
                <div
                  key={ds}
                  className={`${styles.dayCard} ${working ? styles.dayCardOn : ''} ${isToday ? styles.dayCardToday : ''}`}
                >
                  <span className={`${styles.dayDow} ${i === 5 ? styles.dowSat : i === 6 ? styles.dowSun : ''}`}>
                    {DOW[i]}
                  </span>
                  <span className={styles.dayDate}>{d.getDate()}</span>
                  {working ? (
                    <span className={styles.dayTime}>
                      {schedule.startTime}<br />~ {schedule.endTime}
                    </span>
                  ) : (
                    <span className={styles.dayOff}>휴무</span>
                  )}
                  {isToday && <span className={styles.todayBadge}>오늘</span>}
                </div>
              )
            })}
          </div>
        </section>

        {/* 근무 패턴 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>근무 패턴</h2>
          <div className={styles.patternCard}>
            <div className={styles.patternRow}>
              <span className={styles.patternLabel}>근무 요일</span>
              <div className={styles.dowRow}>
                {DOW.map((d, i) => (
                  <span
                    key={i}
                    className={`${styles.dowDot} ${schedule.days.includes(i) ? styles.dowDotOn : ''}`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.patternRow}>
              <span className={styles.patternLabel}>근무 시간</span>
              <span className={styles.patternValue}>
                {schedule.startTime} ~ {schedule.endTime} (하루 {dailyHours}시간)
              </span>
            </div>
            <div className={styles.patternRow}>
              <span className={styles.patternLabel}>입사일</span>
              <span className={styles.patternValue}>{me.hiredAt}</span>
            </div>
            <p className={styles.patternHint}>
              스케줄 변경이 필요하면 요청함에서 근무변경 요청을 보내주세요.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
