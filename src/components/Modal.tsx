'use client'

import { useEffect } from 'react'
import { LiaTimesSolid } from 'react-icons/lia'
import { useScrollLock } from '@/lib/useScrollLock'
import styles from './Modal.module.css'

export default function Modal({
  title,
  onClose,
  size = 'default',
  flush = false,
  children,
}: {
  title: string
  onClose: () => void
  size?: 'default' | 'wide'
  flush?: boolean
  children: React.ReactNode
}) {
  useScrollLock(true)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.dialog} ${size === 'wide' ? styles.dialogWide : ''}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
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
