'use client'

import { useRef, useState } from 'react'
import type { AnimationEvent } from 'react'

/**
 * 페이지를 떠날 때 종료(나가는) 애니메이션을 재생하고, 애니메이션이 끝나면 네비게이션한다.
 * setTimeout 없이 animationend 이벤트로 처리한다.
 *
 * 사용법:
 *   const { leaving, leave, onAnimationEnd } = usePageLeave()
 *   <div className={`${styles.page} ${leaving ? styles.leaving : ''}`} onAnimationEnd={onAnimationEnd}>
 *   <button onClick={() => leave(() => router.back())}>...</button>
 */
export function usePageLeave() {
  const [leaving, setLeaving] = useState(false)
  const navRef = useRef<(() => void) | null>(null)

  function leave(navigate: () => void) {
    navRef.current = navigate
    setLeaving(true)
  }

  // 자식 요소의 진입 애니메이션 animationend는 버블링으로 올라오므로,
  // leaving 상태 + 루트 자신의 애니메이션(target===currentTarget)일 때만 이동한다.
  function onAnimationEnd(e: AnimationEvent<HTMLElement>) {
    if (leaving && e.target === e.currentTarget) navRef.current?.()
  }

  return { leaving, leave, onAnimationEnd }
}
