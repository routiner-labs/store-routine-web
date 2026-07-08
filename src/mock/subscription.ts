// 구독/결제 목업 데이터 — 실결제(토스페이먼츠) 연동 전까지 화면 표시용
// 가격 기준: .claude/planning/saas_subscription_planning.md (부가세 포함)
// 구독은 매장별로 구성: 매장마다 요금(기본/추가), 용량, 결제 카드를 따로 가진다.

export const BASE_STORE_PRICE = 9900 // 기본 매장 월 요금
export const EXTRA_STORE_PRICE = 8800 // 추가 매장(2호점부터) 월 요금
export const STORAGE_ADDON_PRICE = 3300 // 추가 용량 10GB당 월 요금
export const BASE_STORAGE_GB = 20 // 매장당 기본 용량

export const MOCK_TODAY = '2026-07-08'
export const NEXT_BILLING_DATE = '2026-07-25'

export function monthlyTotal(storeCount: number) {
  if (storeCount <= 0) return 0
  return BASE_STORE_PRICE + (storeCount - 1) * EXTRA_STORE_PRICE
}

// 월 요금의 이번 달 일할계산 (시작일~말일)
export function prorateMonthly(monthlyAmount: number, dateISO: string = MOCK_TODAY) {
  const d = new Date(dateISO)
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const remainingDays = daysInMonth - d.getDate() + 1
  return {
    remainingDays,
    amount: Math.floor((monthlyAmount * remainingDays) / daysInMonth),
  }
}

// 매장 추가 시 이번 달 일할계산
export function extraStoreProration(dateISO: string = MOCK_TODAY) {
  return prorateMonthly(EXTRA_STORE_PRICE, dateISO)
}

// 매장별 사용량 (storeId -> GB, 미등록 매장은 0)
export const STORAGE_USAGE_GB: Record<string, number> = {
  '1': 7.2,
  '2': 3.4,
  '3': 17.5,
}

// ── 매장 메타 (목업) ──
export const STORE_REGISTERED_AT: Record<string, string> = {
  '1': '2026-03-02',
  '2': '2026-04-14',
  '3': '2026-05-12',
}

export const STORE_EMPLOYEE_COUNT: Record<string, number> = {
  '1': 4,
  '2': 3,
  '3': 2,
}

// ── 매장별 구독 이상 상태 (결제 실패 흐름: PAST_DUE → SUSPENDED → LOCKED) ──
export type StoreSubIssueStatus = 'PAST_DUE' | 'SUSPENDED' | 'LOCKED'

export interface StoreSubIssue {
  status: StoreSubIssueStatus
  failedAt: string // 결제 실패일
  lockAt: string // 로그인 제한 시작일
  deleteAt: string // 데이터 삭제 예정일 (lockAt + 90일)
}

// 신촌점: 6/25 국민카드 결제 실패 → 7/1부터 뷰어 모드 (MOCK_TODAY 7/8 기준)
export const STORE_SUB_ISSUES: Record<string, StoreSubIssue> = {
  '3': { status: 'SUSPENDED', failedAt: '2026-06-25', lockAt: '2026-07-15', deleteAt: '2026-10-13' },
}

export function daysUntil(dateISO: string, fromISO: string = MOCK_TODAY) {
  return Math.ceil((new Date(dateISO).getTime() - new Date(fromISO).getTime()) / 86400000)
}

export function subIssueSummary(issue: StoreSubIssue): string {
  switch (issue.status) {
    case 'PAST_DUE':
      return '말일까지 재결제 시도 중 (정상 이용) · 미결제 시 다음 달 1일부터 뷰어 모드'
    case 'SUSPENDED':
      return `뷰어 모드 제한 중 · ${issue.lockAt} 로그인 제한 (D-${daysUntil(issue.lockAt)}) · ${issue.deleteAt} 데이터 삭제 (D-${daysUntil(issue.deleteAt)})`
    case 'LOCKED':
      return `로그인 제한 중 · ${issue.deleteAt} 데이터 삭제 (D-${daysUntil(issue.deleteAt)})`
  }
}

// ── 매장별 추가 용량 (storeId -> GB) — 세션 내 유지 목업 상태 ──
export const STORE_ADDON_GB: Record<string, number> = {}

export function addStorageAddon(storeId: string, units: number) {
  STORE_ADDON_GB[storeId] = (STORE_ADDON_GB[storeId] ?? 0) + units * 10
}

export function storeStorageLimit(storeId: string) {
  return BASE_STORAGE_GB + (STORE_ADDON_GB[storeId] ?? 0)
}

// ── 등록된 결제 카드 (매장마다 다른 카드를 쓸 수 있다) ──
export interface RegisteredCard {
  id: string
  cardName: string
  cardNumberMasked: string
}

export const REGISTERED_CARDS: RegisteredCard[] = [
  { id: 'card1', cardName: '신한카드', cardNumberMasked: '**** **** **** 1234' },
  { id: 'card2', cardName: '국민카드', cardNumberMasked: '**** **** **** 5678' },
]

// 매장별 결제 카드 배정 (storeId -> cardId) — 세션 내 유지 목업 상태
export const STORE_CARDS: Record<string, string> = {
  '1': 'card1',
  '2': 'card1',
  '3': 'card2',
}

export function assignStoreCard(storeId: string, cardId: string) {
  STORE_CARDS[storeId] = cardId
}

export function cardById(id: string): RegisteredCard | undefined {
  return REGISTERED_CARDS.find((c) => c.id === id)
}

// ── 결제 내역 (카드별로 승인이 분리된다) ──
export type PaymentStatus = 'PAID' | 'FAILED'

export interface PaymentItem {
  label: string
  amount: number
}

export interface PaymentRecord {
  id: string
  date: string
  paidAt: string // 결제 일시 (YYYY-MM-DD HH:mm)
  label: string
  amount: number
  status: PaymentStatus
  cardName: string
  cardNumberMasked: string
  approvalNo: string
  period: string // 이용 기간
  storeIds: string[] // 이 결제가 청구한 매장들
  failReason?: string // 결제 실패 사유 (FAILED일 때)
  items: PaymentItem[]
}

const SHINHAN = { cardName: '신한카드', cardNumberMasked: '**** **** **** 1234' }
const KOOKMIN = { cardName: '국민카드', cardNumberMasked: '**** **** **** 5678' }

export const PAYMENT_HISTORY: PaymentRecord[] = [
  // 신촌점 7월 이용료 재시도 실패 (25일 최초 실패 후 말일까지 재시도)
  {
    id: 'pay5c',
    date: '2026-06-30',
    paidAt: '2026-06-30 09:00',
    label: '2026년 7월 이용료',
    amount: 8800,
    status: 'FAILED',
    ...KOOKMIN,
    approvalNo: '',
    period: '2026-07-01 ~ 2026-07-31',
    storeIds: ['3'],
    failReason: '카드 한도 초과',
    items: [{ label: '추가 매장 - 스타벅스 신촌점', amount: 8800 }],
  },
  {
    id: 'pay5b',
    date: '2026-06-28',
    paidAt: '2026-06-28 09:00',
    label: '2026년 7월 이용료',
    amount: 8800,
    status: 'FAILED',
    ...KOOKMIN,
    approvalNo: '',
    period: '2026-07-01 ~ 2026-07-31',
    storeIds: ['3'],
    failReason: '카드 한도 초과',
    items: [{ label: '추가 매장 - 스타벅스 신촌점', amount: 8800 }],
  },
  {
    id: 'pay6',
    date: '2026-06-25',
    paidAt: '2026-06-25 09:12',
    label: '2026년 7월 이용료',
    amount: 18700,
    status: 'PAID',
    ...SHINHAN,
    approvalNo: '30412577',
    period: '2026-07-01 ~ 2026-07-31',
    storeIds: ['1', '2'],
    items: [
      { label: '기본 매장 - 스타벅스 강남점', amount: 9900 },
      { label: '추가 매장 - 스타벅스 홍대점', amount: 8800 },
    ],
  },
  {
    id: 'pay5',
    date: '2026-06-25',
    paidAt: '2026-06-25 09:12',
    label: '2026년 7월 이용료',
    amount: 8800,
    status: 'FAILED',
    ...KOOKMIN,
    approvalNo: '',
    period: '2026-07-01 ~ 2026-07-31',
    storeIds: ['3'],
    failReason: '카드 한도 초과',
    items: [{ label: '추가 매장 - 스타벅스 신촌점', amount: 8800 }],
  },
  {
    id: 'pay4',
    date: '2026-05-25',
    paidAt: '2026-05-25 09:03',
    label: '2026년 6월 이용료',
    amount: 18700,
    status: 'PAID',
    ...SHINHAN,
    approvalNo: '29984102',
    period: '2026-06-01 ~ 2026-06-30',
    storeIds: ['1', '2'],
    items: [
      { label: '기본 매장 - 스타벅스 강남점', amount: 9900 },
      { label: '추가 매장 - 스타벅스 홍대점', amount: 8800 },
    ],
  },
  {
    id: 'pay3',
    date: '2026-05-25',
    paidAt: '2026-05-25 09:03',
    label: '2026년 6월 이용료',
    amount: 8800,
    status: 'PAID',
    ...KOOKMIN,
    approvalNo: '29984107',
    period: '2026-06-01 ~ 2026-06-30',
    storeIds: ['3'],
    items: [{ label: '추가 매장 - 스타벅스 신촌점', amount: 8800 }],
  },
  {
    id: 'pay2',
    date: '2026-05-12',
    paidAt: '2026-05-12 14:27',
    label: '매장 추가 (2026년 5월 일할계산)',
    amount: 5680,
    status: 'PAID',
    ...KOOKMIN,
    approvalNo: '29610344',
    period: '2026-05-12 ~ 2026-05-31',
    storeIds: ['3'],
    items: [{ label: '추가 매장 - 스타벅스 신촌점 (5/12~5/31 일할계산)', amount: 5680 }],
  },
  {
    id: 'pay1',
    date: '2026-04-25',
    paidAt: '2026-04-25 09:15',
    label: '2026년 5월 이용료',
    amount: 18700,
    status: 'PAID',
    ...SHINHAN,
    approvalNo: '28770461',
    period: '2026-05-01 ~ 2026-05-31',
    storeIds: ['1', '2'],
    items: [
      { label: '기본 매장 - 스타벅스 강남점', amount: 9900 },
      { label: '추가 매장 - 스타벅스 홍대점', amount: 8800 },
    ],
  },
]
