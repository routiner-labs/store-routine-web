'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { LiaAngleDownSolid, LiaSearchSolid, LiaTimesSolid } from 'react-icons/lia'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import { useHoverTooltip } from '@/lib/useHoverTooltip'
import styles from './MultiSelectFilter.module.css'

export interface MultiSelectOption {
  id: string
  label: string
  sublabel?: string
}

export default function MultiSelectFilter({
  title,
  placeholder = '',
  searchPlaceholder = '검색',
  options,
  selectedIds,
  onApply,
  className,
  renderTrigger,
}: {
  title: string
  placeholder?: string
  searchPlaceholder?: string
  options: MultiSelectOption[]
  selectedIds: string[]
  onApply: (ids: string[]) => void
  className?: string
  /** 기본 트리거(버튼+X) 대신 쓸 커스텀 트리거. 팝업을 여는 open()만 넘겨준다. */
  renderTrigger?: (props: { open: () => void; selectedCount: number }) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string[]>(selectedIds)
  const [query, setQuery] = useState('')
  const { anchorRef, rect, anchorHandlers, tooltipHandlers } = useHoverTooltip()

  useScrollLock(open)
  // 필터 팝업 — 뷰어형(ESC 바로 닫힘, 최상위일 때만)
  usePopupEsc(open, 'viewer', () => setOpen(false))

  function openPopup() {
    setDraft(selectedIds)
    setQuery('')
    setOpen(true)
  }

  function toggle(id: string) {
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function apply() {
    onApply(draft)
    setOpen(false)
  }

  const q = query.trim().toLowerCase()
  const filteredOptions = q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q))
    : options

  const buttonLabel = selectedIds.length === 0 ? placeholder : `${title} ${selectedIds.length}개 선택됨`

  return (
    <div className={renderTrigger ? undefined : `${styles.wrap} ${className ?? ''}`}>
      {renderTrigger ? (
        renderTrigger({ open: openPopup, selectedCount: selectedIds.length })
      ) : (
        <>
          <div className={styles.triggerHoverArea} ref={anchorRef} {...anchorHandlers}>
            <button type="button" className={styles.trigger} onClick={openPopup}>
              <span className={styles.triggerLabel}>{buttonLabel}</span>
              <LiaAngleDownSolid className={styles.triggerChevron} />
            </button>
          </div>
          {selectedIds.length > 0 && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={(e) => { e.stopPropagation(); onApply([]) }}
              aria-label={`${title} 선택 해제`}
            >
              <LiaTimesSolid />
            </button>
          )}
        </>
      )}

      {rect && selectedIds.length > 0 && createPortal(
        <div
          className={styles.filterTooltip}
          style={{ top: rect.top, left: rect.left, width: rect.width }}
          {...tooltipHandlers}
        >
          <div className={styles.filterTooltipCard}>
            {selectedIds.map((id) => {
              const opt = options.find((o) => o.id === id)
              if (!opt) return null
              return (
                <span key={id} className={styles.tooltipRow}>
                  <span className={styles.tooltipAvatar}>{opt.label[0]}</span>
                  <span className={styles.tooltipName}>{opt.label}</span>
                  <button
                    type="button"
                    className={styles.tooltipRemove}
                    onClick={(e) => { e.stopPropagation(); onApply(selectedIds.filter((x) => x !== id)) }}
                    aria-label={`${opt.label} 제거`}
                  >
                    <LiaTimesSolid />
                  </button>
                </span>
              )
            })}
          </div>
        </div>,
        document.body
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
            <div className={styles.popupSearch}>
              <LiaSearchSolid className={styles.popupSearchIcon} />
              <input
                className={styles.popupSearchInput}
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.optionList}>
              {filteredOptions.length === 0 ? (
                <p className={styles.optionEmpty}>검색 결과가 없습니다.</p>
              ) : (
                filteredOptions.map((o) => (
                  <label key={o.id} className={styles.optionRow}>
                    <input
                      type="checkbox"
                      className={styles.optionCheckbox}
                      checked={draft.includes(o.id)}
                      onChange={() => toggle(o.id)}
                    />
                    <span className={styles.optionLabel}>{o.label}</span>
                    {o.sublabel && <span className={styles.optionSublabel}>{o.sublabel}</span>}
                  </label>
                ))
              )}
            </div>
            <div className={styles.popupFoot}>
              <button type="button" className={styles.resetBtn} onClick={() => setDraft([])}>
                전체 해제
              </button>
              <button type="button" className={styles.applyBtn} onClick={apply}>
                적용{draft.length > 0 ? ` (${draft.length})` : ''}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
