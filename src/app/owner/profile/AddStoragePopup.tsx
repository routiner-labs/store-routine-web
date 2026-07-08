'use client'

import { useState } from 'react'
import { LiaCreditCardSolid, LiaMinusSolid, LiaPlusSolid } from 'react-icons/lia'
import Modal from '@/components/Modal'
import {
  STORAGE_ADDON_PRICE,
  NEXT_BILLING_DATE,
  prorateMonthly,
  type RegisteredCard,
} from '@/mock/subscription'
import styles from './BillingForm.module.css'

function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

// 매장별 스토리지 용량 추가 절차: 수량 선택 → 요금(일할계산) 안내 → 해당 매장 카드로 결제(목업)
export default function AddStoragePopup({
  storeName,
  card,
  onClose,
  onSubmit,
}: {
  storeName: string
  card: RegisteredCard | undefined
  onClose: () => void
  onSubmit: (units: number) => void
}) {
  const [units, setUnits] = useState(1)

  const monthly = units * STORAGE_ADDON_PRICE
  const proration = prorateMonthly(monthly)

  return (
    <Modal title={`용량 추가 - ${storeName}`} onClose={onClose}>
      <div className={styles.form}>
        <div className={styles.section}>
          <span className={styles.sectionTitle}>추가 용량</span>
          <div className={styles.stepperRow}>
            <button
              className={styles.stepperBtn}
              onClick={() => setUnits((u) => Math.max(1, u - 1))}
              aria-label="감소"
            >
              <LiaMinusSolid />
            </button>
            <span className={styles.stepperValue}>{units * 10}GB</span>
            <button
              className={styles.stepperBtn}
              onClick={() => setUnits((u) => Math.min(9, u + 1))}
              aria-label="증가"
            >
              <LiaPlusSolid />
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>요금</span>
          <div className={styles.feeBox}>
            <div className={styles.feeRow}>
              <span className={styles.feeLabel}>월 요금 (10GB당 {formatWon(STORAGE_ADDON_PRICE)})</span>
              <span className={styles.feeValue}>
                {formatWon(monthly)} <em className={styles.feeNote}>부가세 포함</em>
              </span>
            </div>
            <div className={styles.feeRow}>
              <span className={styles.feeLabel}>
                오늘 결제 금액 <em className={styles.feeNote}>이번 달 {proration.remainingDays}일 일할계산</em>
              </span>
              <span className={styles.feeToday}>{formatWon(proration.amount)}</span>
            </div>
          </div>
          <p className={styles.feeDesc}>
            다음 결제일({NEXT_BILLING_DATE})부터 이 매장의 결제 카드로 정기 결제에 합산됩니다.
            추가 용량은 이 매장에만 적용됩니다.
          </p>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>결제 카드</span>
          <div className={styles.cardOption}>
            <span className={styles.cardIcon}>
              <LiaCreditCardSolid />
            </span>
            <span className={styles.cardName}>{card?.cardName ?? '카드 미등록'}</span>
            <span className={styles.cardNumber}>{card?.cardNumberMasked ?? ''}</span>
          </div>
        </div>

        <button className={styles.submit} onClick={() => onSubmit(units)}>
          {formatWon(proration.amount)} 결제하고 용량 추가
        </button>
      </div>
    </Modal>
  )
}
