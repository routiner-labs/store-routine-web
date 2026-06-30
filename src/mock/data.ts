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
  // ── CONFIRMED ──
  { id: '1',  type: '재료부족', content: '우유가 2팩 남았습니다. 내일 오픈 전에 보충이 필요해요.',                                             status: 'CONFIRMED',   visibility: 'ALL',        createdAt: '2026-06-29 14:32', employeeName: '김민수', hasPhoto: true  },
  { id: '11', type: '재료부족', content: '원두 재고가 한 봉지 남았어요. 3일치 정도 될 것 같습니다.',                                           status: 'CONFIRMED',   visibility: 'ALL',        createdAt: '2026-06-28 09:20', employeeName: '박준혁', hasPhoto: false },
  { id: '12', type: '청소시설', content: '홀 쪽 창문에 곰팡이가 생겼어요. 환기가 잘 안 되는 것 같습니다.',                                     status: 'CONFIRMED',   visibility: 'ALL',        createdAt: '2026-06-27 15:10', employeeName: '이지은', hasPhoto: true  },
  { id: '13', type: '근무변경', content: '7월 3일 가족 행사가 생겼습니다. 하루 대타를 구해도 될까요?',                                         status: 'CONFIRMED',   visibility: 'OWNER_ONLY', createdAt: '2026-06-27 17:40', employeeName: '박준혁', hasPhoto: false },
  { id: '14', type: '기타',     content: '에어컨 온도를 좀 더 낮춰도 될까요? 홀이 너무 더워서 손님들이 불편해하시는 것 같아요.',                status: 'CONFIRMED',   visibility: 'ALL',        createdAt: '2026-06-29 12:50', employeeName: '김민수', hasPhoto: false },
  { id: '15', type: '재료부족', content: '설탕 시럽이 2병 남았어요. 아메리카노 주문이 많은 시간대에 부족할 수 있을 것 같습니다.',               status: 'CONFIRMED',   visibility: 'ALL',        createdAt: '2026-06-28 09:55', employeeName: '최수아', hasPhoto: false },
  // ── REQUESTED ──
  { id: '2',  type: '근무변경', content: '이번 주 금요일 개인 사정으로 2시간 일찍 퇴근이 가능한지 여쭤봅니다.',                                 status: 'REQUESTED',   visibility: 'OWNER_ONLY', createdAt: '2026-06-30 11:15', employeeName: '이지은', hasPhoto: false },
  { id: '21', type: '재료부족', content: '냉동 베이글 재고가 5개 남았어요. 주말 수요를 생각하면 금요일 전에 입고가 필요할 것 같습니다.',         status: 'REQUESTED',   visibility: 'ALL',        createdAt: '2026-06-30 08:30', employeeName: '박준혁', hasPhoto: false },
  { id: '22', type: '청소시설', content: '주방 후드 필터가 많이 더러워졌어요. 세척이 필요할 것 같습니다.',                                      status: 'REQUESTED',   visibility: 'ALL',        createdAt: '2026-06-30 09:10', employeeName: '최수아', hasPhoto: true  },
  { id: '23', type: '기타',     content: '다음 달 공휴일 근무 일정을 미리 알 수 있을까요? 개인 일정을 잡아야 해서요.',                          status: 'REQUESTED',   visibility: 'OWNER_ONLY', createdAt: '2026-06-30 10:45', employeeName: '최수아', hasPhoto: false },
  { id: '24', type: '장비고장', content: '포스 영수증 프린터가 중간에 계속 끊겨요. 영수증이 반쪽만 나오고 있습니다.',                           status: 'REQUESTED',   visibility: 'ALL',        createdAt: '2026-06-30 13:22', employeeName: '김민수', hasPhoto: true  },
  { id: '25', type: '고객이슈', content: '단골 손님이 포인트 카드가 사라졌다고 하십니다. 확인 부탁드립니다.',                                   status: 'REQUESTED',   visibility: 'ALL',        createdAt: '2026-06-30 14:30', employeeName: '이지은', hasPhoto: false },
  // ── IN_PROGRESS ──
  { id: '3',  type: '장비고장', content: '커피머신 스팀 노즐에서 물이 계속 새고 있어요. 수건으로 막아두었습니다.',                               status: 'IN_PROGRESS', visibility: 'OWNER_ONLY', createdAt: '2026-06-30 09:44', employeeName: '김민수', hasPhoto: true  },
  { id: '31', type: '고객이슈', content: '배달 주문 리뷰에 위생 관련 악성 리뷰가 달렸어요. 사실과 다른 내용인데 대응이 필요할 것 같습니다.',   status: 'IN_PROGRESS', visibility: 'OWNER_ONLY', createdAt: '2026-06-29 20:15', employeeName: '이지은', hasPhoto: false },
  { id: '32', type: '장비고장', content: '냉장 쇼케이스 온도가 계속 올라가요. 설정은 3도인데 표시는 8도입니다.',                               status: 'IN_PROGRESS', visibility: 'ALL',        createdAt: '2026-06-29 14:00', employeeName: '박준혁', hasPhoto: true  },
  { id: '33', type: '재료부족', content: '아이스 컵이 반 박스 남았어요. 여름이라 금방 소진될 것 같습니다.',                                    status: 'IN_PROGRESS', visibility: 'ALL',        createdAt: '2026-06-30 07:50', employeeName: '최수아', hasPhoto: false },
  { id: '34', type: '청소시설', content: '냉장고 내부 선반 하나가 깨졌어요. 교체가 필요합니다.',                                               status: 'IN_PROGRESS', visibility: 'ALL',        createdAt: '2026-06-29 10:00', employeeName: '김민수', hasPhoto: true  },
  { id: '35', type: '청소시설', content: '화장실 손잡이가 흔들려요. 나사가 빠진 것 같은데 수리가 필요합니다.',                                  status: 'IN_PROGRESS', visibility: 'ALL',        createdAt: '2026-06-28 11:30', employeeName: '최수아', hasPhoto: true  },
  // ── DONE ──
  { id: '41', type: '청소시설', content: '홀 화장실 변기 물이 잘 내려가지 않아요. 뚫어뻥으로 해결했는데 다시 막히면 신고해도 될까요?',         status: 'DONE',        visibility: 'ALL',        createdAt: '2026-06-28 16:20', employeeName: '박준혁', hasPhoto: false },
  { id: '42', type: '재료부족', content: '버터가 거의 다 떨어졌습니다. 크루아상 구울 때 필요한데 남은 게 한 조각 정도예요.',                   status: 'DONE',        visibility: 'ALL',        createdAt: '2026-06-27 10:05', employeeName: '최수아', hasPhoto: true  },
  { id: '43', type: '고객이슈', content: '오늘 오후 3시쯤 테이블 4번 손님이 음식에서 이물질이 나왔다고 컴플레인 하셨습니다. 환불 처리 후 귀가하셨어요.', status: 'DONE', visibility: 'OWNER_ONLY', createdAt: '2026-06-28 18:30', employeeName: '이지은', hasPhoto: true },
  { id: '44', type: '근무변경', content: '6월 25일 대신 27일에 근무하겠습니다. 동료와 협의 완료했어요.',                                       status: 'DONE',        visibility: 'OWNER_ONLY', createdAt: '2026-06-23 09:00', employeeName: '김민수', hasPhoto: false },
  { id: '45', type: '장비고장', content: '블렌더 뚜껑이 잘 안 잠겨요. 사용할 때 튀는 경우가 있어서 위험합니다.',                               status: 'DONE',        visibility: 'ALL',        createdAt: '2026-06-24 11:20', employeeName: '박준혁', hasPhoto: true  },
  { id: '46', type: '기타',     content: '손님들이 와이파이 비밀번호를 자주 물어봐서 안내판을 만들면 좋겠습니다.',                              status: 'DONE',        visibility: 'ALL',        createdAt: '2026-06-23 14:00', employeeName: '최수아', hasPhoto: false },
  // ── REJECTED ──
  { id: '51', type: '근무변경', content: '이번 주 토요일 오전 근무를 오후로 바꿀 수 있을까요? 병원 예약이 있습니다.',                          status: 'REJECTED',    visibility: 'OWNER_ONLY', createdAt: '2026-06-26 14:00', employeeName: '이지은', hasPhoto: false },
  { id: '52', type: '기타',     content: '직원 할인을 음료뿐만 아니라 베이커리에도 적용해주실 수 있을까요?',                                   status: 'REJECTED',    visibility: 'OWNER_ONLY', createdAt: '2026-06-25 18:30', employeeName: '박준혁', hasPhoto: false },
  { id: '53', type: '근무변경', content: '다음 주 월요일 개인 사정으로 결근이 필요합니다.',                                                    status: 'REJECTED',    visibility: 'OWNER_ONLY', createdAt: '2026-06-24 19:00', employeeName: '최수아', hasPhoto: false },
  { id: '54', type: '기타',     content: '주차 공간이 협소해서 배달 기사분들이 불편해하십니다. 안내판 부착이 가능할까요?',                     status: 'REJECTED',    visibility: 'ALL',        createdAt: '2026-06-22 10:00', employeeName: '김민수', hasPhoto: false },
  { id: '55', type: '장비고장', content: '에스프레소 머신 압력 게이지가 9bar 미만으로 떨어집니다. 추출이 제대로 안 되고 있어요.',              status: 'REJECTED',    visibility: 'ALL',        createdAt: '2026-06-21 15:45', employeeName: '박준혁', hasPhoto: false },
  { id: '56', type: '고객이슈', content: '테이블 2번에서 머리카락이 나왔다는 컴플레인이 있었습니다. 음료 재제조 후 사과드렸습니다.',            status: 'REJECTED',    visibility: 'OWNER_ONLY', createdAt: '2026-06-25 15:30', employeeName: '이지은', hasPhoto: false },
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
