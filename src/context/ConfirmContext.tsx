'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import styles from './ConfirmContext.module.css'

export interface ConfirmOptions {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean // true(기본) = 확인 버튼 빨강
}

type ConfirmState = ConfirmOptions & { resolve: (v: boolean) => void }

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null)

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve })
    })
  }, [])

  function close(value: boolean) {
    setState((cur) => {
      cur?.resolve(value)
      return null
    })
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className={styles.overlay} onClick={() => close(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.title}>{state.title ?? '삭제하시겠어요?'}</h3>
            {state.message && <p className={styles.message}>{state.message}</p>}
            <div className={styles.actions}>
              <button
                className={`${styles.confirm} ${state.danger === false ? '' : styles.danger}`}
                onClick={() => close(true)}
                autoFocus
              >
                {state.confirmText ?? '삭제'}
              </button>
              <button className={styles.cancel} onClick={() => close(false)}>
                {state.cancelText ?? '취소'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
