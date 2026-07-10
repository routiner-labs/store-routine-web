'use client'

import { useState } from 'react'
import Modal from '@/components/Modal'
import { useToast } from '@/context/ToastContext'
import styles from './PasswordChangePopup.module.css'

// 프로필의 비밀번호 변경 팝업 — 목업 단계라 실제 변경 없이 검증 + 토스트만 수행
export default function PasswordChangePopup({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  function submit() {
    if (!current || !next || !confirm) {
      showToast('모든 항목을 입력해주세요.', 'warning')
      return
    }
    if (next !== confirm) {
      showToast('새 비밀번호가 일치하지 않습니다.', 'error')
      return
    }
    showToast('비밀번호가 변경되었습니다.')
    onClose()
  }

  return (
    <Modal title="비밀번호 변경" dismiss="guard" onClose={onClose}>
      <div className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>현재 비밀번호</span>
          <input
            type="password"
            className={styles.input}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>새 비밀번호</span>
          <input
            type="password"
            className={styles.input}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>새 비밀번호 확인</span>
          <input
            type="password"
            className={styles.input}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <button className={styles.submit} onClick={submit}>
          변경하기
        </button>
      </div>
    </Modal>
  )
}
