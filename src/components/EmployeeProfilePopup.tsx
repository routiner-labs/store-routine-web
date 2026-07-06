'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Employee } from '@/types'
import { useScrollLock } from '@/lib/useScrollLock'
import styles from './EmployeeProfilePopup.module.css'

const DOW = ['월', '화', '수', '목', '금', '토', '일']

export default function EmployeeProfilePopup({
  name,
  employee,
  onClose,
}: {
  name: string
  employee?: Employee
  onClose: () => void
}) {
  useScrollLock(true)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // 어떤 중첩 위치(sticky/transform 등 스태킹 컨텍스트 내부)에서 열려도
  // 항상 최상위에 뜨도록 body에 portal로 렌더링한다.
  return createPortal(
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.popupHeader}>
          <span className={styles.popupTitle}>직원 프로필</span>
          <button className={styles.popupClose} onClick={onClose}>닫기</button>
        </div>
        <div className={styles.profileBody}>
          <div className={styles.profileAvatar}>{name[0]}</div>
          <div className={styles.profileName}>{name}</div>
          {employee ? (
            <>
              <span className={`${styles.profileStatusBadge} ${employee.status === 'ACTIVE' ? styles.profileBadgeActive : styles.profileBadgeInactive}`}>
                {employee.status === 'ACTIVE' ? '재직중' : '퇴직'}
              </span>
              <div className={styles.profileMeta}>
                <div className={styles.profileMetaItem}>
                  <span className={styles.profileMetaLabel}>연락처</span>
                  <span className={styles.profileMetaValue}>{employee.phone}</span>
                </div>
                {employee.birthDate && (
                  <div className={styles.profileMetaItem}>
                    <span className={styles.profileMetaLabel}>생년월일</span>
                    <span className={styles.profileMetaValue}>{employee.birthDate}</span>
                  </div>
                )}
                <div className={styles.profileMetaItem}>
                  <span className={styles.profileMetaLabel}>입사일</span>
                  <span className={styles.profileMetaValue}>{employee.hiredAt}</span>
                </div>
                {employee.terminatedAt && (
                  <div className={styles.profileMetaItem}>
                    <span className={styles.profileMetaLabel}>퇴직일</span>
                    <span className={styles.profileMetaValue}>{employee.terminatedAt}</span>
                  </div>
                )}
                {employee.schedule && (
                  <div className={styles.profileMetaItem}>
                    <span className={styles.profileMetaLabel}>근무요일</span>
                    <div className={styles.profileDowRow}>
                      {DOW.map((d, i) => (
                        <span
                          key={i}
                          className={`${styles.profileDowDot} ${employee.schedule!.days.includes(i) ? styles.profileDowDotOn : ''}`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {employee.schedule && (
                  <div className={styles.profileMetaItem}>
                    <span className={styles.profileMetaLabel}>근무시간</span>
                    <span className={styles.profileMetaValue}>
                      {employee.schedule.startTime} ~ {employee.schedule.endTime}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className={styles.profileNotFound}>직원 정보를 찾을 수 없습니다.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
