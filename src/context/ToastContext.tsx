'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { LiaCheckCircleSolid, LiaTimesCircleSolid, LiaInfoCircleSolid, LiaExclamationCircleSolid, LiaTimesSolid } from 'react-icons/lia'
import styles from './ToastContext.module.css'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  exiting: boolean
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <LiaCheckCircleSolid />,
  error:   <LiaTimesCircleSolid />,
  info:    <LiaInfoCircleSolid />,
  warning: <LiaExclamationCircleSolid />,
}

const EXIT_DELAY = 2800
const ANIM_DURATION = 280

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `t${Date.now()}`
    setToasts((prev) => [...prev, { id, message, type, exiting: false }])

    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, ANIM_DURATION)
    }, EXIT_DELAY)
  }, [])

  function dismiss(id: string) {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, ANIM_DURATION)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.container} aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[`toast_${toast.type}`]} ${toast.exiting ? styles.toastExiting : ''}`}
          >
            <span className={styles.toastIcon}>{ICONS[toast.type]}</span>
            <span className={styles.toastMessage}>{toast.message}</span>
            <button className={styles.toastClose} onClick={() => dismiss(toast.id)} aria-label="닫기">
              <LiaTimesSolid />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
