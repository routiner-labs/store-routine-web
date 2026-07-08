'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LiaCreditCardSolid, LiaAngleRightSolid, LiaPlusSolid } from 'react-icons/lia'
import { useStore } from '@/context/StoreContext'
import {
  BASE_STORE_PRICE,
  EXTRA_STORE_PRICE,
  STORAGE_USAGE_GB,
  NEXT_BILLING_DATE,
  PAYMENT_HISTORY,
  REGISTERED_CARDS,
  STORE_CARDS,
  STORE_SUB_ISSUES,
  cardById,
  storeStorageLimit,
  monthlyTotal,
  subIssueSummary,
} from '@/mock/subscription'
import PasswordChangePopup from '@/components/PasswordChangePopup'
import DataPolicyFooter from '@/components/DataPolicyFooter'
import AddStoreConfirmPopup from './AddStoreConfirmPopup'
import styles from './page.module.css'

const OWNER = {
  initial: '사',
  name: '사장님',
  phone: '010-1234-5678',
  email: 'owner@example.com',
  joinedAt: '2026-03-02',
}

function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

function gaugeLevel(ratio: number) {
  if (ratio >= 0.95) return 'danger'
  if (ratio >= 0.8) return 'warning'
  return 'normal'
}

export default function OwnerProfilePage() {
  const router = useRouter()
  const { stores } = useStore()
  const [pwOpen, setPwOpen] = useState(false)
  const [addStoreOpen, setAddStoreOpen] = useState(false)

  const total = monthlyTotal(stores.length)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>프로필</h1>
      </header>

      <div className={`${styles.body} ${styles.bodyGrid}`}>
        {/* ── 좌: 내 정보 ── */}
        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>내 정보</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileAvatar}>{OWNER.initial}</span>
              <div className={styles.profileText}>
                <span className={styles.profileName}>{OWNER.name}</span>
                <span className={styles.profileRole}>사장 계정</span>
              </div>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>연락처</span>
              <span className={styles.infoValue}>{OWNER.phone}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>로그인 이메일</span>
              <span className={styles.infoValue}>{OWNER.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>가입일</span>
              <span className={styles.infoValue}>{OWNER.joinedAt}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>비밀번호</span>
              <button className={styles.smallBtn} onClick={() => setPwOpen(true)}>
                변경
              </button>
            </div>
          </section>
        </div>

        {/* ── 우: 구독(매장별) + 결제 내역 ── */}
        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>구독 정보</span>
              <span className={styles.activeBadge}>이용 중</span>
            </div>
            <div className={styles.planCard}>
              <div className={styles.planText}>
                <span className={styles.planName}>월간 구독</span>
                <span className={styles.planMeta}>
                  매장 {stores.length}개 · 다음 결제일 {NEXT_BILLING_DATE}
                </span>
              </div>
              <span className={styles.planAmount}>월 {formatWon(total)}</span>
            </div>

            <div className={styles.storageHead}>
              <span className={styles.storageHeadLabel}>매장별 구독</span>
              <span className={styles.storageHeadDesc}>매장을 누르면 상세 관리로 이동</span>
            </div>
            {stores.map((store, index) => {
              const isBase = index === 0
              const fee = isBase ? BASE_STORE_PRICE : EXTRA_STORE_PRICE
              const used = STORAGE_USAGE_GB[store.id] ?? 0
              const limit = storeStorageLimit(store.id)
              const ratio = Math.min(used / limit, 1)
              const level = gaugeLevel(ratio)
              const card = cardById(STORE_CARDS[store.id] ?? REGISTERED_CARDS[0].id)
              const issue = STORE_SUB_ISSUES[store.id]
              return (
                <Link
                  key={store.id}
                  href={`/owner/profile/stores/${store.id}`}
                  className={styles.storeSub}
                >
                  <div className={styles.storeSubHead}>
                    <span className={styles.storeSubName}>
                      {store.name} <span className={styles.storeSubCode}>({store.code})</span>
                    </span>
                    {issue && <span className={styles.failBadge}>결제 실패</span>}
                    <LiaAngleRightSolid className={styles.historyChevron} />
                  </div>
                  {issue && (
                    <div className={styles.subIssue}>
                      <span className={styles.subIssueText}>{subIssueSummary(issue)}</span>
                    </div>
                  )}
                  <div className={styles.storageLine}>
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
                      {used.toFixed(1)}GB / {limit}GB
                    </span>
                  </div>
                  <div className={styles.cardLine}>
                    <span className={styles.cardLineIcon}>
                      <LiaCreditCardSolid />
                    </span>
                    <span className={styles.cardLineValue}>
                      {card ? `${card.cardName} ${card.cardNumberMasked}` : '카드 미등록'}
                    </span>
                    <span className={styles.feeBadge}>
                      {isBase ? '기본 매장' : '추가 매장'} · 월 {formatWon(fee)}
                    </span>
                  </div>
                </Link>
              )
            })}
            <button className={styles.moreRow} onClick={() => setAddStoreOpen(true)}>
              <LiaPlusSolid /> 매장 추가
            </button>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>결제 내역</span>
            </div>
            {PAYMENT_HISTORY.slice(0, 10).map((record) => (
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
            ))}
            <Link href="/owner/profile/payments" className={styles.moreRow}>
              더보기 <LiaAngleRightSolid />
            </Link>
          </section>
        </div>
      </div>

      <DataPolicyFooter />

      {pwOpen && <PasswordChangePopup onClose={() => setPwOpen(false)} />}
      {addStoreOpen && (
        <AddStoreConfirmPopup
          onClose={() => setAddStoreOpen(false)}
          onConfirm={() => {
            setAddStoreOpen(false)
            router.push('/owner/profile/stores/new')
          }}
        />
      )}
    </div>
  )
}
