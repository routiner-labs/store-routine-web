export type TaskKind = 'COMMON' | 'EXTRA'
export type Recurrence = 'RECURRING' | 'ONCE' // 반복(주기) / 단건

// 수행 시점 (시작 ~ 종료 시각, 둘 다 비면 상시)
export interface TaskTiming {
  start: string // 'HH:MM' | ''
  end: string // 'HH:MM' | ''
}
export const DEFAULT_TIMING: TaskTiming = { start: '', end: '' }

// 카테고리 (사용자 관리)
export type TaskCategory = string // 카테고리 id
export interface Category {
  id: string
  name: string
}
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'PREP', name: '준비' },
  { id: 'CLEAN', name: '청소' },
  { id: 'HYGIENE', name: '위생' },
  { id: 'STOCK', name: '재고' },
  { id: 'SAFETY', name: '안전' },
  { id: 'CLOSE', name: '마감' },
  { id: 'ETC', name: '기타' },
]

export type RecurrenceFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
export type MonthlyMode = 'DAY' | 'NTH_WEEKDAY' // 날짜 지정 / 몇째주 요일
export type MonthDayKind = 'FIRST' | 'LAST' | 'SPECIFIC' // 월초 / 월말 / 특정일

export interface RecurrenceRule {
  freq: RecurrenceFreq
  interval: number // N일/N주/N개월/N년 마다
  weekdays: number[] // WEEKLY: 0=월 .. 6=일
  monthlyMode: MonthlyMode
  monthDayKind: MonthDayKind // MONTHLY + DAY 모드
  monthDay: number // SPECIFIC 일자 (1~31)
  nthWeek: number // MONTHLY + NTH_WEEKDAY: 1~5, -1=마지막
  nthWeekday: number // 0=월 .. 6=일
}

export const DEFAULT_RECURRENCE_RULE: RecurrenceRule = {
  freq: 'DAILY',
  interval: 1,
  weekdays: [0, 1, 2, 3, 4],
  monthlyMode: 'DAY',
  monthDayKind: 'FIRST',
  monthDay: 1,
  nthWeek: 1,
  nthWeekday: 0,
}

export interface TaskTemplate {
  id: string
  title: string
  method: string // 수행 방법 — 게시글 형태 HTML(텍스트 + 인라인 이미지)
  active?: boolean // 활성 여부 (undefined = 활성)
  category?: TaskCategory
  timing?: TaskTiming
  recurrence?: Recurrence
  recurrenceRule?: RecurrenceRule
  recurStart?: string // 반복 시작일 'YYYY-MM-DD'
  recurEnd?: string // 반복 종료일 (빈 값=무기한)
  defaultAssigneeIds?: string[] // 반복 업무 기본 담당자
}

export interface StoreTask {
  id: string // 리스트 내 인스턴스 id (`${kind}-${catalogId}`)
  catalogId: string // 원본 카탈로그 테스크 id
  title: string
  method: string
  category: TaskCategory
  timing: TaskTiming
  recurrence: Recurrence
  recurrenceRule: RecurrenceRule
  kind: TaskKind
  assigneeIds: string[]
  done: boolean
}

// 이때까지 만든 모든 테스크 (마스터 카탈로그)
export const TASK_CATALOG: TaskTemplate[] = [
  {
    id: 't1',
    title: '매장 조명 켜기',
    method: '홀·주방·화장실·창고 조명 스위치를 순서대로 모두 켠다. 간판 조명도 함께 켠다.',
    category: 'PREP',
    timing: { start: '08:30', end: '09:00' },
    defaultAssigneeIds: ['emp1'],
  },
  {
    id: 't2',
    title: '포스 전원 확인',
    method: '포스 단말기 전원을 켜고 부팅이 끝나면 카드 단말기 연결 상태까지 확인한다.',
    defaultAssigneeIds: ['emp1', 'emp2'],
  },
  {
    id: 't3',
    title: '준비금 확인',
    method: '금고에서 준비금을 꺼내 포스에 넣고, 금액이 15만원이 맞는지 확인한다.',
  },
  {
    id: 't4',
    title: '테이블 정리',
    method: '모든 테이블을 소독 티슈로 닦고 의자를 정렬한다. 수저통·냅킨 등 집기를 채운다.',
  },
  {
    id: 't5',
    title: '마감 청소',
    method: '홀 바닥을 쓸고 닦은 뒤 주방 바닥과 싱크대를 정리한다. 쓰레기를 배출한다.',
    category: 'CLOSE',
    timing: { start: '22:00', end: '22:30' },
  },
  {
    id: 't6',
    title: '창고 재고 정리',
    method: '창고 품목을 종류별로 정리하고, 부족한 품목은 사진으로 남긴다.',
    recurrenceRule: { ...DEFAULT_RECURRENCE_RULE, freq: 'MONTHLY', monthlyMode: 'DAY', monthDayKind: 'LAST' },
    defaultAssigneeIds: ['emp3'],
  },
  {
    id: 't7',
    title: '신메뉴 교육 자료 숙지',
    method: '공유된 신메뉴 레시피/조리법 자료를 읽고 이해한 내용을 메모로 남긴다.',
    recurrence: 'ONCE',
  },
  {
    id: 't8',
    title: '냉장고 온도 점검',
    method: '냉장고 상단 온도계를 확인하고 5도 이하인지 확인한다.',
  },
  {
    id: 't9',
    title: '화장실 점검',
    method: '변기·세면대·바닥 청결 상태를 확인하고 휴지·비누 등 소모품을 보충한다.',
    category: 'HYGIENE',
    timing: { start: '', end: '15:00' },
    recurrenceRule: { ...DEFAULT_RECURRENCE_RULE, freq: 'WEEKLY', weekdays: [0, 3] },
  },
  {
    id: 't10',
    title: '배달앱 주문 확인',
    method: '배달의민족·쿠팡이츠 앱을 열어 접수 상태와 미확인 주문이 없는지 확인한다.',
  },
  {
    id: 't11',
    title: 'CCTV 정상 작동 확인',
    method: '관제 화면에서 모든 채널이 정상적으로 녹화 중인지 확인한다.',
    active: false,
  },
  {
    id: 't12',
    title: '쓰레기 분리수거',
    method: '일반·음식물·재활용을 분리해 배출하고 배출 상태를 사진으로 남긴다.',
  },
]

// 날짜별 기본 리스트 구성
const DEFAULT_COMMON = ['t1', 't2', 't3', 't4', 't5']
const DEFAULT_EXTRA = ['t6', 't7', 't8']

// 데모용 완료 처리
const DEFAULT_DONE = new Set(['t1', 't3', 't6'])

export function makeTask(catalogId: string, kind: TaskKind): StoreTask {
  const tpl = TASK_CATALOG.find((t) => t.id === catalogId)
  return {
    id: `${kind}-${catalogId}`,
    catalogId,
    title: tpl?.title ?? '알 수 없는 테스크',
    method: tpl?.method ?? '',
    category: tpl?.category ?? 'ETC',
    timing: tpl?.timing ?? DEFAULT_TIMING,
    recurrence: tpl?.recurrence ?? 'RECURRING',
    recurrenceRule: tpl?.recurrenceRule ?? DEFAULT_RECURRENCE_RULE,
    kind,
    assigneeIds: tpl?.defaultAssigneeIds ?? [],
    done: DEFAULT_DONE.has(catalogId),
  }
}

export function createTasksForDate(_date: string): StoreTask[] {
  return [
    ...DEFAULT_COMMON.map((id) => makeTask(id, 'COMMON')),
    ...DEFAULT_EXTRA.map((id) => makeTask(id, 'EXTRA')),
  ]
}
