'use client'

import { useRef, useState } from 'react'

interface TooltipRect {
  top: number
  left: number
  /** 뷰포트 우측 끝에서 앵커 우측 끝까지의 거리. `right`로 위치 잡으면 앵커와 우측 끝이 맞는다. */
  right: number
  width: number
}

// 호버한 요소 바로 아래에 뜨는 툴팁을 document.body에 포털로 그릴 수 있도록
// 좌표를 계산해준다. overflow:hidden인 조상(advPanel 등) 안에 있어도 잘리지 않는다.
export function useHoverTooltip<T extends HTMLElement = HTMLDivElement>() {
  const anchorRef = useRef<T>(null)
  const [rect, setRect] = useState<TooltipRect | null>(null)

  function show() {
    const el = anchorRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    // top을 트리거 바로 아래(간격 0)로 붙인다 — 시각적 여백은 툴팁 쪽 padding-top으로 준다.
    // 실제 간격을 두면 마우스가 트리거→툴팁으로 내려가는 사이에 hover가 끊겨 바로 닫혀버린다.
    setRect({ top: r.bottom, left: r.left, right: window.innerWidth - r.right, width: r.width })
  }

  function hide() {
    setRect(null)
  }

  return {
    anchorRef,
    rect,
    anchorHandlers: { onMouseEnter: show, onMouseLeave: hide },
    tooltipHandlers: { onMouseEnter: show, onMouseLeave: hide },
  }
}
