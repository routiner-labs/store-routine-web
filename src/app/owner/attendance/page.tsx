'use client'

import { useState } from 'react'
import { getAttendanceForDate } from '@/mock/calendar'
import styles from './page.module.css'

type ViewMode = 'day' | 'week' | 'month'

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

const STATUS_LABEL: Record<string, string> = {
  CLOCKED_IN: '출근',
  CLOCKED_OUT: '퇴근',
  SCHEDULED: '예정',
  LATE: '지각',
  ABSENT: '결근',
}

const TODAY = '2026-06-30'

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseDateStr(ds: string) {
  const [y, m, d] = ds.split('-').map(Number)
  return { year: y, month: m, day: d }
}

function weekdayLabel(year: number, month: number, day: number) {
  return WEEKDAY_LABELS[(new Date(year, month - 1, day).getDay() + 6) % 7]
}

function getMonthGrid(year: number, month: number): (number | null)[] {
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const total = new Date(year, month, 0).getDate()
  const grid: (number | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= total; d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

function getWeekDays(year: number, month: number, day: number): Date[] {
  const base = new Date(year, month - 1, day)
  const off = (base.getDay() + 6) % 7
  const monday = new Date(base)
  monday.setDate(base.getDate() - off)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function shiftDate(year: number, month: number, day: number, days: number) {
  const d = new Date(year, month - 1, day)
  d.setDate(d.getDate() + days)
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

function shiftMonth(year: number, month: number, dir: number) {
  let m = month + dir, y = year
  if (m === 0) { y--; m = 12 }
  if (m === 13) { y++; m = 1 }
  return { year: y, month: m }
}

export default function AttendancePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [baseYear, setBaseYear] = useState(2026)
  const [baseMonth, setBaseMonth] = useState(6)
  const [baseDay, setBaseDay] = useState(30)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  function navigate(dir: 1 | -1) {
    setSelectedDate(null)
    if (viewMode === 'day') {
      const n = shiftDate(baseYear, baseMonth, baseDay, dir)
      setBaseYear(n.year); setBaseMonth(n.month); setBaseDay(n.day)
    } else if (viewMode === 'week') {
      const n = shiftDate(baseYear, baseMonth, baseDay, dir * 7)
      setBaseYear(n.year); setBaseMonth(n.month); setBaseDay(n.day)
    } else {
      const n = shiftMonth(baseYear, baseMonth, dir)
      setBaseYear(n.year); setBaseMonth(n.month)
    }
  }

  function switchView(mode: ViewMode) {
    setViewMode(mode)
    setSelectedDate(null)
  }

  const periodLabel = (() => {
    if (viewMode === 'month') return `${baseYear}년 ${baseMonth}월`
    if (viewMode === 'day') return `${baseYear}년 ${baseMonth}월 ${baseDay}일 (${weekdayLabel(baseYear, baseMonth, baseDay)})`
    const week = getWeekDays(baseYear, baseMonth, baseDay)
    const f = week[0], l = week[6]
    const lm = l.getMonth() !== f.getMonth() ? `${l.getMonth() + 1}월 ` : ''
    return `${f.getFullYear()}년 ${f.getMonth() + 1}월 ${f.getDate()}일 ~ ${lm}${l.getDate()}일`
  })()

  const selectedRecords = selectedDate ? getAttendanceForDate(selectedDate) : []
  const dayRecords = getAttendanceForDate(formatDate(baseYear, baseMonth, baseDay))

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.heading}>출근 현황</h1>
        <div className={styles.viewTabs}>
          {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={viewMode === mode ? styles.tabActive : styles.tab}
              onClick={() => switchView(mode)}
            >
              {mode === 'day' ? '일간' : mode === 'week' ? '주간' : '월간'}
            </button>
          ))}
        </div>
      </header>

      {/* 기간 네비게이션 */}
      <div className={styles.periodNav}>
        <button className={styles.navBtn} onClick={() => navigate(-1)}>‹</button>
        <span className={styles.periodLabel}>{periodLabel}</span>
        <button className={styles.navBtn} onClick={() => navigate(1)}>›</button>
      </div>

      {/* 월간 */}
      {viewMode === 'month' && (
        <div className={styles.monthWrap}>
          <div className={styles.calGrid}>
            {WEEKDAY_LABELS.map((l) => (
              <div key={l} className={styles.calHead}>{l}</div>
            ))}
            {getMonthGrid(baseYear, baseMonth).map((d, i) => {
              if (!d) return <div key={`e-${i}`} className={styles.calEmpty} />
              const ds = formatDate(baseYear, baseMonth, d)
              const records = getAttendanceForDate(ds)
              const hasAlert = records.some((r) => r.status === 'LATE' || r.status === 'ABSENT')
              return (
                <button
                  key={d}
                  className={[
                    styles.calCell,
                    ds === selectedDate ? styles.calCellSelected : '',
                    ds === TODAY ? styles.calCellToday : '',
                  ].join(' ')}
                  onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                >
                  <span className={styles.calNum}>{d}</span>
                  {records.length > 0 && (
                    <span className={`${styles.calCount} ${hasAlert ? styles.calCountAlert : ''}`}>
                      {records.length}명
                    </span>
                  )}
                  {hasAlert && <span className={styles.calDot} />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 주간 */}
      {viewMode === 'week' && (
        <div className={styles.weekWrap}>
          {getWeekDays(baseYear, baseMonth, baseDay).map((date) => {
            const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate()
            const ds = formatDate(y, m, d)
            const records = getAttendanceForDate(ds)
            const hasAlert = records.some((r) => r.status === 'LATE' || r.status === 'ABSENT')
            const dowLabel = WEEKDAY_LABELS[(date.getDay() + 6) % 7]
            return (
              <button
                key={ds}
                className={[
                  styles.weekRow,
                  ds === selectedDate ? styles.weekRowSelected : '',
                ].join(' ')}
                onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
              >
                <div className={`${styles.weekDay} ${ds === TODAY ? styles.weekDayToday : ''}`}>
                  <span className={styles.weekDow}>{dowLabel}</span>
                  <span className={styles.weekDate}>{m}/{d}</span>
                </div>
                <div className={styles.weekNames}>
                  {records.length === 0 ? (
                    <span className={styles.weekNone}>-</span>
                  ) : (
                    records.map((r) => (
                      <span
                        key={r.employeeId}
                        className={[
                          styles.weekName,
                          r.status === 'LATE' ? styles.weekNameLate : '',
                          r.status === 'ABSENT' ? styles.weekNameAbsent : '',
                        ].join(' ')}
                      >
                        {r.employeeName}
                      </span>
                    ))
                  )}
                </div>
                <div className={styles.weekMeta}>
                  {hasAlert && <span className={styles.alertPip} />}
                  <span className={styles.weekCount}>{records.length > 0 ? `${records.length}명` : ''}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* 일간 */}
      {viewMode === 'day' && (
        <div className={styles.dayWrap}>
          {dayRecords.length === 0 ? (
            <p className={styles.emptyText}>근무 데이터가 없습니다</p>
          ) : (
            dayRecords.map((r) => (
              <div key={r.employeeId} className={`${styles.empCard} ${styles[`empCard_${r.status}`]}`}>
                <div className={styles.empTop}>
                  <span className={styles.empName}>{r.employeeName}</span>
                  <span className={`${styles.badge} ${styles[`badge_${r.status}`]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <div className={styles.empTimes}>
                  <div className={styles.timeRow}>
                    <span className={styles.timeLabel}>예정</span>
                    <span>{r.scheduledStart} ~ {r.scheduledEnd}</span>
                  </div>
                  {r.clockedIn && (
                    <div className={styles.timeRow}>
                      <span className={styles.timeLabel}>출근</span>
                      <span className={r.status === 'LATE' ? styles.timeAlert : ''}>{r.clockedIn}</span>
                    </div>
                  )}
                  {r.clockedOut && (
                    <div className={styles.timeRow}>
                      <span className={styles.timeLabel}>퇴근</span>
                      <span>{r.clockedOut}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 날짜 상세 — 달력/주간에서 날짜 선택 시 바텀시트로 표시 (레이아웃 시프팅 없음) */}
      {viewMode !== 'day' && selectedDate && (
        <div className={styles.sheetOverlay} onClick={() => setSelectedDate(null)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <div className={styles.sheetHead}>
              <span className={styles.sheetTitle}>
                {(() => {
                  const { year, month, day } = parseDateStr(selectedDate)
                  return `${month}월 ${day}일 (${weekdayLabel(year, month, day)})`
                })()}
              </span>
              <button className={styles.sheetClose} onClick={() => setSelectedDate(null)}>닫기</button>
            </div>
            <div className={styles.sheetBody}>
              {selectedRecords.length === 0 ? (
                <p className={styles.emptyText}>근무 데이터가 없습니다</p>
              ) : (
                selectedRecords.map((r) => (
                  <div key={r.employeeId} className={`${styles.record} ${styles[`record_${r.status}`]}`}>
                    <div>
                      <span className={styles.recordName}>{r.employeeName}</span>
                      <span className={styles.recordTime}>
                        {r.scheduledStart} ~ {r.scheduledEnd}
                        {r.clockedIn && ` · 출근 ${r.clockedIn}`}
                        {r.clockedOut && ` · 퇴근 ${r.clockedOut}`}
                      </span>
                    </div>
                    <span className={`${styles.badge} ${styles[`badge_${r.status}`]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
