'use client'

import { useEffect, useRef, useState } from 'react'
import {
  LiaAngleLeftSolid,
  LiaAngleRightSolid,
  LiaTimesSolid,
  LiaPlusSolid,
  LiaGripVerticalSolid,
  LiaSearchSolid,
  LiaInfoCircleSolid,
  LiaCheckSolid,
  LiaClipboardListSolid,
  LiaCogSolid,
  LiaPenSolid,
  LiaTrashAltSolid,
  LiaAngleDownSolid,
  LiaBookSolid,
  LiaImageSolid,
} from 'react-icons/lia'
import { mockEmployees } from '@/mock/employees'
import { getAttendanceForDate } from '@/mock/calendar'
import { createTasksForDate, TASK_CATALOG } from '@/mock/tasks'
import type { StoreTask, TaskKind, TaskTemplate } from '@/mock/tasks'
import type { CompletionType } from '@/types'
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

const COMPLETION_OPTIONS: CompletionType[] = [
  'CHECK',
  'PHOTO',
  'NUMBER',
  'MEMO',
  'SELECT',
  'OWNER_CONFIRM',
]

const ATT_LABEL: Record<string, string> = {
  CLOCKED_IN: '출근',
  LATE: '지각',
  CLOCKED_OUT: '퇴근',
  SCHEDULED: '예정',
  ABSENT: '결근',
}

type DragItem = { type: 'EMP' | 'CATALOG'; id: string }

function hasMethodContent(html: string) {
  if (/<img/i.test(html)) return true
  return html.replace(/<[^>]*>/g, '').trim().length > 0
}

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
  const [catalog, setCatalog] = useState<TaskTemplate[]>(TASK_CATALOG)
  const [fabOpen, setFabOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<CompletionType>('CHECK')
  const [newMethod, setNewMethod] = useState('')
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null)
  const [methodTask, setMethodTask] = useState<StoreTask | null>(null)
  const seqRef = useRef(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // 에디터가 열릴 때 초기 내용 주입 (uncontrolled)
  useEffect(() => {
    if (createOpen && editorRef.current) {
      editorRef.current.innerHTML = newMethod
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createOpen])

  function insertPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    editorRef.current?.focus()
    Array.from(files).forEach((f) => {
      const url = URL.createObjectURL(f)
      document.execCommand('insertHTML', false, `<img src="${url}" alt="수행 사진" />`)
    })
    e.target.value = ''
  }

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
    ? catalog.filter((t) => t.title.toLowerCase().includes(query))
    : catalog

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
      const tpl = catalog.find((t) => t.id === catalogId)
      if (!tpl) return prev
      const newTask: StoreTask = {
        id: `${kind}-${catalogId}`,
        catalogId,
        title: tpl.title,
        completionType: tpl.completionType,
        method: tpl.method,
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

  function openCreateTask() {
    setFabOpen(false)
    setEditingId(null)
    setNewTitle('')
    setNewType('CHECK')
    setNewMethod('')
    setCreateOpen(true)
  }

  function openManage() {
    setFabOpen(false)
    setManageOpen(true)
  }

  function closeCreate() {
    setCreateOpen(false)
    setEditingId(null)
  }

  function startEdit(tpl: TaskTemplate) {
    setEditingId(tpl.id)
    setNewTitle(tpl.title)
    setNewType(tpl.completionType)
    setNewMethod(tpl.method)
    setManageOpen(false)
    setCreateOpen(true)
  }

  function deleteTask(id: string) {
    setCatalog((prev) => prev.filter((t) => t.id !== id))
  }

  function createTask() {
    const title = newTitle.trim()
    if (!title) return
    const method = editorRef.current?.innerHTML ?? ''
    if (editingId) {
      setCatalog((prev) =>
        prev.map((t) =>
          t.id === editingId ? { ...t, title, completionType: newType, method } : t,
        ),
      )
      setTasksByDate((prev) => {
        const next: Record<string, StoreTask[]> = {}
        for (const date of Object.keys(prev)) {
          next[date] = prev[date].map((t) =>
            t.catalogId === editingId ? { ...t, title, completionType: newType, method } : t,
          )
        }
        return next
      })
    } else {
      seqRef.current += 1
      const id = `custom-${seqRef.current}`
      setCatalog((prev) => [...prev, { id, title, completionType: newType, method }])
    }
    setCreateOpen(false)
    setEditingId(null)
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
        <div className={styles.taskMain}>
          <button
            className={styles.taskTitleBtn}
            onClick={() => setMenuTaskId((cur) => (cur === task.id ? null : task.id))}
          >
            <span className={styles.taskTitle}>{task.title}</span>
            <LiaAngleDownSolid className={styles.taskTitleChevron} />
          </button>
          {menuTaskId === task.id && (
            <div className={styles.taskMenu}>
              <button
                className={styles.taskMenuItem}
                onClick={() => {
                  setMethodTask(task)
                  setMenuTaskId(null)
                }}
              >
                <LiaBookSolid className={styles.taskMenuIcon} />
                수행 방법
              </button>
            </div>
          )}
        </div>
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

      {/* 업무 드롭다운 메뉴 바깥 클릭 닫기 */}
      {menuTaskId && <div className={styles.menuOverlay} onClick={() => setMenuTaskId(null)} />}

      {/* 우측 하단 FAB + 메뉴 */}
      {fabOpen && <div className={styles.fabOverlay} onClick={() => setFabOpen(false)} />}
      <div className={styles.fabWrap}>
        {fabOpen && (
          <div className={styles.fabMenu}>
            <button className={styles.fabMenuItem} onClick={openManage}>
              <LiaCogSolid className={styles.fabMenuIcon} />
              테스크 관리
            </button>
            <button className={styles.fabMenuItem} onClick={openCreateTask}>
              <LiaClipboardListSolid className={styles.fabMenuIcon} />
              테스크 만들기
            </button>
          </div>
        )}
        <button
          className={`${styles.fab} ${fabOpen ? styles.fabActive : ''}`}
          onClick={() => setFabOpen((o) => !o)}
          aria-label="추가 메뉴"
        >
          <LiaPlusSolid />
        </button>
      </div>

      {/* 테스크 만들기 / 수정 팝업 */}
      {createOpen && (
        <div className={styles.modalOverlay} onClick={closeCreate}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{editingId ? '테스크 수정' : '테스크 만들기'}</h2>
              <button className={styles.modalClose} onClick={closeCreate} aria-label="닫기">
                <LiaTimesSolid />
              </button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>테스크 이름</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createTask()
                  }}
                  placeholder="예: 매장 조명 켜기"
                  autoFocus
                />
              </label>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>완료 방식</span>
                <div className={styles.typeChips}>
                  {COMPLETION_OPTIONS.map((ct) => (
                    <button
                      key={ct}
                      className={`${styles.typeChip} ${newType === ct ? styles.typeChipActive : ''}`}
                      onClick={() => setNewType(ct)}
                    >
                      {COMPLETION_LABEL[ct]}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>수행 방법</span>
                <div className={styles.editorToolbar}>
                  <button className={styles.editorTool} onClick={() => fileRef.current?.click()}>
                    <LiaImageSolid />
                    사진
                  </button>
                </div>
                <div
                  ref={editorRef}
                  className={styles.editor}
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="이 업무의 수행 방법을 작성하세요. 사진도 넣을 수 있어요."
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={insertPhotos}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <div className={styles.modalFoot}>
              <button className={styles.btnCancel} onClick={closeCreate}>
                취소
              </button>
              <button className={styles.btnCreate} onClick={createTask} disabled={!newTitle.trim()}>
                {editingId ? '저장' : '만들기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 테스크 관리 팝업 */}
      {manageOpen && (
        <div className={styles.modalOverlay} onClick={() => setManageOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>테스크 관리</h2>
              <button
                className={styles.modalClose}
                onClick={() => setManageOpen(false)}
                aria-label="닫기"
              >
                <LiaTimesSolid />
              </button>
            </div>
            <div className={styles.manageBody}>
              {catalog.length === 0 ? (
                <p className={styles.panelEmpty}>등록된 테스크가 없습니다</p>
              ) : (
                catalog.map((tpl) => (
                  <div key={tpl.id} className={styles.manageRow}>
                    <span className={styles.manageType}>
                      {COMPLETION_LABEL[tpl.completionType]}
                    </span>
                    <span className={styles.manageName}>{tpl.title}</span>
                    <button
                      className={styles.manageEdit}
                      onClick={() => startEdit(tpl)}
                      aria-label={`${tpl.title} 수정`}
                    >
                      <LiaPenSolid />
                    </button>
                    <button
                      className={styles.manageDelete}
                      onClick={() => deleteTask(tpl.id)}
                      aria-label={`${tpl.title} 삭제`}
                    >
                      <LiaTrashAltSolid />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className={styles.modalFoot}>
              <button
                className={styles.btnCreate}
                onClick={() => {
                  setManageOpen(false)
                  openCreateTask()
                }}
              >
                <LiaPlusSolid />새 테스크
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수행 방법 팝업 */}
      {methodTask && (
        <div className={styles.modalOverlay} onClick={() => setMethodTask(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>수행 방법</h2>
              <button
                className={styles.modalClose}
                onClick={() => setMethodTask(null)}
                aria-label="닫기"
              >
                <LiaTimesSolid />
              </button>
            </div>
            <div className={styles.methodBody}>
              <div className={styles.methodTaskName}>
                <span className={styles.taskCompletion}>
                  {COMPLETION_LABEL[methodTask.completionType]}
                </span>
                {methodTask.title}
              </div>
              {hasMethodContent(methodTask.method) ? (
                <div
                  className={styles.methodContent}
                  dangerouslySetInnerHTML={{ __html: methodTask.method }}
                />
              ) : (
                <p className={styles.methodEmpty}>등록된 수행 방법이 없습니다</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
