'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid, LiaCreditCardSolid, LiaPlusSolid, LiaCheckSolid } from 'react-icons/lia'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import {
  BASE_STORAGE_GB,
  EXTRA_STORE_PRICE,
  NEXT_BILLING_DATE,
  REGISTERED_CARDS,
  assignStoreCard,
  cardById,
  extraStoreProration,
} from '@/mock/subscription'
import pStyles from '../../page.module.css'
import formStyles from '../../BillingForm.module.css'
import styles from './page.module.css'

const STEPS = [
  { label: '매장정보', desc: '추가할 매장의 이름과 위치를 입력합니다.' },
  { label: '사업장정보', desc: '사업자 등록 정보를 입력합니다.' },
  { label: '결제등록', desc: '정기 결제에 사용할 카드를 선택합니다.' },
  { label: '결제확인', desc: '입력 내용을 확인하고 결제를 완료합니다.' },
]

function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

// 매장 생성 절차: 매장정보 -> 사업장정보 -> 결제등록 -> 결제확인
export default function NewStorePage() {
  const router = useRouter()
  const { addStore } = useStore()
  const { showToast } = useToast()

  const [step, setStep] = useState(0)
  // 1. 매장정보
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  // 2. 사업장정보
  const [bizNumber, setBizNumber] = useState('')
  const [bizName, setBizName] = useState('')
  const [bizPhone, setBizPhone] = useState('')
  // 3. 결제등록
  const [cardId, setCardId] = useState(REGISTERED_CARDS[0].id)
  // 4. 결제확인
  const [payConfirmed, setPayConfirmed] = useState(false)

  const proration = extraStoreProration()
  const card = cardById(cardId)

  function goNext() {
    if (step === 0 && (!name.trim() || !address.trim())) {
      showToast('매장 이름과 매장 위치를 입력해주세요.', 'warning')
      return
    }
    if (step === 1 && (!bizNumber.trim() || !bizName.trim() || !bizPhone.trim())) {
      showToast('사업장 정보를 모두 입력해주세요.', 'warning')
      return
    }
    setStep((s) => s + 1)
  }

  function submitPayment() {
    const store = addStore(name.trim(), address.trim())
    assignStoreCard(store.id, cardId)
    showToast('결제가 완료되어 매장이 추가되었습니다.')
    router.push('/owner/profile')
  }

  const summaryEntries: [string, string][] = [
    ['매장 이름', name],
    ['매장 위치', address],
    ['사업자 번호', bizNumber],
    ['사업자명', bizName],
    ['연락처', bizPhone],
  ]

  return (
    <div className={pStyles.page}>
      <header className={pStyles.header}>
        <button className={pStyles.backBtn} onClick={() => router.push('/owner/profile')}>
          <LiaAngleLeftSolid /> 프로필
        </button>
      </header>

      <div className={styles.wizardBody}>
        <div className={styles.wizardGrid}>
          {/* ── 절차 표시 ── */}
          <aside className={styles.stepsPanel}>
            <span className={styles.stepsTitle}>매장 추가</span>
            <div className={styles.stepsList}>
              {STEPS.map((s, i) => (
                <Fragment key={s.label}>
                  {i > 0 && <span className={styles.connector} />}
                  <div className={styles.stepItem}>
                    <span
                      className={`${styles.stepCircle} ${
                        i === step
                          ? styles.stepCircleActive
                          : i < step
                            ? styles.stepCircleDone
                            : ''
                      }`}
                    >
                      {i < step ? <LiaCheckSolid /> : i + 1}
                    </span>
                    <span className={styles.stepTexts}>
                      <span
                        className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}
                      >
                        {s.label}
                      </span>
                      <span className={styles.stepDesc}>{s.desc}</span>
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </aside>

          {/* ── 현재 단계 폼 ── */}
          <section className={styles.formPanel}>
            <div className={styles.formHead}>
              <span className={styles.formStepNo}>
                STEP {step + 1} / {STEPS.length}
              </span>
              <h2 className={styles.formTitle}>{STEPS[step].label}</h2>
              <p className={styles.formDesc}>{STEPS[step].desc}</p>
            </div>

            <div className={styles.stepBody}>
              {step === 0 && (
                <>
                  <label className={formStyles.field}>
                    <span className={formStyles.label}>매장 이름</span>
                    <input
                      className={formStyles.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="예: 스타벅스 판교점"
                    />
                  </label>
                  <label className={formStyles.field}>
                    <span className={formStyles.label}>매장 위치</span>
                    <input
                      className={formStyles.input}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="예: 경기 성남시 분당구 판교역로 4"
                    />
                  </label>
                </>
              )}

              {step === 1 && (
                <>
                  <label className={formStyles.field}>
                    <span className={formStyles.label}>사업자 번호</span>
                    <input
                      className={formStyles.input}
                      value={bizNumber}
                      onChange={(e) => setBizNumber(e.target.value)}
                      placeholder="000-00-00000"
                    />
                  </label>
                  <label className={formStyles.field}>
                    <span className={formStyles.label}>사업자명 (상호)</span>
                    <input
                      className={formStyles.input}
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      placeholder="예: 주식회사 루틴커피"
                    />
                  </label>
                  <label className={formStyles.field}>
                    <span className={formStyles.label}>연락처</span>
                    <input
                      className={formStyles.input}
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                      placeholder="010-0000-0000"
                    />
                  </label>
                </>
              )}

              {step === 2 && (
                <>
                  {REGISTERED_CARDS.map((c) => (
                    <label key={c.id} className={formStyles.cardOption}>
                      <input
                        type="radio"
                        name="newStoreCard"
                        className={formStyles.radio}
                        checked={cardId === c.id}
                        onChange={() => setCardId(c.id)}
                      />
                      <span className={formStyles.cardIcon}>
                        <LiaCreditCardSolid />
                      </span>
                      <span className={formStyles.cardName}>{c.cardName}</span>
                      <span className={formStyles.cardNumber}>{c.cardNumberMasked}</span>
                    </label>
                  ))}
                  <button
                    className={`${formStyles.newCardBtn} ${styles.spanFull}`}
                    onClick={() => showToast('새 카드 등록은 준비 중입니다.', 'info')}
                  >
                    <LiaPlusSolid /> 새 카드 등록
                  </button>
                </>
              )}

              {step === 3 && (
                <>
                  <div className={styles.summaryBox}>
                    <span className={styles.summaryBoxTitle}>신청 정보</span>
                    {summaryEntries.map(([label, value]) => (
                      <div key={label} className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>{label}</span>
                        <span className={styles.summaryValue}>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.summaryBox}>
                    <span className={styles.summaryBoxTitle}>결제 정보</span>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>결제 카드</span>
                      <span className={styles.summaryValue}>
                        {card ? `${card.cardName} ${card.cardNumberMasked}` : '-'}
                      </span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>월 요금</span>
                      <span className={styles.summaryValue}>
                        {formatWon(EXTRA_STORE_PRICE)} · 기본 {BASE_STORAGE_GB}GB
                      </span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>
                        오늘 결제 금액
                        <em className={styles.summaryNote}>
                          이번 달 {proration.remainingDays}일 일할계산
                        </em>
                      </span>
                      <span className={styles.summaryPay}>{formatWon(proration.amount)}</span>
                    </div>
                    <p className={styles.payNote}>
                      부가세 포함 금액이며, 다음 결제일({NEXT_BILLING_DATE})부터 선택한 카드로
                      정기 결제됩니다.
                    </p>
                  </div>

                  <label className={`${styles.confirmCheck} ${styles.spanFull}`}>
                    <input
                      type="checkbox"
                      className={styles.confirmCheckbox}
                      checked={payConfirmed}
                      onChange={(e) => setPayConfirmed(e.target.checked)}
                    />
                    <span className={styles.confirmCheckLabel}>
                      결제 정보를 모두 확인했습니다.
                    </span>
                  </label>
                </>
              )}
            </div>

            <div className={styles.formFoot}>
              {step > 0 && (
                <button className={styles.prevBtn} onClick={() => setStep((s) => s - 1)}>
                  이전
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button className={styles.nextBtn} onClick={goNext}>
                  다음
                </button>
              ) : (
                <button
                  className={styles.nextBtn}
                  disabled={!payConfirmed}
                  onClick={submitPayment}
                >
                  {formatWon(proration.amount)} 결제하기
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
