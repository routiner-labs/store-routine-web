'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LiaUserSolid, LiaCogSolid } from 'react-icons/lia'
import SystemSettings from '@/components/SystemSettings'
import styles from './UserMenu.module.css'

// 사이드바 하단 사용자 영역: 아바타/이름 클릭 시 프로필·설정 메뉴 팝업
export default function UserMenu({ initial, name }: { initial: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  function toggle() {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      // 트리거 바로 위로 메뉴가 올라오게 (좌측 정렬)
      setPos({ left: r.left, bottom: window.innerHeight - r.top + 8 })
    }
    setOpen((v) => !v)
  }

  return (
    <>
      <button ref={triggerRef} className={styles.trigger} onClick={toggle}>
        <span className={styles.avatar}>{initial}</span>
        <span className={styles.name}>{name}</span>
      </button>

      {open &&
        pos &&
        createPortal(
          <>
            <div className={styles.overlay} onClick={() => setOpen(false)} />
            <div className={styles.menu} style={{ left: pos.left, bottom: pos.bottom }}>
              <button className={styles.menuItem} onClick={() => setOpen(false)}>
                <LiaUserSolid className={styles.menuIcon} />
                프로필
              </button>
              <button
                className={styles.menuItem}
                onClick={() => {
                  setOpen(false)
                  setSettingsOpen(true)
                }}
              >
                <LiaCogSolid className={styles.menuIcon} />
                설정
              </button>
            </div>
          </>,
          document.body,
        )}

      {settingsOpen && <SystemSettings onClose={() => setSettingsOpen(false)} />}
    </>
  )
}
