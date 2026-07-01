import type { CompletionType } from '@/types'

export type TaskKind = 'COMMON' | 'EXTRA'

export interface TaskTemplate {
  id: string
  title: string
  completionType: CompletionType
  method: string // 수행 방법 — 게시글 형태 HTML(텍스트 + 인라인 이미지)
}

export interface StoreTask {
  id: string // 리스트 내 인스턴스 id (`${kind}-${catalogId}`)
  catalogId: string // 원본 카탈로그 테스크 id
  title: string
  completionType: CompletionType
  method: string
  kind: TaskKind
  assigneeIds: string[]
  done: boolean
}

// 이때까지 만든 모든 테스크 (마스터 카탈로그)
export const TASK_CATALOG: TaskTemplate[] = [
  {
    id: 't1',
    title: '매장 조명 켜기',
    completionType: 'CHECK',
    method: '홀·주방·화장실·창고 조명 스위치를 순서대로 모두 켠다. 간판 조명도 함께 켠다.',
  },
  {
    id: 't2',
    title: '포스 전원 확인',
    completionType: 'CHECK',
    method: '포스 단말기 전원을 켜고 부팅이 끝나면 카드 단말기 연결 상태까지 확인한다.',
  },
  {
    id: 't3',
    title: '준비금 확인',
    completionType: 'NUMBER',
    method: '금고에서 준비금을 꺼내 포스에 넣고, 금액이 15만원이 맞는지 확인 후 숫자로 입력한다.',
  },
  {
    id: 't4',
    title: '테이블 정리',
    completionType: 'CHECK',
    method: '모든 테이블을 소독 티슈로 닦고 의자를 정렬한다. 수저통·냅킨 등 집기를 채운다.',
  },
  {
    id: 't5',
    title: '마감 청소',
    completionType: 'CHECK',
    method: '홀 바닥을 쓸고 닦은 뒤 주방 바닥과 싱크대를 정리한다. 쓰레기를 배출한다.',
  },
  {
    id: 't6',
    title: '창고 재고 정리',
    completionType: 'PHOTO',
    method: '창고 품목을 종류별로 정리하고, 부족한 품목은 사진으로 남긴다.',
  },
  {
    id: 't7',
    title: '신메뉴 교육 자료 숙지',
    completionType: 'MEMO',
    method: '공유된 신메뉴 레시피/조리법 자료를 읽고 이해한 내용을 메모로 남긴다.',
  },
  {
    id: 't8',
    title: '냉장고 온도 점검',
    completionType: 'NUMBER',
    method: '냉장고 상단 온도계를 확인하고 5도 이하인지 숫자로 입력한다.',
  },
  {
    id: 't9',
    title: '화장실 점검',
    completionType: 'CHECK',
    method: '변기·세면대·바닥 청결 상태를 확인하고 휴지·비누 등 소모품을 보충한다.',
  },
  {
    id: 't10',
    title: '배달앱 주문 확인',
    completionType: 'CHECK',
    method: '배달의민족·쿠팡이츠 앱을 열어 접수 상태와 미확인 주문이 없는지 확인한다.',
  },
  {
    id: 't11',
    title: 'CCTV 정상 작동 확인',
    completionType: 'CHECK',
    method: '관제 화면에서 모든 채널이 정상적으로 녹화 중인지 확인한다.',
  },
  {
    id: 't12',
    title: '쓰레기 분리수거',
    completionType: 'PHOTO',
    method: '일반·음식물·재활용을 분리해 배출하고 배출 상태를 사진으로 남긴다.',
  },
]

// 날짜별 기본 리스트 구성
const DEFAULT_COMMON = ['t1', 't2', 't3', 't4', 't5']
const DEFAULT_EXTRA = ['t6', 't7', 't8']
const DEFAULT_ASSIGN: Record<string, string[]> = {
  t1: ['emp1'],
  t2: ['emp1', 'emp2'],
  t6: ['emp3'],
}

// 데모용 완료 처리
const DEFAULT_DONE = new Set(['t1', 't3', 't6'])

export function makeTask(catalogId: string, kind: TaskKind): StoreTask {
  const tpl = TASK_CATALOG.find((t) => t.id === catalogId)
  return {
    id: `${kind}-${catalogId}`,
    catalogId,
    title: tpl?.title ?? '알 수 없는 테스크',
    completionType: tpl?.completionType ?? 'CHECK',
    method: tpl?.method ?? '',
    kind,
    assigneeIds: DEFAULT_ASSIGN[catalogId] ?? [],
    done: DEFAULT_DONE.has(catalogId),
  }
}

export function createTasksForDate(_date: string): StoreTask[] {
  return [
    ...DEFAULT_COMMON.map((id) => makeTask(id, 'COMMON')),
    ...DEFAULT_EXTRA.map((id) => makeTask(id, 'EXTRA')),
  ]
}
