import type { Checklist, AttendanceRecord, SpecialInstruction, EmployeeRequest, RequestReply, ActivityLog } from '@/types'

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
    employeeName: '이지은',
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
      { id: '1-1', title: '매장 조명 켜기', description: '홀, 주방, 화장실, 창고 조명을 모두 켠다.', completionType: 'CHECK', status: 'DONE' },
      { id: '1-2', title: '포스 전원 확인', description: '포스 전원을 켜고 정상 작동 여부를 확인한다.', completionType: 'CHECK', status: 'DONE' },
      { id: '1-3', title: '준비금 확인', description: '금고에서 준비금을 꺼내 포스에 넣는다.', completionType: 'NUMBER', status: 'DONE', value: 150000 },
      { id: '1-4', title: '냉장고 온도 확인', description: '냉장고 상단 온도계를 확인하고 5도 이하인지 입력하세요.', completionType: 'NUMBER', status: 'NEEDS_REVIEW', value: 9 },
      { id: '1-5', title: '테이블 정리', description: '모든 테이블을 닦고 의자를 정리한다.', completionType: 'CHECK', status: 'DONE' },
      { id: '1-6', title: '배달앱 주문 확인', description: '배달의민족, 쿠팡이츠 앱을 열어 주문 접수 상태를 확인한다.', completionType: 'CHECK', status: 'DONE' },
      { id: '1-7', title: '재고 부족 품목 확인', description: '냉장고와 창고를 확인하고 부족한 품목을 사진으로 찍는다.', completionType: 'PHOTO', status: 'PENDING' },
      { id: '1-8', title: '청소 도구 정리', description: '청소 도구가 제자리에 있는지 확인한다.', completionType: 'CHECK', status: 'DONE' },
      { id: '1-9', title: '영업 준비 완료', description: '매장 전체를 한번 돌며 영업 준비 상태를 확인한다.', completionType: 'CHECK', status: 'PENDING' },
      { id: '1-10', title: '특이사항 작성', description: '오픈 시 특이사항이 있으면 작성한다.', completionType: 'MEMO', status: 'PENDING' },
    ],
  },
  {
    id: '2',
    title: '마감 체크리스트',
    type: 'CLOSE',
    items: [
      { id: '2-1', title: '포스 마감', description: '포스에서 일마감 메뉴를 실행하고 매출과 현금을 확인한다.', completionType: 'NUMBER', status: 'PENDING' },
      { id: '2-2', title: '현금함 정리', description: '준비금을 제외한 나머지 금액을 정리한다.', completionType: 'NUMBER', status: 'PENDING' },
      { id: '2-3', title: '냉장고 문 확인', description: '냉장고 문이 완전히 닫혔는지 확인한다.', completionType: 'CHECK', status: 'PENDING' },
      { id: '2-4', title: '가스 밸브 확인', description: '가스 밸브가 잠금 방향으로 되어 있는지 확인한다.', completionType: 'PHOTO', status: 'PENDING' },
      { id: '2-5', title: '매장 조명 끄기', description: '홀, 주방, 화장실, 창고 조명을 모두 끈다.', completionType: 'CHECK', status: 'PENDING' },
      { id: '2-6', title: '출입문 잠금', description: '출입문을 잠근 뒤 손잡이를 당겨 확인한다.', completionType: 'PHOTO', status: 'PENDING' },
      { id: '2-7', title: '특이사항 작성', description: '파손, 재고 부족, 고객 클레임, 설비 이상이 있으면 작성한다.', completionType: 'MEMO', status: 'PENDING' },
    ],
  },
  {
    id: '3',
    title: '청소 체크리스트',
    type: 'CLEANING',
    items: [
      { id: '3-1', title: '홀 바닥 청소', description: '빗자루로 쓸고 걸레로 닦는다.', completionType: 'CHECK', status: 'DONE' },
      { id: '3-2', title: '화장실 청소', description: '변기, 세면대, 바닥을 청소한다.', completionType: 'CHECK', status: 'DONE' },
      { id: '3-3', title: '주방 청소', description: '조리대, 싱크대, 후드를 청소한다.', completionType: 'CHECK', status: 'PENDING' },
      { id: '3-4', title: '쓰레기 배출', description: '일반, 재활용 쓰레기를 분리하여 배출한다.', completionType: 'CHECK', status: 'DONE' },
    ],
  },
]

export const mockSpecialInstructions: SpecialInstruction[] = [
  {
    id: '1',
    title: '오늘 7시 예약석 세팅',
    content: '4인 테이블 2개를 붙여서 예약석을 준비해주세요. 생일 파티라 꽃 장식도 테이블 위에 올려주세요.',
    assignedTo: '이지은',
    status: 'READ',
  },
  {
    id: '2',
    title: '신메뉴 포스터 붙이기',
    content: '창고에 새 포스터 3장이 있습니다. 입구, 계산대 옆, 창가에 붙여주세요.',
    assignedTo: '김민수',
    status: 'DONE',
  },
]

export const mockRequests: EmployeeRequest[] = [
  {
    id: '1',
    type: '재료부족',
    content: '우유가 2팩 남았습니다. 내일 오픈 전에 보충이 필요해요.',
    status: 'CONFIRMED',
    visibility: 'ALL',
    createdAt: '2026-06-29 14:32',
    employeeName: '김민수',
    hasPhoto: true,
  },
  {
    id: '2',
    type: '근무변경',
    content: '이번 주 금요일 개인 사정으로 2시간 일찍 퇴근이 가능한지 여쭤봅니다.',
    status: 'REQUESTED',
    visibility: 'OWNER_ONLY',
    createdAt: '2026-06-30 11:15',
    employeeName: '이지은',
    hasPhoto: false,
  },
  {
    id: '3',
    type: '장비고장',
    content: '커피머신 스팀 노즐에서 물이 계속 새고 있어요. 수건으로 막아두었습니다.',
    status: 'IN_PROGRESS',
    visibility: 'OWNER_ONLY',
    createdAt: '2026-06-30 09:44',
    employeeName: '김민수',
    hasPhoto: true,
  },
]

export const mockReplies: RequestReply[] = [
  {
    id: 'r1',
    requestId: '1',
    content: '확인했습니다. 내일 오전 오픈 전 배송 예정입니다.',
    authorName: '사장',
    authorRole: 'OWNER',
    createdAt: '2026-06-29 16:10',
  },
  {
    id: 'r2',
    requestId: '3',
    content: 'A/S 업체에 연락했습니다. 내일 오후 방문 예정입니다.',
    authorName: '사장',
    authorRole: 'OWNER',
    createdAt: '2026-06-30 10:20',
  },
]

export const mockActivityLogs: ActivityLog[] = [
  // 요청 1
  { id: 'a1', requestId: '1', type: 'CREATED',        actorName: '김민수', actorRole: 'EMPLOYEE', createdAt: '2026-06-29 14:32' },
  { id: 'a2', requestId: '1', type: 'STATUS_CHANGED', actorName: '사장',   actorRole: 'OWNER',    detail: '미확인 → 확인됨',    createdAt: '2026-06-29 15:44' },
  { id: 'a3', requestId: '1', type: 'COMMENT_ADDED',  actorName: '사장',   actorRole: 'OWNER',    createdAt: '2026-06-29 16:10' },
  // 요청 2
  { id: 'a4', requestId: '2', type: 'CREATED',        actorName: '이지은', actorRole: 'EMPLOYEE', createdAt: '2026-06-30 11:15' },
  // 요청 3
  { id: 'a5', requestId: '3', type: 'CREATED',        actorName: '김민수', actorRole: 'EMPLOYEE', createdAt: '2026-06-30 09:44' },
  { id: 'a6', requestId: '3', type: 'STATUS_CHANGED', actorName: '사장',   actorRole: 'OWNER',    detail: '미확인 → 처리 중',   createdAt: '2026-06-30 10:05' },
  { id: 'a7', requestId: '3', type: 'COMMENT_ADDED',  actorName: '사장',   actorRole: 'OWNER',    createdAt: '2026-06-30 10:20' },
]
