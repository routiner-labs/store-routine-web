'use client'

import { useState } from 'react'
import { LiaCreditCardSolid, LiaPlusSolid } from 'react-icons/lia'
import Modal from '@/components/Modal'
import { useToast } from '@/context/ToastContext'
import { REGISTERED_CARDS } from '@/mock/subscription'
import styles from './BillingForm.module.css'

// 매장별 결제 카드 변경 팝업 — 등록된 카드 중 선택
export default function CardSelectPopup({
  storeName,
  selectedCardId,
  onApply,
  onClose,
}: {
  storeName: string
  selectedCardId: string
  onApply: (cardId: string) => void
  onClose: () => void
}) {
  const { showToast } = useToast()
  const [cardId, setCardId] = useState(selectedCardId)

  return (
    <Modal title={`결제 카드 변경 - ${storeName}`} dismiss="guard" onClose={onClose}>
      <div className={styles.form}>
        <div className={styles.section}>
          {REGISTERED_CARDS.map((card) => (
            <label key={card.id} className={styles.cardOption}>
              <input
                type="radio"
                name="storeCardSelect"
                className={styles.radio}
                checked={cardId === card.id}
                onChange={() => setCardId(card.id)}
              />
              <span className={styles.cardIcon}>
                <LiaCreditCardSolid />
              </span>
              <span className={styles.cardName}>{card.cardName}</span>
              <span className={styles.cardNumber}>{card.cardNumberMasked}</span>
            </label>
          ))}
          <button
            className={styles.newCardBtn}
            onClick={() => showToast('새 카드 등록은 준비 중입니다.', 'info')}
          >
            <LiaPlusSolid /> 새 카드 등록
          </button>
        </div>

        <button className={styles.submit} onClick={() => onApply(cardId)}>
          변경하기
        </button>
      </div>
    </Modal>
  )
}
