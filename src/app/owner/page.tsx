'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/context/StoreContext'
import { mockAttendance, mockRequests } from '@/mock/data'
import { mockEmployees, mockJoinRequests } from '@/mock/employees'
import { createTasksForDate } from '@/mock/tasks'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES, type StoreDocument } from '@/mock/documents'
import type { EmployeeRequest, Employee } from '@/types'
import Modal from '@/components/Modal'
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

type RequestFilter = 'pending' | 'confirmed' | 'inProgress'

type HomeModal =
  | { kind: 'request'; request: EmployeeRequest }
  | { kind: 'document'; doc: StoreDocument }
  | { kind: 'employee'; employee: Employee }
  | { kind: 'joins' }

export default function OwnerHome() {
  const { currentStore } = useStore()
  const [requestFilter, setRequestFilter] = useState<RequestFilter | null>('pending')
  const [openTaskList, setOpenTaskList] = useState<'COMMON' | 'EXTRA' | null>(null)
  const [modal, setModal] = useState<HomeModal | null>(null)

  // 업무리스트 페이지와 동일한 오늘자 업무 데이터
  const todayTasks = createTasksForDate('2026-06-30')
  const commonTasks = todayTasks.filter((t) => t.kind === 'COMMON')
  const extraTasks = todayTasks.filter((t) => t.kind === 'EXTRA')
  const commonDone = commonTasks.filter((t) => t.done).length
  const extraDone = extraTasks.filter((t) => t.done).length
  const unassignedCount = todayTasks.filter((t) => t.assigneeIds.length === 0).length

  const empNameById = (empId: string) => mockEmployees.find((e) => e.id === empId)?.name ?? ''

  function assigneeLabel(assigneeIds: string[]) {
    if (assigneeIds.length === 0) return null
    if (assigneeIds.length === 1) return empNameById(assigneeIds[0])
    return `${empNameById(assigneeIds[0])} 외 ${assigneeIds.length - 1}명`
  }

  function toggleTaskList(kind: 'COMMON' | 'EXTRA') {
    setOpenTaskList((prev) => (prev === kind ? null : kind))
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

  const clockedInCount = mockAttendance.filter((r) => r.status === 'CLOCKED_IN').length

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
                    <span className={`${styles.taskChevron} ${openTaskList === kind ? styles.taskChevronOpen : ''}`}>›</span>
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
                <div className={`${styles.taskSubWrap} ${openTaskList === kind ? styles.taskSubWrapOpen : ''}`}>
                  <div className={styles.taskSubList}>
                    {tasks.length === 0 ? (
                      <p className={styles.emptyText}>업무가 없습니다.</p>
                    ) : (
                      tasks.map((task) => (
                        <div key={task.id} className={styles.taskSubRow}>
                          <span className={`${styles.taskSubCheck} ${task.done ? styles.taskSubCheckDone : ''}`}>
                            {task.done ? '✓' : ''}
                          </span>
                          <span className={styles.taskSubTitle} title={task.title}>{task.title}</span>
                          {task.assigneeIds.length === 0 ? (
                            <span className={styles.taskSubUnassigned}>미할당</span>
                          ) : (
                            <span className={styles.taskSubAssignee}>{assigneeLabel(task.assigneeIds)}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className={styles.taskRow}>
              <span className={styles.taskLabel}>미할당 업무</span>
              <span className={unassignedCount > 0 ? styles.unassignedAlert : styles.waitingText}>
                {unassignedCount > 0 ? `${unassignedCount}건` : '없음'}
              </span>
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
            <h2 className={styles.panelTitle}>
              출근 현황
              <span className={styles.count}>{clockedInCount}/{mockAttendance.length}</span>
            </h2>
            <Link href="/owner/attendance" className={styles.panelLink}>전체 보기</Link>
          </div>
          <button
            type="button"
            onClick={() => setModal({ kind: 'joins' })}
            className={styles.joinSummary}
          >
            <span className={styles.joinSummaryLabel}>가입 신청</span>
            <span className={styles.joinSummaryCount}>{mockJoinRequests.length}건</span>
          </button>
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
    </div>
  )
}
