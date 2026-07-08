'use client'

import { createContext, useContext, useState } from 'react'

export type NotificationType = 'REQUEST' | 'ATTENDANCE' | 'CHECKLIST' | 'SYSTEM'

export interface NotificationItem {
  id: string
  title: string
  body?: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  href?: string
}

interface NotificationContextValue {
  notifications: NotificationItem[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1', type: 'REQUEST', isRead: false,
    title: '새 요청이 도착했습니다',
    body: '김민수 — 재료부족 요청',
    createdAt: '방금',
    href: '/owner/requests/1',
  },
  {
    id: 'n2', type: 'ATTENDANCE', isRead: false,
    title: '지각 알림',
    body: '이지은이 10분 지각했습니다',
    createdAt: '5분 전',
  },
  {
    id: 'n3', type: 'CHECKLIST', isRead: false,
    title: '업무리스트 미완료',
    body: '오픈 업무리스트 3개 항목이 완료되지 않았습니다',
    createdAt: '1시간 전',
  },
  {
    id: 'n4', type: 'REQUEST', isRead: true,
    title: '요청 상태 변경',
    body: '박서연 — 근무변경 요청이 완료 처리되었습니다',
    createdAt: '어제',
  },
  {
    id: 'n5', type: 'SYSTEM', isRead: true,
    title: '가입 신청 2건 대기 중',
    body: '직원 가입 신청을 확인해 주세요',
    createdAt: '2일 전',
    href: '/owner/employees/join-requests',
  },
]

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}
