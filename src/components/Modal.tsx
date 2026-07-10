'use client'

import { LiaTimesSolid } from 'react-icons/lia'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import styles from './Modal.module.css'

export default function Modal({
  title,
  onClose,
  size = 'default',
  flush = false,
  dismiss = 'viewer',
  children,
}: {
  title: string
  onClose: () => void
  size?: 'default' | 'wide' | 'small'
  flush?: boolean
  // viewer: ESC로 바로 닫힘 / guard: 수정·생성 팝업이라 ESC 시 컨펌 후 닫힘
  dismiss?: 'viewer' | 'guard'
  children: React.ReactNode
}) {
  useScrollLock(true)
  // ESC는 최상위(가장 최근에 열린) 팝업에만 전달된다. guard면 컨펌 후 닫힘.
  usePopupEsc(true, dismiss, onClose)

  return (
    <div className={styles.overlay}>
      <div
        className={`${styles.dialog} ${size === 'wide' ? styles.dialogWide : ''} ${size === 'small' ? styles.dialogSmall : ''}`}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <LiaTimesSolid />
          </button>
        </div>
        <div className={`${styles.body} ${flush ? styles.bodyFlush : ''}`}>{children}</div>
      </div>
    </div>
  )
}
