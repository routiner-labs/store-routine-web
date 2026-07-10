'use client'

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { LiaAngleDownSolid, LiaCheckSolid } from 'react-icons/lia'
import { useEscClose } from '@/lib/useEscClose'
import styles from './SelectBox.module.css'

interface SelectOption {
  value: string
  label: ReactNode
}

/**
 * 표준 셀렉트 박스.
 * 트리거(닫힌 모습)는 네이티브 select와 동일한 룩이고, 열었을 때 나오는 목록은
 * 네이티브 대신 둥근 커스텀 드롭다운(포털 + fixed)으로 렌더한다.
 * 기존 호출부 호환을 위해 `<option value>라벨</option>` children을 그대로 받아 내부에서 파싱한다.
 * 크기(폭)는 페이지가 wrapClassName으로 정한다 — design-agent.md "셀렉트 박스(SelectBox)" 참고.
 */
export default function SelectBox({
  value,
  onChange,
  children,
  wrapClassName,
  ariaLabel,
}: {
  value: string | number
  onChange: (value: string) => void
  children: ReactNode
  wrapClassName?: string
  ariaLabel?: string
}) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null)

  const options: SelectOption[] = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const props = (child as ReactElement<{ value?: string | number; children?: ReactNode }>).props
      return { value: String(props.value ?? ''), label: props.children }
    })
  const current = String(value)
  const selected = options.find((o) => o.value === current)

  function openMenu() {
    const r = triggerRef.current?.getBoundingClientRect()
    if (r) {
      const top = r.bottom + 4
      setPos({ left: r.left, top, width: r.width, maxHeight: Math.max(160, window.innerHeight - top - 8) })
    }
    setOpen(true)
  }
  const close = () => setOpen(false)

  // ESC로 닫힘(최상위 팝업만) — 모달 안에서 열려도 ESC는 드롭다운만 닫는다
  useEscClose(open, close)

  // 바깥 클릭 / 스크롤 / 리사이즈 시 닫힘
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      close()
    }
    function onReposition() {
      close()
    }
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
  }, [open])

  return (
    <div className={`${styles.wrap} ${wrapClassName ?? ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => (open ? close() : openMenu())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className={styles.triggerLabel}>{selected?.label ?? ''}</span>
        <LiaAngleDownSolid className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`} />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            className={styles.menu}
            role="listbox"
            style={{ left: pos.left, top: pos.top, width: pos.width, maxHeight: pos.maxHeight }}
          >
            {options.map((o) => {
              const on = o.value === current
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={on}
                  className={`${styles.option} ${on ? styles.optionSelected : ''}`}
                  onClick={() => {
                    onChange(o.value)
                    close()
                  }}
                >
                  <span className={styles.optionLabel}>{o.label}</span>
                  {on && <LiaCheckSolid className={styles.optionCheck} />}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </div>
  )
}
