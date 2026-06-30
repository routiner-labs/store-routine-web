'use client'

import { useState } from 'react'
import { LiaAngleDownSolid } from 'react-icons/lia'
import { getAttendanceForDate } from '@/mock/calendar'
import type { AttendanceStatus, CalendarRecord } from '@/types'
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

function AttendanceTimeline({ records }: { records: CalendarRecord[] }) {
  if (records.length === 0) {
    return <p className={styles.emptyText}>근무 데이터가 없습니다</p>
  }

  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const allMin = records.flatMap((r) => [
    toMin(r.scheduledStart), toMin(r.scheduledEnd),
    ...(r.clockedIn ? [toMin(r.clockedIn)] : []),
    ...(r.clockedOut ? [toMin(r.clockedOut)] : []),
  ])
  const tlMin = Math.floor(Math.min(...allMin) / 60) * 60
  const tlMax = Math.ceil(Math.max(...allMin) / 60) * 60
  const span = tlMax - tlMin
  const p = (m: number) => `${((m - tlMin) / span * 100).toFixed(1)}%`
  const w = (s: number, e: number) => `${((e - s) / span * 100).toFixed(1)}%`
  const hrs = Array.from(
    { length: Math.floor(tlMax / 60) - Math.ceil(tlMin / 60) + 1 },
    (_, i) => Math.ceil(tlMin / 60) + i
  )

  return (
    <div className={styles.tlWrap}>
      <div className={styles.tlAxisRow}>
        <div className={styles.tlLabelCol} />
        <div className={styles.tlTrackCol}>
          {hrs.map((h) => (
            <span key={h} className={styles.tlHourMark} style={{ left: p(h * 60) }}>
              {h}
            </span>
          ))}
        </div>
      </div>
      {records.map((r) => {
        const ss = toMin(r.scheduledStart)
        const se = toMin(r.scheduledEnd)
        const ci = r.clockedIn ? toMin(r.clockedIn) : null
        const co = r.clockedOut ? toMin(r.clockedOut) : null
        const ongoing = r.status === 'CLOCKED_IN' || r.status === 'LATE'
        return (
          <div key={r.employeeId} className={styles.tlRow}>
            <div className={styles.tlLabelCol}>
              <span className={styles.tlEmpName}>{r.employeeName}</span>
              <span className={`${styles.badge} ${styles[`badge_${r.status}`]}`}>
                {STATUS_LABEL[r.status]}
              </span>
              <span className={styles.tlEmpTime}>
                {r.clockedIn ?? r.scheduledStart}
                {' ~ '}
                {r.clockedOut ? r.clockedOut : ongoing ? '근무중' : r.scheduledEnd}
              </span>
            </div>
            <div className={styles.tlTrackCol}>
              {hrs.map((h) => (
                <div key={h} className={styles.tlGridLine} style={{ left: p(h * 60) }} />
              ))}
              <div
                className={`${styles.tlBarSched} ${r.status === 'ABSENT' ? styles.tlBarSchedAbsent : ''}`}
                style={{ left: p(ss), width: w(ss, se) }}
              />
              {ci !== null && (
                <div
                  className={`${styles.tlBarActual} ${styles[`tlBarActual_${r.status}`]} ${ongoing ? styles.tlBarOngoing : ''}`}
                  style={{ left: p(ci), width: w(ci, co ?? se) }}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

type TimelineEvent = {
  key: string
  sortMin: number
  time: string | null
  type: AttendanceStatus
  label: string
}

function buildDayEvents(records: CalendarRecord[]): TimelineEvent[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const events: TimelineEvent[] = []
  for (const r of records) {
    if (r.status === 'ABSENT') {
      events.push({ key: `${r.employeeId}-absent`, sortMin: toMin(r.scheduledStart), time: null, type: 'ABSENT', label: `${r.employeeName} 결근` })
      continue
    }
    if (r.status === 'SCHEDULED') {
      events.push({ key: `${r.employeeId}-sched`, sortMin: toMin(r.scheduledStart), time: r.scheduledStart, type: 'SCHEDULED', label: `${r.employeeName} 출근 예정` })
      continue
    }
    if (r.clockedIn) {
      const late = r.status === 'LATE'
      events.push({
        key: `${r.employeeId}-in`,
        sortMin: toMin(r.clockedIn),
        time: r.clockedIn,
        type: late ? 'LATE' : 'CLOCKED_IN',
        label: `${r.employeeName} ${late ? '지각 출근' : '출근'}`,
      })
    }
    if (r.clockedOut) {
      events.push({ key: `${r.employeeId}-out`, sortMin: toMin(r.clockedOut), time: r.clockedOut, type: 'CLOCKED_OUT', label: `${r.employeeName} 퇴근` })
    }
  }
  return events.sort((a, b) => a.sortMin - b.sortMin)
}

function WeeklyTimeline({
  weekDays,
  selectedDate,
  onSelectDate,
}: {
  weekDays: Date[]
  selectedDate: string | null
  onSelectDate: (ds: string) => void
}) {
  const days = weekDays.map((date) => {
    const d = date.getDate()
    const ds = formatDate(date.getFullYear(), date.getMonth() + 1, d)
    return { ds, d, dow: (date.getDay() + 6) % 7, events: buildDayEvents(getAttendanceForDate(ds)) }
  })

  return (
    <div className={styles.gitWeek}>
      {days.map((day) => (
        <div key={day.ds} className={styles.gitCol}>
          <button
            className={[
              styles.gitColHead,
              day.ds === TODAY ? styles.gitColHeadToday : '',
              day.ds === selectedDate ? styles.gitColHeadSel : '',
            ].join(' ')}
            onClick={() => onSelectDate(day.ds)}
          >
            <span
              className={[
                styles.gitColDow,
                day.dow === 5 ? styles.calHeadSat : day.dow === 6 ? styles.calHeadSun : '',
              ].join(' ')}
            >
              {WEEKDAY_LABELS[day.dow]}
            </span>
            <span className={styles.gitColDate}>{day.d}</span>
          </button>
          <div className={`${styles.gitColBody} ${day.events.length === 0 ? styles.gitColBodyEmpty : ''}`}>
            {day.events.length === 0 ? (
              <span className={styles.gitEmpty}>—</span>
            ) : (
              day.events.map((ev) => (
                <div key={ev.key} className={styles.gitEvent}>
                  <span className={styles.gitLane}>
                    <span className={`${styles.gitDot} ${styles[`gitDot_${ev.type}`]}`} />
                  </span>
                  <span className={styles.gitEventBody}>
                    <span className={styles.gitLabel}>{ev.label}</span>
                    {ev.time && <span className={styles.gitTime}>{ev.time}</span>}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AttendancePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [baseYear, setBaseYear] = useState(2026)
  const [baseMonth, setBaseMonth] = useState(6)
  const [baseDay, setBaseDay] = useState(30)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerNavYear, setPickerNavYear] = useState(2026)
  const [pickerNavMonth, setPickerNavMonth] = useState(6)

  function openPicker() {
    setPickerNavYear(baseYear)
    setPickerNavMonth(baseMonth)
    setPickerOpen(true)
  }

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

  const selectedWeekSet = viewMode === 'week'
    ? new Set(
        getWeekDays(baseYear, baseMonth, baseDay)
          .map(d => formatDate(d.getFullYear(), d.getMonth() + 1, d.getDate()))
      )
    : null

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
      <div className={styles.periodNavWrap}>
        <div className={styles.periodNav}>
          <button className={styles.navBtn} onClick={() => navigate(-1)}>‹</button>
          <button className={styles.periodLabelBtn} onClick={openPicker}>
            {periodLabel}
            <LiaAngleDownSolid className={`${styles.periodLabelIcon} ${pickerOpen ? styles.periodLabelIconOpen : ''}`} />
          </button>
          <button className={styles.navBtn} onClick={() => navigate(1)}>›</button>
        </div>

        {pickerOpen && (
          <>
            <div className={styles.pickerOverlay} onClick={() => setPickerOpen(false)} />
            <div className={styles.picker}>
              {viewMode === 'month' ? (
                /* 월 선택 */
                <>
                  <div className={styles.pickerHead}>
                    <button className={styles.pickerNavBtn} onClick={() => setPickerNavYear(y => y - 1)}>‹</button>
                    <span className={styles.pickerTitle}>{pickerNavYear}년</span>
                    <button className={styles.pickerNavBtn} onClick={() => setPickerNavYear(y => y + 1)}>›</button>
                  </div>
                  <div className={styles.pickerMonthGrid}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <button
                        key={m}
                        className={[
                          styles.pickerMonth,
                          m === baseMonth && pickerNavYear === baseYear ? styles.pickerMonthSelected : '',
                        ].join(' ')}
                        onClick={() => { setBaseYear(pickerNavYear); setBaseMonth(m); setPickerOpen(false) }}
                      >
                        {m}월
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* 날짜 선택 (일간/주간) */
                <>
                  <div className={styles.pickerHead}>
                    <button className={styles.pickerNavBtn} onClick={() => {
                      const n = shiftMonth(pickerNavYear, pickerNavMonth, -1)
                      setPickerNavYear(n.year); setPickerNavMonth(n.month)
                    }}>‹</button>
                    <span className={styles.pickerTitle}>{pickerNavYear}년 {pickerNavMonth}월</span>
                    <button className={styles.pickerNavBtn} onClick={() => {
                      const n = shiftMonth(pickerNavYear, pickerNavMonth, 1)
                      setPickerNavYear(n.year); setPickerNavMonth(n.month)
                    }}>›</button>
                  </div>
                  <div className={styles.pickerDayGrid}>
                    {WEEKDAY_LABELS.map((l, i) => (
                      <div
                        key={l}
                        className={[
                          styles.pickerDow,
                          i === 5 ? styles.pickerDowSat : i === 6 ? styles.pickerDowSun : '',
                        ].join(' ')}
                      >
                        {l}
                      </div>
                    ))}
                    {getMonthGrid(pickerNavYear, pickerNavMonth).map((d, i) => {
                      if (!d) return <div key={`e-${i}`} />
                      const ds = formatDate(pickerNavYear, pickerNavMonth, d)
                      const isToday = ds === TODAY
                      const isSelected = viewMode === 'day'
                        ? ds === formatDate(baseYear, baseMonth, baseDay)
                        : (selectedWeekSet?.has(ds) ?? false)
                      const dow = (new Date(pickerNavYear, pickerNavMonth - 1, d).getDay() + 6) % 7
                      return (
                        <button
                          key={d}
                          className={[
                            styles.pickerDay,
                            isToday ? styles.pickerDayToday : '',
                            isSelected ? styles.pickerDaySelected : '',
                            dow === 5 ? styles.pickerDaySat : dow === 6 ? styles.pickerDaySun : '',
                          ].join(' ')}
                          onClick={() => {
                            const { year, month, day } = parseDateStr(ds)
                            setBaseYear(year); setBaseMonth(month); setBaseDay(day)
                            setPickerOpen(false)
                            setSelectedDate(null)
                          }}
                        >
                          {d}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* 월간 */}
      {viewMode === 'month' && (
        <div className={styles.monthWrap}>
          <div className={styles.calGrid}>
            {WEEKDAY_LABELS.map((l, i) => (
              <div
                key={l}
                className={[
                  styles.calHead,
                  i === 5 ? styles.calHeadSat : i === 6 ? styles.calHeadSun : '',
                ].join(' ')}
              >
                {l}
              </div>
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
          <WeeklyTimeline
            weekDays={getWeekDays(baseYear, baseMonth, baseDay)}
            selectedDate={selectedDate}
            onSelectDate={(ds) => setSelectedDate(ds === selectedDate ? null : ds)}
          />
        </div>
      )}

      {/* 일간 */}
      {viewMode === 'day' && (
        <div className={styles.dayWrap}>
          <AttendanceTimeline records={dayRecords} />
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
              <AttendanceTimeline records={selectedRecords} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
