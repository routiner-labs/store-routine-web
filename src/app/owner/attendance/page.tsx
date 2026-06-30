'use client'

import { useState } from 'react'
import { LiaAngleDownSolid } from 'react-icons/lia'
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
          <div className={styles.weekGrid}>
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
            {getWeekDays(baseYear, baseMonth, baseDay).map((date) => {
              const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate()
              const ds = formatDate(y, m, d)
              const records = getAttendanceForDate(ds)
              const hasAlert = records.some((r) => r.status === 'LATE' || r.status === 'ABSENT')
              return (
                <button
                  key={ds}
                  className={[
                    styles.weekCell,
                    ds === selectedDate ? styles.weekCellSelected : '',
                    ds === TODAY ? styles.weekCellToday : '',
                  ].join(' ')}
                  onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                >
                  <span className={styles.weekCellNum}>{d}</span>
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
              ) : (() => {
                const toMin = (t: string) => {
                  const [h, m] = t.split(':').map(Number)
                  return h * 60 + m
                }
                const allMin = selectedRecords.flatMap(r => [
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
                        {hrs.map(h => (
                          <span key={h} className={styles.tlHourMark} style={{ left: p(h * 60) }}>
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedRecords.map(r => {
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
                            {hrs.map(h => (
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
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
