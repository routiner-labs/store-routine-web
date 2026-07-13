'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  LiaAngleRightSolid,
  LiaBookSolid,
  LiaCalendarSolid,
  LiaInboxSolid,
} from 'react-icons/lia'
import { mockSpecialInstructions, mockRequests } from '@/mock/data'
import { mockEmployees } from '@/mock/employees'
import { createTasksForDate, type StoreTask } from '@/mock/tasks'
import { getAttendanceForDate } from '@/mock/calendar'
import { useToast } from '@/context/ToastContext'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import EmployeeName from '@/components/EmployeeName'
import Modal from '@/components/Modal'
import type { SpecialInstruction } from '@/types'
import styles from './page.module.css'

const TODAY = '2026-06-30'
const ME_ID = 'emp2'
const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']

const statusLabel: Record<string, string> = {
  REQUESTED: '확인 대기',
  CONFIRMED: '확인 완료',
  IN_PROGRESS: '처리 중',
  DONE: '완료',
  REJECTED: '반려',
}

type ShiftState = 'BEFORE' | 'WORKING' | 'DONE'

function describeTiming(task: StoreTask): string {
  if (task.timing.start && task.timing.end) return `${task.timing.start} ~ ${task.timing.end}`
  if (task.timing.start) return `${task.timing.start}부터`
  if (task.timing.end) return `${task.timing.end}까지`
  return '상시'
}

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}.${date.getDate()}`
}

function getWeekDates(dateText: string): Date[] {
  const [year, month, day] = dateText.split('-').map(Number)
  const base = new Date(year, month - 1, day)
  const mondayOffset = (base.getDay() + 6) % 7
  const monday = new Date(base)
  monday.setDate(base.getDate() - mondayOffset)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date
  })
}

export default function EmployeeHome() {
  const { showToast } = useToast()
  const me = mockEmployees.find((employee) => employee.id === ME_ID)
  const meName = me?.name ?? '직원'
  const [shiftState, setShiftState] = useState<ShiftState>('BEFORE')
  const [clockedInAt, setClockedInAt] = useState<string | null>(null)
  const [instructions, setInstructions] = useState(mockSpecialInstructions)
  const [openInstruction, setOpenInstruction] = useState<SpecialInstruction | null>(null)
  const [selectedTask, setSelectedTask] = useState<StoreTask | null>(null)
  const [openTaskLists, setOpenTaskLists] = useState<Set<'COMMON' | 'EXTRA'>>(
    new Set(['COMMON', 'EXTRA'])
  )

  useScrollLock(openInstruction !== null)
  usePopupEsc(openInstruction !== null, 'viewer', () => setOpenInstruction(null))

  const myChecklists = useMemo(
    () =>
      createTasksForDate(TODAY)
        .filter((task) => task.assigneeIds.includes(ME_ID))
        .sort((a, b) => {
          if (!a.timing.start && !b.timing.start) return 0
          if (!a.timing.start) return 1
          if (!b.timing.start) return -1
          return a.timing.start.localeCompare(b.timing.start)
        }),
    []
  )
  const myInstruction = instructions.find((instruction) => instruction.assignedTo === meName)
  const myRequests = mockRequests
    .filter((request) => request.employeeName === meName)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)
  const attendance = getAttendanceForDate(TODAY).find((record) => record.employeeId === ME_ID)
  const checklistDone = myChecklists.filter((checklist) => checklist.done).length
  const commonChecklists = myChecklists.filter((checklist) => checklist.kind === 'COMMON')
  const extraChecklists = myChecklists.filter((checklist) => checklist.kind === 'EXTRA')
  const pendingRequests = myRequests.filter((request) => request.status === 'REQUESTED').length
  const weekDates = getWeekDates(TODAY)

  function clockIn() {
    setClockedInAt('15:58')
    setShiftState('WORKING')
    showToast('출근 처리가 완료되었습니다.')
  }

  function clockOut() {
    setShiftState('DONE')
    showToast('퇴근 처리가 완료되었습니다. 오늘도 수고하셨습니다.')
  }

  function completeInstruction(id: string) {
    setInstructions((prev) =>
      prev.map((instruction) => (instruction.id === id ? { ...instruction, status: 'DONE' } : instruction))
    )
    setOpenInstruction(null)
    showToast('특이사항 확인이 완료 처리되었습니다.')
  }

  function toggleTaskList(kind: 'COMMON' | 'EXTRA') {
    setOpenTaskLists((current) => {
      const next = new Set(current)
      if (next.has(kind)) next.delete(kind)
      else next.add(kind)
      return next
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.greeting}>오늘 근무 한눈에 보기</p>
          <h1 className={styles.name}>
            <EmployeeName name={meName} />님
          </h1>
        </div>
        <div className={styles.storeBadge}>스타벅스 강남점</div>
      </header>

      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.shiftSummaryCard}`}>
          <div className={styles.shiftSummaryBody}>
            <span className={styles.summaryLabel}>
              {shiftState === 'BEFORE' && '오늘 근무 시간'}
              {shiftState === 'WORKING' && `${clockedInAt} 출근 · 근무 중`}
              {shiftState === 'DONE' && '오늘 근무 완료'}
            </span>
            <strong className={styles.summaryValue}>
              {attendance ? `${attendance.scheduledStart} ~ ${attendance.scheduledEnd}` : '근무 일정 없음'}
            </strong>
          </div>
          {shiftState === 'BEFORE' && (
            <button className={styles.clockInBtn} onClick={clockIn}>출근하기</button>
          )}
          {shiftState === 'WORKING' && (
            <button className={styles.clockOutBtn} onClick={clockOut}>퇴근하기</button>
          )}
          {shiftState === 'DONE' && <span className={styles.shiftDoneBadge}>퇴근 완료</span>}
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>배정 체크리스트</span>
          <strong className={styles.summaryValue}>{myChecklists.length}개</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>체크리스트 진행</span>
          <strong className={styles.summaryValue}>{checklistDone}/{myChecklists.length}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>확인 대기 요청</span>
          <strong className={styles.summaryValue}>{pendingRequests}</strong>
        </div>
      </div>

      <div className={styles.grid}>
        <section className={styles.areaChecklist}>
          <div className={styles.taskComponents}>
            {([
              { kind: 'COMMON', label: '공통 업무 리스트', items: commonChecklists },
              { kind: 'EXTRA', label: '추가 업무 리스트', items: extraChecklists },
            ] as const).map(({ kind, label, items }) => {
              const done = items.filter((item) => item.done).length
              const isOpen = openTaskLists.has(kind)
              return (
                <div key={kind} className={`${styles.panel} ${styles.taskComponent}`}>
                  <button
                    type="button"
                    className={`${styles.taskRow} ${styles.taskRowToggle}`}
                    onClick={() => toggleTaskList(kind)}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.taskLabel}>
                      {label}
                      <span className={`${styles.taskChevron} ${isOpen ? styles.taskChevronOpen : ''}`}>›</span>
                    </span>
                    <span className={styles.taskRight}>
                      <span className={styles.progressBar}>
                        <span
                          className={styles.progressFill}
                          style={{ width: items.length === 0 ? '0%' : `${(done / items.length) * 100}%` }}
                        />
                      </span>
                      <span className={styles.progressText}>{done}/{items.length}</span>
                    </span>
                  </button>
                  <div className={`${styles.taskSubWrap} ${isOpen ? styles.taskSubWrapOpen : ''}`}>
                    <div className={styles.taskSubList}>
                      {items.length === 0 ? (
                        <p className={styles.emptyText}>배정된 업무가 없습니다.</p>
                      ) : (
                        items.map((checklist) => (
                          <button
                            key={checklist.id}
                            type="button"
                            className={`${styles.taskSubRow} ${styles.taskSubRowButton}`}
                            onClick={() => setSelectedTask(checklist)}
                          >
                            <span className={`${styles.taskSubCheck} ${checklist.done ? styles.taskSubCheckDone : ''}`}>
                              {checklist.done ? '✓' : ''}
                            </span>
                            <div className={styles.taskSubMain}>
                              <span className={styles.taskSubTitle}>{checklist.title}</span>
                              <span className={styles.taskSubTiming}>{describeTiming(checklist)}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className={`${styles.panel} ${styles.areaRequests}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>내 요청 문서</h2>
              <p className={styles.panelSubtitle}>내가 등록한 요청의 처리 상태입니다.</p>
            </div>
            <Link href="/employee/requests" className={styles.panelLink}>전체 보기</Link>
          </div>
          <div className={styles.requestList}>
            {myRequests.length === 0 ? (
              <p className={styles.emptyText}>등록한 요청이 없습니다.</p>
            ) : (
              myRequests.map((request) => (
                <Link key={request.id} href={`/employee/requests/${request.id}`} className={styles.requestRow}>
                  <span className={styles.requestType}>{request.type}</span>
                  <span className={styles.requestBody}>
                    <span className={styles.requestContent}>{request.content}</span>
                    <span className={styles.requestDate}>{request.createdAt.slice(0, 10)}</span>
                  </span>
                  <span className={`${styles.requestStatus} ${styles[`status_${request.status}`]}`}>
                    {statusLabel[request.status]}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className={`${styles.panel} ${styles.areaSchedule}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>나의 근무일정</h2>
              <p className={styles.panelSubtitle}>이번 주 근무 시간을 모두 표시합니다.</p>
            </div>
            <Link href="/employee/schedule" className={styles.panelLink}>일정 보기</Link>
          </div>
          <div className={styles.weekSchedule}>
            {weekDates.map((date, index) => {
              const isWorking = me?.schedule?.days.includes(index) ?? false
              const isToday = formatDate(date) === '6.30'
              return (
                <div key={date.toISOString()} className={`${styles.weekDay} ${isToday ? styles.weekDayToday : ''}`}>
                  <div className={styles.weekDayLabel}>
                    <span>{WEEKDAYS[index]}</span>
                    <span className={styles.weekDate}>{formatDate(date)}</span>
                  </div>
                  <strong className={isWorking ? styles.weekTime : styles.weekOff}>
                    {isWorking && me?.schedule
                      ? `${me.schedule.startTime} ~ ${me.schedule.endTime}`
                      : '휴무'}
                  </strong>
                  {isToday && <span className={styles.todayBadge}>오늘</span>}
                </div>
              )
            })}
          </div>
        </section>

        <section className={`${styles.panel} ${styles.areaInfo}`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>전달사항 / 문서</h2>
            <Link href="/employee/documents" className={styles.panelLink}>
              문서 보기<LiaAngleRightSolid />
            </Link>
          </div>
          <div className={styles.infoStack}>
            {myInstruction ? (
              <button className={styles.instructionCard} onClick={() => setOpenInstruction(myInstruction)}>
                <div>
                  <p className={styles.instructionLabel}>특이사항</p>
                  <p className={styles.instructionTitle}>{myInstruction.title}</p>
                </div>
                <span className={`${styles.instructionStatus} ${styles[`ist_${myInstruction.status}`]}`}>
                  {myInstruction.status === 'DONE' ? '완료' : '확인 필요'}
                </span>
              </button>
            ) : (
              <div className={styles.infoCard}>
                <span className={styles.infoIcon}><LiaBookSolid /></span>
                <div>
                  <p className={styles.infoTitle}>읽지 않은 전달사항이 없습니다</p>
                  <p className={styles.infoDesc}>새 공지나 업무 안내 문서는 문서함에서 다시 확인할 수 있습니다.</p>
                </div>
              </div>
            )}

            <Link href="/employee/requests/new" className={styles.infoCard}>
              <span className={styles.infoIcon}><LiaInboxSolid /></span>
              <div>
                <p className={styles.infoTitle}>요청 바로 등록</p>
                <p className={styles.infoDesc}>재고 부족, 시설 이상, 근무 변경 요청을 빠르게 남길 수 있습니다.</p>
              </div>
            </Link>
            <Link href="/employee/schedule" className={styles.infoCard}>
              <span className={styles.infoIcon}><LiaCalendarSolid /></span>
              <div>
                <p className={styles.infoTitle}>주간 근무 일정 확인</p>
                <p className={styles.infoDesc}>이번 주 전체 일정과 주간 총 근무시간을 확인할 수 있습니다.</p>
              </div>
            </Link>
          </div>
        </section>
      </div>

      {selectedTask && (
        <Modal title="업무 상세" size="small" onClose={() => setSelectedTask(null)}>
          <div className={styles.taskPopup}>
            <div className={styles.taskPopupTitleRow}>
              <h3 className={styles.taskPopupTitle}>{selectedTask.title}</h3>
              <span className={`${styles.taskPopupStatus} ${selectedTask.done ? styles.taskPopupStatusDone : ''}`}>
                {selectedTask.done ? '완료' : '진행 전'}
              </span>
            </div>
            <div className={styles.taskPopupMeta}>
              <span>{selectedTask.kind === 'COMMON' ? '공통 업무' : '추가 업무'}</span>
              <span>{describeTiming(selectedTask)}</span>
            </div>
            <div className={styles.taskPopupMethod}>
              <h4 className={styles.taskPopupSectionTitle}>수행 방법</h4>
              <div
                className={styles.taskPopupContent}
                dangerouslySetInnerHTML={{ __html: selectedTask.method }}
              />
            </div>
          </div>
        </Modal>
      )}

      {openInstruction && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <span className={styles.popupTitle}>특이사항</span>
              <button className={styles.popupClose} onClick={() => setOpenInstruction(null)}>닫기</button>
            </div>
            <div className={styles.popupBody}>
              <p className={styles.popupInstructionTitle}>{openInstruction.title}</p>
              <p className={styles.popupInstructionContent}>{openInstruction.content}</p>
              {openInstruction.status !== 'DONE' ? (
                <button className={styles.popupDoneBtn} onClick={() => completeInstruction(openInstruction.id)}>
                  확인 완료 처리
                </button>
              ) : (
                <p className={styles.popupDoneText}>이미 완료 처리된 전달사항입니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
