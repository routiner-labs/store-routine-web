'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid, LiaCheckSolid, LiaTimesSolid } from 'react-icons/lia'
import { mockJoinRequests } from '@/mock/employees'
import styles from './page.module.css'

export default function JoinRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState(mockJoinRequests)

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
                {req.message && <span className={styles.msg}>"{req.message}"</span>}
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.btnReject}
                  onClick={() => setRequests((prev) => prev.filter((r) => r.id !== req.id))}
                >
                  <LiaTimesSolid /> 거절
                </button>
                <button
                  className={styles.btnApprove}
                  onClick={() => setRequests((prev) => prev.filter((r) => r.id !== req.id))}
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
