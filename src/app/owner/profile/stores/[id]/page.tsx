'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LiaAngleLeftSolid, LiaAngleRightSolid, LiaCreditCardSolid } from 'react-icons/lia'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import {
  BASE_STORE_PRICE,
  EXTRA_STORE_PRICE,
  STORAGE_ADDON_PRICE,
  STORAGE_USAGE_GB,
  STORE_REGISTERED_AT,
  STORE_EMPLOYEE_COUNT,
  STORE_CARDS,
  STORE_ADDON_GB,
  STORE_SUB_ISSUES,
  REGISTERED_CARDS,
  PAYMENT_HISTORY,
  MOCK_TODAY,
  assignStoreCard,
  addStorageAddon,
  storeStorageLimit,
  cardById,
  subIssueSummary,
} from '@/mock/subscription'
import CardSelectPopup from '../../CardSelectPopup'
import AddStoragePopup from '../../AddStoragePopup'
import styles from '../../page.module.css'

function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

function gaugeLevel(ratio: number) {
  if (ratio >= 0.95) return 'danger'
  if (ratio >= 0.8) return 'warning'
  return 'normal'
}

// 매장 상세: 기본 정보 수정 + 등록일/임직원 수 확인 + 결제 카드 변경/용량 추가
export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { stores, updateStore } = useStore()
  const { showToast } = useToast()

  const store = stores.find((s) => s.id === id)
  const storeIndex = stores.findIndex((s) => s.id === id)

  const [name, setName] = useState(store?.name ?? '')
  const [address, setAddress] = useState(store?.address ?? '')
  const [cardId, setCardId] = useState(STORE_CARDS[id] ?? REGISTERED_CARDS[0].id)
  const [limitGb, setLimitGb] = useState(storeStorageLimit(id))
  const [cardPopupOpen, setCardPopupOpen] = useState(false)
  const [storagePopupOpen, setStoragePopupOpen] = useState(false)

  if (!store) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.push('/owner/profile')}>
            <LiaAngleLeftSolid /> 프로필
          </button>
        </header>
        <p className={styles.emptyText}>매장을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const isBase = storeIndex === 0
  const fee = isBase ? BASE_STORE_PRICE : EXTRA_STORE_PRICE
  const addonGb = STORE_ADDON_GB[id] ?? 0
  const used = STORAGE_USAGE_GB[id] ?? 0
  const ratio = Math.min(used / limitGb, 1)
  const level = gaugeLevel(ratio)
  const card = cardById(cardId)
  const registeredAt = STORE_REGISTERED_AT[id] ?? MOCK_TODAY
  const employeeCount = STORE_EMPLOYEE_COUNT[id] ?? 0
  const issue = STORE_SUB_ISSUES[id]
  // 이 매장에 대한 결제 시도 내역 (실패 재시도 포함)
  const storePayments = PAYMENT_HISTORY.filter((r) => r.storeIds.includes(id))

  function saveBasicInfo() {
    if (!name.trim() || !address.trim()) {
      showToast('매장명과 주소를 입력해주세요.', 'warning')
      return
    }
    updateStore(id, { name: name.trim(), address: address.trim() })
    showToast('매장 정보가 저장되었습니다.')
  }

  function handleCardChange(nextCardId: string) {
    assignStoreCard(id, nextCardId)
    setCardId(nextCardId)
    setCardPopupOpen(false)
    showToast('결제 카드가 변경되었습니다.')
  }

  function handleAddStorage(units: number) {
    addStorageAddon(id, units)
    setLimitGb(storeStorageLimit(id))
    setStoragePopupOpen(false)
    showToast(`용량 ${units * 10}GB가 추가되었습니다.`)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/owner/profile')}>
          <LiaAngleLeftSolid /> 프로필
        </button>
      </header>

      <div className={`${styles.body} ${styles.bodyGrid}`}>
        {/* ── 좌: 기본 정보 ── */}
        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>기본 정보</span>
            </div>
            <div className={styles.editRow}>
              <span className={styles.editLabel}>매장명</span>
              <input
                className={styles.editInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.editRow}>
              <span className={styles.editLabel}>주소</span>
              <input
                className={styles.editInput}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className={styles.editFoot}>
              <button className={styles.smallBtn} onClick={saveBasicInfo}>
                저장
              </button>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>매장 식별번호</span>
              <span className={styles.infoValue}>{store.code}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>등록일</span>
              <span className={styles.infoValue}>{registeredAt}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>임직원 수</span>
              <span className={styles.infoValue}>{employeeCount}명</span>
            </div>
          </section>
        </div>

        {/* ── 우: 구독 관리 ── */}
        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>구독</span>
              <div className={styles.panelHeaderRight}>
                {issue && <span className={styles.failBadge}>결제 실패</span>}
                <span className={styles.feeBadge}>
                  {isBase ? '기본 매장' : '추가 매장'} · 월 {formatWon(fee)}
                </span>
              </div>
            </div>
            {issue && (
              <div className={`${styles.subIssue} ${styles.subIssueDetail}`}>
                <span className={styles.subIssueText}>{subIssueSummary(issue)}</span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>매장 요금</span>
              <span className={styles.infoValue}>월 {formatWon(fee)}</span>
            </div>
            {addonGb > 0 && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>추가 용량</span>
                <span className={styles.infoValue}>
                  {addonGb}GB · 월 {formatWon((addonGb / 10) * STORAGE_ADDON_PRICE)}
                </span>
              </div>
            )}
            <div className={styles.subRow}>
              <div className={styles.gaugeTrack}>
                <div
                  className={`${styles.gaugeFill} ${
                    level === 'danger'
                      ? styles.gaugeDanger
                      : level === 'warning'
                        ? styles.gaugeWarning
                        : ''
                  }`}
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
              <span className={styles.storageUsage}>
                {used.toFixed(1)}GB / {limitGb}GB
              </span>
              <button className={styles.smallBtn} onClick={() => setStoragePopupOpen(true)}>
                용량 추가
              </button>
            </div>
            <div className={styles.subRow}>
              <span className={styles.cardLineIcon}>
                <LiaCreditCardSolid />
              </span>
              <span className={styles.cardLineValue}>
                {card ? `${card.cardName} ${card.cardNumberMasked}` : '카드 미등록'}
              </span>
              <button className={styles.smallBtn} onClick={() => setCardPopupOpen(true)}>
                카드 변경
              </button>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>결제 내역</span>
              <span className={styles.storageHeadDesc}>총 {storePayments.length}건</span>
            </div>
            {storePayments.length === 0 ? (
              <p className={styles.emptyText}>결제 내역이 없습니다.</p>
            ) : (
              storePayments.map((record) => (
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
                    <span
                      className={record.status === 'PAID' ? styles.paidBadge : styles.failedBadge}
                    >
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

      {cardPopupOpen && (
        <CardSelectPopup
          storeName={store.name}
          selectedCardId={cardId}
          onApply={handleCardChange}
          onClose={() => setCardPopupOpen(false)}
        />
      )}
      {storagePopupOpen && (
        <AddStoragePopup
          storeName={store.name}
          card={card}
          onClose={() => setStoragePopupOpen(false)}
          onSubmit={handleAddStorage}
        />
      )}
    </div>
  )
}
