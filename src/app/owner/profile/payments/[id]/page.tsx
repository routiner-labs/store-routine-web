'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid, LiaCreditCardSolid } from 'react-icons/lia'
import { PAYMENT_HISTORY } from '@/mock/subscription'
import { useToast } from '@/context/ToastContext'
import styles from './page.module.css'

function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

export default function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { showToast } = useToast()

  const record = PAYMENT_HISTORY.find((r) => r.id === id)

  function notReady() {
    showToast('준비 중인 기능입니다.', 'info')
  }

  if (!record) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.push('/owner/profile')}>
            <LiaAngleLeftSolid /> 프로필
          </button>
        </header>
        <p className={styles.notFound}>결제 내역을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/owner/profile')}>
          <LiaAngleLeftSolid /> 프로필
        </button>
      </header>

      <div className={`${styles.body} ${styles.bodyGrid}`}>
        {/* ── 좌: 결제 요약 + 결제 수단 ── */}
        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.summary}>
              <span className={record.status === 'PAID' ? styles.paidBadge : styles.failedBadge}>
                {record.status === 'PAID' ? '결제 완료' : '결제 실패'}
              </span>
              <span className={styles.summaryAmount}>{formatWon(record.amount)}</span>
              <span className={styles.summaryLabel}>{record.label}</span>
              <span className={styles.summaryDate}>
                {record.paidAt} {record.status === 'PAID' ? '결제' : '결제 시도'}
              </span>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>결제 수단</span>
            </div>
            <div className={styles.methodRow}>
              <span className={styles.cardIcon}>
                <LiaCreditCardSolid />
              </span>
              <div className={styles.cardText}>
                <span className={styles.cardName}>{record.cardName}</span>
                <span className={styles.cardNumber}>{record.cardNumberMasked}</span>
              </div>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>결제 일시</span>
              <span className={styles.detailValue}>{record.paidAt}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>승인번호</span>
              <span className={styles.detailValue}>{record.approvalNo || '-'}</span>
            </div>
            {record.status === 'FAILED' && record.failReason && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>실패 사유</span>
                <span className={`${styles.detailValue} ${styles.failReason}`}>
                  {record.failReason}
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>이용 기간</span>
              <span className={styles.detailValue}>{record.period}</span>
            </div>
          </section>
        </div>

        {/* ── 우: 결제 항목 + 액션 ── */}
        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>결제 항목</span>
            </div>
            {record.items.map((item, i) => (
              <div key={i} className={styles.detailRow}>
                <span className={styles.itemLabel}>{item.label}</span>
                <span className={styles.detailValue}>{formatWon(item.amount)}</span>
              </div>
            ))}
            <div className={`${styles.detailRow} ${styles.totalRow}`}>
              <span className={styles.totalLabel}>합계</span>
              <span className={styles.totalValue}>{formatWon(record.amount)}</span>
            </div>
          </section>

          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={notReady}>
              영수증 보기
            </button>
            <button className={styles.actionBtn} onClick={notReady}>
              세금계산서 발급
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
