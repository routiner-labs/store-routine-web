'use client'

import { useEffect, useRef, useState } from 'react'
import { LiaUserSolid, LiaCogSolid } from 'react-icons/lia'
import SystemSettings from '@/components/SystemSettings'
import styles from './UserMenu.module.css'

// 사이드바 하단 사용자 영역: 아바타/이름 클릭 시 이름+벨 줄은 제자리에 두고 위쪽으로 프로필·설정 메뉴가 펼쳐짐
export default function UserMenu({
  initial,
  name,
  children,
}: {
  initial: string
  name: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function closeOnOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutside)
    return () => document.removeEventListener('mousedown', closeOnOutside)
  }, [open])

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div className={`${styles.expand} ${open ? styles.expandOpen : ''}`}>
        <div className={styles.menuInner}>
          <button className={styles.menuItem} onClick={() => setOpen(false)}>
            <LiaUserSolid className={styles.menuIcon} />
            <span className={styles.menuLabel}>프로필</span>
          </button>
          <button
            className={styles.menuItem}
            onClick={() => {
              setOpen(false)
              setSettingsOpen(true)
            }}
          >
            <LiaCogSolid className={styles.menuIcon} />
            <span className={styles.menuLabel}>시스템 설정</span>
          </button>
        </div>
      </div>

      <div className={styles.row}>
        <button className={styles.trigger} onClick={() => setOpen((v) => !v)}>
          <span className={styles.avatar}>{initial}</span>
          <span className={styles.name}>{name}</span>
        </button>
        {children}
      </div>

      {settingsOpen && <SystemSettings onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
