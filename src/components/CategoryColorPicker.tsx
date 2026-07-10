'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LiaTimesSolid } from 'react-icons/lia'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import { hexToRgb, rgbToHex, categoryBadgeStyle } from '@/lib/categoryColors'
import styles from './CategoryColorPicker.module.css'

interface Hsv {
  h: number // 0-360
  s: number // 0-100
  v: number // 0-100
}

function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6)
    else if (max === gn) h = 60 * ((bn - rn) / d + 2)
    else h = 60 * ((rn - gn) / d + 4)
  }
  if (h < 0) h += 360
  const s = max === 0 ? 0 : (d / max) * 100
  return { h, s, v: max * 100 }
}

function hsvToRgb({ h, s, v }: Hsv): { r: number; g: number; b: number } {
  const sn = s / 100
  const vn = v / 100
  const c = vn * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vn - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

const CHANNELS = [
  { key: 'r', label: 'R' },
  { key: 'g', label: 'G' },
  { key: 'b', label: 'B' },
] as const

// 카테고리 뱃지 색상 선택 팝업.
// 좌측: 색상 스펙트럼(채도·명도 사각형) + 색상(Hue) 바, 우측: RGB 상세값 입력.
// 카테고리 관리 팝업의 페인트붓 버튼에서 연다.
export default function CategoryColorPicker({
  initialColor,
  previewText,
  onApply,
  onClose,
}: {
  initialColor?: string
  previewText: string
  onApply: (hex: string) => void
  onClose: () => void
}) {
  const [hsv, setHsv] = useState<Hsv>(() => {
    const { r, g, b } = hexToRgb(initialColor ?? '#6B7280')
    return rgbToHsv(r, g, b)
  })
  const svRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)

  useScrollLock(true)
  // 색상 선택 팝업 — 뷰어형(ESC 바로 닫힘)
  usePopupEsc(true, 'viewer', onClose)

  const rgb = hsvToRgb(hsv)
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b)

  function setChannel(key: 'r' | 'g' | 'b', value: number) {
    const next = { ...rgb, [key]: clamp(value, 0, 255) }
    setHsv(rgbToHsv(next.r, next.g, next.b))
  }

  // 스펙트럼/휴 바 공통 드래그 처리 — pointerdown 후 window에서 move/up을 받는다 (TimeRangeSlider 패턴)
  function beginDrag(
    e: React.PointerEvent,
    apply: (clientX: number, clientY: number) => void,
  ) {
    e.preventDefault()
    apply(e.clientX, e.clientY)
    const onMove = (ev: PointerEvent) => apply(ev.clientX, ev.clientY)
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function applySv(clientX: number, clientY: number) {
    const rect = svRef.current?.getBoundingClientRect()
    if (!rect) return
    const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100)
    const v = clamp((1 - (clientY - rect.top) / rect.height) * 100, 0, 100)
    setHsv((prev) => ({ ...prev, s, v }))
  }

  function applyHue(clientX: number, clientY: number) {
    void clientX
    const rect = hueRef.current?.getBoundingClientRect()
    if (!rect) return
    const h = clamp(((clientY - rect.top) / rect.height) * 360, 0, 359.9)
    setHsv((prev) => ({ ...prev, h }))
  }

  const hueColor = `hsl(${hsv.h}, 100%, 50%)`

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.title}>뱃지 색상</span>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <LiaTimesSolid />
          </button>
        </div>

        <div className={styles.previewWrap}>
          <span className={styles.previewBadge} style={categoryBadgeStyle(hex)}>
            {previewText || '카테고리'}
          </span>
          <span className={styles.hexLabel}>{hex}</span>
        </div>

        <div className={styles.pickerBody}>
          <div
            className={styles.svBox}
            ref={svRef}
            style={{
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`,
            }}
            onPointerDown={(e) => beginDrag(e, applySv)}
          >
            <div
              className={styles.svHandle}
              style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
            />
          </div>
          <div
            className={styles.hueBar}
            ref={hueRef}
            onPointerDown={(e) => beginDrag(e, applyHue)}
          >
            <div className={styles.hueHandle} style={{ top: `${(hsv.h / 360) * 100}%` }} />
          </div>

          <div className={styles.channels}>
            {CHANNELS.map((ch) => (
              <label key={ch.key} className={styles.channelRow}>
                <span className={styles.channelLabel}>{ch.label}</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={Math.round(rgb[ch.key])}
                  onChange={(e) => setChannel(ch.key, Number(e.target.value) || 0)}
                  className={styles.channelInput}
                />
              </label>
            ))}
          </div>
        </div>

        <div className={styles.foot}>
          <button
            type="button"
            className={styles.applyBtn}
            onClick={() => { onApply(hex); onClose() }}
          >
            적용
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
