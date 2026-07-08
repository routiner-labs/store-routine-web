import type { Metadata } from 'next'
import { ToastProvider } from '@/context/ToastContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { ConfirmProvider } from '@/context/ConfirmContext'
import { ThemeProvider } from '@/context/ThemeContext'
import './globals.css'

export const metadata: Metadata = {
  title: '루틴 - 매장 루틴 관리',
  description: '알바생은 오늘 할 일을 확인하고, 사장님은 미완료와 이상 상황만 확인합니다.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        {/* 첫 페인트 전에 저장된 테마를 적용해 라이트→다크 깜빡임을 막는다 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`,
          }}
        />
        <ThemeProvider>
          <NotificationProvider>
            <ToastProvider>
              <ConfirmProvider>{children}</ConfirmProvider>
            </ToastProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
