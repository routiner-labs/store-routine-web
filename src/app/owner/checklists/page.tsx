'use client'

import { useState } from 'react'
import {
  LiaAngleLeftSolid,
  LiaAngleRightSolid,
  LiaTimesSolid,
  LiaPlusSolid,
  LiaGripVerticalSolid,
  LiaSearchSolid,
  LiaInfoCircleSolid,
  LiaCheckSolid,
} from 'react-icons/lia'
import { mockEmployees } from '@/mock/employees'
import { getAttendanceForDate } from '@/mock/calendar'
import { createTasksForDate, TASK_CATALOG } from '@/mock/tasks'
import type { StoreTask, TaskKind } from '@/mock/tasks'
import styles from './page.module.css'

const TODAY = '2026-06-30'
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

const COMPLETION_LABEL: Record<string, string> = {
  CHECK: '확인',
  PHOTO: '사진',
  NUMBER: '숫자',
  MEMO: '메모',
  SELECT: '선택',
  OWNER_CONFIRM: '사장확인',
}

const ATT_LABEL: Record<string, string> = {
  CLOCKED_IN: '출근',
  LATE: '지각',
  CLOCKED_OUT: '퇴근',
  SCHEDULED: '예정',
  ABSENT: '결근',
}

type DragItem = { type: 'EMP' | 'CATALOG'; id: string }

function InfoTip({ text, align = 'left' }: { text: string; align?: 'left' | 'right' }) {
  return (
    <span className={styles.infoTip}>
      <LiaInfoCircleSolid className={styles.infoIcon} />
      <span
        className={`${styles.infoTooltip} ${align === 'right' ? styles.infoTooltipRight : ''}`}
      >
        {text}
      </span>
    </span>
  )
}

function formatHeaderDate(ds: string) {
  const [y, m, d] = ds.split('-').map(Number)
  const w = WEEKDAY[new Date(y, m - 1, d).getDay()]
  return `${m}월 ${d}일 (${w})`
}

function shiftDate(ds: string, days: number) {
  const [y, m, d] = ds.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export default function OwnerChecklists() {
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [tasksByDate, setTasksByDate] = useState<Record<string, StoreTask[]>>(() => ({
    [TODAY]: createTasksForDate(TODAY),
  }))
  const [dragItem, setDragItem] = useState<DragItem | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)
  const [dragOverSection, setDragOverSection] = useState<TaskKind | null>(null)
  const [catalogQuery, setCatalogQuery] = useState('')
  const [taskQuery, setTaskQuery] = useState<Record<TaskKind, string>>({ COMMON: '', EXTRA: '' })
  const [empQuery, setEmpQuery] = useState('')

  const tasks = tasksByDate[selectedDate] ?? []
  const commonTasks = tasks.filter((t) => t.kind === 'COMMON')
  const extraTasks = tasks.filter((t) => t.kind === 'EXTRA')

  const employees = mockEmployees.filter((e) => e.status === 'ACTIVE')
  const empById = Object.fromEntries(mockEmployees.map((e) => [e.id, e]))

  const attByEmp: Record<string, string> = {}
  getAttendanceForDate(selectedDate).forEach((r) => {
    attByEmp[r.employeeId] = r.status
  })

  const query = catalogQuery.trim().toLowerCase()
  const filteredCatalog = query
    ? TASK_CATALOG.filter((t) => t.title.toLowerCase().includes(query))
    : TASK_CATALOG

  const empQ = empQuery.trim().toLowerCase()
  const filteredEmployees = empQ
    ? employees.filter((e) => e.name.toLowerCase().includes(empQ))
    : employees

  const assignedCountByEmp: Record<string, number> = {}
  tasks.forEach((t) => {
    t.assigneeIds.forEach((id) => {
      assignedCountByEmp[id] = (assignedCountByEmp[id] ?? 0) + 1
    })
  })

  const totalCount = tasks.length
  const assignedCount = tasks.filter((t) => t.assigneeIds.length > 0).length
  const doneCount = tasks.filter((t) => t.done).length
  const summary = [
    { label: '전체', value: totalCount, cls: '' },
    { label: '할당', value: assignedCount, cls: styles.sumAssigned },
    { label: '미할당', value: totalCount - assignedCount, cls: styles.sumUnassigned },
    { label: '완료', value: doneCount, cls: styles.sumDone },
    { label: '미완료', value: totalCount - doneCount, cls: styles.sumPending },
  ]

  function clearDrag() {
    setDragItem(null)
    setDragOverTaskId(null)
    setDragOverSection(null)
  }

  function goToDate(days: number) {
    const ds = shiftDate(selectedDate, days)
    setTasksByDate((prev) => (prev[ds] ? prev : { ...prev, [ds]: createTasksForDate(ds) }))
    setSelectedDate(ds)
  }

  function assign(taskId: string, empId: string) {
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).map((t) =>
        t.id === taskId && !t.assigneeIds.includes(empId)
          ? { ...t, assigneeIds: [...t.assigneeIds, empId] }
          : t,
      ),
    }))
  }

  function unassign(taskId: string, empId: string) {
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).map((t) =>
        t.id === taskId ? { ...t, assigneeIds: t.assigneeIds.filter((id) => id !== empId) } : t,
      ),
    }))
  }

  function addTaskToList(kind: TaskKind, catalogId: string) {
    setTasksByDate((prev) => {
      const list = prev[selectedDate] ?? []
      if (list.some((t) => t.kind === kind && t.catalogId === catalogId)) return prev
      const tpl = TASK_CATALOG.find((t) => t.id === catalogId)
      if (!tpl) return prev
      const newTask: StoreTask = {
        id: `${kind}-${catalogId}`,
        catalogId,
        title: tpl.title,
        completionType: tpl.completionType,
        kind,
        assigneeIds: [],
        done: false,
      }
      return { ...prev, [selectedDate]: [...list, newTask] }
    })
  }

  function toggleDone(taskId: string) {
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t,
      ),
    }))
  }

  function removeTask(taskId: string) {
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).filter((t) => t.id !== taskId),
    }))
  }

  function renderTask(task: StoreTask) {
    return (
      <div
        key={task.id}
        className={`${styles.task} ${task.done ? styles.taskDone : ''} ${
          dragOverTaskId === task.id ? styles.taskDragOver : ''
        }`}
        onDragOver={(e) => {
          if (dragItem?.type !== 'EMP') return
          e.preventDefault()
          if (dragOverTaskId !== task.id) setDragOverTaskId(task.id)
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverTaskId(null)
        }}
        onDrop={() => {
          if (dragItem?.type === 'EMP') assign(task.id, dragItem.id)
          clearDrag()
        }}
      >
        <button
          className={`${styles.taskCheck} ${task.done ? styles.taskCheckDone : ''}`}
          onClick={() => toggleDone(task.id)}
          aria-label={task.done ? '완료 취소' : '완료 처리'}
        >
          {task.done && <LiaCheckSolid />}
        </button>
        <span className={styles.taskCompletion}>{COMPLETION_LABEL[task.completionType]}</span>
        <span className={styles.taskTitle}>{task.title}</span>
        <div className={styles.assignees}>
          {task.assigneeIds.length === 0 && (
            <span className={styles.assignHint}>
              <LiaPlusSolid />
              직원 배정
            </span>
          )}

          {task.assigneeIds.length === 1 &&
            (() => {
              const emp = empById[task.assigneeIds[0]]
              if (!emp) return null
              return (
                <span className={styles.assigneeChip}>
                  <span className={styles.assigneeAvatar}>{emp.name[0]}</span>
                  {emp.name}
                  <button
                    className={styles.assigneeRemove}
                    onClick={() => unassign(task.id, task.assigneeIds[0])}
                    aria-label={`${emp.name} 배정 해제`}
                  >
                    <LiaTimesSolid />
                  </button>
                </span>
              )
            })()}

          {task.assigneeIds.length >= 2 && (
            <span className={styles.assigneeMore}>
              <span className={styles.assigneeCount}>{task.assigneeIds.length}명 배정</span>
              <span className={styles.assigneeTooltip}>
                <span className={styles.assigneeTooltipCard}>
                  {task.assigneeIds.map((empId) => {
                    const emp = empById[empId]
                    if (!emp) return null
                    return (
                      <span key={empId} className={styles.tooltipRow}>
                        <span className={styles.tooltipAvatar}>{emp.name[0]}</span>
                        <span className={styles.tooltipName}>{emp.name}</span>
                        <button
                          className={styles.tooltipRemove}
                          onClick={() => unassign(task.id, empId)}
                          aria-label={`${emp.name} 배정 해제`}
                        >
                          <LiaTimesSolid />
                        </button>
                      </span>
                    )
                  })}
                </span>
              </span>
            </span>
          )}
        </div>
        <button
          className={styles.taskRemove}
          onClick={() => removeTask(task.id)}
          aria-label="업무 제거"
        >
          <LiaTimesSolid />
        </button>
      </div>
    )
  }

  function renderSection(kind: TaskKind, title: string, desc: string, list: StoreTask[]) {
    const q = taskQuery[kind].trim().toLowerCase()
    const filtered = q
      ? list.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.assigneeIds.some((id) => empById[id]?.name.toLowerCase().includes(q)),
        )
      : list
    return (
      <section
        className={`${styles.taskSection} ${dragOverSection === kind ? styles.taskSectionDragOver : ''}`}
        onDragOver={(e) => {
          if (dragItem?.type !== 'CATALOG') return
          e.preventDefault()
          if (dragOverSection !== kind) setDragOverSection(kind)
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverSection(null)
        }}
        onDrop={() => {
          if (dragItem?.type === 'CATALOG') addTaskToList(kind, dragItem.id)
          clearDrag()
        }}
      >
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <InfoTip text={desc} />
          <span className={styles.sectionCount}>{filtered.length}</span>
        </div>
        <div className={styles.taskSearch}>
          <LiaSearchSolid className={styles.taskSearchIcon} />
          <input
            className={styles.taskSearchInput}
            type="text"
            placeholder="테스크·직원 이름 검색"
            value={taskQuery[kind]}
            onChange={(e) => setTaskQuery((prev) => ({ ...prev, [kind]: e.target.value }))}
          />
          {taskQuery[kind] && (
            <button
              className={styles.taskSearchClear}
              onClick={() => setTaskQuery((prev) => ({ ...prev, [kind]: '' }))}
              aria-label="검색어 지우기"
            >
              <LiaTimesSolid />
            </button>
          )}
        </div>
        <div className={styles.taskList}>
          {filtered.length === 0 ? (
            <p className={styles.emptyText}>
              {q ? '검색 결과가 없습니다' : '테스크를 여기로 끌어다 놓으세요'}
            </p>
          ) : (
            filtered.map(renderTask)
          )}
        </div>
      </section>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>업무리스트</h1>
        <div className={styles.dateNav}>
          <button className={styles.dateBtn} onClick={() => goToDate(-1)} aria-label="이전 날짜">
            <LiaAngleLeftSolid />
          </button>
          <span className={styles.dateLabel}>{formatHeaderDate(selectedDate)}</span>
          <button className={styles.dateBtn} onClick={() => goToDate(1)} aria-label="다음 날짜">
            <LiaAngleRightSolid />
          </button>
        </div>
      </header>

      <div className={styles.summary}>
        {summary.map((s) => (
          <div key={s.label} className={styles.summaryItem}>
            <span className={`${styles.summaryNum} ${s.cls}`}>{s.value}</span>
            <span className={styles.summaryLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.layout}>
        {/* 직원 패널 (드래그 소스) */}
        <aside className={styles.empPanel}>
          <h2 className={styles.panelTitle}>
            직원
            <InfoTip text="직원을 업무로 끌어다 놓아 배정합니다" />
          </h2>
          <div className={styles.panelSearch}>
            <LiaSearchSolid className={styles.panelSearchIcon} />
            <input
              className={styles.panelSearchInput}
              type="text"
              placeholder="직원 이름 검색"
              value={empQuery}
              onChange={(e) => setEmpQuery(e.target.value)}
            />
            {empQuery && (
              <button
                className={styles.panelSearchClear}
                onClick={() => setEmpQuery('')}
                aria-label="검색어 지우기"
              >
                <LiaTimesSolid />
              </button>
            )}
          </div>
          <div className={styles.empList}>
            {filteredEmployees.length === 0 ? (
              <p className={styles.panelEmpty}>검색 결과가 없습니다</p>
            ) : (
              filteredEmployees.map((emp) => {
              const status = attByEmp[emp.id]
              return (
                <div
                  key={emp.id}
                  className={`${styles.empCard} ${
                    dragItem?.type === 'EMP' && dragItem.id === emp.id ? styles.dragging : ''
                  }`}
                  draggable
                  onDragStart={() => setDragItem({ type: 'EMP', id: emp.id })}
                  onDragEnd={clearDrag}
                >
                  <span className={styles.empAvatar}>{emp.name[0]}</span>
                  <span className={styles.empInfo}>
                    <span className={styles.empName}>{emp.name}</span>
                    <span className={styles.empMeta}>할당 {assignedCountByEmp[emp.id] ?? 0}개</span>
                  </span>
                  <span
                    className={`${styles.attBadge} ${status ? styles[`att_${status}`] : styles.att_OFF}`}
                  >
                    {status ? ATT_LABEL[status] : '휴무'}
                  </span>
                </div>
              )
            })
          )}
          </div>
        </aside>

        {/* 업무 섹션 (드롭 타겟) */}
        <div className={styles.taskArea}>
          {renderSection('COMMON', '공통 업무 리스트', '주기로 등록해둔 업무들의 목록입니다', commonTasks)}
          {renderSection('EXTRA', '추가 업무 리스트', '추가적으로 할당하는 리스트입니다', extraTasks)}
        </div>

        {/* 테스크 목록 (카탈로그, 드래그 소스) */}
        <aside className={styles.catalogPanel}>
          <h2 className={styles.panelTitle}>
            테스크 목록
            <InfoTip text="테스크를 공통·추가 리스트로 끌어다 놓아 추가합니다" align="right" />
          </h2>
          <div className={styles.panelSearch}>
            <LiaSearchSolid className={styles.panelSearchIcon} />
            <input
              className={styles.panelSearchInput}
              type="text"
              placeholder="테스크 검색"
              value={catalogQuery}
              onChange={(e) => setCatalogQuery(e.target.value)}
            />
            {catalogQuery && (
              <button
                className={styles.panelSearchClear}
                onClick={() => setCatalogQuery('')}
                aria-label="검색어 지우기"
              >
                <LiaTimesSolid />
              </button>
            )}
          </div>
          <div className={styles.catalogList}>
            {filteredCatalog.length === 0 ? (
              <p className={styles.panelEmpty}>검색 결과가 없습니다</p>
            ) : (
              filteredCatalog.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`${styles.catalogItem} ${
                    dragItem?.type === 'CATALOG' && dragItem.id === tpl.id ? styles.dragging : ''
                  }`}
                  draggable
                  onDragStart={() => setDragItem({ type: 'CATALOG', id: tpl.id })}
                  onDragEnd={clearDrag}
                >
                  <LiaGripVerticalSolid className={styles.catalogGrip} />
                  <span className={styles.catalogTitle}>{tpl.title}</span>
                  <span className={styles.catalogCompletion}>
                    {COMPLETION_LABEL[tpl.completionType]}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
