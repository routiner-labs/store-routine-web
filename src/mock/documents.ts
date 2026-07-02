export interface DocumentCategory {
  id: string
  name: string
}

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { id: 'POS', name: '포스·결제' },
  { id: 'SERVICE', name: '고객 응대' },
  { id: 'CLEAN', name: '청소·시설' },
  { id: 'STOCK', name: '재고·보관' },
  { id: 'SAFETY', name: '안전·비상' },
  { id: 'RULE', name: '매장 운영 규칙' },
  { id: 'MARKETING', name: '이벤트·마케팅' },
  { id: 'ETC', name: '기타' },
]

export interface StoreDocument {
  id: string
  title: string
  category: string // DocumentCategory id
  content: string // HTML (RichTextEditor 출력)
  authorName: string
  createdAt: string // 'YYYY-MM-DD'
  updatedAt: string
}

export const DOCUMENT_CATALOG: StoreDocument[] = [
  {
    id: 'doc1',
    title: '포스 기본 결제 방법',
    category: 'POS',
    authorName: '사장',
    createdAt: '2026-05-12',
    updatedAt: '2026-06-02',
    content:
      '<p>포스 단말기에서 주문을 등록하고 결제를 완료하는 기본 절차입니다.</p><ol><li>메뉴 화면에서 주문 항목을 선택한다.</li><li>수량과 옵션을 확인한 뒤 주문 확정 버튼을 누른다.</li><li>결제 수단(카드/현금/간편결제)을 선택한다.</li><li>카드 결제 시 단말기에 카드를 인식시키고 승인을 기다린다.</li><li>영수증 발행 여부를 고객에게 물어본다.</li></ol><p>결제 금액과 주문 내역이 일치하는지 항상 확인 후 마무리합니다.</p>',
  },
  {
    id: 'doc2',
    title: '카드 단말기 오류 대처법',
    category: 'POS',
    authorName: '사장',
    createdAt: '2026-05-14',
    updatedAt: '2026-05-14',
    content:
      '<p>카드 결제 중 오류가 발생했을 때 대처 순서입니다.</p><ul><li>"통신 오류"가 뜨면 단말기를 재부팅하고 다시 시도한다.</li><li>같은 오류가 반복되면 다른 카드로 결제를 시도해 카드 문제인지 확인한다.</li><li>단말기 자체 문제로 판단되면 즉시 사장에게 연락한다.</li><li>오류로 이중 승인된 경우 승인 취소 후 다시 결제한다.</li></ul><p>고객에게는 당황하지 말고 "잠시만 기다려 주세요"라고 안내합니다.</p>',
  },
  {
    id: 'doc3',
    title: '환불 처리 방법',
    category: 'POS',
    authorName: '사장',
    createdAt: '2026-05-20',
    updatedAt: '2026-06-10',
    content:
      '<p>고객이 환불을 요청하면 아래 절차대로 처리합니다.</p><ol><li>원본 영수증 또는 결제 내역을 확인한다.</li><li>환불 사유를 간단히 확인하고 메모해 둔다.</li><li>포스에서 해당 주문을 조회해 결제 취소를 진행한다.</li><li>카드 결제는 승인 취소, 현금 결제는 현금으로 즉시 환불한다.</li><li>고액이거나 애매한 경우 사장 확인 후 처리한다.</li></ol>',
  },
  {
    id: 'doc4',
    title: '쿠폰·포인트 적용 방법',
    category: 'POS',
    authorName: '박서연',
    createdAt: '2026-05-22',
    updatedAt: '2026-05-22',
    content:
      '<p>쿠폰 및 적립 포인트를 적용하는 방법입니다.</p><ul><li>결제 화면에서 "할인 적용" 버튼을 누른다.</li><li>쿠폰은 바코드를 스캔하거나 쿠폰 번호를 직접 입력한다.</li><li>포인트는 고객 전화번호로 조회 후 사용할 금액을 입력한다.</li><li>중복 할인이 불가능한 쿠폰은 적용 전에 안내한다.</li></ul><p>적용 후 최종 결제 금액을 고객에게 다시 한번 확인시켜 줍니다.</p>',
  },
  {
    id: 'doc5',
    title: '고객 응대 기본 멘트',
    category: 'SERVICE',
    authorName: '사장',
    createdAt: '2026-04-18',
    updatedAt: '2026-05-01',
    content:
      '<p>매장 방문부터 퇴장까지 기본적으로 사용하는 응대 멘트입니다.</p><ul><li>입장: "어서오세요, 몇 분이세요?"</li><li>주문: "주문 도와드릴까요?"</li><li>서빙: "맛있게 드세요."</li><li>퇴장: "감사합니다, 안녕히 가세요."</li></ul><p>바쁠 때도 눈을 마주치고 웃으며 인사하는 것이 중요합니다.</p>',
  },
  {
    id: 'doc6',
    title: '클레임 응대 매뉴얼',
    category: 'SERVICE',
    authorName: '사장',
    createdAt: '2026-04-25',
    updatedAt: '2026-06-05',
    content:
      '<p>고객 불만이 접수되었을 때의 대응 원칙입니다.</p><ol><li>먼저 사과하고 끝까지 고객의 말을 듣는다.</li><li>매장 잘못이 명확하면 즉시 재조리, 교환, 환불 중 하나를 안내한다.</li><li>판단이 어려운 경우 "확인 후 바로 안내드리겠습니다"라고 말하고 사장에게 연락한다.</li><li>처리 결과와 고객 반응을 요청함에 기록으로 남긴다.</li></ol><p>절대 고객과 언쟁하지 않습니다.</p>',
  },
  {
    id: 'doc7',
    title: '전화 응대 가이드',
    category: 'SERVICE',
    authorName: '이지은',
    createdAt: '2026-04-28',
    updatedAt: '2026-04-28',
    content:
      '<p>매장 전화를 받을 때 기본 순서입니다.</p><ul><li>"안녕하세요, ○○입니다"로 시작한다.</li><li>예약 문의는 날짜·시간·인원을 메모한다.</li><li>포장 주문은 메뉴, 수량, 픽업 시간을 확인한다.</li><li>답하기 어려운 질문은 사장에게 확인 후 다시 연락드린다고 안내한다.</li></ul>',
  },
  {
    id: 'doc8',
    title: '배달 주문 접수 방법',
    category: 'SERVICE',
    authorName: '사장',
    createdAt: '2026-05-02',
    updatedAt: '2026-05-30',
    content:
      '<p>배달앱 주문이 들어왔을 때 처리 순서입니다.</p><ol><li>주문 알림음이 울리면 즉시 앱을 확인한다.</li><li>주문 내용, 요청사항(맵기, 리뷰 이벤트 등)을 꼼꼼히 읽는다.</li><li>주문을 수락하고 예상 조리 시간을 입력한다.</li><li>조리 완료 후 포장 상태를 확인하고 배달 기사에게 전달한다.</li><li>품절 메뉴는 즉시 앱에서 품절 처리한다.</li></ol>',
  },
  {
    id: 'doc9',
    title: '오픈 전 청소 체크리스트',
    category: 'CLEAN',
    authorName: '사장',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    content:
      '<p>영업 시작 전 매장 상태를 점검하는 항목입니다.</p><ul><li>테이블·의자 정렬 및 먼지 제거</li><li>바닥 청소 상태 확인</li><li>유리문·창문 지문 제거</li><li>화장실 소모품(휴지, 비누) 보충</li><li>간판 조명 및 매장 조명 점검</li></ul><p>모든 항목을 체크한 뒤 오픈합니다.</p>',
  },
  {
    id: 'doc10',
    title: '마감 청소 순서',
    category: 'CLEAN',
    authorName: '사장',
    createdAt: '2026-04-03',
    updatedAt: '2026-06-15',
    content:
      '<p>마감 시 청소는 아래 순서로 진행합니다.</p><ol><li>테이블과 의자를 닦고 정리한다.</li><li>주방 조리대와 싱크대를 세척한다.</li><li>바닥을 쓸고 물걸레질한다.</li><li>쓰레기를 분리배출한다.</li><li>마지막으로 화장실을 점검한다.</li></ol><p>청소가 끝나면 사진으로 남겨 마감 체크리스트에 첨부합니다.</p>',
  },
  {
    id: 'doc11',
    title: '화장실 청소 방법',
    category: 'CLEAN',
    authorName: '박서연',
    createdAt: '2026-04-05',
    updatedAt: '2026-04-05',
    content:
      '<p>화장실 청소 시 아래 순서를 지켜주세요.</p><ul><li>변기 내부와 외부를 세제로 닦는다.</li><li>세면대와 거울의 물때를 제거한다.</li><li>바닥을 물청소하고 건조시킨다.</li><li>휴지, 손세정제, 핸드타월을 보충한다.</li></ul>',
  },
  {
    id: 'doc12',
    title: '청소 도구 보관 위치',
    category: 'CLEAN',
    authorName: '사장',
    createdAt: '2026-04-06',
    updatedAt: '2026-04-06',
    content:
      '<p>청소 도구는 아래 위치에 보관되어 있습니다.</p><ul><li>대걸레·빗자루: 주방 뒤편 청소 도구함</li><li>세제·소독티슈: 싱크대 하단 서랍</li><li>고무장갑·수세미: 싱크대 옆 바구니</li><li>화장실 전용 세제: 화장실 청소함</li></ul><p>사용 후에는 항상 제자리에 정리해 주세요.</p>',
  },
  {
    id: 'doc13',
    title: '재고 발주 기준',
    category: 'STOCK',
    authorName: '사장',
    createdAt: '2026-05-01',
    updatedAt: '2026-06-20',
    content:
      '<p>주요 품목별 발주 기준 재고량입니다.</p><ul><li>원두: 2봉 이하로 남으면 발주</li><li>우유: 5팩 이하로 남으면 발주</li><li>일회용 컵: 1박스 이하로 남으면 발주</li><li>포장 용기: 반 박스 이하로 남으면 발주</li></ul><p>기준 이하로 확인되면 즉시 요청함에 재료 부족을 등록해 주세요.</p>',
  },
  {
    id: 'doc14',
    title: '냉장·냉동 보관 규칙',
    category: 'STOCK',
    authorName: '사장',
    createdAt: '2026-05-03',
    updatedAt: '2026-05-03',
    content:
      '<p>식자재 보관 시 아래 규칙을 지켜주세요.</p><ol><li>육류·해산물은 냉동, 채소·유제품은 냉장 보관한다.</li><li>먼저 들어온 재료가 앞쪽에 오도록 선입선출로 정리한다.</li><li>개봉한 제품은 밀폐 용기에 담고 개봉일을 표시한다.</li><li>냉장고 온도는 5도 이하, 냉동고는 영하 18도 이하를 유지한다.</li></ol>',
  },
  {
    id: 'doc15',
    title: '유통기한 관리 방법',
    category: 'STOCK',
    authorName: '이지은',
    createdAt: '2026-05-06',
    updatedAt: '2026-05-06',
    content:
      '<p>유통기한이 임박한 재료는 아래와 같이 관리합니다.</p><ul><li>매일 오픈 전 유통기한을 확인한다.</li><li>임박한 품목은 앞쪽으로 옮기고 스티커로 표시한다.</li><li>유통기한이 지난 재료는 즉시 폐기하고 사진으로 기록한다.</li><li>폐기 수량이 많으면 발주량 조정을 위해 사장에게 보고한다.</li></ul>',
  },
  {
    id: 'doc16',
    title: '재고 부족 보고 방법',
    category: 'STOCK',
    authorName: '사장',
    createdAt: '2026-05-08',
    updatedAt: '2026-05-08',
    content:
      '<p>재고가 부족할 때는 앱의 요청함을 이용해 보고합니다.</p><ol><li>요청함에서 "재료/비품 부족" 유형을 선택한다.</li><li>부족한 품목명과 대략적인 필요 수량을 작성한다.</li><li>가능하면 현재 재고 사진을 첨부한다.</li><li>등록 후 사장의 확인 상태를 확인한다.</li></ol>',
  },
  {
    id: 'doc17',
    title: '화재 발생 시 대응 방법',
    category: 'SAFETY',
    authorName: '사장',
    createdAt: '2026-04-10',
    updatedAt: '2026-04-10',
    content:
      '<p>화재 발생 시 아래 순서로 침착하게 대응합니다.</p><ol><li>가스 밸브를 즉시 잠근다.</li><li>초기 진화가 가능하면 소화기로 진화를 시도한다.</li><li>불이 커지면 즉시 고객과 함께 대피한다.</li><li>대피 후 119에 신고하고 사장에게 연락한다.</li></ol><p>소화기 위치는 주방 입구와 홀 계산대 옆에 있습니다.</p>',
  },
  {
    id: 'doc18',
    title: '가스 밸브 점검 방법',
    category: 'SAFETY',
    authorName: '사장',
    createdAt: '2026-04-12',
    updatedAt: '2026-06-01',
    content:
      '<p>마감 시 가스 밸브 점검은 필수입니다.</p><ul><li>주방 조리기구의 밸브를 모두 잠근다.</li><li>메인 가스 밸브를 잠금 방향으로 돌린다.</li><li>밸브가 완전히 잠겼는지 손으로 당겨 확인한다.</li><li>잠금 상태를 사진으로 찍어 마감 체크리스트에 첨부한다.</li></ul>',
  },
  {
    id: 'doc19',
    title: '정전 시 대응 방법',
    category: 'SAFETY',
    authorName: '사장',
    createdAt: '2026-04-15',
    updatedAt: '2026-04-15',
    content:
      '<p>영업 중 정전이 발생하면 아래와 같이 대응합니다.</p><ol><li>고객에게 상황을 안내하고 안심시킨다.</li><li>냉장고·냉동고 문을 최대한 열지 않는다.</li><li>두꺼비집(차단기)을 확인해 내려간 것이 있는지 점검한다.</li><li>원인을 알 수 없으면 한전(123)에 문의하고 사장에게 연락한다.</li></ol>',
  },
  {
    id: 'doc20',
    title: '응급상황 대처 및 연락처',
    category: 'SAFETY',
    authorName: '사장',
    createdAt: '2026-04-16',
    updatedAt: '2026-04-16',
    content:
      '<p>매장 내 응급상황 발생 시 아래를 참고하세요.</p><ul><li>화상·부상 발생 시 응급처치 후 상태에 따라 119에 신고한다.</li><li>고객 응급상황도 동일하게 119에 즉시 신고한다.</li><li>사고 경위와 조치 내용을 반드시 사장에게 보고한다.</li></ul><p>구급함은 주방 옆 선반에 비치되어 있습니다.</p>',
  },
  {
    id: 'doc21',
    title: '출퇴근 규정',
    category: 'RULE',
    authorName: '사장',
    createdAt: '2026-03-20',
    updatedAt: '2026-05-10',
    content:
      '<p>출퇴근과 관련된 기본 규정입니다.</p><ul><li>근무 시작 10분 전까지 도착해 출근 등록을 한다.</li><li>퇴근 시 마감 업무를 모두 완료한 뒤 퇴근 등록을 한다.</li><li>지각·조퇴·결근은 최소 2시간 전에 사장에게 알린다.</li><li>대타가 필요한 경우 사장 승인 후 근무자를 변경한다.</li></ul>',
  },
  {
    id: 'doc22',
    title: '근무 중 휴대폰 사용 규정',
    category: 'RULE',
    authorName: '사장',
    createdAt: '2026-03-22',
    updatedAt: '2026-03-22',
    content:
      '<p>근무 중 휴대폰 사용은 아래와 같이 제한됩니다.</p><ul><li>업무용 확인(앱 알림, 요청함 등)은 언제든 가능하다.</li><li>개인 통화·SNS는 휴게시간에만 이용한다.</li><li>고객 응대 중에는 휴대폰을 사용하지 않는다.</li></ul>',
  },
  {
    id: 'doc23',
    title: '복장 및 위생 규정',
    category: 'RULE',
    authorName: '사장',
    createdAt: '2026-03-25',
    updatedAt: '2026-03-25',
    content:
      '<p>근무 시 복장과 위생 기준입니다.</p><ul><li>지급된 유니폼과 앞치마를 착용한다.</li><li>긴 머리는 반드시 묶는다.</li><li>조리 업무 시 위생장갑을 착용한다.</li><li>손톱은 짧게 유지하고 향이 강한 향수는 자제한다.</li></ul>',
  },
  {
    id: 'doc24',
    title: '지각·결근 처리 규정',
    category: 'RULE',
    authorName: '사장',
    createdAt: '2026-03-28',
    updatedAt: '2026-03-28',
    content:
      '<p>지각과 결근은 아래 기준으로 처리됩니다.</p><ol><li>10분 이내 지각은 사유를 기록하고 주의로 처리한다.</li><li>10분 초과 지각이 반복되면 사장과 면담한다.</li><li>무단 결근은 사전 연락 여부와 관계없이 별도로 기록한다.</li><li>부득이한 사유는 증빙과 함께 사전에 보고한다.</li></ol>',
  },
  {
    id: 'doc25',
    title: '신메뉴 홍보 안내',
    category: 'MARKETING',
    authorName: '사장',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-18',
    content:
      '<p>신메뉴 출시 시 홍보 방법입니다.</p><ul><li>매장 입구 포스터를 신메뉴 포스터로 교체한다.</li><li>주문 시 고객에게 신메뉴를 간단히 소개한다.</li><li>포장 시 신메뉴 홍보 스티커를 부착한다.</li></ul><p>포스터 및 스티커는 계산대 아래 서랍에 있습니다.</p>',
  },
  {
    id: 'doc26',
    title: '리뷰 이벤트 진행 방법',
    category: 'MARKETING',
    authorName: '사장',
    createdAt: '2026-06-05',
    updatedAt: '2026-06-05',
    content:
      '<p>리뷰 작성 이벤트 응대 방법입니다.</p><ol><li>고객이 리뷰 작성 의사를 밝히면 이벤트 안내 카드를 전달한다.</li><li>리뷰 캡처 화면을 확인하고 사은품을 지급한다.</li><li>같은 영수증으로 중복 지급하지 않는다.</li></ol>',
  },
  {
    id: 'doc27',
    title: 'SNS 업로드 가이드',
    category: 'MARKETING',
    authorName: '이지은',
    createdAt: '2026-06-08',
    updatedAt: '2026-06-08',
    content:
      '<p>매장 SNS 계정 운영 시 참고 사항입니다.</p><ul><li>음식 사진은 자연광이 있는 창가에서 촬영한다.</li><li>고객이 나온 사진은 반드시 동의를 구한 뒤 업로드한다.</li><li>업로드 전 사장에게 확인받는다.</li></ul>',
  },
  {
    id: 'doc28',
    title: '긴급 연락처 목록',
    category: 'ETC',
    authorName: '사장',
    createdAt: '2026-03-15',
    updatedAt: '2026-06-25',
    content:
      '<p>비상 상황 시 아래 연락처를 이용하세요.</p><ul><li>사장: 010-0000-0000</li><li>건물 관리실: 02-000-0000</li><li>포스 업체 고객센터: 1588-0000</li><li>가스 안전공사: 1544-4500</li><li>화재·구급: 119 / 범죄 신고: 112</li></ul>',
  },
  {
    id: 'doc29',
    title: '매장 와이파이·비밀번호 안내',
    category: 'ETC',
    authorName: '사장',
    createdAt: '2026-03-16',
    updatedAt: '2026-03-16',
    content:
      '<p>매장에서 사용하는 각종 계정 정보입니다.</p><ul><li>고객용 와이파이: STORE_GUEST / 비밀번호는 영수증 하단 참고</li><li>포스 관리자 비밀번호는 사장에게 문의</li><li>배달앱 접수 태블릿 잠금 패턴은 계산대 메모 참고</li></ul><p>외부 유출에 주의해 주세요.</p>',
  },
  {
    id: 'doc30',
    title: '신입 알바 교육 자료',
    category: 'ETC',
    authorName: '사장',
    createdAt: '2026-06-28',
    updatedAt: '2026-07-02',
    content:
      '<p>신입 알바생이 첫 출근 전 확인해야 할 내용입니다.</p><ol><li>출퇴근 등록 방법을 앱에서 미리 확인한다.</li><li>오픈·마감 체크리스트 항목을 숙지한다.</li><li>포스 기본 결제 방법 문서를 읽어본다.</li><li>궁금한 점은 요청함의 "기타" 유형으로 남긴다.</li></ol><p>첫 2주는 선배 직원과 함께 근무하며 업무를 익힙니다.</p>',
  },
]
