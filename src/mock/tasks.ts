import type { CompletionType } from '@/types'

export type TaskKind = 'COMMON' | 'EXTRA'

export interface TaskTemplate {
  id: string
  title: string
  completionType: CompletionType
}

export interface StoreTask {
  id: string // 리스트 내 인스턴스 id (`${kind}-${catalogId}`)
  catalogId: string // 원본 카탈로그 테스크 id
  title: string
  completionType: CompletionType
  kind: TaskKind
  assigneeIds: string[]
  done: boolean
}

// 이때까지 만든 모든 테스크 (마스터 카탈로그)
export const TASK_CATALOG: TaskTemplate[] = [
  { id: 't1', title: '매장 조명 켜기', completionType: 'CHECK' },
  { id: 't2', title: '포스 전원 확인', completionType: 'CHECK' },
  { id: 't3', title: '준비금 확인', completionType: 'NUMBER' },
  { id: 't4', title: '테이블 정리', completionType: 'CHECK' },
  { id: 't5', title: '마감 청소', completionType: 'CHECK' },
  { id: 't6', title: '창고 재고 정리', completionType: 'PHOTO' },
  { id: 't7', title: '신메뉴 교육 자료 숙지', completionType: 'MEMO' },
  { id: 't8', title: '냉장고 온도 점검', completionType: 'NUMBER' },
  { id: 't9', title: '화장실 점검', completionType: 'CHECK' },
  { id: 't10', title: '배달앱 주문 확인', completionType: 'CHECK' },
  { id: 't11', title: 'CCTV 정상 작동 확인', completionType: 'CHECK' },
  { id: 't12', title: '쓰레기 분리수거', completionType: 'PHOTO' },
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
