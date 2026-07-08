'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid, LiaCheckSolid, LiaTimesSolid } from 'react-icons/lia'
import { mockJoinRequests } from '@/mock/employees'
import { useToast } from '@/context/ToastContext'
import { useConfirm } from '@/context/ConfirmContext'
import styles from './page.module.css'

export default function JoinRequestsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [requests, setRequests] = useState(mockJoinRequests)

  function approve(id: string, name: string) {
    setRequests((prev) => prev.filter((r) => r.id !== id))
    showToast(`${name}님의 가입을 수락했습니다`)
  }

  async function reject(id: string, name: string) {
    const ok = await confirm({
      title: '가입 신청을 거절할까요?',
      message: `${name}님의 가입 신청이 거절됩니다.`,
      confirmText: '거절',
    })
    if (!ok) return
    setRequests((prev) => prev.filter((r) => r.id !== id))
    showToast(`${name}님의 가입 신청을 거절했습니다`, 'error')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <LiaAngleLeftSolid /> 직원 관리
        </button>
        <h1 className={styles.heading}>가입 신청</h1>
        {requests.length > 0 && (
          <span className={styles.count}>{requests.length}건</span>
        )}
      </header>

      <div className={styles.body}>
        {requests.length === 0 ? (
          <p className={styles.empty}>새로운 가입 신청이 없습니다.</p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className={styles.card}>
              <div className={styles.info}>
                <span className={styles.name}>{req.name}</span>
                <span className={styles.meta}>{req.phone} · {req.requestedAt}</span>
                {req.message && <span className={styles.msg}>&ldquo;{req.message}&rdquo;</span>}
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.btnReject}
                  onClick={() => reject(req.id, req.name)}
                >
                  <LiaTimesSolid /> 거절
                </button>
                <button
                  className={styles.btnApprove}
                  onClick={() => approve(req.id, req.name)}
                >
                  <LiaCheckSolid /> 수락
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
