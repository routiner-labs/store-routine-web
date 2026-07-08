'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { LiaCogSolid, LiaTimesSolid, LiaPaletteSolid } from 'react-icons/lia'
import { useScrollLock } from '@/lib/useScrollLock'
import { useTheme } from '@/context/ThemeContext'
import styles from './SystemSettings.module.css'

type SettingsSection = 'theme'

const SECTIONS: Array<{ id: SettingsSection; label: string; icon: React.ReactNode }> = [
  { id: 'theme', label: '테마', icon: <LiaPaletteSolid /> },
]

function SettingsPopup({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState<SettingsSection>('theme')
  const { theme, setTheme } = useTheme()

  useScrollLock(true)

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <span className={styles.title}>시스템 설정</span>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <LiaTimesSolid />
          </button>
        </div>

        <div className={styles.body}>
          {/* 좌측: 설정 항목 */}
          <div className={styles.menu}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.menuItem} ${section === s.id ? styles.menuItemActive : ''}`}
                onClick={() => setSection(s.id)}
              >
                <span className={styles.menuIcon}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* 우측: 상세 조정 */}
          <div className={styles.detail}>
            {section === 'theme' && (
              <div className={styles.detailSection}>
                <div className={styles.detailRow}>
                  <div className={styles.detailInfo}>
                    <span className={styles.detailLabel}>다크 모드</span>
                    <span className={styles.detailDesc}>
                      화면을 어두운 색상으로 표시합니다.
                    </span>
                  </div>
                  <div className={styles.segmented}>
                    <button
                      type="button"
                      className={`${styles.segBtn} ${theme === 'dark' ? styles.segBtnActive : ''}`}
                      onClick={() => setTheme('dark')}
                    >
                      활성화
                    </button>
                    <button
                      type="button"
                      className={`${styles.segBtn} ${theme === 'light' ? styles.segBtnActive : ''}`}
                      onClick={() => setTheme('light')}
                    >
                      비활성화
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// 사이드바 하단(종 모양 왼쪽)에 놓는 톱니바퀴 버튼 + 시스템 설정 팝업
export default function SystemSettings() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={styles.gearBtn}
        onClick={() => setOpen(true)}
        aria-label="시스템 설정"
      >
        <LiaCogSolid className={styles.gearIcon} />
      </button>
      {open && <SettingsPopup onClose={() => setOpen(false)} />}
    </>
  )
}
