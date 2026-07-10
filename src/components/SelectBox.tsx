'use client'

import { LiaAngleDownSolid } from 'react-icons/lia'
import styles from './SelectBox.module.css'

/**
 * 표준 셀렉트 박스.
 * 네이티브 화살표 대신 커스텀 화살표(LiaAngleDownSolid)를 박스 안쪽(right 14px)에 배치한다.
 * 크기(폭)는 페이지가 wrapClassName으로 결정하고, 디자인은 전 페이지 공통 — design-agent.md "셀렉트 박스" 참고.
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
  children: React.ReactNode
  /** 폭 제어용 — flex:1, width:100% 등 페이지 사정에 맞게 */
  wrapClassName?: string
  ariaLabel?: string
}) {
  return (
    <span className={`${styles.wrap} ${wrapClassName ?? ''}`}>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      >
        {children}
      </select>
      <LiaAngleDownSolid className={styles.arrow} />
    </span>
  )
}
