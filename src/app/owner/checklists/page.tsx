'use client'

import { useEffect, useRef, useState } from 'react'
import {
  LiaTimesSolid,
  LiaPlusSolid,
  LiaGripVerticalSolid,
  LiaSearchSolid,
  LiaInfoCircleSolid,
  LiaCheckSolid,
  LiaClipboardListSolid,
  LiaCogSolid,
  LiaTrashAltSolid,
  LiaAngleDownSolid,
  LiaBookSolid,
  LiaBarsSolid,
  LiaClockSolid,
  LiaBanSolid,
} from 'react-icons/lia'
import { mockEmployees } from '@/mock/employees'
import { getAttendanceForDate } from '@/mock/calendar'
import {
  createTasksForDate,
  DEFAULT_CATEGORIES,
  DEFAULT_RECURRENCE_RULE,
  DEFAULT_TIMING,
  TASK_CATALOG,
} from '@/mock/tasks'
import type {
  Category,
  MonthDayKind,
  MonthlyMode,
  Recurrence,
  RecurrenceFreq,
  RecurrenceRule,
  StoreTask,
  TaskCategory,
  TaskKind,
  TaskTemplate,
  TaskTiming,
} from '@/mock/tasks'
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor'
import Modal from '@/components/Modal'
import DocumentDetailView from '@/app/owner/documents/DocumentDetailView'
import RequestDetailView from '@/app/owner/requests/RequestDetailView'
import { DOCUMENT_CATALOG, DOCUMENT_CATEGORIES } from '@/mock/documents'
import { mockRequests } from '@/mock/data'
import { LiaInboxSolid } from 'react-icons/lia'
import { useConfirm } from '@/context/ConfirmContext'
import { useToast } from '@/context/ToastContext'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import { categoryBadgeStyle } from '@/lib/categoryColors'
import EmployeeName from '@/components/EmployeeName'
import CategoryColorPicker from '@/components/CategoryColorPicker'
import CategoryManagePopup from '@/components/CategoryManagePopup'
import SelectBox from '@/components/SelectBox'
import styles from './page.module.css'

const TODAY = '2026-06-30'
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: 'RECURRING', label: '반복' },
  { value: 'ONCE', label: '단건' },
]

function hasTiming(t: TaskTiming): boolean {
  return Boolean(t.start || t.end)
}

function hmToMin(hm: string): number {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

function minToHm(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function TimeRangeSlider({
  start,
  end,
  onChange,
}: {
  start: string
  end: string
  onChange: (start: string, end: string) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const R0 = 6 * 60 // 06:00
  const R1 = 24 * 60 // 24:00
  const SPAN = R1 - R0
  const STEP = 30
  const active = Boolean(start || end)
  const sMin = start ? hmToMin(start) : 9 * 60
  const eMin = end ? hmToMin(end) : 18 * 60
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
  const pct = (m: number) => ((clamp(m, R0, R1) - R0) / SPAN) * 100
  const minAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return R0
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    return clamp(Math.round((R0 + ratio * SPAN) / STEP) * STEP, R0, R1)
  }

  function begin(mode: 'start' | 'end' | 'range', e: React.PointerEvent) {
    e.preventDefault()
    const s0 = sMin
    const e0 = eMin
    const anchor = minAt(e.clientX)
    const onMove = (ev: PointerEvent) => {
      const m = minAt(ev.clientX)
      if (mode === 'start') onChange(minToHm(Math.min(m, e0 - STEP)), minToHm(e0))
      else if (mode === 'end') onChange(minToHm(s0), minToHm(Math.max(m, s0 + STEP)))
      else {
        const d = clamp(m - anchor, R0 - s0, R1 - e0)
        onChange(minToHm(s0 + d), minToHm(e0 + d))
      }
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div className={`${styles.trs} ${active ? '' : styles.trsInactive}`}>
      <div className={styles.trsTop}>
        <input
          type="time"
          className={styles.trsTimeInput}
          value={start}
          onChange={(e) => onChange(e.target.value, end)}
        />
        <span className={styles.trsSep}>~</span>
        <input
          type="time"
          className={styles.trsTimeInput}
          value={end}
          onChange={(e) => onChange(start, e.target.value)}
        />
        {active && (
          <button
            type="button"
            className={styles.trsClear}
            onClick={() => onChange('', '')}
            aria-label="상시로 변경"
          >
            <LiaTimesSolid />
          </button>
        )}
      </div>
      <div className={styles.trsTrack} ref={trackRef}>
        <div
          className={styles.trsFill}
          style={{ left: `${pct(sMin)}%`, width: `${pct(eMin) - pct(sMin)}%` }}
          onPointerDown={(e) => begin('range', e)}
        />
        <div
          className={styles.trsHandle}
          style={{ left: `${pct(sMin)}%` }}
          onPointerDown={(e) => begin('start', e)}
        />
        <div
          className={styles.trsHandle}
          style={{ left: `${pct(eMin)}%` }}
          onPointerDown={(e) => begin('end', e)}
        />
        {!active && <div className={styles.trsHint}>드래그해서 시간대 설정</div>}
      </div>
      <div className={styles.trsTicks}>
        {[6, 9, 12, 15, 18, 21, 24].map((h) => (
          <span key={h} className={styles.trsTick}>
            {h}
          </span>
        ))}
      </div>
    </div>
  )
}

function describeTiming(t: TaskTiming): string {
  if (t.start && t.end) return `${t.start}~${t.end}`
  if (t.start) return `${t.start}부터`
  if (t.end) return `${t.end}까지`
  return '상시'
}

const WD_LABELS = ['월', '화', '수', '목', '금', '토', '일'] // 0=월 .. 6=일

const FREQ_OPTIONS: { value: RecurrenceFreq; label: string; unit: string }[] = [
  { value: 'DAILY', label: '매일', unit: '일' },
  { value: 'WEEKLY', label: '매주', unit: '주' },
  { value: 'MONTHLY', label: '매월', unit: '개월' },
  { value: 'YEARLY', label: '매년', unit: '년' },
]

const NTH_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '첫째' },
  { value: 2, label: '둘째' },
  { value: 3, label: '셋째' },
  { value: 4, label: '넷째' },
  { value: 5, label: '다섯째' },
  { value: -1, label: '마지막' },
]

function describeRecurrence(r: RecurrenceRule): string {
  const days = (arr: number[]) =>
    arr.length ? arr.map((d) => WD_LABELS[d]).join('·') : '요일 미선택'
  if (r.freq === 'DAILY') return r.interval > 1 ? `${r.interval}일마다` : '매일'
  if (r.freq === 'WEEKLY') {
    const base = r.interval > 1 ? `${r.interval}주마다` : '매주'
    return `${base} ${days(r.weekdays)}`
  }
  if (r.freq === 'MONTHLY') {
    const base = r.interval > 1 ? `${r.interval}개월마다` : '매월'
    if (r.monthlyMode === 'DAY') {
      const d =
        r.monthDayKind === 'FIRST' ? '월초' : r.monthDayKind === 'LAST' ? '월말' : `${r.monthDay}일`
      return `${base} ${d}`
    }
    const nth = NTH_OPTIONS.find((o) => o.value === r.nthWeek)?.label ?? ''
    return `${base} ${nth} ${WD_LABELS[r.nthWeekday]}요일`
  }
  return r.interval > 1 ? `${r.interval}년마다` : '매년'
}

function RecurrenceEditor({
  value,
  onChange,
}: {
  value: RecurrenceRule
  onChange: (r: RecurrenceRule) => void
}) {
  const set = (patch: Partial<RecurrenceRule>) => onChange({ ...value, ...patch })
  const unit = FREQ_OPTIONS.find((f) => f.value === value.freq)?.unit ?? ''

  return (
    <div className={styles.recurDetail}>
      <div className={styles.recurRow}>
        <SelectBox value={value.freq} onChange={(v) => set({ freq: v as RecurrenceFreq })}>
          {FREQ_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </SelectBox>
        <input
          type="number"
          min={1}
          className={styles.recurNum}
          value={value.interval}
          onChange={(e) => set({ interval: Math.max(1, Number(e.target.value) || 1) })}
        />
        <span className={styles.recurUnit}>{unit}마다</span>
      </div>

      {value.freq === 'WEEKLY' && (
        <div className={styles.recurWeekdays}>
          {WD_LABELS.map((l, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.recurDay} ${value.weekdays.includes(i) ? styles.recurDayOn : ''}`}
              onClick={() =>
                set({
                  weekdays: value.weekdays.includes(i)
                    ? value.weekdays.filter((d) => d !== i)
                    : [...value.weekdays, i].sort((a, b) => a - b),
                })
              }
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {value.freq === 'MONTHLY' && (
        <>
          <div className={styles.recurRow}>
            <SelectBox value={value.monthlyMode} onChange={(v) => set({ monthlyMode: v as MonthlyMode })}>
              <option value="DAY">날짜 지정</option>
              <option value="NTH_WEEKDAY">요일 지정</option>
            </SelectBox>

            {value.monthlyMode === 'DAY' ? (
              <>
                <SelectBox value={value.monthDayKind} onChange={(v) => set({ monthDayKind: v as MonthDayKind })}>
                  <option value="FIRST">월초</option>
                  <option value="LAST">월말</option>
                  <option value="SPECIFIC">특정일</option>
                </SelectBox>
                {value.monthDayKind === 'SPECIFIC' && (
                  <>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      className={styles.recurNum}
                      value={value.monthDay}
                      onChange={(e) =>
                        set({ monthDay: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })
                      }
                    />
                    <span className={styles.recurUnit}>일</span>
                  </>
                )}
              </>
            ) : (
              <SelectBox value={value.nthWeek} onChange={(v) => set({ nthWeek: Number(v) })}>
                {NTH_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectBox>
            )}
          </div>

          {value.monthlyMode === 'NTH_WEEKDAY' && (
            <div className={styles.recurWeekdays}>
              {WD_LABELS.map((l, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.recurDay} ${value.nthWeekday === i ? styles.recurDayOn : ''}`}
                  onClick={() => set({ nthWeekday: i })}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <span className={styles.recurSummary}>{describeRecurrence(value)}</span>
    </div>
  )
}

const ATT_LABEL: Record<string, string> = {
  CLOCKED_IN: '출근',
  LATE: '지각',
  CLOCKED_OUT: '퇴근',
  SCHEDULED: '예정',
  ABSENT: '결근',
}

type DragItem = { type: 'EMP' | 'CATALOG'; id: string }
type SummaryFilter = 'ALL' | 'ASSIGNED' | 'UNASSIGNED' | 'DONE' | 'PENDING'

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

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function shiftMonth(year: number, month: number, dir: number) {
  let m = month + dir
  let y = year
  if (m === 0) {
    y--
    m = 12
  }
  if (m === 13) {
    y++
    m = 1
  }
  return { year: y, month: m }
}

function getMonthGrid(year: number, month: number): (number | null)[] {
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const total = new Date(year, month, 0).getDate()
  const grid: (number | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= total; d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

export default function OwnerChecklists() {
  const confirm = useConfirm()
  const { showToast } = useToast()
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(() => Number(TODAY.split('-')[0]))
  const [pickerMonth, setPickerMonth] = useState(() => Number(TODAY.split('-')[1]))
  const [tasksByDate, setTasksByDate] = useState<Record<string, StoreTask[]>>(() => ({
    [TODAY]: createTasksForDate(TODAY),
  }))
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilter>('ALL')
  const [dragItem, setDragItem] = useState<DragItem | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)
  const [dragOverSection, setDragOverSection] = useState<TaskKind | null>(null)
  const [trashDragOver, setTrashDragOver] = useState(false)
  const [catalogQuery, setCatalogQuery] = useState('')
  const [taskQuery, setTaskQuery] = useState<Record<TaskKind, string>>({ COMMON: '', EXTRA: '' })
  const [empQuery, setEmpQuery] = useState('')
  const [hideOffDuty, setHideOffDuty] = useState(false)
  const [catalog, setCatalog] = useState<TaskTemplate[]>(TASK_CATALOG)
  const [fabOpen, setFabOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newActive, setNewActive] = useState(true)
  const [manageSearch, setManageSearch] = useState('')
  const [newCategory, setNewCategory] = useState<TaskCategory>('ETC')
  const [newTiming, setNewTiming] = useState<TaskTiming>(DEFAULT_TIMING)
  const [newRecurrence, setNewRecurrence] = useState<Recurrence>('RECURRING')
  const [newRule, setNewRule] = useState<RecurrenceRule>(DEFAULT_RECURRENCE_RULE)
  const [newRecurStart, setNewRecurStart] = useState('')
  const [newRecurEnd, setNewRecurEnd] = useState('')
  const [newAssignees, setNewAssignees] = useState<string[]>([])
  const [dutyPickerOpen, setDutyPickerOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [catManageOpen, setCatManageOpen] = useState(false)
  const [catDraft, setCatDraft] = useState('')
  const [catDraftColor, setCatDraftColor] = useState<string | undefined>(undefined)
  const [catColorPickingId, setCatColorPickingId] = useState<string | null>(null) // 카테고리 id 또는 'NEW'(추가 행)
  const catSeqRef = useRef(0)

  const categoryName = (id: TaskCategory) => categories.find((c) => c.id === id)?.name ?? '미분류'
  const categoryColor = (id: TaskCategory) => categories.find((c) => c.id === id)?.color

  function addCategory() {
    const name = catDraft.trim()
    if (!name) return
    catSeqRef.current += 1
    setCategories((prev) => [...prev, { id: `cat-${catSeqRef.current}`, name, color: catDraftColor }])
    setCatDraft('')
    setCatDraftColor(undefined)
    showToast('카테고리가 추가되었습니다')
  }

  function renameCategory(id: string, name: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
  }

  function setCategoryColor(id: string, color: string) {
    if (id === 'NEW') {
      setCatDraftColor(color)
      return
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, color } : c)))
  }

  async function deleteCategory(id: string) {
    const cat = categories.find((c) => c.id === id)
    const ok = await confirm({
      title: '카테고리를 삭제할까요?',
      message: `'${cat?.name ?? ''}' 카테고리가 삭제됩니다.`,
    })
    if (!ok) return
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id)
      if (newCategory === id) setNewCategory(next[0]?.id ?? 'ETC')
      return next
    })
    showToast('카테고리가 삭제되었습니다')
  }
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null)
  const [catalogMenuId, setCatalogMenuId] = useState<string | null>(null)
  const [methodTask, setMethodTask] = useState<StoreTask | null>(null)
  const [timingTask, setTimingTask] = useState<StoreTask | null>(null)
  const [timingDraft, setTimingDraft] = useState<TaskTiming>(DEFAULT_TIMING)
  const [newDocRefs, setNewDocRefs] = useState<string[]>([])
  const [docPickerOpen, setDocPickerOpen] = useState(false)
  const [docPickerQuery, setDocPickerQuery] = useState('')
  const [docPreviewId, setDocPreviewId] = useState<string | null>(null)
  const [docDraftRefs, setDocDraftRefs] = useState<string[]>([])
  const [viewDocId, setViewDocId] = useState<string | null>(null)
  const [viewRequestId, setViewRequestId] = useState<string | null>(null)
  const seqRef = useRef(0)
  const methodHtmlRef = useRef('')

  // 팝업이 열리면 배경 스크롤 잠금
  useScrollLock(manageOpen || methodTask !== null || timingTask !== null || dutyPickerOpen || catManageOpen || docPickerOpen || viewDocId !== null || viewRequestId !== null)

  // ESC 닫기: 미저장 초안이 있는 폼은 guard(컨펌 후), 뷰어·즉시반영 선택은 viewer(바로 닫힘).
  // 최상위 팝업에만 적용되므로 서브 팝업이 위에 떠 있으면 그 서브 팝업만 닫힌다.
  usePopupEsc(manageOpen, 'guard', closeManage)
  usePopupEsc(timingTask !== null, 'guard', () => setTimingTask(null))
  usePopupEsc(docPickerOpen, 'guard', () => setDocPickerOpen(false))
  usePopupEsc(methodTask !== null, 'viewer', () => setMethodTask(null))
  usePopupEsc(dutyPickerOpen, 'viewer', () => setDutyPickerOpen(false))
  usePopupEsc(catManageOpen, 'viewer', () => setCatManageOpen(false))

  // 테스크 목록 드롭다운: 바깥 클릭 시 닫기 (sticky 패널의 stacking context 때문에 오버레이 대신 사용)
  useEffect(() => {
    if (!catalogMenuId) return
    function onPointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement
      if (!target.closest(`.${styles.catalogItem}`)) setCatalogMenuId(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [catalogMenuId])

  const docTitle = (id: string) => DOCUMENT_CATALOG.find((d) => d.id === id)?.title ?? '삭제된 문서'
  const docCategoryName = (id: string) => {
    const doc = DOCUMENT_CATALOG.find((d) => d.id === id)
    return DOCUMENT_CATEGORIES.find((c) => c.id === doc?.category)?.name ?? '기타'
  }
  const docCategoryColor = (id: string) => {
    const doc = DOCUMENT_CATALOG.find((d) => d.id === id)
    return DOCUMENT_CATEGORIES.find((c) => c.id === doc?.category)?.color
  }

  function toggleDocRef(docId: string) {
    setNewDocRefs((prev) =>
      prev.includes(docId) ? prev.filter((x) => x !== docId) : [...prev, docId],
    )
  }

  function toggleDocDraft(docId: string) {
    setDocDraftRefs((prev) =>
      prev.includes(docId) ? prev.filter((x) => x !== docId) : [...prev, docId],
    )
  }

  function openDocPicker() {
    setDocDraftRefs(newDocRefs)
    setDocPreviewId(DOCUMENT_CATALOG[0]?.id ?? null)
    setDocPickerOpen(true)
  }

  function closeDocPicker() {
    setDocPickerOpen(false)
    setDocPickerQuery('')
  }

  function applyDocPicker() {
    setNewDocRefs(docDraftRefs)
    closeDocPicker()
    showToast(`참조 문서 ${docDraftRefs.length}건이 적용되었습니다`)
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
  const activeCatalog = catalog.filter((t) => t.active !== false)
  const filteredCatalog = query
    ? activeCatalog.filter((t) => t.title.toLowerCase().includes(query))
    : activeCatalog

  const manageQ = manageSearch.trim().toLowerCase()
  const manageFiltered = manageQ
    ? catalog.filter(
        (t) =>
          t.title.toLowerCase().includes(manageQ) ||
          categoryName(t.category ?? 'ETC').toLowerCase().includes(manageQ),
      )
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
  const summary: { key: SummaryFilter; label: string; value: number; cls: string }[] = [
    { key: 'ALL', label: '전체', value: totalCount, cls: '' },
    { key: 'ASSIGNED', label: '할당', value: assignedCount, cls: styles.sumAssigned },
    { key: 'UNASSIGNED', label: '미할당', value: totalCount - assignedCount, cls: styles.sumUnassigned },
    { key: 'DONE', label: '완료', value: doneCount, cls: styles.sumDone },
    { key: 'PENDING', label: '미완료', value: totalCount - doneCount, cls: styles.sumPending },
  ]

  function matchesSummary(t: StoreTask): boolean {
    if (summaryFilter === 'ASSIGNED') return t.assigneeIds.length > 0
    if (summaryFilter === 'UNASSIGNED') return t.assigneeIds.length === 0
    if (summaryFilter === 'DONE') return t.done
    if (summaryFilter === 'PENDING') return !t.done
    return true
  }

  function clearDrag() {
    setDragItem(null)
    setDragOverTaskId(null)
    setDragOverSection(null)
    setTrashDragOver(false)
  }

  function deactivateTask(id: string) {
    const tpl = catalog.find((t) => t.id === id)
    if (!tpl) return
    setCatalog((prev) => prev.map((t) => (t.id === id ? { ...t, active: false } : t)))
    showToast(`'${tpl.title}' 테스크가 비활성화되었습니다`)
  }

  async function confirmDeactivate(tpl: TaskTemplate) {
    setCatalogMenuId(null)
    const ok = await confirm({
      title: '테스크를 비활성화할까요?',
      message: `'${tpl.title}' 테스크가 목록에서 숨겨집니다. 테스크 관리에서 다시 켤 수 있어요.`,
      confirmText: '비활성화',
      cancelText: '취소',
      danger: false,
    })
    if (!ok) return
    deactivateTask(tpl.id)
  }

  function toggleTaskActive(id: string) {
    const tpl = catalog.find((t) => t.id === id)
    if (!tpl) return
    const next = tpl.active === false
    setCatalog((prev) => prev.map((t) => (t.id === id ? { ...t, active: next } : t)))
    if (editingId === id) setNewActive(next)
    showToast(next ? `'${tpl.title}' 테스크가 활성화되었습니다` : `'${tpl.title}' 테스크가 비활성화되었습니다`)
  }

  function openDatePicker() {
    const [y, m] = selectedDate.split('-').map(Number)
    setPickerYear(y)
    setPickerMonth(m)
    setDatePickerOpen(true)
  }

  function selectDate(ds: string) {
    setTasksByDate((prev) => (prev[ds] ? prev : { ...prev, [ds]: createTasksForDate(ds) }))
    setSelectedDate(ds)
    setDatePickerOpen(false)
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

  async function assignEmployee(taskId: string, empId: string) {
    const isOffDuty = !attByEmp[empId]
    if (isOffDuty) {
      const emp = empById[empId]
      const ok = await confirm({
        title: '휴무자를 배정할까요?',
        message: `${emp?.name ?? '이 직원'}님은 ${formatHeaderDate(selectedDate)} 휴무입니다. 그래도 배정하시겠어요?`,
        confirmText: '네',
        cancelText: '아니오',
        danger: false,
      })
      if (!ok) return
    }
    assign(taskId, empId)
  }

  function unassign(taskId: string, empId: string) {
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).map((t) =>
        t.id === taskId ? { ...t, assigneeIds: t.assigneeIds.filter((id) => id !== empId) } : t,
      ),
    }))
  }

  function createTaskFromSearch(name: string) {
    const title = name.trim()
    if (!title) return
    openManageNew()
    setNewTitle(title)
    setCatalogQuery('')
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
        method: tpl.method,
        category: tpl.category ?? 'ETC',
        timing: tpl.timing ?? DEFAULT_TIMING,
        recurrence: tpl.recurrence ?? 'RECURRING',
        recurrenceRule: tpl.recurrenceRule ?? DEFAULT_RECURRENCE_RULE,
        kind,
        assigneeIds: tpl.defaultAssigneeIds ?? [],
        done: false,
        docRefs: tpl.docRefs ?? [],
      }
      return { ...prev, [selectedDate]: [...list, newTask] }
    })
  }

  function saveTaskTiming() {
    if (!timingTask) return
    const taskId = timingTask.id
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).map((t) =>
        t.id === taskId ? { ...t, timing: timingDraft } : t,
      ),
    }))
    setTimingTask(null)
    showToast(hasTiming(timingDraft) ? '수행 시간이 지정되었습니다' : '상시 수행으로 변경되었습니다')
  }

  function toggleDone(taskId: string) {
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t,
      ),
    }))
  }

  function selectNew() {
    setEditingId(null)
    setNewTitle('')
    setNewActive(true)
    setNewCategory('ETC')
    setNewTiming(DEFAULT_TIMING)
    setNewRecurrence('ONCE')
    setNewRule(DEFAULT_RECURRENCE_RULE)
    setNewRecurStart('')
    setNewRecurEnd('')
    setNewAssignees([])
    setNewDocRefs([])
    methodHtmlRef.current = ''
  }

  function openManageNew() {
    setFabOpen(false)
    selectNew()
    setManageOpen(true)
  }

  function openManage() {
    setFabOpen(false)
    if (catalog.length > 0) selectTask(catalog[0])
    else selectNew()
    setManageOpen(true)
  }

  function openManageFor(tpl: TaskTemplate) {
    setFabOpen(false)
    setCatalogMenuId(null)
    selectTask(tpl)
    setManageOpen(true)
  }

  function closeManage() {
    setManageOpen(false)
    setEditingId(null)
    setDutyPickerOpen(false)
    setCatManageOpen(false)
  }

  function toggleAssignee(empId: string) {
    setNewAssignees((prev) =>
      prev.includes(empId) ? prev.filter((x) => x !== empId) : [...prev, empId],
    )
  }

  function setRecurrence(value: Recurrence) {
    if (value === newRecurrence) return
    setNewRecurrence(value)
  }

  function selectTask(tpl: TaskTemplate) {
    setEditingId(tpl.id)
    setNewTitle(tpl.title)
    setNewActive(tpl.active !== false)
    setNewCategory(tpl.category ?? 'ETC')
    setNewTiming(tpl.timing ?? DEFAULT_TIMING)
    setNewRecurrence(tpl.recurrence ?? 'RECURRING')
    setNewRule(tpl.recurrenceRule ?? DEFAULT_RECURRENCE_RULE)
    setNewRecurStart(tpl.recurStart ?? '')
    setNewRecurEnd(tpl.recurEnd ?? '')
    setNewAssignees(tpl.defaultAssigneeIds ?? [])
    setNewDocRefs(tpl.docRefs ?? [])
    methodHtmlRef.current = tpl.method
  }

  async function deleteTask(id: string) {
    const tpl = catalog.find((t) => t.id === id)
    const ok = await confirm({
      title: '테스크를 삭제할까요?',
      message: `'${tpl?.title ?? ''}' 테스크가 삭제됩니다.`,
    })
    if (!ok) return
    const next = catalog.filter((t) => t.id !== id)
    setCatalog(next)
    if (editingId === id) {
      if (next.length > 0) selectTask(next[0])
      else selectNew()
    }
    showToast('테스크가 삭제되었습니다')
  }

  function saveTask() {
    const title = newTitle.trim()
    if (!title) return
    const isEdit = Boolean(editingId)
    const method = methodHtmlRef.current
    const assignees = newRecurrence === 'RECURRING' ? newAssignees : []
    const catalogPatch = {
      title,
      method,
      active: newActive,
      category: newCategory,
      timing: newTiming,
      recurrence: newRecurrence,
      recurrenceRule: newRule,
      recurStart: newRecurrence === 'RECURRING' ? newRecurStart : '',
      recurEnd: newRecurrence === 'RECURRING' ? newRecurEnd : '',
      defaultAssigneeIds: assignees,
      docRefs: newDocRefs,
    }
    if (editingId) {
      setCatalog((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...catalogPatch } : t)))
      setTasksByDate((prev) => {
        const next: Record<string, StoreTask[]> = {}
        for (const date of Object.keys(prev)) {
          next[date] = prev[date].map((t) =>
            t.catalogId === editingId
              ? {
                  ...t,
                  title,
                  method,
                  category: newCategory,
                  timing: newTiming,
                  recurrence: newRecurrence,
                  recurrenceRule: newRule,
                  docRefs: newDocRefs,
                }
              : t,
          )
        }
        return next
      })
    } else {
      seqRef.current += 1
      const id = `custom-${seqRef.current}`
      setCatalog((prev) => [...prev, { id, ...catalogPatch }])
      setEditingId(id)
    }
    showToast(isEdit ? '저장되었습니다' : '테스크가 추가되었습니다')
  }

  function renderTaskFormBody() {
    return (
      <>
        <div className={styles.formCol}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>테스크 이름</span>
            <input
              className={styles.fieldInput}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTask()
              }}
              placeholder="예: 매장 조명 켜기"
            />
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>상태</span>
            <div className={styles.segmented}>
              <button
                type="button"
                className={`${styles.segBtn} ${newActive ? styles.segBtnActive : ''}`}
                onClick={() => setNewActive(true)}
              >
                활성
              </button>
              <button
                type="button"
                className={`${styles.segBtn} ${!newActive ? styles.segBtnActive : ''}`}
                onClick={() => setNewActive(false)}
              >
                비활성
              </button>
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>카테고리</span>
            <div className={styles.catRow}>
              <SelectBox
                value={newCategory}
                onChange={setNewCategory}
                wrapClassName={styles.catSelectWrap}
                ariaLabel="카테고리 선택"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectBox>
              <button
                type="button"
                className={styles.catManageBtn}
                onClick={() => setCatManageOpen(true)}
                aria-label="카테고리 관리"
              >
                <LiaBarsSolid />
              </button>
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>수행 시점</span>
            <TimeRangeSlider
              start={newTiming.start}
              end={newTiming.end}
              onChange={(s, en) => setNewTiming({ start: s, end: en })}
            />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>주기</span>
            <div className={styles.segmented}>
              {RECURRENCE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`${styles.segBtn} ${newRecurrence === r.value ? styles.segBtnActive : ''}`}
                  onClick={() => setRecurrence(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {newRecurrence === 'ONCE' && (
              <span className={styles.fieldHint}>이 업무는 한 번만 수행합니다.</span>
            )}
          </div>
          {/* 반복 옵션 — 단건 전환 시 위로 부드럽게 접힘(grid-template-rows 트랜지션). 항상 마운트되어 값 보존 */}
          <div className={`${styles.recurWrap} ${newRecurrence === 'RECURRING' ? styles.recurWrapOpen : ''}`}>
            <div className={styles.recurWrapInner}>
              <div className={styles.recurSection}>
                <RecurrenceEditor value={newRule} onChange={setNewRule} />
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>반복 기간</span>
                  <div className={styles.recurRow}>
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={newRecurStart}
                      onChange={(e) => setNewRecurStart(e.target.value)}
                    />
                    <span className={styles.recurUnit}>~</span>
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={newRecurEnd}
                      onChange={(e) => setNewRecurEnd(e.target.value)}
                    />
                  </div>
                  <span className={styles.fieldHint}>종료일을 비우면 무기한 반복됩니다.</span>
                </div>
                <div className={styles.field}>
                  <div className={styles.dutyHead}>
                    <span className={styles.fieldLabel}>담당자</span>
                    <button
                      type="button"
                      className={styles.dutyAdd}
                      onClick={() => setDutyPickerOpen(true)}
                    >
                      <LiaPlusSolid />
                      담당자 추가하기
                    </button>
                  </div>
                  <div className={styles.dutyList}>
                    {newAssignees.length === 0 ? (
                      <span className={styles.dutyEmpty}>지정된 담당자가 없습니다</span>
                    ) : (
                      newAssignees.map((id) => {
                        const emp = empById[id]
                        if (!emp) return null
                        return (
                          <div key={id} className={styles.dutyRow}>
                            <span className={styles.dutyAvatar}>{emp.name[0]}</span>
                            <EmployeeName name={emp.name} className={styles.dutyName} />
                            <button
                              type="button"
                              className={styles.dutyRemove}
                              onClick={() => toggleAssignee(id)}
                              aria-label={`${emp.name} 제거`}
                            >
                              <LiaTimesSolid />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                  <span className={styles.fieldHint}>반복 편성 시 기본으로 배정됩니다.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.formCol}>
          <div className={`${styles.field} ${styles.fieldEditor}`}>
            <span className={styles.fieldLabel}>수행 방법</span>
            <RichTextEditor
              key={editingId ?? 'new'}
              initialHtml={methodHtmlRef.current}
              placeholder="이 업무의 수행 방법을 작성하세요. 사진도 넣을 수 있어요."
              onChange={(html) => {
                methodHtmlRef.current = html
              }}
            />
          </div>
          <div className={styles.field}>
            <div className={styles.dutyHead}>
              <span className={styles.fieldLabel}>참조 문서</span>
              <button
                type="button"
                className={styles.dutyAdd}
                onClick={openDocPicker}
              >
                <LiaPlusSolid />
                문서 추가하기
              </button>
            </div>
            <div className={styles.dutyList}>
              {newDocRefs.length === 0 ? (
                <span className={styles.dutyEmpty}>연결된 문서가 없습니다</span>
              ) : (
                newDocRefs.map((docId) => (
                  <div key={docId} className={styles.dutyRow}>
                    <span className={styles.docRefBadge}>{docCategoryName(docId)}</span>
                    <span className={styles.dutyName}>{docTitle(docId)}</span>
                    <button
                      type="button"
                      className={styles.dutyRemove}
                      onClick={() => toggleDocRef(docId)}
                      aria-label="참조 해제"
                    >
                      <LiaTimesSolid />
                    </button>
                  </div>
                ))
              )}
            </div>
            <span className={styles.fieldHint}>수행 방법 팝업에서 바로 열어볼 수 있습니다.</span>
          </div>
        </div>
      </>
    )
  }

  async function removeTask(taskId: string) {
    const t = (tasksByDate[selectedDate] ?? []).find((x) => x.id === taskId)
    const ok = await confirm({
      title: '업무를 목록에서 제거할까요?',
      message: `'${t?.title ?? ''}' 업무가 이 날짜 목록에서 제거됩니다.`,
    })
    if (!ok) return
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).filter((t) => t.id !== taskId),
    }))
    showToast('업무를 목록에서 제거했습니다')
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
          if (dragItem?.type === 'EMP') assignEmployee(task.id, dragItem.id)
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
        {hasTiming(task.timing) && (
          <span className={styles.taskTiming}>{describeTiming(task.timing)}</span>
        )}
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
              <button
                className={styles.taskMenuItem}
                onClick={() => {
                  setTimingTask(task)
                  setTimingDraft(task.timing)
                  setMenuTaskId(null)
                }}
              >
                <LiaClockSolid className={styles.taskMenuIcon} />
                수행 시간 지정
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

          {task.assigneeIds.length >= 1 && (
            <span className={styles.assigneeMore}>
              <span className={styles.assigneeCount}>
                {(() => {
                  const firstName = empById[task.assigneeIds[0]]?.name ?? '알 수 없음'
                  return task.assigneeIds.length === 1
                    ? firstName
                    : `${firstName} 외 ${task.assigneeIds.length - 1}`
                })()}
              </span>
              <span className={styles.assigneeTooltip}>
                <span className={styles.assigneeTooltipCard}>
                  {task.assigneeIds.map((empId) => {
                    const emp = empById[empId]
                    if (!emp) return null
                    return (
                      <span key={empId} className={styles.tooltipRow}>
                        <span className={styles.tooltipAvatar}>{emp.name[0]}</span>
                        <EmployeeName name={emp.name} className={styles.tooltipName} />
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
    const filtered = list.filter((t) => {
      if (!matchesSummary(t)) return false
      if (!q) return true
      return (
        t.title.toLowerCase().includes(q) ||
        t.assigneeIds.some((id) => empById[id]?.name.toLowerCase().includes(q))
      )
    })
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
              {q
                ? '검색 결과가 없습니다'
                : summaryFilter !== 'ALL'
                  ? '해당하는 업무가 없습니다'
                  : '테스크를 여기로 끌어다 놓으세요'}
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
        <div className={styles.periodNav}>
          <button className={styles.periodLabelBtn} onClick={openDatePicker}>
            {formatHeaderDate(selectedDate)}
            <LiaAngleDownSolid
              className={`${styles.periodLabelIcon} ${datePickerOpen ? styles.periodLabelIconOpen : ''}`}
            />
          </button>
          {datePickerOpen && (
            <>
              <div className={styles.pickerOverlay} onClick={() => setDatePickerOpen(false)} />
              <div className={styles.picker}>
                <div className={styles.pickerHead}>
                  <button
                    className={styles.pickerNavBtn}
                    onClick={() => {
                      const n = shiftMonth(pickerYear, pickerMonth, -1)
                      setPickerYear(n.year)
                      setPickerMonth(n.month)
                    }}
                  >
                    ‹
                  </button>
                  <span className={styles.pickerTitle}>
                    {pickerYear}년 {pickerMonth}월
                  </span>
                  <button
                    className={styles.pickerNavBtn}
                    onClick={() => {
                      const n = shiftMonth(pickerYear, pickerMonth, 1)
                      setPickerYear(n.year)
                      setPickerMonth(n.month)
                    }}
                  >
                    ›
                  </button>
                </div>
                <div className={styles.pickerDayGrid}>
                  {WD_LABELS.map((l, i) => (
                    <div
                      key={l}
                      className={`${styles.pickerDow} ${
                        i === 5 ? styles.pickerDowSat : i === 6 ? styles.pickerDowSun : ''
                      }`}
                    >
                      {l}
                    </div>
                  ))}
                  {getMonthGrid(pickerYear, pickerMonth).map((d, i) => {
                    if (!d) return <div key={`e-${i}`} />
                    const ds = formatDate(pickerYear, pickerMonth, d)
                    const isToday = ds === TODAY
                    const isSelected = ds === selectedDate
                    const dow = (new Date(pickerYear, pickerMonth - 1, d).getDay() + 6) % 7
                    return (
                      <button
                        key={d}
                        className={`${styles.pickerDay} ${isToday ? styles.pickerDayToday : ''} ${
                          isSelected ? styles.pickerDaySelected : ''
                        } ${dow === 5 ? styles.pickerDaySat : dow === 6 ? styles.pickerDaySun : ''}`}
                        onClick={() => selectDate(ds)}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <div className={styles.summary}>
        {summary.map((s) => (
          <button
            key={s.key}
            className={`${styles.summaryItem} ${summaryFilter === s.key ? styles.summaryItemActive : ''}`}
            onClick={() => setSummaryFilter(summaryFilter === s.key ? 'ALL' : s.key)}
          >
            <span className={`${styles.summaryNum} ${s.cls}`}>{s.value}</span>
            <span className={styles.summaryLabel}>{s.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* 직원 패널 (드래그 소스) */}
        <aside className={styles.empPanel}>
          <h2 className={styles.panelTitle}>
            직원
            <InfoTip text="직원을 업무로 끌어다 놓아 배정합니다" />
            <span className={styles.offDutyToggle}>
              <button
                type="button"
                className={`${styles.activeSwitch} ${hideOffDuty ? styles.activeSwitchOn : ''}`}
                onClick={() => setHideOffDuty((v) => !v)}
                aria-label="휴무자 제외"
              >
                <span className={styles.activeSwitchKnob} />
              </button>
              <span className={`${styles.infoTooltip} ${styles.infoTooltipRight}`}>
                휴무자를 목록에서 제외합니다
              </span>
            </span>
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
              <p className={styles.panelEmpty}>
                {empQ ? '검색 결과가 없습니다' : '표시할 직원이 없습니다'}
              </p>
            ) : (
              filteredEmployees.map((emp) => {
              const status = attByEmp[emp.id]
              const hidden = hideOffDuty && !status
              return (
                <div
                  key={emp.id}
                  className={`${styles.empCard} ${
                    dragItem?.type === 'EMP' && dragItem.id === emp.id ? styles.dragging : ''
                  } ${hidden ? styles.empCardHidden : ''}`}
                  draggable={!hidden}
                  aria-hidden={hidden}
                  onDragStart={() => setDragItem({ type: 'EMP', id: emp.id })}
                  onDragEnd={clearDrag}
                >
                  <span className={styles.empAvatar}>{emp.name[0]}</span>
                  <span className={styles.empInfo}>
                    <EmployeeName name={emp.name} className={styles.empName} />
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
            <span
              className={`${styles.catalogTrash} ${
                dragItem?.type === 'CATALOG' ? styles.catalogTrashReady : ''
              } ${trashDragOver ? styles.catalogTrashOver : ''}`}
              onDragOver={(e) => {
                if (dragItem?.type !== 'CATALOG') return
                e.preventDefault()
                if (!trashDragOver) setTrashDragOver(true)
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setTrashDragOver(false)
              }}
              onDrop={() => {
                if (dragItem?.type === 'CATALOG') deactivateTask(dragItem.id)
                clearDrag()
              }}
              aria-label="휴지통 — 테스크를 끌어다 놓으면 비활성화"
            >
              <LiaTrashAltSolid className={styles.catalogTrashIcon} />
              <span className={`${styles.infoTooltip} ${styles.infoTooltipRight}`}>
                휴지통 — 테스크를 끌어다 놓으면 비활성화됩니다
              </span>
            </span>
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
              query ? (
                <button
                  className={styles.catalogCreate}
                  onClick={() => createTaskFromSearch(catalogQuery)}
                >
                  <LiaPlusSolid />
                  <span>
                    ‘{catalogQuery.trim()}’ 테스크 만들기
                  </span>
                </button>
              ) : (
                <p className={styles.panelEmpty}>테스크가 없습니다</p>
              )
            ) : (
              filteredCatalog.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`${styles.catalogItem} ${
                    dragItem?.type === 'CATALOG' && dragItem.id === tpl.id ? styles.dragging : ''
                  } ${catalogMenuId === tpl.id ? styles.catalogItemActive : ''}`}
                  draggable
                  onDragStart={() => {
                    setDragItem({ type: 'CATALOG', id: tpl.id })
                    setCatalogMenuId(null)
                  }}
                  onDragEnd={clearDrag}
                  onClick={() => setCatalogMenuId((cur) => (cur === tpl.id ? null : tpl.id))}
                >
                  <LiaGripVerticalSolid className={styles.catalogGrip} />
                  <span className={styles.catalogTitle} title={tpl.title}>{tpl.title}</span>
                  {catalogMenuId === tpl.id && (
                    <div
                      className={`${styles.taskMenu} ${styles.catalogMenu}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className={styles.taskMenuItem} onClick={() => openManageFor(tpl)}>
                        <LiaCogSolid className={styles.taskMenuIcon} />
                        관리
                      </button>
                      <button
                        className={styles.taskMenuItem}
                        onClick={() => confirmDeactivate(tpl)}
                      >
                        <LiaBanSolid className={styles.taskMenuIcon} />
                        비활성화
                      </button>
                    </div>
                  )}
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
            <button className={styles.fabMenuItem} onClick={openManageNew}>
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

      {/* 카테고리 관리 팝업 */}
      {catManageOpen && (
        <CategoryManagePopup
          categories={categories}
          getCount={(c) => catalog.filter((t) => (t.category ?? 'ETC') === c.id).length}
          draftName={catDraft}
          onDraftNameChange={setCatDraft}
          draftColor={catDraftColor}
          onAdd={addCategory}
          onRename={renameCategory}
          onDelete={deleteCategory}
          onPickColor={setCatColorPickingId}
          onClose={() => setCatManageOpen(false)}
        />
      )}

      {/* 뱃지 색상 선택 팝업 (스펙트럼 + RGB) */}
      {catColorPickingId && (
        <CategoryColorPicker
          initialColor={
            catColorPickingId === 'NEW'
              ? catDraftColor
              : categories.find((c) => c.id === catColorPickingId)?.color
          }
          previewText={
            catColorPickingId === 'NEW'
              ? catDraft.trim() || '새 카테고리'
              : categoryName(catColorPickingId)
          }
          onApply={(hex) => setCategoryColor(catColorPickingId, hex)}
          onClose={() => setCatColorPickingId(null)}
        />
      )}

      {/* 담당자 선택 팝업 */}
      {dutyPickerOpen && (
        <div className={styles.dutyPopOverlay}>
          <div className={styles.dutyPopCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dutyPopHead}>
              <span className={styles.dutyPopTitle}>담당자 선택</span>
              <button
                className={styles.modalClose}
                onClick={() => setDutyPickerOpen(false)}
                aria-label="닫기"
              >
                <LiaTimesSolid />
              </button>
            </div>
            <div className={styles.dutyPopList}>
              {employees.map((emp) => {
                const on = newAssignees.includes(emp.id)
                return (
                  <button
                    key={emp.id}
                    type="button"
                    className={styles.dutyPopRow}
                    onClick={() => toggleAssignee(emp.id)}
                  >
                    <span className={styles.dutyPopAvatar}>{emp.name[0]}</span>
                    <span className={styles.dutyPopName}>{emp.name}</span>
                    {on && <LiaCheckSolid className={styles.dutyPopCheck} />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 테스크 관리 (리스트 | 상세) */}
      {manageOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.manageModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>테스크 관리</h2>
              <button className={styles.modalClose} onClick={closeManage} aria-label="닫기">
                <LiaTimesSolid />
              </button>
            </div>
            <div className={styles.manageLayout}>
              <aside className={styles.manageList}>
                <div className={styles.manageSearch}>
                  <LiaSearchSolid className={styles.manageSearchIcon} />
                  <input
                    className={styles.manageSearchInput}
                    type="text"
                    placeholder="이름·카테고리 검색"
                    value={manageSearch}
                    onChange={(e) => setManageSearch(e.target.value)}
                  />
                  {manageSearch && (
                    <button
                      className={styles.manageSearchClear}
                      onClick={() => setManageSearch('')}
                      aria-label="검색어 지우기"
                    >
                      <LiaTimesSolid />
                    </button>
                  )}
                </div>
                <div className={styles.manageListScroll}>
                  {manageQ && manageFiltered.length === 0 && (
                    <p className={styles.manageEmpty}>검색 결과가 없습니다</p>
                  )}
                  {manageFiltered.map((tpl) => {
                    const inactive = tpl.active === false
                    return (
                      <div
                        key={tpl.id}
                        className={`${styles.manageListItem} ${
                          editingId === tpl.id ? styles.manageListItemActive : ''
                        } ${inactive ? styles.manageListItemOff : ''}`}
                        onClick={() => selectTask(tpl)}
                      >
                        <span className={styles.catBadge} style={categoryBadgeStyle(categoryColor(tpl.category ?? 'ETC'))}>
                          {categoryName(tpl.category ?? 'ETC')}
                        </span>
                        <span className={styles.manageListName} title={tpl.title}>{tpl.title}</span>
                        <button
                          type="button"
                          className={`${styles.activeSwitch} ${!inactive ? styles.activeSwitchOn : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTaskActive(tpl.id)
                          }}
                          aria-label={inactive ? `${tpl.title} 활성화` : `${tpl.title} 비활성화`}
                        >
                          <span className={styles.activeSwitchKnob} />
                        </button>
                      </div>
                    )
                  })}
                  {editingId === null && (
                    <div className={`${styles.manageListItem} ${styles.manageListItemActive}`}>
                      <span className={styles.catBadge} style={categoryBadgeStyle(categoryColor(newCategory))}>{categoryName(newCategory)}</span>
                      <span className={styles.manageListName}>
                        {newTitle.trim() || '새 테스크'}
                      </span>
                    </div>
                  )}
                </div>
                <button className={styles.manageNewBtn} onClick={selectNew}>
                  <LiaPlusSolid />새 테스크
                </button>
              </aside>
              <div className={styles.manageDetail}>
                <div className={styles.modalBody}>{renderTaskFormBody()}</div>
                <div className={styles.modalFoot}>
                  {editingId && (
                    <button className={styles.btnDanger} onClick={() => deleteTask(editingId)}>
                      <LiaTrashAltSolid />
                      삭제
                    </button>
                  )}
                  <button
                    className={styles.btnCreate}
                    onClick={saveTask}
                    disabled={!newTitle.trim()}
                  >
                    {editingId ? '저장' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 수행 시간 지정 팝업 (이 날짜의 해당 업무에만 적용) */}
      {timingTask && (
        <div className={styles.dutyPopOverlay}>
          <div className={styles.dutyPopCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dutyPopHead}>
              <span className={styles.dutyPopTitle}>수행 시간 지정</span>
              <button
                className={styles.modalClose}
                onClick={() => setTimingTask(null)}
                aria-label="닫기"
              >
                <LiaTimesSolid />
              </button>
            </div>
            <div className={styles.timingPopBody}>
              <div className={styles.timingTaskName}>{timingTask.title}</div>
              <p className={styles.timingHint}>
                {formatHeaderDate(selectedDate)} 목록의 이 업무에만 적용됩니다.
              </p>
              <TimeRangeSlider
                start={timingDraft.start}
                end={timingDraft.end}
                onChange={(start, end) => setTimingDraft({ start, end })}
              />
            </div>
            <div className={styles.timingPopFoot}>
              <button className={styles.btnCreate} onClick={saveTaskTiming}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수행 방법 팝업 */}
      {methodTask && (
        <div className={styles.modalOverlay}>
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
              <div className={styles.methodTaskName}>{methodTask.title}</div>
              <div className={styles.methodMeta}>
                <span className={styles.catBadge} style={categoryBadgeStyle(categoryColor(methodTask.category))}>{categoryName(methodTask.category)}</span>
                <span>{describeTiming(methodTask.timing)}</span>
                <span>·</span>
                <span>
                  {methodTask.recurrence === 'ONCE'
                    ? '단건'
                    : describeRecurrence(methodTask.recurrenceRule)}
                </span>
              </div>
              {hasMethodContent(methodTask.method) ? (
                <div
                  className={styles.methodContent}
                  dangerouslySetInnerHTML={{ __html: methodTask.method }}
                />
              ) : (
                <p className={styles.methodEmpty}>등록된 수행 방법이 없습니다</p>
              )}
              {methodTask.docRefs.length > 0 && (
                <div className={styles.methodDocs}>
                  <span className={styles.methodDocsTitle}>참조 문서</span>
                  {methodTask.docRefs.map((docId) => (
                    <button
                      key={docId}
                      type="button"
                      className={styles.methodDocRow}
                      onClick={() => setViewDocId(docId)}
                    >
                      <span className={styles.docRefBadge}>{docCategoryName(docId)}</span>
                      <span className={styles.methodDocName}>{docTitle(docId)}</span>
                      <LiaBookSolid className={styles.methodDocIcon} />
                    </button>
                  ))}
                </div>
              )}
              {methodTask.requestRef && (() => {
                const refReq = mockRequests.find((r) => r.id === methodTask.requestRef)
                return (
                  <div className={styles.methodDocs}>
                    <span className={styles.methodDocsTitle}>참조 요청</span>
                    <button
                      type="button"
                      className={styles.methodDocRow}
                      onClick={() => setViewRequestId(methodTask.requestRef!)}
                    >
                      <span className={styles.docRefBadge}>{refReq?.type ?? '요청'}</span>
                      <span className={styles.methodDocName}>
                        {refReq ? refReq.content : '원본 요청 열기'}
                      </span>
                      <LiaInboxSolid className={styles.methodDocIcon} />
                    </button>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 참조 문서 선택 팝업 (좌: 목록 / 우: 뷰어) */}
      {docPickerOpen && (() => {
        const q = docPickerQuery.trim().toLowerCase()
        const filteredDocs = q
          ? DOCUMENT_CATALOG.filter(
              (d) =>
                d.title.toLowerCase().includes(q) ||
                docCategoryName(d.id).toLowerCase().includes(q),
            )
          : DOCUMENT_CATALOG
        const previewDoc = DOCUMENT_CATALOG.find((d) => d.id === docPreviewId)
        return (
          <div className={styles.dutyPopOverlay}>
            <div className={styles.docPickerCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.dutyPopHead}>
                <span className={styles.dutyPopTitle}>참조 문서 선택</span>
                <button className={styles.modalClose} onClick={closeDocPicker} aria-label="닫기">
                  <LiaTimesSolid />
                </button>
              </div>
              <div className={styles.docPickerBody}>
                {/* 좌: 목록 */}
                <div className={styles.docPickerListPane}>
                  <div className={styles.manageSearch}>
                    <LiaSearchSolid className={styles.manageSearchIcon} />
                    <input
                      className={styles.manageSearchInput}
                      type="text"
                      placeholder="이름·카테고리 검색"
                      value={docPickerQuery}
                      onChange={(e) => setDocPickerQuery(e.target.value)}
                    />
                    {docPickerQuery && (
                      <button
                        className={styles.manageSearchClear}
                        onClick={() => setDocPickerQuery('')}
                        aria-label="검색어 지우기"
                      >
                        <LiaTimesSolid />
                      </button>
                    )}
                  </div>
                  <div className={styles.docPickerList}>
                    {filteredDocs.length === 0 ? (
                      <p className={styles.manageEmpty}>검색 결과가 없습니다</p>
                    ) : (
                      filteredDocs.map((d) => {
                        const on = docDraftRefs.includes(d.id)
                        const active = docPreviewId === d.id
                        return (
                          <div
                            key={d.id}
                            className={`${styles.docPickerRow} ${active ? styles.docPickerRowActive : ''}`}
                          >
                            <button
                              type="button"
                              className={`${styles.docPickerCheck} ${on ? styles.docPickerCheckOn : ''}`}
                              onClick={() => toggleDocDraft(d.id)}
                              aria-label={on ? `${d.title} 선택 해제` : `${d.title} 선택`}
                            >
                              {on && <LiaCheckSolid />}
                            </button>
                            <button
                              type="button"
                              className={styles.docPickerRowMain}
                              onClick={() => setDocPreviewId(d.id)}
                            >
                              <span className={styles.docRefBadge}>{docCategoryName(d.id)}</span>
                              <span className={styles.docPickerRowName} title={d.title}>
                                {d.title}
                              </span>
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
                {/* 우: 뷰어 */}
                <div className={styles.docPickerViewer}>
                  {previewDoc ? (
                    <article>
                      <div className={styles.docPickerViewerHead}>
                        <span
                          className={styles.catBadge}
                          style={categoryBadgeStyle(docCategoryColor(previewDoc.id))}
                        >
                          {docCategoryName(previewDoc.id)}
                        </span>
                        <h3 className={styles.docPickerViewerTitle}>{previewDoc.title}</h3>
                        <p className={styles.docPickerViewerMeta}>
                          <EmployeeName name={previewDoc.authorName} />
                          <span>
                            작성 {previewDoc.createdAt}
                            {previewDoc.updatedAt !== previewDoc.createdAt &&
                              ` · 수정 ${previewDoc.updatedAt}`}
                          </span>
                        </p>
                      </div>
                      <div
                        className={styles.docPickerViewerContent}
                        dangerouslySetInnerHTML={{ __html: previewDoc.content }}
                      />
                    </article>
                  ) : (
                    <div className={styles.docPickerViewerEmpty}>
                      <LiaBookSolid />
                      <p>왼쪽에서 문서를 선택하면 내용을 볼 수 있습니다</p>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.docPickerFoot}>
                <span className={styles.docPickerFootCount}>{docDraftRefs.length}건 선택됨</span>
                <div className={styles.docPickerFootBtns}>
                  <button type="button" className={styles.btnCancel} onClick={closeDocPicker}>
                    취소
                  </button>
                  <button type="button" className={styles.btnCreate} onClick={applyDocPicker}>
                    추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 참조 문서 보기 (문서함 상세와 동일) */}
      {viewDocId && (
        <Modal title="문서" size="wide" flush onClose={() => setViewDocId(null)}>
          <DocumentDetailView id={viewDocId} mode="modal" onDeleted={() => setViewDocId(null)} />
        </Modal>
      )}

      {/* 참조 요청 보기 (요청함 상세와 동일) */}
      {viewRequestId && (
        <Modal title="요청 상세" size="wide" flush onClose={() => setViewRequestId(null)}>
          <RequestDetailView id={viewRequestId} mode="modal" onDeleted={() => setViewRequestId(null)} />
        </Modal>
      )}
    </div>
  )
}
