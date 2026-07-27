'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid, LiaCheckSolid } from 'react-icons/lia'
import { mockEmployees } from '@/mock/employees'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import { usePageLeave } from '@/lib/usePageLeave'
import EmployeeName from '@/components/EmployeeName'
import type { WeeklySchedule } from '@/types'
import EmployeeScheduleTable from './EmployeeScheduleTable'
import styles from './EmployeeScheduleManager.module.css'

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']
const TODAY = '2026-06-30'

type DayOverride = { off: boolean; startTime: string; endTime: string }

/**
 * 직원 스케줄 관리 (페이지형).
 * mode='base'  — 반복되는 기본 근무 패턴(요일/시간) 설정
 * mode='adjust' — 특정 날짜만 근무·휴무·시간 조정(기본 스케줄은 유지)
 * 팝업이 아니라 별도 페이지로, 출근 현황 FAB 메뉴에서 각각 진입한다.
 */
export default function EmployeeScheduleManager({
  mode,
  title,
}: {
  mode: 'base' | 'adjust'
  title: string
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const confirm = useConfirm()
  const { leaving, leave, onAnimationEnd } = usePageLeave()

  const activeEmployees = mockEmployees.filter((e) => e.status === 'ACTIVE')

  // 스케줄은 사장이 생성해야 존재한다. 생성 전에는 null(스케줄 없음).
  const [schedules, setSchedules] = useState<Record<string, WeeklySchedule | null>>(() =>
    Object.fromEntries(activeEmployees.map((e) => [e.id, e.schedule ?? null])),
  )
  // 일자별 조정: 날짜 -> 직원 -> { off | 근무시간 }
  const [overrides, setOverrides] = useState<Record<string, Record<string, DayOverride>>>({})
  const [schedDate, setSchedDate] = useState(TODAY)

  function dowOf(ds: string) {
    const [y, m, d] = ds.split('-').map(Number)
    return (new Date(y, m - 1, d).getDay() + 6) % 7
  }

  // 해당 날짜의 실제 근무 정보(일자별 조정 > 기본 패턴 순)
  function effectiveDay(empId: string, ds: string) {
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

  function save() {
    showToast(mode === 'base' ? '기본 스케줄이 저장되었습니다' : '일자별 조정이 저장되었습니다')
    leave(() => router.push('/owner/attendance'))
  }

  return (
    <div
      className={`${styles.page} ${leaving ? styles.leaving : ''}`}
      onAnimationEnd={onAnimationEnd}
    >
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => leave(() => router.push('/owner/attendance'))}
        >
          <LiaAngleLeftSolid /> 출근 현황
        </button>
        <h1 className={styles.heading}>{title}</h1>
      </header>

      <div className={styles.body} data-schedule-body>
        {mode === 'base' ? (
          <>
            <p className={styles.guide}>
              스케줄을 생성해야 근무 일정이 만들어집니다. 반복되는 기본 근무 패턴을 설정하세요.
            </p>
            <EmployeeScheduleTable mode="base">
              {activeEmployees.map((emp) => {
              const sched = schedules[emp.id]
              return (
                <div key={emp.id} className={styles.row} data-schedule-row>
                  <div className={styles.emp} data-schedule-employee>
                    <span className={styles.avatar}>{emp.name[0]}</span>
                    <EmployeeName name={emp.name} className={styles.name} />
                  </div>
                  {sched === null ? (
                    <div className={styles.none} data-schedule-empty>
                      <span className={styles.noneText}>등록된 스케줄이 없습니다</span>
                      <button
                        type="button"
                        className={styles.createBtn}
                        onClick={() => createSchedule(emp.id)}
                      >
                        스케줄 만들기
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={styles.days}>
                        {WEEKDAY_LABELS.map((d, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`${styles.day} ${sched.days.includes(i) ? styles.dayOn : ''}`}
                            onClick={() => toggleSchedDay(emp.id, i)}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                      <div className={styles.times} data-schedule-time>
                        <input
                          type="time"
                          className={styles.timeInput}
                          value={sched.startTime}
                          onChange={(e) => setSchedTime(emp.id, 'startTime', e.target.value)}
                        />
                        <span className={styles.timeSep}>~</span>
                        <input
                          type="time"
                          className={styles.timeInput}
                          value={sched.endTime}
                          onChange={(e) => setSchedTime(emp.id, 'endTime', e.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.removeBtn}
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
            </EmployeeScheduleTable>
          </>
        ) : (
          <>
            <div className={styles.dateRow} data-schedule-context>
              <input
                type="date"
                className={styles.dateInput}
                value={schedDate}
                onChange={(e) => e.target.value && setSchedDate(e.target.value)}
              />
              <span className={styles.guideInline}>
                선택한 날짜만 근무·휴무·시간을 조정합니다. 기본 스케줄은 바뀌지 않습니다.
              </span>
            </div>
            <EmployeeScheduleTable mode="adjust">
              {activeEmployees.map((emp) => {
              const eff = effectiveDay(emp.id, schedDate)
              return (
                <div key={emp.id} className={styles.row} data-schedule-row>
                  <div className={styles.emp} data-schedule-employee>
                    <span className={styles.avatar}>{emp.name[0]}</span>
                    <EmployeeName name={emp.name} className={styles.name} />
                    {eff.adjusted && <span className={styles.adjBadge}>조정됨</span>}
                  </div>
                  <div className={styles.daySeg}>
                    <button
                      type="button"
                      className={`${styles.segBtn} ${eff.working ? styles.segOn : ''}`}
                      onClick={() => setDayOverride(emp.id, { off: false })}
                    >
                      근무
                    </button>
                    <button
                      type="button"
                      className={`${styles.segBtn} ${!eff.working ? styles.segOff : ''}`}
                      onClick={() => setDayOverride(emp.id, { off: true })}
                    >
                      휴무
                    </button>
                  </div>
                  <div className={styles.times} data-schedule-time>
                    {eff.working ? (
                      <>
                        <input
                          type="time"
                          className={styles.timeInput}
                          value={eff.startTime}
                          onChange={(e) => setDayOverride(emp.id, { startTime: e.target.value })}
                        />
                        <span className={styles.timeSep}>~</span>
                        <input
                          type="time"
                          className={styles.timeInput}
                          value={eff.endTime}
                          onChange={(e) => setDayOverride(emp.id, { endTime: e.target.value })}
                        />
                      </>
                    ) : (
                      <span className={styles.offText}>휴무</span>
                    )}
                    {eff.adjusted && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => resetDayOverride(emp.id)}
                      >
                        기본으로
                      </button>
                    )}
                  </div>
                </div>
              )
              })}
            </EmployeeScheduleTable>
          </>
        )}
      </div>

      <div className={styles.foot}>
        <button className={styles.save} onClick={save}>
          <LiaCheckSolid /> 저장
        </button>
      </div>
    </div>
  )
}
