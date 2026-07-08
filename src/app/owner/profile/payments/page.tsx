'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid, LiaAngleRightSolid } from 'react-icons/lia'
import { PAYMENT_HISTORY } from '@/mock/subscription'
import MonthRangeFilter from '@/components/MonthRangeFilter'
import styles from '../page.module.css'

function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

// 결제 내역 전체 목록 — 프로필의 결제 내역(최대 10개)에서 "더보기"로 진입
export default function PaymentListPage() {
  const router = useRouter()
  // 조회 기간 (YYYY-MM, 단일 월이면 start === end)
  const [startMonth, setStartMonth] = useState('')
  const [endMonth, setEndMonth] = useState('')

  const filtered = PAYMENT_HISTORY.filter((record) => {
    if (!startMonth) return true
    const key = record.date.slice(0, 7)
    return key >= startMonth && key <= (endMonth || startMonth)
  })

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/owner/profile')}>
          <LiaAngleLeftSolid /> 프로필
        </button>
      </header>

      <div className={styles.body}>
        <div className={styles.monthFilterRow}>
          <MonthRangeFilter
            title="조회 기간"
            placeholder="전체 기간"
            startMonth={startMonth}
            endMonth={endMonth}
            onApply={(s, e) => {
              setStartMonth(s)
              setEndMonth(e)
            }}
          />
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>결제 내역</span>
            <span className={styles.storageHeadDesc}>총 {filtered.length}건</span>
          </div>
          {filtered.length === 0 ? (
            <p className={styles.emptyText}>해당 기간의 결제 내역이 없습니다.</p>
          ) : (
            filtered.map((record) => (
              <Link
                key={record.id}
                href={`/owner/profile/payments/${record.id}`}
                className={styles.historyRow}
              >
                <div className={styles.historyText}>
                  <span className={styles.historyLabel}>{record.label}</span>
                  <span className={styles.historyDate}>
                    {record.date} · {record.cardName}
                    {record.status === 'FAILED' && record.failReason
                      ? ` · ${record.failReason}`
                      : ''}
                  </span>
                </div>
                <div className={styles.historyRight}>
                  <span className={styles.historyAmount}>{formatWon(record.amount)}</span>
                  <span className={record.status === 'PAID' ? styles.paidBadge : styles.failedBadge}>
                    {record.status === 'PAID' ? '결제 완료' : '결제 실패'}
                  </span>
                </div>
                <LiaAngleRightSolid className={styles.historyChevron} />
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  )
}
