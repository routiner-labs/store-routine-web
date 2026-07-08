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
  color?: string // 뱃지 색상(hex). 없으면 중립(회색) 스타일
}
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'PREP', name: '준비', color: '#3D63DD' },
  { id: 'CLEAN', name: '청소', color: '#3D63DD' },
  { id: 'HYGIENE', name: '위생', color: '#3D63DD' },
  { id: 'STOCK', name: '재고', color: '#3D63DD' },
  { id: 'SAFETY', name: '안전', color: '#3D63DD' },
  { id: 'CLOSE', name: '마감', color: '#3D63DD' },
  { id: 'ETC', name: '기타', color: '#3D63DD' },
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
  docRefs?: string[] // 참조 문서 (문서함 StoreDocument id)
  requestRef?: string // 이 테스크를 만든 원본 요청 id (요청함 참조)
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
  docRefs: string[]
  requestRef?: string
}

// 이때까지 만든 모든 테스크 (마스터 카탈로그)
export const TASK_CATALOG: TaskTemplate[] = [
  {
    id: 't1',
    title: '매장 조명 켜기',
    method:
      '<p>영업 준비의 첫 단계입니다. 어두운 곳이 남지 않도록 아래 순서대로 켭니다.</p><ol><li>홀 메인 조명 → 창가 보조 조명 순서로 켠다.</li><li>주방, 화장실, 창고 조명을 차례로 켠다.</li><li>외부 간판과 입간판 조명을 켠다.</li><li>깜빡이거나 나간 전구가 있으면 요청함에 사진과 함께 등록한다.</li></ol>',
    docRefs: ['doc9'],
    category: 'PREP',
    timing: { start: '08:30', end: '09:00' },
    defaultAssigneeIds: ['emp1'],
  },
  {
    id: 't2',
    title: '포스 전원 확인',
    method:
      '<p>포스와 결제 라인이 정상이어야 영업을 시작할 수 있습니다.</p><ol><li>포스 단말기 전원을 켜고 부팅 완료를 기다린다.</li><li>카드 단말기 연결 상태를 확인한다.</li><li>테스트로 주문 화면을 열어 메뉴가 정상 표시되는지 확인한다.</li><li>오류가 있으면 카드 단말기 오류 대처법 문서를 먼저 확인한다.</li></ol>',
    docRefs: ['doc1', 'doc2'],
    defaultAssigneeIds: ['emp1', 'emp2'],
  },
  {
    id: 't3',
    title: '준비금 확인',
    method:
      '<p>준비금은 매일 오픈 전 확인합니다.</p><ol><li>금고에서 준비금 봉투를 꺼낸다.</li><li>지폐/동전을 세어 <strong>15만원</strong>이 맞는지 확인한다.</li><li>포스 현금함에 넣고 시재 등록을 한다.</li><li>금액이 다르면 임의로 채우지 말고 사장에게 바로 연락한다.</li></ol>',
    docRefs: ['doc1'],
  },
  {
    id: 't4',
    title: '테이블 정리',
    method:
      '<p>첫 손님을 맞기 전 홀 상태를 정돈합니다.</p><ul><li>모든 테이블을 소독 티슈로 닦는다.</li><li>의자를 정렬하고 흔들리는 의자는 표시해 둔다.</li><li>수저통, 냅킨, 티슈 등 집기를 채운다.</li><li>창가 자리는 유리 지문까지 확인한다.</li></ul>',
    docRefs: ['doc9'],
  },
  {
    id: 't5',
    title: '마감 청소',
    method:
      '<p>마감 청소는 다음 날 오픈 품질을 결정합니다. 순서를 지켜주세요.</p><ol><li>홀 바닥을 쓸고 물걸레질한다.</li><li>주방 바닥과 싱크대를 정리한다.</li><li>쓰레기를 분리해 배출한다.</li><li>청소 도구는 제자리에 정리한다.</li><li>완료 후 홀 전체 사진을 남긴다.</li></ol>',
    docRefs: ['doc10', 'doc12'],
    category: 'CLOSE',
    timing: { start: '22:00', end: '22:30' },
  },
  {
    id: 't6',
    title: '창고 재고 정리',
    method:
      '<p>월말 창고 정리는 발주 정확도를 위해 꼭 필요합니다.</p><ol><li>품목을 종류별로 선반에 정리한다(선입선출).</li><li>유통기한 임박 품목은 앞쪽으로 옮기고 표시한다.</li><li>발주 기준 이하로 남은 품목은 사진으로 남긴다.</li><li>부족 품목은 요청함에 재료 부족으로 등록한다.</li></ol>',
    docRefs: ['doc13', 'doc16'],
    recurrenceRule: { ...DEFAULT_RECURRENCE_RULE, freq: 'MONTHLY', monthlyMode: 'DAY', monthDayKind: 'LAST' },
    defaultAssigneeIds: ['emp3'],
  },
  {
    id: 't7',
    title: '신메뉴 교육 자료 숙지',
    method:
      '<p>신메뉴 출시 전 전 직원이 숙지해야 합니다.</p><ul><li>공유된 신메뉴 레시피와 조리 순서를 정독한다.</li><li>알레르기 유발 재료와 안내 멘트를 확인한다.</li><li>이해가 안 되는 부분은 메모로 남겨 공유한다.</li></ul>',
    docRefs: ['doc25'],
    recurrence: 'ONCE',
  },
  {
    id: 't8',
    title: '냉장고 온도 점검',
    method:
      '<p>식자재 안전을 위한 필수 점검입니다.</p><ol><li>냉장고 상단 온도계를 확인한다.</li><li><strong>5도 이하</strong>인지 확인하고 수치를 기록한다.</li><li>기준 초과 시 문이 완전히 닫혔는지 먼저 확인한다.</li><li>30분 후에도 높으면 요청함에 장비 고장으로 등록한다.</li></ol>',
    docRefs: ['doc14'],
  },
  {
    id: 't9',
    title: '화장실 점검',
    method:
      '<p>화장실 상태는 매장 위생 인상을 좌우합니다.</p><ul><li>변기, 세면대, 바닥 청결 상태를 확인한다.</li><li>휴지, 손세정제, 핸드타월을 보충한다.</li><li>배수구 냄새가 나면 물을 한 번 흘려보낸다.</li></ul>',
    docRefs: ['doc11'],
    category: 'HYGIENE',
    timing: { start: '', end: '15:00' },
    recurrenceRule: { ...DEFAULT_RECURRENCE_RULE, freq: 'WEEKLY', weekdays: [0, 3] },
  },
  {
    id: 't10',
    title: '배달앱 주문 확인',
    method:
      '<p>미확인 주문은 바로 고객 클레임으로 이어집니다.</p><ol><li>배달의민족, 쿠팡이츠 앱을 연다.</li><li>접수 대기/미확인 주문이 없는지 확인한다.</li><li>품절 메뉴가 있으면 즉시 품절 처리한다.</li></ol>',
    docRefs: ['doc8'],
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
    method:
      '<p>배출 규정을 지키지 않으면 과태료가 나올 수 있습니다.</p><ul><li>일반, 음식물, 재활용을 분리해 배출한다.</li><li>박스는 테이프를 제거하고 접어서 배출한다.</li><li>배출 상태를 사진으로 남긴다.</li></ul>',
    docRefs: ['doc10'],
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
    docRefs: tpl?.docRefs ?? [],
    requestRef: tpl?.requestRef,
  }
}

export function createTasksForDate(_date: string): StoreTask[] {
  return [
    ...DEFAULT_COMMON.map((id) => makeTask(id, 'COMMON')),
    ...DEFAULT_EXTRA.map((id) => makeTask(id, 'EXTRA')),
  ]
}

// 요청함 항목으로 테스크를 생성하고 오늘 업무리스트에 추가한다.
// 모듈 싱글턴이므로 업무리스트 페이지 진입 시 반영된다. (목업: 새로고침 시 초기화)
let requestTaskSeq = 0

// 해당 요청으로 이미 테스크를 만들었는지 확인
export function hasTaskForRequest(requestId: string): boolean {
  return TASK_CATALOG.some((t) => t.requestRef === requestId)
}

// 요청 삭제 시 그 요청으로 만든 테스크를 카탈로그와 기본 리스트에서 함께 제거한다.
export function removeTasksForRequest(requestId: string) {
  const ids = TASK_CATALOG.filter((t) => t.requestRef === requestId).map((t) => t.id)
  if (ids.length === 0) return
  for (const id of ids) {
    const ci = TASK_CATALOG.findIndex((t) => t.id === id)
    if (ci !== -1) TASK_CATALOG.splice(ci, 1)
    for (const list of [DEFAULT_COMMON, DEFAULT_EXTRA]) {
      const li = list.indexOf(id)
      if (li !== -1) list.splice(li, 1)
    }
  }
}

export function registerTaskFromRequest(input: {
  title: string
  method: string
  category: TaskCategory
  kind: TaskKind
  docRefs?: string[]
  requestRef?: string
}): string {
  requestTaskSeq += 1
  const id = `req-task-${requestTaskSeq}`
  TASK_CATALOG.push({
    id,
    title: input.title,
    method: input.method,
    category: input.category,
    recurrence: 'ONCE',
    docRefs: input.docRefs ?? [],
    requestRef: input.requestRef,
  })
  if (input.kind === 'COMMON') DEFAULT_COMMON.push(id)
  else DEFAULT_EXTRA.push(id)
  return id
}
