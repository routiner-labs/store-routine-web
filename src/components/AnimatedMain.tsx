'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * 레이아웃의 <main>을 현재 경로(pathname)로 키잉한다.
 * 메뉴 이동/페이지 전환마다 <main>이 리마운트되어 진입 애니메이션(mainEnter)이 다시 재생된다.
 * 래퍼를 추가하지 않고 기존 <main>을 그대로 쓰므로 높이 체인/레이아웃에 영향이 없다.
 */
export default function AnimatedMain({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const pathname = usePathname()
  return (
    <main key={pathname} className={className}>
      {children}
    </main>
  )
}
