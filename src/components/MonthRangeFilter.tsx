'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  LiaAngleDownSolid,
  LiaAngleLeftSolid,
  LiaAngleRightSolid,
  LiaTimesSolid,
} from 'react-icons/lia'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import { DialColumn } from './DateRangeFilter'
import drf from './DateRangeFilter.module.css'
import styles from './MonthRangeFilter.module.css'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function monthKey(year: number, month: number) {
  return `${year}-${pad(month)}`
}

function formatMonthLabel(key: string) {
  const [y, m] = key.split('-').map(Number)
  return `${y}년 ${m}월`
}

// 연/월 선택 피커 — DateRangeFilter와 동일한 상호작용(달력 하나에서 클릭 두 번으로 범위,
// 연도는 스크롤 다이얼)을 월 단위로 제공한다. 한 달만 선택하고 적용하면 단일 월 조회.
export default function MonthRangeFilter({
  title,
  placeholder,
  startMonth,
  endMonth,
  onApply,
  className,
}: {
  title: string
  placeholder: string
  startMonth: string // 'YYYY-MM', 없으면 ''
  endMonth: string
  onApply: (start: string, end: string) => void
  className?: string
}) {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(startMonth)
  const [draftEnd, setDraftEnd] = useState(endMonth)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [yearDialOpen, setYearDialOpen] = useState(false)

  useScrollLock(open)
  // 월 범위 필터 — 뷰어형(ESC 바로 닫힘)
  usePopupEsc(open, 'viewer', () => setOpen(false))

  function openPopup() {
    setDraftStart(startMonth)
    setDraftEnd(endMonth)
    const base = startMonth || endMonth
    setViewYear(base ? Number(base.split('-')[0]) : today.getFullYear())
    setYearDialOpen(false)
    setOpen(true)
  }

  function handleMonthClick(key: string) {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(key)
      setDraftEnd('')
    } else if (key < draftStart) {
      setDraftStart(key)
      setDraftEnd('')
    } else {
      setDraftEnd(key)
    }
  }

  function apply() {
    onApply(draftStart, draftStart ? draftEnd || draftStart : '')
    setOpen(false)
  }

  function reset() {
    setDraftStart('')
    setDraftEnd('')
  }

  const hasValue = Boolean(startMonth)
  const triggerLabel = !hasValue
    ? placeholder
    : endMonth && endMonth !== startMonth
      ? `${formatMonthLabel(startMonth)} ~ ${formatMonthLabel(endMonth)}`
      : formatMonthLabel(startMonth)
  const isRange = Boolean(draftStart && draftEnd && draftStart !== draftEnd)
  const yearValues = Array.from({ length: 61 }, (_, i) => today.getFullYear() - 50 + i)
  const monthValues = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className={`${drf.wrap} ${className ?? ''}`}>
      <button type="button" className={drf.trigger} onClick={openPopup}>
        <span className={drf.triggerLabel}>{triggerLabel}</span>
        <LiaAngleDownSolid className={drf.triggerChevron} />
      </button>
      {hasValue && (
        <button
          type="button"
          className={drf.clearBtn}
          onClick={(e) => {
            e.stopPropagation()
            onApply('', '')
          }}
          aria-label={`${title} 선택 해제`}
        >
          <LiaTimesSolid />
        </button>
      )}

      {open &&
        createPortal(
          <div className={drf.popupOverlay}>
            <div className={drf.popupCard} onClick={(e) => e.stopPropagation()}>
              <div className={drf.popupHead}>
                <span className={drf.popupTitle}>{title} 선택</span>
                <button className={drf.popupClose} onClick={() => setOpen(false)} aria-label="닫기">
                  <LiaTimesSolid />
                </button>
              </div>

              <div className={drf.calHead}>
                <button
                  type="button"
                  className={`${drf.calNavBtn} ${yearDialOpen ? drf.calNavBtnHidden : ''}`}
                  onClick={() => setViewYear((y) => y - 1)}
                  disabled={yearDialOpen}
                  aria-hidden={yearDialOpen}
                  tabIndex={yearDialOpen ? -1 : 0}
                  aria-label="이전 연도"
                >
                  <LiaAngleLeftSolid />
                </button>
                <button
                  type="button"
                  className={drf.calTitleBtn}
                  onClick={() => setYearDialOpen((v) => !v)}
                >
                  <span className={drf.calTitle}>{viewYear}년</span>
                  <LiaAngleDownSolid
                    className={`${drf.calTitleChevron} ${yearDialOpen ? drf.calTitleChevronOpen : ''}`}
                  />
                </button>
                <button
                  type="button"
                  className={`${drf.calNavBtn} ${yearDialOpen ? drf.calNavBtnHidden : ''}`}
                  onClick={() => setViewYear((y) => y + 1)}
                  disabled={yearDialOpen}
                  aria-hidden={yearDialOpen}
                  tabIndex={yearDialOpen ? -1 : 0}
                  aria-label="다음 연도"
                >
                  <LiaAngleRightSolid />
                </button>
              </div>

              {yearDialOpen ? (
                <div key="dial" className={drf.calViewSwitch}>
                  <div className={drf.dialRow}>
                    <DialColumn
                      values={yearValues}
                      selected={viewYear}
                      onSelect={setViewYear}
                      formatLabel={(y) => `${y}년`}
                    />
                  </div>
                  <button
                    type="button"
                    className={drf.dialConfirmBtn}
                    onClick={() => setYearDialOpen(false)}
                  >
                    선택
                  </button>
                </div>
              ) : (
                <div key="months" className={drf.calViewSwitch}>
                  <div className={styles.monthGrid}>
                    {monthValues.map((m) => {
                      const key = monthKey(viewYear, m)
                      const isStart = key === draftStart
                      const isEnd = key === draftEnd
                      const inRange = isRange && key > draftStart && key < draftEnd
                      return (
                        <div
                          key={m}
                          className={`${styles.monthCell} ${inRange ? styles.inRange : ''} ${isRange && isStart ? styles.rangeStart : ''} ${isRange && isEnd ? styles.rangeEnd : ''}`}
                        >
                          <button
                            type="button"
                            className={`${styles.monthBtn} ${isStart || isEnd ? styles.selected : ''}`}
                            onClick={() => handleMonthClick(key)}
                          >
                            {m}월
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className={drf.popupFoot}>
                <span className={drf.calRangeHint}>
                  {draftStart && draftEnd
                    ? `${formatMonthLabel(draftStart)} ~ ${formatMonthLabel(draftEnd)}`
                    : draftStart
                      ? `${formatMonthLabel(draftStart)} · 종료 월을 선택하거나 그대로 적용`
                      : '월을 선택하세요'}
                </span>
                <div className={drf.popupFootBtns}>
                  <button type="button" className={drf.resetBtn} onClick={reset}>
                    초기화
                  </button>
                  <button type="button" className={drf.applyBtn} onClick={apply}>
                    적용
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
