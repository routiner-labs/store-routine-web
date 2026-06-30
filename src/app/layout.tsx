import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '루틴 - 매장 루틴 관리',
  description: '알바생은 오늘 할 일을 확인하고, 사장님은 미완료와 이상 상황만 확인합니다.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
