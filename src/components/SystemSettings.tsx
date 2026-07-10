'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { LiaTimesSolid, LiaPaletteSolid } from 'react-icons/lia'
import { useScrollLock } from '@/lib/useScrollLock'
import { usePopupEsc } from '@/lib/usePopupEsc'
import { useTheme } from '@/context/ThemeContext'
import styles from './SystemSettings.module.css'

type SettingsSection = 'theme'

const SECTIONS: Array<{ id: SettingsSection; label: string; icon: React.ReactNode }> = [
  { id: 'theme', label: '테마', icon: <LiaPaletteSolid /> },
]

// 시스템 설정 팝업 (사이드바 하단 사용자 메뉴의 "설정"에서 열림)
export default function SystemSettings({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState<SettingsSection>('theme')
  const { theme, setTheme } = useTheme()

  useScrollLock(true)
  // 설정 팝업 — 뷰어형(설정은 즉시 반영, ESC 바로 닫힘)
  usePopupEsc(true, 'viewer', onClose)

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.card}>
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
