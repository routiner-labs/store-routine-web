'use client'

import { useEffect } from 'react'

// 여러 팝업이 겹쳐 열려도 안전하도록 참조 카운트로 관리한다.
let lockCount = 0
let savedOverflow = ''

/**
 * active인 동안 body 스크롤을 잠근다.
 * 팝업이 열려 있으면 휠은 팝업 내부에서만 동작하고 뒤 페이지는 움직이지 않는다.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return

    if (lockCount === 0) {
      savedOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    lockCount += 1

    return () => {
      lockCount -= 1
      if (lockCount === 0) {
        document.body.style.overflow = savedOverflow
      }
    }
  }, [active])
}
