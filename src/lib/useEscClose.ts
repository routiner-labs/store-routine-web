'use client'

import { useEffect, useRef } from 'react'

// 여러 팝업이 겹쳐 열려도 ESC는 항상 '가장 위(가장 최근에 열린)' 팝업 하나에만 전달한다.
// (useScrollLock의 참조 카운트와 같은 취지의 전역 스택)
type EscHandler = () => void
const stack: EscHandler[] = []
let attached = false

function onKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  const top = stack[stack.length - 1]
  if (!top) return
  e.preventDefault()
  top()
}

/**
 * active인 동안 이 팝업을 ESC 스택에 올린다.
 * ESC를 누르면 가장 위 팝업의 onEsc만 실행되고, 아래 팝업은 그대로 유지된다.
 * 바로 닫을지(뷰어) / 컨펌 후 닫을지(수정·생성)는 onEsc를 넘기는 호출부가 정한다.
 */
export function useEscClose(active: boolean, onEsc: EscHandler) {
  const ref = useRef(onEsc)
  // 최신 콜백을 ref에 보관(렌더 중 ref 변경 금지 → 이펙트에서 갱신)
  useEffect(() => {
    ref.current = onEsc
  })

  useEffect(() => {
    if (!active) return
    const handler = () => ref.current()
    stack.push(handler)
    if (!attached) {
      document.addEventListener('keydown', onKeyDown)
      attached = true
    }
    return () => {
      const i = stack.lastIndexOf(handler)
      if (i !== -1) stack.splice(i, 1)
    }
  }, [active])
}
