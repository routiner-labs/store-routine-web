'use client'

import { useState } from 'react'
import { LiaAngleDownSolid, LiaUserClockSolid, LiaTimesSolid, LiaCheckSolid } from 'react-icons/lia'
import { getAttendanceForDate } from '@/mock/calendar'
import { mockEmployees } from '@/mock/employees'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import { useScrollLock } from '@/lib/useScrollLock'
import type { AttendanceStatus, CalendarRecord, WeeklySchedule } from '@/types'
import styles from './page.module.css'

type ViewMode = 'day' | 'week' | 'month'
const VIEW_LABEL: Record<ViewMode, string> = { day: '일간', week: '주간', month: '월간' }

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
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const [schedOpen, setSchedOpen] = useState(false)
  const [schedTab, setSchedTab] = useState<'BASE' | 'DATE'>('BASE')
  const [schedDate, setSchedDate] = useState(TODAY)
  // 스케줄은 사장이 생성해야 존재한다. 생성 전에는 null(스케줄 없음).
  const [schedules, setSchedules] = useState<Record<string, WeeklySchedule | null>>(() =>
    Object.fromEntries(
      mockEmployees
        .filter((e) => e.status === 'ACTIVE')
        .map((e) => [e.id, e.schedule ?? null])
    )
  )
  // 일자별 조정: 날짜 -> 직원 -> { off | 근무시간 }
  type DayOverride = { off: boolean; startTime: string; endTime: string }
  const [overrides, setOverrides] = useState<Record<string, Record<string, DayOverride>>>({})
  const { showToast } = useToast()
  const confirm = useConfirm()

  const activeEmployees = mockEmployees.filter((e) => e.status === 'ACTIVE')

  function dowOf(ds: string) {
    const [y, m, d] = ds.split('-').map(Number)
    return (new Date(y, m - 1, d).getDay() + 6) % 7
  }

  // 해당 날짜의 실제 근무 정보(일자별 조정 > 기본 패턴 순)
  function effectiveDay(empId: string, ds: string): { working: boolean; startTime: string; endTime: string; adjusted: boolean } {
    const ov = overrides[ds]?.[empId]
    if (ov) return { working: !ov.off, startTime: ov.startTime, endTime: ov.endTime, adjusted: true }
    const base = schedules[empId]
    if (base && base.days.includes(dowOf(ds))) {
      return { working: true, startTime: base.startTime, endTime: base.endTime, adjusted: false }
    }
    return { working: false, startTime: '09:00', endTime: '18:00', adjusted: false }
  }

  function createSchedule(empId: string) {
    setSchedules((prev) => ({ ...prev, [empId]: { days: [], startTime: '09:00', endTime: '18:00' } }))
  }

  async function removeSchedule(empId: string, name: string) {
    const ok = await confirm({
      title: '스케줄을 삭제할까요?',
      message: `${name}님의 기본 스케줄이 삭제됩니다.`,
    })
    if (!ok) return
    setSchedules((prev) => ({ ...prev, [empId]: null }))
    showToast('스케줄이 삭제되었습니다', 'error')
  }

  function toggleSchedDay(empId: string, day: number) {
    setSchedules((prev) => {
      const cur = prev[empId]
      if (!cur) return prev
      const days = cur.days.includes(day)
        ? cur.days.filter((d) => d !== day)
        : [...cur.days, day].sort((a, b) => a - b)
      return { ...prev, [empId]: { ...cur, days } }
    })
  }

  function setSchedTime(empId: string, key: 'startTime' | 'endTime', value: string) {
    setSchedules((prev) => {
      const cur = prev[empId]
      if (!cur) return prev
      return { ...prev, [empId]: { ...cur, [key]: value } }
    })
  }

  function setDayOverride(empId: string, patch: Partial<DayOverride>) {
    setOverrides((prev) => {
      const eff = effectiveDay(empId, schedDate)
      const cur = prev[schedDate]?.[empId] ?? { off: !eff.working, startTime: eff.startTime, endTime: eff.endTime }
      return { ...prev, [schedDate]: { ...prev[schedDate], [empId]: { ...cur, ...patch } } }
    })
  }

  function resetDayOverride(empId: string) {
    setOverrides((prev) => {
      const day = { ...prev[schedDate] }
      delete day[empId]
      return { ...prev, [schedDate]: day }
    })
  }

  function saveSchedules() {
    setSchedOpen(false)
    showToast('직원 스케줄이 저장되었습니다')
  }

  function openPicker() {
    setPickerNavYear(baseYear)
    setPickerNavMonth(baseMonth)
    setPickerOpen(true)
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

  // 팝업/바텀시트가 열리면 배경 스크롤 잠금
  useScrollLock(schedOpen || (viewMode !== 'day' && selectedDate !== null))

  const selectedRecords = selectedDate ? getAttendanceForDate(selectedDate) : []
  const dayRecords = getAttendanceForDate(formatDate(baseYear, baseMonth, baseDay))

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.heading}>출근 현황</h1>
      {/* 기간 네비게이션 */}
      <div className={styles.periodNavWrap}>
        <div className={styles.periodNav}>
          <button className={styles.periodLabelBtn} onClick={openPicker}>
            {periodLabel}
            <LiaAngleDownSolid className={`${styles.periodLabelIcon} ${pickerOpen ? styles.periodLabelIconOpen : ''}`} />
          </button>
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
        <div className={styles.viewTabs}>
          {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={viewMode === mode ? styles.tabActive : styles.tab}
              onClick={() => switchView(mode)}
            >
              {VIEW_LABEL[mode]}
            </button>
          ))}
        </div>
        <div className={styles.viewDropdownWrap}>
          <button className={styles.viewDropdownBtn} onClick={() => setViewMenuOpen((o) => !o)}>
            {VIEW_LABEL[viewMode]}
            <LiaAngleDownSolid
              className={`${styles.viewDropdownIcon} ${viewMenuOpen ? styles.viewDropdownIconOpen : ''}`}
            />
          </button>
          {viewMenuOpen && (
            <>
              <div className={styles.viewMenuOverlay} onClick={() => setViewMenuOpen(false)} />
              <div className={styles.viewMenu}>
                {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    className={`${styles.viewMenuItem} ${
                      viewMode === mode ? styles.viewMenuItemActive : ''
                    }`}
                    onClick={() => {
                      switchView(mode)
                      setViewMenuOpen(false)
                    }}
                  >
                    {VIEW_LABEL[mode]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

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

      {/* 스케줄 관리 FAB */}
      <div className={styles.fabWrap}>
        <button
          className={styles.fab}
          onClick={() => setSchedOpen(true)}
          aria-label="스케줄 관리"
        >
          <LiaUserClockSolid />
        </button>
      </div>

      {/* 직원 스케줄 관리 팝업: 기본 근무 패턴 + 일자별 조정 */}
      {schedOpen && (
        <div className={styles.schedOverlay} onClick={() => setSchedOpen(false)}>
          <div className={styles.schedModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.schedHead}>
              <span className={styles.schedTitle}>직원 스케줄 관리</span>
              <button className={styles.schedClose} onClick={() => setSchedOpen(false)} aria-label="닫기">
                <LiaTimesSolid />
              </button>
            </div>

            <div className={styles.schedTabs}>
              <button
                className={`${styles.schedTabBtn} ${schedTab === 'BASE' ? styles.schedTabActive : ''}`}
                onClick={() => setSchedTab('BASE')}
              >
                기본 스케줄
              </button>
              <button
                className={`${styles.schedTabBtn} ${schedTab === 'DATE' ? styles.schedTabActive : ''}`}
                onClick={() => setSchedTab('DATE')}
              >
                일자별 조정
              </button>
            </div>

            {schedTab === 'BASE' ? (
              <div className={styles.schedBody}>
                <p className={styles.schedGuide}>
                  스케줄을 생성해야 근무 일정이 만들어집니다. 반복되는 기본 근무 패턴을 설정하세요.
                </p>
                {activeEmployees.map((emp) => {
                  const sched = schedules[emp.id]
                  return (
                    <div key={emp.id} className={styles.schedRow}>
                      <div className={styles.schedEmp}>
                        <span className={styles.schedAvatar}>{emp.name[0]}</span>
                        <span className={styles.schedName}>{emp.name}</span>
                      </div>
                      {sched === null ? (
                        <div className={styles.schedNone}>
                          <span className={styles.schedNoneText}>등록된 스케줄이 없습니다</span>
                          <button
                            type="button"
                            className={styles.schedCreateBtn}
                            onClick={() => createSchedule(emp.id)}
                          >
                            스케줄 만들기
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className={styles.schedDays}>
                            {WEEKDAY_LABELS.map((d, i) => (
                              <button
                                key={i}
                                type="button"
                                className={`${styles.schedDay} ${sched.days.includes(i) ? styles.schedDayOn : ''}`}
                                onClick={() => toggleSchedDay(emp.id, i)}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                          <div className={styles.schedTimes}>
                            <input
                              type="time"
                              className={styles.schedTimeInput}
                              value={sched.startTime}
                              onChange={(e) => setSchedTime(emp.id, 'startTime', e.target.value)}
                            />
                            <span className={styles.schedTimeSep}>~</span>
                            <input
                              type="time"
                              className={styles.schedTimeInput}
                              value={sched.endTime}
                              onChange={(e) => setSchedTime(emp.id, 'endTime', e.target.value)}
                            />
                            <button
                              type="button"
                              className={styles.schedRemoveBtn}
                              onClick={() => removeSchedule(emp.id, emp.name)}
                            >
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className={styles.schedBody}>
                <div className={styles.schedDateRow}>
                  <input
                    type="date"
                    className={styles.schedDateInput}
                    value={schedDate}
                    onChange={(e) => e.target.value && setSchedDate(e.target.value)}
                  />
                  <span className={styles.schedGuideInline}>
                    선택한 날짜만 근무·휴무·시간을 조정합니다. 기본 스케줄은 바뀌지 않습니다.
                  </span>
                </div>
                {activeEmployees.map((emp) => {
                  const eff = effectiveDay(emp.id, schedDate)
                  return (
                    <div key={emp.id} className={styles.schedRow}>
                      <div className={styles.schedEmp}>
                        <span className={styles.schedAvatar}>{emp.name[0]}</span>
                        <span className={styles.schedName}>{emp.name}</span>
                        {eff.adjusted && <span className={styles.schedAdjBadge}>조정됨</span>}
                      </div>
                      <div className={styles.schedDaySeg}>
                        <button
                          type="button"
                          className={`${styles.schedSegBtn} ${eff.working ? styles.schedSegOn : ''}`}
                          onClick={() => setDayOverride(emp.id, { off: false })}
                        >
                          근무
                        </button>
                        <button
                          type="button"
                          className={`${styles.schedSegBtn} ${!eff.working ? styles.schedSegOff : ''}`}
                          onClick={() => setDayOverride(emp.id, { off: true })}
                        >
                          휴무
                        </button>
                      </div>
                      <div className={styles.schedTimes}>
                        {eff.working ? (
                          <>
                            <input
                              type="time"
                              className={styles.schedTimeInput}
                              value={eff.startTime}
                              onChange={(e) => setDayOverride(emp.id, { startTime: e.target.value })}
                            />
                            <span className={styles.schedTimeSep}>~</span>
                            <input
                              type="time"
                              className={styles.schedTimeInput}
                              value={eff.endTime}
                              onChange={(e) => setDayOverride(emp.id, { endTime: e.target.value })}
                            />
                          </>
                        ) : (
                          <span className={styles.schedOffText}>휴무</span>
                        )}
                        {eff.adjusted && (
                          <button
                            type="button"
                            className={styles.schedRemoveBtn}
                            onClick={() => resetDayOverride(emp.id)}
                          >
                            기본으로
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className={styles.schedFoot}>
              <button className={styles.schedSave} onClick={saveSchedules}>
                <LiaCheckSolid /> 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
