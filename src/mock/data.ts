import type {
  Checklist,
  AttendanceRecord,
  SpecialInstruction,
  EmployeeRequest,
  RequestReply,
  ActivityLog,
  RequestVisibility,
} from '@/types'

export interface RequestCategory {
  id: string
  name: string
  color?: string
}

export const REQUEST_CATEGORIES: RequestCategory[] = [
  { id: 'cat-material', name: '재료 부족', color: '#C2410C' },
  { id: 'cat-equipment', name: '장비 고장', color: '#B91C1C' },
  { id: 'cat-schedule', name: '근무 변경', color: '#3D63DD' },
  { id: 'cat-customer', name: '고객 이슈', color: '#6D28D9' },
  { id: 'cat-facility', name: '청소 시설', color: '#15803D' },
  { id: 'cat-etc', name: '기타' },
]

export const mockAttendance: AttendanceRecord[] = [
  {
    employeeId: '1',
    employeeName: '김민수',
    status: 'CLOCKED_IN',
    scheduledStart: '10:00',
    scheduledEnd: '17:00',
    clockedIn: '09:58',
  },
  {
    employeeId: '2',
    employeeName: '이서윤',
    status: 'SCHEDULED',
    scheduledStart: '16:00',
    scheduledEnd: '22:00',
  },
]

export const mockChecklists: Checklist[] = [
  {
    id: '1',
    title: '오픈 체크리스트',
    type: 'OPEN',
    items: [
      { id: '1-1', title: '매장 조명 켜기', description: '홀, 주방, 창고 조명을 모두 켭니다.', completionType: 'CHECK', status: 'DONE' },
      { id: '1-2', title: '포스 전원 확인', description: '포스 전원을 켜고 정상 작동 여부를 확인합니다.', completionType: 'CHECK', status: 'DONE' },
      { id: '1-3', title: '준비금 확인', description: '준비금 금액을 확인하고 입력합니다.', completionType: 'NUMBER', status: 'DONE', value: 150000 },
      { id: '1-4', title: '냉장고 온도 확인', description: '냉장고 상단 온도계를 확인하고 수치를 기록합니다.', completionType: 'NUMBER', status: 'NEEDS_REVIEW', value: 9 },
      { id: '1-5', title: '테이블 정리', description: '모든 테이블과 의자 상태를 정리합니다.', completionType: 'CHECK', status: 'DONE' },
      { id: '1-6', title: '배달앱 주문 확인', description: '배달앱 주문 접수 상태를 확인합니다.', completionType: 'CHECK', status: 'DONE' },
      { id: '1-7', title: '부족 재고 촬영', description: '부족한 재고를 사진으로 기록합니다.', completionType: 'PHOTO', status: 'PENDING' },
      { id: '1-8', title: '청소 도구 정리', description: '청소 도구가 제자리에 있는지 확인합니다.', completionType: 'CHECK', status: 'DONE' },
      { id: '1-9', title: '오픈 준비 최종 확인', description: '매장 전체를 둘러보고 오픈 상태를 점검합니다.', completionType: 'CHECK', status: 'PENDING' },
      { id: '1-10', title: '특이사항 메모', description: '전달할 특이사항이 있으면 메모를 남깁니다.', completionType: 'MEMO', status: 'PENDING' },
    ],
  },
  {
    id: '2',
    title: '마감 체크리스트',
    type: 'CLOSE',
    items: [
      { id: '2-1', title: '포스 마감', description: '포스 마감 처리 후 매출 금액을 확인합니다.', completionType: 'NUMBER', status: 'PENDING' },
      { id: '2-2', title: '현금 정리', description: '준비금을 제외한 금액을 정리합니다.', completionType: 'NUMBER', status: 'PENDING' },
      { id: '2-3', title: '창고 문 확인', description: '창고 문이 잠겼는지 확인합니다.', completionType: 'CHECK', status: 'PENDING' },
      { id: '2-4', title: '가스 밸브 확인', description: '가스 밸브 상태를 사진으로 기록합니다.', completionType: 'PHOTO', status: 'PENDING' },
      { id: '2-5', title: '매장 조명 끄기', description: '홀, 주방, 창고 조명을 모두 끕니다.', completionType: 'CHECK', status: 'PENDING' },
      { id: '2-6', title: '출입문 잠금', description: '출입문 잠금 상태를 사진으로 남깁니다.', completionType: 'PHOTO', status: 'PENDING' },
      { id: '2-7', title: '특이사항 작성', description: '고객 이슈나 장비 이상이 있으면 작성합니다.', completionType: 'MEMO', status: 'PENDING' },
    ],
  },
  {
    id: '3',
    title: '청소 체크리스트',
    type: 'CLEANING',
    items: [
      { id: '3-1', title: '홀 바닥 청소', description: '빗자루와 밀대로 바닥을 정리합니다.', completionType: 'CHECK', status: 'DONE' },
      { id: '3-2', title: '화장실 청소', description: '변기, 세면대, 바닥을 청소합니다.', completionType: 'CHECK', status: 'DONE' },
      { id: '3-3', title: '주방 청소', description: '조리대와 싱크대, 후드를 점검합니다.', completionType: 'CHECK', status: 'PENDING' },
      { id: '3-4', title: '쓰레기 배출', description: '일반과 재활용 쓰레기를 분리 배출합니다.', completionType: 'CHECK', status: 'DONE' },
    ],
  },
]

export const mockSpecialInstructions: SpecialInstruction[] = [
  {
    id: '1',
    title: '오늘 7시 예약 테이블 세팅',
    content: '4인 테이블 2개를 붙여 예약석으로 준비해 주세요. 생일 파티용 안내 카드도 함께 올려주세요.',
    assignedTo: '이서윤',
    status: 'READ',
  },
  {
    id: '2',
    title: '신메뉴 포스터 부착',
    content: '창고 앞 포스터 3장을 계산대와 입구 쪽에 부착해 주세요.',
    assignedTo: '김민수',
    status: 'DONE',
  },
]

export const mockRequests: EmployeeRequest[] = [
  { id: '1', type: '재료 부족', content: '우유가 2박스 부족합니다. 오늘 오픈 전에 보충이 필요합니다.', status: 'CONFIRMED', visibility: 'ALL', createdAt: '2026-06-29 14:32', employeeName: '김민수', hasPhoto: true },
  { id: '11', type: '재료 부족', content: '시럽 재고가 거의 없습니다. 3일치 정도만 남았습니다.', status: 'CONFIRMED', visibility: 'ALL', createdAt: '2026-06-28 09:20', employeeName: '박서준', hasPhoto: false },
  { id: '12', type: '청소 시설', content: '홀 쪽 창문에 금이 갔습니다. 확인이 필요합니다.', status: 'CONFIRMED', visibility: 'ALL', createdAt: '2026-06-27 15:10', employeeName: '이서윤', hasPhoto: true },
  { id: '13', type: '근무 변경', content: '7월 3일 가족 행사로 대타를 구할 수 있을지 문의드립니다.', status: 'CONFIRMED', visibility: 'OWNER_ONLY', createdAt: '2026-06-27 17:40', employeeName: '박서준', hasPhoto: false },
  { id: '14', type: '기타', content: '에어컨 온도를 조금 낮춰주실 수 있을까요? 더운 구역이 있습니다.', status: 'CONFIRMED', visibility: 'ALL', createdAt: '2026-06-29 12:50', employeeName: '김민수', hasPhoto: false },
  { id: '15', type: '재료 부족', content: '샷 시럽이 2병 부족합니다. 금요일 전까지 입고가 필요합니다.', status: 'CONFIRMED', visibility: 'ALL', createdAt: '2026-06-28 09:55', employeeName: '최수아', hasPhoto: false },
  { id: '2', type: '근무 변경', content: '이번 주 금요일 개인 사정으로 2시간 일찍 퇴근 가능한지 문의드립니다.', status: 'REQUESTED', visibility: 'OWNER_ONLY', createdAt: '2026-06-30 11:15', employeeName: '이서윤', hasPhoto: false },
  { id: '21', type: '재료 부족', content: '냉동 베이글 재고가 5개 남았습니다. 금요일 전 입고가 필요합니다.', status: 'REQUESTED', visibility: 'ALL', createdAt: '2026-06-30 08:30', employeeName: '박서준', hasPhoto: false },
  { id: '22', type: '청소 시설', content: '주방 후드 필터가 많이 더럽습니다. 교체가 필요해 보입니다.', status: 'REQUESTED', visibility: 'ALL', createdAt: '2026-06-30 09:10', employeeName: '최수아', hasPhoto: true },
  { id: '23', type: '기타', content: '다음 달 공휴일 근무 일정을 미리 공유받을 수 있을까요?', status: 'REQUESTED', visibility: 'OWNER_ONLY', createdAt: '2026-06-30 10:45', employeeName: '최수아', hasPhoto: false },
  { id: '24', type: '장비 고장', content: '포스 영수증 프린터가 중간에 계속 끊깁니다. 점검이 필요합니다.', status: 'REQUESTED', visibility: 'ALL', createdAt: '2026-06-30 13:22', employeeName: '김민수', hasPhoto: true },
  { id: '25', type: '고객 이슈', content: '점심 고객님이 사인 카드 분실 문의를 남기셨습니다. 확인 부탁드립니다.', status: 'REQUESTED', visibility: 'ALL', createdAt: '2026-06-30 14:30', employeeName: '이서윤', hasPhoto: false },
  { id: '3', type: '장비 고장', content: '커피머신 스팀 쪽에서 물이 계속 새고 있습니다. 점검이 필요합니다.', status: 'IN_PROGRESS', visibility: 'OWNER_ONLY', createdAt: '2026-06-30 09:44', employeeName: '김민수', hasPhoto: true },
  { id: '31', type: '고객 이슈', content: '배달 주문 리뷰에 위생 관련 부정 리뷰가 올라왔습니다. 대응이 필요합니다.', status: 'IN_PROGRESS', visibility: 'OWNER_ONLY', createdAt: '2026-06-29 20:15', employeeName: '이서윤', hasPhoto: false },
  { id: '32', type: '장비 고장', content: '냉장 쇼케이스 온도가 계속 올라가고 있습니다. 설정은 3도인데 현재 8도입니다.', status: 'IN_PROGRESS', visibility: 'ALL', createdAt: '2026-06-29 14:00', employeeName: '박서준', hasPhoto: true },
  { id: '33', type: '재료 부족', content: '아이스컵과 박스가 부족합니다. 이번 주 내 입고가 필요합니다.', status: 'IN_PROGRESS', visibility: 'ALL', createdAt: '2026-06-30 07:50', employeeName: '최수아', hasPhoto: false },
  { id: '34', type: '청소 시설', content: '창고 안쪽 선반 하나가 흔들립니다. 교체가 필요합니다.', status: 'IN_PROGRESS', visibility: 'ALL', createdAt: '2026-06-29 10:00', employeeName: '김민수', hasPhoto: true },
  { id: '35', type: '청소 시설', content: '화장실 문손잡이가 느슨합니다. 수리가 필요합니다.', status: 'IN_PROGRESS', visibility: 'ALL', createdAt: '2026-06-28 11:30', employeeName: '최수아', hasPhoto: true },
  { id: '41', type: '청소 시설', content: '홀 화장실 변기 물이 약하게 내려가던 문제를 조치했습니다.', status: 'DONE', visibility: 'ALL', createdAt: '2026-06-28 16:20', employeeName: '박서준', hasPhoto: false },
  { id: '42', type: '재료 부족', content: '버터가 거의 소진되어 긴급 발주 요청을 완료했습니다.', status: 'DONE', visibility: 'ALL', createdAt: '2026-06-27 10:05', employeeName: '최수아', hasPhoto: true },
  { id: '43', type: '고객 이슈', content: '오후 3시 테이블 4번 고객 컴플레인을 응대 완료했습니다.', status: 'DONE', visibility: 'OWNER_ONLY', createdAt: '2026-06-28 18:30', employeeName: '이서윤', hasPhoto: true },
  { id: '44', type: '근무 변경', content: '6월 25일부터 27일까지 근무 조정이 승인되었습니다.', status: 'DONE', visibility: 'OWNER_ONLY', createdAt: '2026-06-23 09:00', employeeName: '김민수', hasPhoto: false },
  { id: '45', type: '장비 고장', content: '블렌더 스위치 이상 문제를 수리 완료했습니다.', status: 'DONE', visibility: 'ALL', createdAt: '2026-06-24 11:20', employeeName: '박서준', hasPhoto: true },
  { id: '46', type: '기타', content: '와이파이 비밀번호 안내문 제작 요청이 반영되었습니다.', status: 'DONE', visibility: 'ALL', createdAt: '2026-06-23 14:00', employeeName: '최수아', hasPhoto: false },
  { id: '51', type: '근무 변경', content: '이번 주 일요일 오전 근무를 오후로 바꾸는 요청은 반려되었습니다.', status: 'REJECTED', visibility: 'OWNER_ONLY', createdAt: '2026-06-26 14:00', employeeName: '이서윤', hasPhoto: false },
  { id: '52', type: '기타', content: '직원 할인 범위를 베이커리까지 확대하는 요청은 반려되었습니다.', status: 'REJECTED', visibility: 'OWNER_ONLY', createdAt: '2026-06-25 18:30', employeeName: '박서준', hasPhoto: false },
  { id: '53', type: '근무 변경', content: '다음 주 토요일 결근 요청은 승인되지 않았습니다.', status: 'REJECTED', visibility: 'OWNER_ONLY', createdAt: '2026-06-24 19:00', employeeName: '최수아', hasPhoto: false },
  { id: '54', type: '기타', content: '주차 공간 안내판 부착 요청은 우선 보류되었습니다.', status: 'REJECTED', visibility: 'ALL', createdAt: '2026-06-22 10:00', employeeName: '김민수', hasPhoto: false },
  { id: '55', type: '장비 고장', content: '에스프레소 머신 압력 이슈는 증상 재현이 되지 않아 반려되었습니다.', status: 'REJECTED', visibility: 'ALL', createdAt: '2026-06-21 15:45', employeeName: '박서준', hasPhoto: false },
  { id: '56', type: '고객 이슈', content: '테이블 2번 고객 응대 관련 인사 조치 요청은 반려되었습니다.', status: 'REJECTED', visibility: 'OWNER_ONLY', createdAt: '2026-06-25 15:30', employeeName: '이서윤', hasPhoto: false },
]

export const mockReplies: RequestReply[] = [
  {
    id: 'r1',
    requestId: '1',
    content: '확인했습니다. 내일 오전 배송 예정입니다.',
    authorName: '사장',
    authorRole: 'OWNER',
    createdAt: '2026-06-29 16:10',
  },
  {
    id: 'r1-1',
    requestId: '1',
    parentId: 'r1',
    content: '감사합니다. 오픈 전에 받으면 문제없습니다.',
    authorName: '김민수',
    authorRole: 'EMPLOYEE',
    createdAt: '2026-06-29 16:25',
  },
  {
    id: 'r3',
    requestId: '2',
    content: '금요일 마감은 유지하고 2시간 조기 퇴근으로 조정하겠습니다.',
    authorName: '사장',
    authorRole: 'OWNER',
    createdAt: '2026-06-30 12:40',
  },
  {
    id: 'r2',
    requestId: '3',
    content: 'A/S 업체에 접수했습니다. 내일 오후 방문 예정입니다.',
    authorName: '사장',
    authorRole: 'OWNER',
    createdAt: '2026-06-30 10:20',
  },
  {
    id: 'r2-1',
    requestId: '3',
    parentId: 'r2',
    content: '방문 시간이 확정되면 공유 부탁드립니다.',
    authorName: '김민수',
    authorRole: 'EMPLOYEE',
    createdAt: '2026-06-30 10:35',
  },
]

export const mockActivityLogs: ActivityLog[] = [
  { id: 'a1', requestId: '1', type: 'CREATED', actorName: '김민수', actorRole: 'EMPLOYEE', createdAt: '2026-06-29 14:32' },
  { id: 'a2', requestId: '1', type: 'STATUS_CHANGED', actorName: '사장', actorRole: 'OWNER', detail: '확인 대기 → 확인 완료', createdAt: '2026-06-29 15:44' },
  { id: 'a3', requestId: '1', type: 'COMMENT_ADDED', actorName: '사장', actorRole: 'OWNER', createdAt: '2026-06-29 16:10' },
  { id: 'a4', requestId: '2', type: 'CREATED', actorName: '이서윤', actorRole: 'EMPLOYEE', createdAt: '2026-06-30 11:15' },
  { id: 'a5', requestId: '3', type: 'CREATED', actorName: '김민수', actorRole: 'EMPLOYEE', createdAt: '2026-06-30 09:44' },
  { id: 'a6', requestId: '3', type: 'STATUS_CHANGED', actorName: '사장', actorRole: 'OWNER', detail: '확인 대기 → 처리 중', createdAt: '2026-06-30 10:05' },
  { id: 'a7', requestId: '3', type: 'COMMENT_ADDED', actorName: '사장', actorRole: 'OWNER', createdAt: '2026-06-30 10:20' },
]

let requestSeq = 0

export function addRequest(input: {
  type: string
  content: string
  visibility: RequestVisibility
  hasPhoto: boolean
  employeeName: string
}): string {
  requestSeq += 1
  const id = `owner-req-${requestSeq}`
  mockRequests.unshift({
    id,
    type: input.type,
    content: input.content,
    status: 'REQUESTED',
    visibility: input.visibility,
    createdAt: '2026-06-30 방금',
    employeeName: input.employeeName,
    hasPhoto: input.hasPhoto,
  })
  mockActivityLogs.push({
    id: `a-${id}`,
    requestId: id,
    type: 'CREATED',
    actorName: input.employeeName,
    actorRole: 'OWNER',
    createdAt: '2026-06-30 방금',
  })
  return id
}
