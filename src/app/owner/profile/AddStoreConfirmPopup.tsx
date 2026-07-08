'use client'

import { useState } from 'react'
import Modal from '@/components/Modal'
import {
  BASE_STORAGE_GB,
  EXTRA_STORE_PRICE,
  extraStoreProration,
} from '@/mock/subscription'
import formStyles from './BillingForm.module.css'
import styles from './AddStoreConfirmPopup.module.css'

export const ADD_STORE_CONFIRM_PHRASE = '내용을 확인했으며 매장을 추가하겠습니다'

function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

// 매장 추가 전 경고 팝업 — 결제가 늘어나는 결정이므로 핵심 고지 후,
// 동일 문구를 직접 입력해야 매장 생성 절차로 진행할 수 있다.
export default function AddStoreConfirmPopup({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: () => void
}) {
  const [phrase, setPhrase] = useState('')
  const proration = extraStoreProration()
  const matched = phrase.trim() === ADD_STORE_CONFIRM_PHRASE

  return (
    <Modal title="매장 추가 안내" onClose={onClose}>
      <div className={formStyles.form}>
        <p className={styles.warnHead}>
          매장을 추가하면 정기 결제 금액이 늘어납니다. 아래 내용을 반드시 확인해주세요.
        </p>

        <ul className={styles.noticeList}>
          <li className={styles.noticeItem}>
            추가 매장 요금은 <strong>월 {formatWon(EXTRA_STORE_PRICE)}</strong>(부가세 포함)이며,
            매장별 기본 {BASE_STORAGE_GB}GB가 제공됩니다.
          </li>
          <li className={styles.noticeItem}>
            추가 즉시 이번 달 남은 {proration.remainingDays}일에 대한{' '}
            <strong>{formatWon(proration.amount)}</strong>이 결제되고, 이후 매월 25일에 다음 달
            이용료가 정기 결제됩니다.
          </li>
          <li className={styles.noticeItem}>
            해지해도 이미 결제한 달의 말일까지 이용할 수 있으며, 월간 구독은 남은 기간에 대한
            환불이 없습니다. 연간권 중도 해지 시 할인 전 정가 기준으로 사용 기간을 차감한 금액이
            환불됩니다.
          </li>
          <li className={styles.noticeItem}>
            결제 실패 시 해당 월 말일까지 재시도하며, 미결제 시 다음 달 1일부터 계정 전체가 조회
            전용으로 제한되고(직원 포함), 14일까지 미결제 시 로그인이 제한됩니다. 이후 90일이
            지나면 데이터가 삭제됩니다.
          </li>
        </ul>

        <div className={styles.phraseSection}>
          <p className={styles.phraseGuide}>
            매장을 추가하시려면 아래 문구를 동일하게 입력해주세요.
          </p>
          <p className={styles.phraseBox}>{ADD_STORE_CONFIRM_PHRASE}</p>
          <input
            className={formStyles.input}
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="문구를 입력하세요"
          />
        </div>

        <button className={formStyles.submit} disabled={!matched} onClick={onConfirm}>
          매장 생성 진행
        </button>
      </div>
    </Modal>
  )
}
