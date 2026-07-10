'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LiaAngleDownSolid, LiaAngleLeftSolid, LiaAngleRightSolid, LiaTimesSolid } from 'react-icons/lia'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import styles from './DateRangeFilter.module.css'

const DIAL_ITEM_HEIGHT = 36
const DIAL_VISIBLE_ROWS = 5
const DIAL_PAD = ((DIAL_VISIBLE_ROWS - 1) / 2) * DIAL_ITEM_HEIGHT

// 위아래로 쓸어서(스크롤) 고르는 다이얼. 네이티브 스크롤 스냅으로 물리감을 주고,
// scrollend에서 가운데 온 값을 읽어 선택값으로 반영한다. (MonthRangeFilter에서도 재사용)
export function DialColumn({
  values,
  selected,
  onSelect,
  formatLabel,
}: {
  values: number[]
  selected: number
  onSelect: (v: number) => void
  formatLabel?: (v: number) => string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; startScrollTop: number; moved: boolean } | null>(null)
  const justDraggedRef = useRef(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.max(0, values.indexOf(selected))
    el.scrollTop = idx * DIAL_ITEM_HEIGHT
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScrollEnd() {
      const idx = Math.round(el!.scrollTop / DIAL_ITEM_HEIGHT)
      const clamped = Math.min(values.length - 1, Math.max(0, idx))
      const value = values[clamped]
      if (value !== undefined && value !== selected) onSelect(value)
    }
    el.addEventListener('scrollend', onScrollEnd)
    return () => el.removeEventListener('scrollend', onScrollEnd)
  }, [values, selected, onSelect])

  function scrollToValue(v: number) {
    const el = scrollRef.current
    if (!el) return
    const idx = values.indexOf(v)
    if (idx === -1) return
    el.scrollTo({ top: idx * DIAL_ITEM_HEIGHT, behavior: 'smooth' })
  }

  // PC에서는 스크롤/트랙패드 외에 마우스로 꾹 눌러 위아래로 끄는 것도 지원한다.
  // 터치는 브라우저 기본 스크롤에 맡기고(pointerType이 mouse일 때만 동작) 겹치지 않게 한다.
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return
    const el = scrollRef.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
    dragRef.current = { startY: e.clientY, startScrollTop: el.scrollTop, moved: false }
    setDragging(true)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current
    const drag = dragRef.current
    if (!el || !drag) return
    const delta = e.clientY - drag.startY
    if (Math.abs(delta) > 3) drag.moved = true
    el.scrollTop = drag.startScrollTop - delta
  }

  function handlePointerUp() {
    const el = scrollRef.current
    const drag = dragRef.current
    dragRef.current = null
    setDragging(false)
    if (!el || !drag) return
    justDraggedRef.current = drag.moved
    if (drag.moved) {
      const idx = Math.round(el.scrollTop / DIAL_ITEM_HEIGHT)
      const clamped = Math.min(values.length - 1, Math.max(0, idx))
      el.scrollTo({ top: clamped * DIAL_ITEM_HEIGHT, behavior: 'smooth' })
    }
  }

  function handleItemClick(v: number) {
    if (justDraggedRef.current) {
      justDraggedRef.current = false
      return
    }
    scrollToValue(v)
  }

  return (
    <div className={styles.dialCol}>
      <div className={styles.dialHighlight} />
      <div
        className={`${styles.dialScroll} ${dragging ? styles.dialScrollDragging : ''}`}
        ref={scrollRef}
        style={{ height: DIAL_VISIBLE_ROWS * DIAL_ITEM_HEIGHT }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div style={{ height: DIAL_PAD }} />
        {values.map((v) => (
          <button
            type="button"
            key={v}
            className={`${styles.dialItem} ${v === selected ? styles.dialItemActive : ''}`}
            style={{ height: DIAL_ITEM_HEIGHT }}
            onClick={() => handleItemClick(v)}
          >
            {formatLabel ? formatLabel(v) : v}
          </button>
        ))}
        <div style={{ height: DIAL_PAD }} />
      </div>
    </div>
  )
}

const WD_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`
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

export default function DateRangeFilter({
  title,
  placeholder,
  startDate,
  endDate,
  onApply,
  className,
}: {
  title: string
  placeholder: string
  startDate: string
  endDate: string
  onApply: (start: string, end: string) => void
  className?: string
}) {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(startDate)
  const [draftEnd, setDraftEnd] = useState(endDate)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1)
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)

  useScrollLock(open)
  // 달력/연월 다이얼 — 뷰어형. 다이얼(위)이 열려 있으면 ESC로 다이얼만 닫힌다.
  usePopupEsc(open, 'viewer', () => setOpen(false))
  usePopupEsc(monthPickerOpen, 'viewer', () => setMonthPickerOpen(false))

  function openPopup() {
    setDraftStart(startDate)
    setDraftEnd(endDate)
    const base = startDate || endDate
    if (base) {
      const [y, m] = base.split('-').map(Number)
      setViewYear(y)
      setViewMonth(m)
    } else {
      setViewYear(today.getFullYear())
      setViewMonth(today.getMonth() + 1)
    }
    setMonthPickerOpen(false)
    setOpen(true)
  }

  function handleDayClick(ds: string) {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(ds)
      setDraftEnd('')
    } else if (ds < draftStart) {
      setDraftStart(ds)
      setDraftEnd('')
    } else {
      setDraftEnd(ds)
    }
  }

  function apply() {
    onApply(draftStart, draftEnd)
    setOpen(false)
  }

  function reset() {
    setDraftStart('')
    setDraftEnd('')
  }

  const hasValue = Boolean(startDate || endDate)
  const triggerLabel = hasValue ? `${startDate || '...'} ~ ${endDate || '...'}` : placeholder
  const isRange = Boolean(draftStart && draftEnd && draftStart !== draftEnd)
  const grid = getMonthGrid(viewYear, viewMonth)
  const yearValues = Array.from({ length: 61 }, (_, i) => today.getFullYear() - 50 + i)
  const monthValues = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className={`${styles.wrap} ${className ?? ''}`}>
      <button type="button" className={styles.trigger} onClick={openPopup}>
        <span className={styles.triggerLabel}>{triggerLabel}</span>
        <LiaAngleDownSolid className={styles.triggerChevron} />
      </button>
      {hasValue && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={(e) => { e.stopPropagation(); onApply('', '') }}
          aria-label={`${title} 선택 해제`}
        >
          <LiaTimesSolid />
        </button>
      )}

      {open && createPortal(
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHead}>
              <span className={styles.popupTitle}>{title} 선택</span>
              <button className={styles.popupClose} onClick={() => setOpen(false)} aria-label="닫기">
                <LiaTimesSolid />
              </button>
            </div>

            <div className={styles.calHead}>
              <button
                type="button"
                className={`${styles.calNavBtn} ${monthPickerOpen ? styles.calNavBtnHidden : ''}`}
                onClick={() => {
                  const n = shiftMonth(viewYear, viewMonth, -1)
                  setViewYear(n.year)
                  setViewMonth(n.month)
                }}
                disabled={monthPickerOpen}
                aria-hidden={monthPickerOpen}
                tabIndex={monthPickerOpen ? -1 : 0}
                aria-label="이전 달"
              >
                <LiaAngleLeftSolid />
              </button>
              <button
                type="button"
                className={styles.calTitleBtn}
                onClick={() => setMonthPickerOpen((v) => !v)}
              >
                <span className={styles.calTitle}>{viewYear}년 {viewMonth}월</span>
                <LiaAngleDownSolid className={`${styles.calTitleChevron} ${monthPickerOpen ? styles.calTitleChevronOpen : ''}`} />
              </button>
              <button
                type="button"
                className={`${styles.calNavBtn} ${monthPickerOpen ? styles.calNavBtnHidden : ''}`}
                onClick={() => {
                  const n = shiftMonth(viewYear, viewMonth, 1)
                  setViewYear(n.year)
                  setViewMonth(n.month)
                }}
                disabled={monthPickerOpen}
                aria-hidden={monthPickerOpen}
                tabIndex={monthPickerOpen ? -1 : 0}
                aria-label="다음 달"
              >
                <LiaAngleRightSolid />
              </button>
            </div>

            {monthPickerOpen ? (
              <div key="dial" className={styles.calViewSwitch}>
                <div className={styles.dialRow}>
                  <DialColumn
                    values={yearValues}
                    selected={viewYear}
                    onSelect={setViewYear}
                    formatLabel={(y) => `${y}년`}
                  />
                  <DialColumn
                    values={monthValues}
                    selected={viewMonth}
                    onSelect={setViewMonth}
                    formatLabel={(m) => `${m}월`}
                  />
                </div>
                <button
                  type="button"
                  className={styles.dialConfirmBtn}
                  onClick={() => setMonthPickerOpen(false)}
                >
                  선택
                </button>
              </div>
            ) : (
              <div key="days" className={styles.calViewSwitch}>
                <div className={styles.calDowRow}>
                  {WD_LABELS.map((l, i) => (
                    <span
                      key={l}
                      className={`${styles.calDow} ${i === 5 ? styles.calDowSat : i === 6 ? styles.calDowSun : ''}`}
                    >
                      {l}
                    </span>
                  ))}
                </div>

                <div className={styles.calGrid}>
                  {grid.map((d, i) => {
                    if (!d) return <div key={`e-${i}`} />
                    const ds = formatDate(viewYear, viewMonth, d)
                    const isStart = ds === draftStart
                    const isEnd = ds === draftEnd
                    const inRange = isRange && ds > draftStart && ds < draftEnd
                    const dow = (new Date(viewYear, viewMonth - 1, d).getDay() + 6) % 7
                    return (
                      <div
                        key={d}
                        className={`${styles.calCell} ${inRange ? styles.calCellInRange : ''} ${isRange && isStart ? styles.calCellRangeStart : ''} ${isRange && isEnd ? styles.calCellRangeEnd : ''}`}
                      >
                        <button
                          type="button"
                          className={`${styles.calDay} ${isStart || isEnd ? styles.calDaySelected : ''} ${dow === 5 ? styles.calDaySat : dow === 6 ? styles.calDaySun : ''}`}
                          onClick={() => handleDayClick(ds)}
                        >
                          {d}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className={styles.popupFoot}>
              <span className={styles.calRangeHint}>
                {draftStart && draftEnd
                  ? `${draftStart} ~ ${draftEnd}`
                  : draftStart
                    ? '종료일을 선택하세요'
                    : '시작일을 선택하세요'}
              </span>
              <div className={styles.popupFootBtns}>
                <button type="button" className={styles.resetBtn} onClick={reset}>
                  초기화
                </button>
                <button type="button" className={styles.applyBtn} onClick={apply}>
                  적용
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
