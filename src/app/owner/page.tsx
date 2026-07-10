'use client'

import { useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { LiaUserPlusSolid, LiaAngleRightSolid, LiaTrashAltSolid, LiaCheckSolid, LiaSearchSolid, LiaTimesSolid, LiaBookSolid } from 'react-icons/lia'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import { mockAttendance, mockRequests } from '@/mock/data'
import { mockEmployees, mockJoinRequests } from '@/mock/employees'
import { createTasksForDate, type StoreTask, type TaskTiming } from '@/mock/tasks'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES, type StoreDocument } from '@/mock/documents'
import type { EmployeeRequest, Employee } from '@/types'
import Modal from '@/components/Modal'
import { usePopupEsc } from '@/lib/usePopupEsc'
import EmployeeProfilePopup from '@/components/EmployeeProfilePopup'
import EmployeeName from '@/components/EmployeeName'
import RequestDetailView from './requests/RequestDetailView'
import DocumentDetailView from './documents/DocumentDetailView'
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

function categoryName(id: string) {
  return DOCUMENT_CATEGORIES.find((c) => c.id === id)?.name ?? id
}

function hasTiming(t: TaskTiming): boolean {
  return Boolean(t.start || t.end)
}

function describeTiming(t: TaskTiming): string {
  if (t.start && t.end) return `${t.start}~${t.end}`
  if (t.start) return `${t.start}부터`
  if (t.end) return `${t.end}까지`
  return '상시'
}

type RequestFilter = 'pending' | 'confirmed' | 'inProgress'

type HomeModal =
  | { kind: 'request'; request: EmployeeRequest }
  | { kind: 'document'; doc: StoreDocument }
  | { kind: 'employee'; employee: Employee }
  | { kind: 'joins' }
  | { kind: 'quickAssign'; taskId: string }
  | { kind: 'method'; taskId: string }

export default function OwnerHome() {
  const { currentStore } = useStore()
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [requestFilter, setRequestFilter] = useState<RequestFilter | null>('pending')
  const [openTaskLists, setOpenTaskLists] = useState<Set<'COMMON' | 'EXTRA' | 'UNASSIGNED'>>(new Set())
  const [modal, setModal] = useState<HomeModal | null>(null)
  // 담당자 이름 클릭 시 뜨는 액션 메뉴(퀵지정/삭제)의 앵커 위치
  const [assignMenu, setAssignMenu] = useState<{ taskId: string; x: number; y: number } | null>(null)
  // 퀵지정 팝업에서 선택 중인 담당자 초안 (적용을 눌러야 실제 반영)
  const [assignDraft, setAssignDraft] = useState<string[]>([])
  // 퀵지정 팝업 직원 검색어
  const [assignSearch, setAssignSearch] = useState('')

  // 업무리스트 페이지와 동일한 오늘자 업무 데이터 (홈에서 완료·담당 변경이 가능하도록 로컬 상태로 보관)
  const [todayTasks, setTodayTasks] = useState<StoreTask[]>(() => createTasksForDate('2026-06-30'))
  const employees = mockEmployees.filter((e) => e.status === 'ACTIVE')
  // 출퇴근 현황은 이름으로 매핑(출근 현황 섹션과 동일 방식). 기록이 없으면 휴무로 본다.
  const attByName = Object.fromEntries(mockAttendance.map((r) => [r.employeeName, r]))

  // 업무명 클릭 시 뜨는 액션 메뉴 — 뷰어형(ESC 바로 닫힘)
  usePopupEsc(assignMenu !== null, 'viewer', () => setAssignMenu(null))
  const commonTasks = todayTasks.filter((t) => t.kind === 'COMMON')
  const extraTasks = todayTasks.filter((t) => t.kind === 'EXTRA')
  const commonDone = commonTasks.filter((t) => t.done).length
  const extraDone = extraTasks.filter((t) => t.done).length
  const unassignedTasks = todayTasks.filter((t) => t.assigneeIds.length === 0)
  const unassignedCount = unassignedTasks.length
  const unassignedDone = unassignedTasks.filter((t) => t.done).length

  const empNameById = (empId: string) => mockEmployees.find((e) => e.id === empId)?.name ?? ''

  function assigneeLabel(assigneeIds: string[]) {
    if (assigneeIds.length === 0) return null
    if (assigneeIds.length === 1) return empNameById(assigneeIds[0])
    return `${empNameById(assigneeIds[0])} 외 ${assigneeIds.length - 1}명`
  }

  function toggleTaskList(kind: 'COMMON' | 'EXTRA' | 'UNASSIGNED') {
    setOpenTaskLists((prev) => {
      const next = new Set(prev)
      if (next.has(kind)) {
        next.delete(kind)
      } else {
        next.add(kind)
      }
      return next
    })
  }

  // 완료 체크 토글 — 게이지바(progressFill)는 done 수에 따라 자동으로 다시 채워진다
  function toggleTaskDone(taskId: string) {
    setTodayTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)))
  }

  function openAssignMenu(e: MouseEvent, taskId: string) {
    const rect = e.currentTarget.getBoundingClientRect()
    setAssignMenu({ taskId, x: rect.left, y: rect.bottom + 4 })
  }

  function openQuickAssign(taskId: string) {
    const task = todayTasks.find((t) => t.id === taskId)
    setAssignDraft(task ? [...task.assigneeIds] : [])
    setAssignSearch('')
    setAssignMenu(null)
    setModal({ kind: 'quickAssign', taskId })
  }

  function openMethod(taskId: string) {
    setAssignMenu(null)
    setModal({ kind: 'method', taskId })
  }

  function toggleAssignDraft(empId: string) {
    setAssignDraft((prev) => (prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]))
  }

  function applyQuickAssign(taskId: string) {
    setTodayTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, assigneeIds: [...assignDraft] } : t)))
    setModal(null)
    showToast('담당자가 지정되었습니다')
  }

  async function requestDeleteTask(taskId: string) {
    const task = todayTasks.find((t) => t.id === taskId)
    setAssignMenu(null)
    const ok = await confirm({
      title: '이 업무를 삭제할까요?',
      message: task ? `'${task.title}' 업무를 오늘 업무리스트에서 삭제합니다.` : undefined,
    })
    if (!ok) return
    setTodayTasks((prev) => prev.filter((t) => t.id !== taskId))
    showToast('업무가 삭제되었습니다')
  }

  // inUnassignedList: 미할당 업무 리스트에서는 모두 미할당이므로 '미할당' 뱃지를 빼고 공통/추가 구분만 보여준다
  function renderTaskSubRow(task: StoreTask, inUnassignedList = false) {
    const unassigned = task.assigneeIds.length === 0
    return (
      <div key={task.id} className={styles.taskSubRow}>
        <button
          type="button"
          className={`${styles.taskSubCheck} ${task.done ? styles.taskSubCheckDone : ''}`}
          onClick={() => toggleTaskDone(task.id)}
          aria-label={task.done ? '완료 취소' : '완료 표시'}
        >
          {task.done ? '✓' : ''}
        </button>
        <div className={styles.taskSubMain}>
          <button
            type="button"
            className={styles.taskSubTitle}
            title={task.title}
            onClick={(e) => openAssignMenu(e, task.id)}
          >
            {task.title}
          </button>
          {hasTiming(task.timing) && (
            <span className={styles.taskSubTiming}>{describeTiming(task.timing)}</span>
          )}
        </div>
        {inUnassignedList ? (
          <span className={styles.taskSubKind}>{task.kind === 'COMMON' ? '공통' : '추가'}</span>
        ) : (
          <span className={unassigned ? styles.taskSubUnassigned : styles.taskSubAssignee}>
            {unassigned ? '미할당' : assigneeLabel(task.assigneeIds)}
          </span>
        )}
      </div>
    )
  }

  const pendingRequests = mockRequests.filter((r) => r.status === 'REQUESTED')
  const confirmedRequests = mockRequests.filter((r) => r.status === 'CONFIRMED')
  const inProgressRequests = mockRequests.filter((r) => r.status === 'IN_PROGRESS')

  const filteredRequests =
    requestFilter === 'pending'
      ? pendingRequests
      : requestFilter === 'confirmed'
        ? confirmedRequests
        : requestFilter === 'inProgress'
          ? inProgressRequests
          : []

  function toggleFilter(filter: RequestFilter) {
    setRequestFilter((prev) => (prev === filter ? null : filter))
  }

  const recentDocs = [...DOCUMENT_CATALOG]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.storeName}>{currentStore.name}</h1>
          <p className={styles.date}>오늘 운영 현황</p>
        </div>
        <span className={styles.operatingBadge}>운영 중</span>
      </header>

      <div className={styles.grid}>
        {/* ── 요청 현황 ── */}
        <section className={`${styles.panel} ${styles.areaRequests}`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>요청 현황</h2>
            <Link href="/owner/requests" className={styles.panelLink}>전체 보기</Link>
          </div>
          <div className={styles.requestGrid}>
            <button
              type="button"
              onClick={() => toggleFilter('pending')}
              className={`${styles.requestStat} ${requestFilter === 'pending' ? styles.requestStatActive : ''}`}
            >
              <span className={`${styles.requestCount} ${pendingRequests.length > 0 ? styles.countAlert : ''}`}>
                {pendingRequests.length}
              </span>
              <span className={styles.requestLabel}>미확인</span>
            </button>
            <button
              type="button"
              onClick={() => toggleFilter('confirmed')}
              className={`${styles.requestStat} ${requestFilter === 'confirmed' ? styles.requestStatActive : ''}`}
            >
              <span className={styles.requestCount}>{confirmedRequests.length}</span>
              <span className={styles.requestLabel}>확인됨</span>
            </button>
            <button
              type="button"
              onClick={() => toggleFilter('inProgress')}
              className={`${styles.requestStat} ${requestFilter === 'inProgress' ? styles.requestStatActive : ''}`}
            >
              <span className={styles.requestCount}>{inProgressRequests.length}</span>
              <span className={styles.requestLabel}>처리 중</span>
            </button>
          </div>
          {requestFilter === null ? (
            <p className={styles.requestHint}>항목을 눌러 요청 내역을 확인하세요.</p>
          ) : filteredRequests.length === 0 ? (
            <p className={styles.emptyText}>해당하는 요청이 없습니다.</p>
          ) : (
            <div className={styles.requestList}>
              {filteredRequests.map((req) => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => setModal({ kind: 'request', request: req })}
                  className={styles.requestListRow}
                >
                  <span className={styles.requestType}>{req.type}</span>
                  <span className={styles.requestListBody}>
                    <span className={styles.requestContent} title={req.content}>{req.content}</span>
                    <span className={styles.requestMeta}><EmployeeName name={req.employeeName} /> · {req.createdAt}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── 업무 현황 ── */}
        <section className={`${styles.panel} ${styles.areaTasks}`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>업무 현황</h2>
            <Link href="/owner/checklists" className={styles.panelLink}>전체 보기</Link>
          </div>
          <div className={styles.panelBody}>
            {([
              { kind: 'COMMON' as const, label: '공통 업무 리스트', tasks: commonTasks, done: commonDone },
              { kind: 'EXTRA' as const, label: '추가 업무 리스트', tasks: extraTasks, done: extraDone },
            ]).map(({ kind, label, tasks, done }) => (
              <div key={kind}>
                <button
                  type="button"
                  className={`${styles.taskRow} ${styles.taskRowToggle}`}
                  onClick={() => toggleTaskList(kind)}
                >
                  <span className={styles.taskLabel}>
                    {label}
                    <span className={`${styles.taskChevron} ${openTaskLists.has(kind) ? styles.taskChevronOpen : ''}`}>›</span>
                  </span>
                  <span className={styles.taskRight}>
                    <span className={styles.progressBar}>
                      <span
                        className={styles.progressFill}
                        style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }}
                      />
                    </span>
                    <span className={styles.progressText}>{done}/{tasks.length}</span>
                  </span>
                </button>
                <div className={`${styles.taskSubWrap} ${openTaskLists.has(kind) ? styles.taskSubWrapOpen : ''}`}>
                  <div className={styles.taskSubList}>
                    {tasks.length === 0 ? (
                      <p className={styles.emptyText}>업무가 없습니다.</p>
                    ) : (
                      tasks.map((task) => renderTaskSubRow(task))
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div>
              <button
                type="button"
                className={`${styles.taskRow} ${styles.taskRowToggle}`}
                onClick={() => toggleTaskList('UNASSIGNED')}
              >
                <span className={styles.taskLabel}>
                  미할당 업무
                  <span className={`${styles.taskChevron} ${openTaskLists.has('UNASSIGNED') ? styles.taskChevronOpen : ''}`}>›</span>
                </span>
                <span className={styles.taskRight}>
                  <span className={styles.progressBar}>
                    <span
                      className={styles.progressFill}
                      style={{ width: `${unassignedCount ? (unassignedDone / unassignedCount) * 100 : 0}%` }}
                    />
                  </span>
                  <span className={`${styles.progressText} ${unassignedCount > 0 ? styles.unassignedAlert : ''}`}>{unassignedDone}/{unassignedCount}</span>
                </span>
              </button>
              <div className={`${styles.taskSubWrap} ${openTaskLists.has('UNASSIGNED') ? styles.taskSubWrapOpen : ''}`}>
                <div className={styles.taskSubList}>
                  {unassignedTasks.length === 0 ? (
                    <p className={styles.emptyText}>업무가 없습니다.</p>
                  ) : (
                    unassignedTasks.map((task) => renderTaskSubRow(task, true))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 문서함 ── */}
        <section className={`${styles.panel} ${styles.areaDocuments}`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>문서함</h2>
            <Link href="/owner/documents" className={styles.panelLink}>전체 보기</Link>
          </div>
          <div className={styles.docBody}>
            <div className={styles.recentDocs}>
              <p className={styles.recentLabel}>최근 업데이트</p>
              {recentDocs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setModal({ kind: 'document', doc })}
                  className={styles.docRow}
                >
                  <span className={styles.docTitle}>{doc.title}</span>
                  <span className={styles.docMeta}>{categoryName(doc.category)} · {doc.updatedAt}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── 출근 현황 (가입 신청 건수 포함) ── */}
        <section className={`${styles.panel} ${styles.areaAttendance}`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>출근 현황</h2>
            <Link href="/owner/attendance" className={styles.panelLink}>전체 보기</Link>
          </div>
          <div className={styles.panelBody}>
            {mockAttendance.map((record) => {
              const emp = mockEmployees.find((e) => e.name === record.employeeName)
              return (
                <div key={record.employeeId} className={styles.attendanceRow}>
                  <div>
                    {emp ? (
                      <button
                        type="button"
                        onClick={() => setModal({ kind: 'employee', employee: emp })}
                        className={styles.employeeNameLink}
                      >
                        {record.employeeName}
                      </button>
                    ) : (
                      <p className={styles.employeeName}>{record.employeeName}</p>
                    )}
                    <p className={styles.scheduleTime}>
                      {record.scheduledStart} ~ {record.scheduledEnd}
                      {record.clockedIn && ` · ${record.clockedIn} 출근`}
                    </p>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[`status_${record.status}`]}`}>
                    {attendanceLabel(record.status)}
                  </span>
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setModal({ kind: 'joins' })}
            className={styles.joinSummary}
          >
            <span className={`${styles.joinSummaryIcon} ${mockJoinRequests.length > 0 ? styles.joinSummaryIconAlert : ''}`}>
              <LiaUserPlusSolid />
            </span>
            <span className={styles.joinSummaryBody}>
              <span className={styles.joinSummaryLabel}>가입 신청</span>
              <span className={styles.joinSummaryValue}>
                {mockJoinRequests.length > 0 ? `${mockJoinRequests.length}건 대기 중` : '대기 중인 신청 없음'}
              </span>
            </span>
            <LiaAngleRightSolid className={styles.joinSummaryArrow} />
          </button>
        </section>
      </div>

      {/* ── 팝업 (상세 화면과 동일한 디자인) ── */}
      {modal?.kind === 'request' && (
        <Modal title="요청 상세" size="wide" flush onClose={() => setModal(null)}>
          <RequestDetailView id={modal.request.id} mode="modal" onDeleted={() => setModal(null)} />
        </Modal>
      )}

      {modal?.kind === 'document' && (
        <Modal title="문서" size="wide" flush onClose={() => setModal(null)}>
          <DocumentDetailView id={modal.doc.id} mode="modal" onDeleted={() => setModal(null)} />
        </Modal>
      )}

      {modal?.kind === 'employee' && (
        <EmployeeProfilePopup
          name={modal.employee.name}
          employee={modal.employee}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === 'joins' && (
        <Modal title={`가입 신청 ${mockJoinRequests.length}건`} onClose={() => setModal(null)}>
          {mockJoinRequests.length === 0 ? (
            <p className={styles.emptyText}>대기 중인 가입 신청이 없습니다.</p>
          ) : (
            <div className={styles.joinModalList}>
              {mockJoinRequests.map((req) => (
                <div key={req.id} className={styles.joinModalItem}>
                  <div className={styles.joinModalHead}>
                    <span className={styles.joinModalName}>{req.name}</span>
                    <span className={styles.joinModalDate}>{req.requestedAt}</span>
                  </div>
                  <p className={styles.joinModalPhone}>{req.phone}</p>
                  {req.message && <p className={styles.joinModalMessage}>{req.message}</p>}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* 담당자 이름 클릭 → 퀵지정 / 삭제 액션 메뉴 */}
      {assignMenu && (
        <>
          <div className={styles.assignMenuOverlay} onClick={() => setAssignMenu(null)} />
          <div className={styles.assignMenu} style={{ top: assignMenu.y, left: assignMenu.x }}>
            <button
              type="button"
              className={styles.assignMenuItem}
              onClick={() => openQuickAssign(assignMenu.taskId)}
            >
              <LiaUserPlusSolid />
              퀵지정
            </button>
            <button
              type="button"
              className={styles.assignMenuItem}
              onClick={() => openMethod(assignMenu.taskId)}
            >
              <LiaBookSolid />
              수행방법
            </button>
            <button
              type="button"
              className={`${styles.assignMenuItem} ${styles.assignMenuItemDanger}`}
              onClick={() => requestDeleteTask(assignMenu.taskId)}
            >
              <LiaTrashAltSolid />
              삭제
            </button>
          </div>
        </>
      )}

      {/* 퀵 지정 팝업 — 담당 직원 선택(초안) 후 적용 */}
      {modal?.kind === 'quickAssign' && (() => {
        const task = todayTasks.find((t) => t.id === modal.taskId)
        if (!task) return null
        const q = assignSearch.trim().toLowerCase()
        const filtered = q ? employees.filter((e) => e.name.toLowerCase().includes(q)) : employees
        return (
          <Modal title="퀵 지정" size="small" dismiss="guard" onClose={() => setModal(null)}>
            <div className={styles.quickAssign}>
              <p className={styles.quickAssignTask}>{task.title}</p>
              <div className={styles.quickAssignSearch}>
                <LiaSearchSolid className={styles.quickAssignSearchIcon} />
                <input
                  className={styles.quickAssignSearchInput}
                  type="text"
                  placeholder="직원 이름 검색"
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                />
                {assignSearch && (
                  <button
                    type="button"
                    className={styles.quickAssignSearchClear}
                    onClick={() => setAssignSearch('')}
                    aria-label="검색어 지우기"
                  >
                    <LiaTimesSolid />
                  </button>
                )}
              </div>
              <div className={styles.quickAssignList}>
                {filtered.length === 0 ? (
                  <p className={styles.emptyText}>검색 결과가 없습니다.</p>
                ) : (
                  filtered.map((emp) => {
                    const on = assignDraft.includes(emp.id)
                    const att = attByName[emp.name]
                    return (
                      <div
                        key={emp.id}
                        className={styles.quickAssignRow}
                        onClick={() => toggleAssignDraft(emp.id)}
                      >
                        <span
                          className={`${styles.checkbox} ${on ? styles.checkboxOn : ''}`}
                          aria-hidden="true"
                        >
                          {on && <LiaCheckSolid />}
                        </span>
                        <span className={styles.quickAssignAvatar}>{emp.name[0]}</span>
                        {/* 이름 클릭 시 프로필 팝업 (EmployeeName이 stopPropagation 처리 → 선택 토글과 분리) */}
                        <EmployeeName name={emp.name} className={styles.quickAssignName} />
                        <span className={`${styles.quickAssignStatus} ${att ? styles[`status_${att.status}`] : styles.status_OFF}`}>
                          {att ? attendanceLabel(att.status) : '휴무'}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
              <button type="button" className={styles.quickAssignApply} onClick={() => applyQuickAssign(task.id)}>
                적용
              </button>
            </div>
          </Modal>
        )
      })()}

      {/* 수행 방법 보기 팝업 */}
      {modal?.kind === 'method' && (() => {
        const task = todayTasks.find((t) => t.id === modal.taskId)
        if (!task) return null
        return (
          <Modal title="수행 방법" size="small" onClose={() => setModal(null)}>
            <div className={styles.methodView}>
              <p className={styles.methodViewName}>{task.title}</p>
              <p className={styles.methodViewMeta}>{describeTiming(task.timing)}</p>
              {task.method ? (
                <div className={styles.methodContent} dangerouslySetInnerHTML={{ __html: task.method }} />
              ) : (
                <p className={styles.emptyText}>등록된 수행 방법이 없습니다.</p>
              )}
            </div>
          </Modal>
        )
      })()}
    </div>
  )
}
