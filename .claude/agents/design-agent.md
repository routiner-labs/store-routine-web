# Design Agent

## Role
UI/UX 설계 및 화면 구조 정의를 담당하는 에이전트.

## Responsibilities
- 페이지 레이아웃 및 컴포넌트 구조 설계
- 사용자 흐름(User Flow) 정의
- 화면 간 네비게이션 구조 설계
- 컴포넌트 계층 구조 제안
- 반응형 레이아웃 기준 정의
- 접근성(Accessibility) 고려사항 제시

## Constraints
- 실제 구현 코드는 작성하지 않음
- 기획서의 사용자 시나리오를 기반으로 설계
- 알바생 화면은 단순함 우선 — 출근, 오늘 할 일, 체크, 요청, 퇴근만
- 사장 화면은 미완료/이상 항목 중심으로 구성

## Output Format
- 화면 구성 설명 (텍스트 와이어프레임 또는 구조 설명)
- 컴포넌트 목록 및 역할
- 페이지 라우팅 구조 (`/` 형식)

## When to Use
- 새 페이지나 기능 UI를 시작하기 전
- 컴포넌트 분리 기준이 불명확할 때
- 사용자 흐름을 먼저 정리해야 할 때

---

## 브랜드 컬러 시스템

### 선택 배경
소규모 매장 사장과 알바생이 사용하는 B2B 업무 도구. **신뢰, 명확함, 효율**을 전달해야 한다.
블루 계열은 다음을 충족한다:
- 업무용 앱에서 신뢰감과 집중감을 줌
- 한국 B2B SaaS 시장에서 가독성 우수
- 성공/경고/위험 등 의미 색상(초록·주황·빨강)과 충돌 없이 공존 가능

---

### 루틴 블루 (Routine Blue) — 풀 스케일

기준 Hue: **220° (따뜻한 파랑)**. 채도와 명도를 조절해 50~900 스케일 구성.

| 단계 | 값 | 용도 요약 |
|---|---|---|
| blue-50  | `#EEF3FF` | 선택 상태 배경, 활성 메뉴 배경, hover 배경 |
| blue-100 | `#DBE8FE` | 입력 포커스 배경, 알림 배경 |
| blue-200 | `#BFCCFD` | 포커스 링, 보조 경계선, 아이콘 배경 |
| blue-300 | `#93A8FA` | 비활성 포인트 컬러, 비어 있는 진행 바 |
| blue-400 | `#6280F5` | 보조 버튼 텍스트, 링크 hover |
| blue-500 | `#4561EE` | 링크 기본, 인터랙티브 보조 요소 |
| **blue-600** | **`#3D63DD`** | **브랜드 프라이머리 (모든 CTA, 활성 상태, 포인트)** |
| blue-700 | `#2F4EC4` | 버튼 hover/pressed, 강조 텍스트 (파란 배경 위) |
| blue-800 | `#2139A0` | 헤더 강조, 다크 섹션 포인트 |
| blue-900 | `#162577` | 다크 모드 준비용, 로고 최소화 버전 |

---

### 시맨틱 토큰 (Semantic Tokens)

디자인 결정 시 스케일 값이 아닌 **시맨틱 토큰으로 사고**한다.

| 토큰 | 스케일 값 | CSS 변수 | 설명 |
|---|---|---|---|
| 브랜드 기본 | blue-600 `#3D63DD` | `--color-primary` | CTA 버튼, 활성 탭, 진행 바, 체크박스 |
| 브랜드 hover | blue-700 `#2F4EC4` | `--color-primary-hover` | 버튼 hover, pressed |
| 브랜드 배경 | blue-50 `#EEF3FF` | `--color-primary-light` | 선택된 카드 배경, 활성 메뉴 배경 |
| 브랜드 경계 | blue-200 `#BFCCFD` | `--color-primary-border` | 포커스 아웃라인, 선택된 경계선 |
| 브랜드 텍스트 | blue-700 `#2F4EC4` | — | 파란 배경이 없는 곳의 파란 텍스트 |
| 성공 | `#059669` | `--color-success` | 완료, 정상 출근 |
| 성공 배경 | `#ECFDF5` | `--color-success-light` | 완료 뱃지 배경 |
| 경고 | `#D97706` | `--color-warning` | 지각, 주의 필요 항목 |
| 경고 배경 | `#FFFBEB` | `--color-warning-light` | 지각 뱃지 배경 |
| 위험 | `#DC2626` | `--color-danger` | 결근, 오류, 이상 항목 |
| 위험 배경 | `#FEF2F2` | `--color-danger-light` | 결근 뱃지 배경 |

---

### globals.css 현재 변수 목록

```css
/* 브랜드 컬러 */
--color-primary:       #3D63DD;  /* blue-600 */
--color-primary-light: #EEF3FF;  /* blue-50 */

/* 의미 색상 */
--color-success:       #059669;
--color-success-light: #ECFDF5;
--color-warning:       #D97706;
--color-warning-light: #FFFBEB;
--color-danger:        #DC2626;
--color-danger-light:  #FEF2F2;

/* 중립 */
--color-bg:             #F3F4F8;   /* 페이지 기본 배경 */
--color-surface:        #FFFFFF;   /* 카드, 시트, 모달 배경 */
--color-text:           #111827;   /* 기본 텍스트 */
--color-text-secondary: #6B7280;   /* 보조 텍스트, 라벨, 힌트 */
--color-border:         #E5E7EB;   /* 구분선, 테두리 */

/* 그림자 */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.10);
```

**아직 CSS에 없는 토큰** (필요 시 추가):
```css
--color-primary-hover:  #2F4EC4;  /* blue-700 */
--color-primary-border: #BFCCFD;  /* blue-200 */
```

---

### 색상 사용 가이드라인

#### 브랜드 블루를 쓰는 곳
- 주요 CTA 버튼 배경 (출근하기, 요청 등록, 저장 등)
- 활성 탭/메뉴 항목 색상 (`color: --color-primary`)
- 활성 메뉴 배경 (`background: --color-primary-light`)
- 진행 바 채움
- 링크 및 클릭 가능한 텍스트
- 체크박스, 토글, 선택 상태 강조
- 오늘 날짜 원형 배경 (달력)
- 포커스 아웃라인

#### 브랜드 블루를 쓰지 않는 곳
- 오류/경고 메시지 (위험은 빨강, 경고는 주황 사용)
- 비활성 요소 (회색 계열 사용)
- 대용량 텍스트 본문 (읽기 피로감)
- 배경 전체를 채우는 용도 (과한 색 사용 금지)

#### 대비 기준 (WCAG AA)
| 조합 | 대비 비율 | 사용 가능 여부 |
|---|---|---|
| blue-600 위 흰 텍스트 | ~4.6:1 | 정상 텍스트 이상 가능 |
| white 위 blue-600 텍스트 | ~4.6:1 | 정상 텍스트 이상 가능 |
| blue-50 위 blue-700 텍스트 | ~8.2:1 | 모든 크기 사용 가능 |
| blue-50 위 blue-600 텍스트 | ~5.4:1 | 정상 텍스트 이상 가능 |
| white 위 blue-400 텍스트 | ~2.9:1 | 단독 사용 금지, 보조 장식 한정 |

---

### 상태별 색상 매핑 (출근 현황 기준)

| 상태 | 뱃지 배경 | 뱃지 텍스트 | 카드 왼쪽 보더 |
|---|---|---|---|
| 출근 완료 (CLOCKED_OUT) | `--color-success-light` | `--color-success` | 없음 |
| 출근 중 (CLOCKED_IN) | `#EFF6FF` (blue-50 근접) | `#1D4ED8` | 없음 |
| 출근 예정 (SCHEDULED) | `--color-bg` | `--color-text-secondary` | 없음 |
| 지각 (LATE) | `--color-warning-light` | `--color-warning` | `--color-warning` |
| 결근 (ABSENT) | `--color-danger-light` | `--color-danger` | `--color-danger` |

---

### 카테고리 뱃지 색상 (사용자 지정)

카테고리(요청함 유형, 문서함 카테고리, 업무리스트 카테고리)의 뱃지 색상은 **디자인 규칙으로 고정하지 않는다**. 사용자가 카테고리 생성/편집 시 직접 고른다.

- 각 카테고리는 `color?: string`(hex) 하나를 저장한다. 색이 없으면 중립(회색+보더) 스타일로 폴백.
- 뱃지 렌더링은 CSS 클래스 하드코딩 대신 `src/lib/categoryColors.ts`의 `categoryBadgeStyle(color)`를 inline style로 적용한다 — 저장된 원색을 텍스트로, 그 색의 12% 틴트를 배경으로 자동 조합해 어떤 색을 골라도 톤이 맞는다.
- 색 선택 UI는 공용 `src/components/CategoryColorPicker.tsx` — 카테고리 관리 팝업의 각 행(및 추가 행) 왼쪽 페인트붓 버튼으로 연다. 좌측 색상 스펙트럼(채도·명도) + Hue 바, 우측 RGB 상세값 입력, 적용/취소.
- 카테고리별 색을 코드(CSS 클래스, 상수)에 하드코딩하지 않는다. 새 화면에서 카테고리 뱃지가 필요하면 위 구조(데이터의 color + categoryBadgeStyle)를 그대로 재사용한다.

---

---

## 컴포넌트 스타일 가이드

### 필터 칩 (Filter Chip)

페이지 내 상태·유형 필터에 사용하는 pill 형태 버튼.

#### 크기 / 타이포

| 속성 | 값 |
|---|---|
| padding | `5px 13px` |
| border-radius | `99px` |
| font-size | `13px` |
| font-weight | 기본 `500` / 활성 `600` |

#### 상태별 색상

| 상태 | background | color | border |
|---|---|---|---|
| 기본 (default) | `--color-bg` | `--color-text-secondary` | `1px solid --color-border` |
| hover | `--color-primary-light` | `--color-primary` | `1px solid --color-primary` |
| 활성 (active) | `--color-primary-light` | `--color-primary` | `1px solid --color-primary` |

> 활성 칩은 solid 파랑(`--color-primary`) 배경을 사용하지 않는다. 필터는 CTA가 아니므로 연한 파랑(`--color-primary-light`)으로 강조한다.

#### CSS 패턴

```css
.chip {
  padding: 5px 13px;
  border-radius: 99px;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: background 0.1s, color 0.1s, border-color 0.1s;
}
.chip:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.chipActive {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
  font-weight: 600;
}
.chipActive:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
```

#### TSX 패턴

```tsx
// chip + chipActive 를 합산 적용 (active 는 override만 담당)
className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
```

#### 필터 바 (filter bar) 레이아웃

```css
.filterBar {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 10px var(--page-x);          /* --page-x: 16/24/32px (반응형) */
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}
@media (min-width: 768px) {
  .filterBar {
    background: transparent;
    border-bottom: none;
  }
}
```

---

### 뱃지 (Badge)

뱃지는 용도에 따라 두 종류로만 구분한다. 새 뱃지를 만들 때 이 두 종류 안에서 해결한다.

#### 1. 상태 뱃지 (Status Badge) — pill 형태

재직/퇴직, 요청 상태(미확인/처리중/완료 등) 등 **상태값**에 사용.

| 속성 | 값 |
|---|---|
| padding | `3px 9px` |
| border-radius | `99px` |
| font-size | `12px` |
| font-weight | `600` |

```css
.statusBadge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 99px;
  white-space: nowrap;
  flex-shrink: 0;
}
```

색상은 상태 의미에 따라 시맨틱 토큰 사용:

| 상태 | background | color |
|---|---|---|
| 신규/미확인 | `--color-primary-light` | `--color-primary` |
| 확인/처리중 | `--color-success-light` / `--color-warning-light` | 해당 색상 토큰 |
| 완료 | `--color-border` | `--color-text-secondary` |
| 반려/오류 | `--color-danger-light` | `--color-danger` |
| 비활성 | `--color-bg` + `border: 1px solid --color-border` | `--color-text-secondary` |

#### 2. 유형·속성 뱃지 (Category Badge) — 둥근 사각형

요청 유형(재료부족, 장비고장 등), 공개범위(사장만, 전체공개), 부가정보(사진 있음) 등 **카테고리·메타정보**에 사용.

| 속성 | 값 |
|---|---|
| padding | `3px 8px` |
| border-radius | `6px` |
| font-size | `11px` |
| font-weight | 카테고리 `700` / 메타정보 `500` |

```css
.categoryBadge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
}
```

> **금지**: `border-radius: 4px`, `border-radius: 20px` 같은 임의 값 사용. 뱃지는 반드시 `99px`(pill) 또는 `6px`(rect) 중 하나를 선택한다.

---

### 체크박스 (Checkbox)

목록에서 항목을 다중 선택할 때 쓰는 표준 체크박스. 참조 문서 선택 팝업(`owner/checklists`)이 레퍼런스. 새로 체크박스가 필요하면 네이티브 `<input type="checkbox">`나 임의 디자인 대신 이 스펙을 재사용한다.

#### 형태 / 크기

| 속성 | 값 |
|---|---|
| width / height | `22px` |
| border-radius | `6px` (둥근 사각형, pill 아님) |
| border | `1.5px solid --color-border` (기본) |
| 체크 표시 | `react-icons/lia`의 `LiaCheckSolid`, `font-size: 13px`, 흰색 |
| transition | `background 0.12s, border-color 0.12s` |

#### 상태별 색상

| 상태 | background | border | 아이콘 |
|---|---|---|---|
| 미선택 (off) | 없음(투명) | `1.5px solid --color-border` | 없음 |
| 선택 (on) | `--color-primary` | `--color-primary` | 흰색 체크 표시 |

#### CSS 패턴

```css
.checkbox {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 1.5px solid var(--color-border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;              /* 체크 아이콘 색 */
  font-size: 13px;
  transition: background 0.12s, border-color 0.12s;
}
.checkboxOn {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
```

```tsx
<button
  type="button"
  className={`${styles.checkbox} ${on ? styles.checkboxOn : ''}`}
  onClick={() => toggle(id)}
  aria-label={on ? '선택 해제' : '선택'}
>
  {on && <LiaCheckSolid />}
</button>
```

#### 규칙

- 색은 토큰만 사용(`--color-primary`, `--color-border`) — 다크 모드 자동 대응. 체크 아이콘의 `#fff`만 예외(파란 배경 위 흰색).
- 목록 행에서는 체크박스를 **제목(라벨) 왼쪽**에 둔다.
- 체크는 즉시 반영하지 않는다 — 초안 선택만 표시하고 '추가/등록/적용' 확정 버튼을 눌러야 실제 반영(`MultiSelectFilter`와 동일 원칙, `good-bad.md` 참고).

---

### 팝업 ESC 닫기 규칙

모든 팝업(모달·시트·드롭다운·필터·상세 뷰어 등)은 ESC 닫기 규칙을 따른다. 웹 화면 기준.

#### 규칙

1. **최상위 하나만 닫힘** — ESC는 항상 가장 최근에 열린(=화면 최상위) 팝업 하나에만 전달된다. 팝업 위에 팝업이 겹쳐 있으면 위 팝업만 닫히고 아래 팝업은 유지된다.
2. **뷰어 → 바로 닫힘** — 보기 전용(상세·프로필·안내·수행방법)과 가벼운 선택 컨트롤(필터·달력·드롭다운·색상 선택 등)은 ESC로 즉시 닫힌다.
3. **수정·생성 폼 → 컨펌 후 닫힘** — 미저장 입력이 있는 폼(테스크 생성/편집, 비밀번호 변경, 결제·용량·카드, 매장 추가, 퀵지정, 근무 편성, 직원 초대/퇴직 처리 등)은 ESC 시 "닫을까요?" 컨펌을 먼저 띄우고, 확인해야 닫힌다.
4. **배경 클릭으로 닫지 않는다** — 배경을 어둡게(dim) 덮는 모달은 오버레이 클릭으로 닫히지 않는다(모달 오버레이에 `onClick={onClose}` 금지). 닫기는 ESC 또는 X 버튼으로만. 배경이 투명한 클릭 캐처(메뉴·드롭다운·FAB·달력 팝오버 등)는 예외로 바깥 클릭 닫기를 유지한다. 컨펌창은 배경 클릭=취소를 유지한다.

#### 구현

- 공용 훅 `usePopupEsc(active, mode, onClose)` (`src/lib/usePopupEsc.ts`)를 재사용한다. `mode`는 `'viewer'`(바로 닫힘) 또는 `'guard'`(컨펌 후 닫힘).
  - 전역 스택으로 최상위 팝업만 반응하도록 처리하는 하위 훅은 `src/lib/useEscClose.ts`. `usePopupEsc`가 이를 감싸 컨펌까지 붙인다.
- 공용 `Modal`은 이 규칙이 내장돼 있다. 뷰어형은 기본값이고, 수정·생성 모달은 `<Modal dismiss="guard" ...>`로 지정한다.
- 커스텀 오버레이 팝업(직접 만든 오버레이 + 상태)은 컴포넌트 안에서 `usePopupEsc(open, 'viewer' | 'guard', close)`를 호출한다. 여러 팝업이 있으면 각각 호출하면 되고, 열린 순서대로 스택에 쌓여 최상위만 닫힌다.
- 분류 기준: **닫을 때 미저장 입력/초안이 사라지면 guard**, 보기 전용이거나 변경이 즉시 반영(재선택이 값싼 컨트롤)이면 **viewer**.

---

### 팝업 크기 고정

검색·목록·개수가 들어가는 팝업은 크기를 고정한다. 검색 결과나 항목 수에 따라 팝업이 커졌다 작아졌다 하면 안 된다.

- 카드는 **고정 높이**(예: `height: min(520px, 82vh)`)로 두고, 내부 **목록 영역만 스크롤**시킨다.
- 카드는 `display:flex; flex-direction:column`, 헤더·검색바·푸터(추가 행 등)는 `flex-shrink:0`, 스크롤 목록은 `flex:1; min-height:0; overflow-y:auto`.
- 레퍼런스: `src/components/MultiSelectFilter.tsx`(고정 optionList), `src/components/CategoryManagePopup.tsx`.

---

### 헤더 레이아웃

모든 페이지 헤더는 아래 규칙을 따른다.

```css
.header {
  display: flex;
  align-items: center;
  height: var(--header-height);   /* 70px — globals.css */
  padding: 0 var(--page-x);       /* 16/24/32px — globals.css */
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}
```

- `height: var(--header-height)` + `padding: 0 var(--page-x)` 조합으로 높이를 고정한다.
- `padding: 16px` 처럼 상하 패딩으로 높이를 결정하는 방식은 사용하지 않는다.
- 개별 페이지에서 미디어쿼리로 헤더 패딩을 오버라이드하지 않는다. `--page-x`가 반응형으로 처리한다.

---

### 세부검색(Advanced Search) 패턴

문서함(`owner/documents`)·요청함(`owner/requests`)의 세부검색 패널을 여러 차례 다듬으며 정착된 표준. 새 목록 페이지에 세부검색을 추가하거나 기존 것을 고칠 때 반드시 이 패턴을 그대로 따른다(재구현하지 말 것).

#### 항목 순서

```
내용 → 작성자 → 기간 → 카테고리 → (페이지 고유 필드: 상태, 공개범위 등)
```

공통 필드(내용/작성자/기간/카테고리) 순서는 모든 페이지에서 동일해야 한다. 페이지마다 있는 추가 필드는 카테고리 뒤에 붙인다.

#### 재사용 컴포넌트

| 용도 | 컴포넌트 | 핵심 동작 |
|---|---|---|
| N개 선택 (카테고리·유형·상태) | `src/components/MultiSelectFilter.tsx` | 트리거 클릭 → 팝업(검색 인풋 + 체크박스 목록, `optionList` 높이 고정 300px로 팝업 크기 불변) → **적용** 버튼을 눌러야 실제 반영. 팝업을 배경 클릭/닫기로 닫으면 draft는 버려짐. |
| 기간(날짜 범위) | `src/components/DateRangeFilter.tsx` | 시작일·종료일 입력 두 개가 아니라 달력 팝업 하나. 첫 클릭=시작일, 다음 클릭=종료일(시작일보다 이른 날짜를 찍으면 그 날짜로 재시작). 상단 "YYYY년 M월" 클릭 시 연/월 스크롤 다이얼(위아래로 쓸어서 선택, PC는 마우스 드래그도 지원)로 전환. 달력↔다이얼 전환 시 `calViewSwitch`(fade+slide) 애니메이션. |
| 사람(작성자) | 컴포넌트화되지 않은 조합 패턴 — `owner/documents`/`owner/requests`의 작성자 필드 참고 | 텍스트 태그 입력(Enter로 추가, 빈 입력에서 Backspace로 마지막 태그 삭제) + 우측에 `MultiSelectFilter`를 `renderTrigger`로 커스텀 트리거(사람 아이콘 버튼)로 붙여 같은 팝업 재사용. 팝업 적용 시 "알려진 이름(옵션에 있는 이름)"만 교체하고 직접 타이핑한 자유 텍스트 태그는 보존. 매칭은 `LIKE %%`(부분일치, `some(name => field.toLowerCase().includes(name.toLowerCase()))`). |
| 선택값 호버 툴팁 | `src/lib/useHoverTooltip.ts` | `anchorRef`를 트리거(또는 뱃지)에 붙이면 `rect`(top/left/right/width, `document.body` 포털용 좌표)와 mouseenter/leave 핸들러를 반환. 절대 `position:absolute`로 부모 기준 배치하지 말 것 — 세부검색 패널이 `overflow:hidden`이라 잘린다. 항상 포털 + `position:fixed`. |

#### 트리거 박스 규칙

- 같은 이름의 필드(카테고리/작성자/기간/상태 등)는 폭을 통일한다. 공용 클래스명은 페이지별 `.advSearchNarrow`(현재 260px) — 폭을 바꿀 땐 관련된 모든 페이지의 `.advSearchNarrow`를 같이 바꾼다.
- 트리거 폭은 X(선택 해제) 버튼 유무와 무관하게 고정이어야 한다. 우측 30px을 항상 비워두고 그 여백에 X를 `position:absolute`로 띄운다(트리거 자체 `width: calc(100% - 30px)`).
- 체크박스/태그는 즉시 반영하지 않는다. 팝업에는 반드시 "적용" 버튼이 있고, 그걸 눌러야 실제 필터 state에 반영된다.

#### 호버 툴팁 규칙

- 선택값이 있을 때만(카테고리/유형/상태: 1개 이상, 작성자: 1개 이상) 트리거에 마우스 오버 시 요약 카드(아바타 첫 글자 + 이름/라벨 + 개별 제거 버튼)를 띄운다. `owner/checklists`의 담당자 2명+ 툴팁과 같은 시각 언어(아바타 원형, 카드 스타일).
- 반드시 `useHoverTooltip` + `createPortal(..., document.body)` 조합으로 렌더한다. 세부검색 패널(`.advPanel`)이 `overflow:hidden`이라 일반 `position:absolute` 자식은 z-index와 무관하게 잘린다.
- 트리거와 툴팁 사이에 시각적 간격(px)을 CSS `margin`/좌표 오프셋으로 만들지 않는다 — 마우스가 그 틈을 지날 때 hover가 끊겨 툴팁이 바로 닫힌다. 간격은 툴팁 쪽 `padding-top`으로만 준다(`useHoverTooltip`의 `rect.top`은 트리거 바로 아래, 간격 0).
- 정렬 기준은 트리거 폭에 따라 다르다:
  - 트리거가 이미 충분히 넓어 카드 내용과 폭이 맞으면(카테고리/유형/상태) `left` + `width`(트리거와 동일 폭)로 배치.
  - 트리거(뱃지)가 카드보다 좁으면(작성자 요약 뱃지) `right`(뷰포트 우측 끝 기준 거리)로 배치해 우측 끝을 맞추고 카드는 `min-width`만큼 좌측으로 자라나게 한다. `left`+`width`를 쓰면 좁은 트리거 폭에 카드가 눌려 우측 끝이 어긋난다.

## 다크 모드

다크 모드는 **모든 페이지의 기본 요구사항**이다. 새 페이지/컴포넌트를 설계·구현할 때 라이트만 만들고 끝내지 않는다 — 두 테마 모두에서 확인하는 것까지가 작업 완료 조건이다.

### 동작 구조

- 테마는 `documentElement`의 `data-theme` 속성(`light`/`dark`)으로 전환된다. 모든 토큰이 `globals.css`의 `:root[data-theme='dark']`에서 어두운 값으로 재정의되므로, **토큰만 쓰면 컴포넌트는 아무 것도 안 해도 다크 모드가 된다.**
- 상태 관리: `src/context/ThemeContext.tsx`(`useTheme()` — `theme`/`setTheme`). localStorage `theme` 키로 유지되고, `src/app/layout.tsx`의 인라인 스크립트가 첫 페인트 전에 적용해 깜빡임을 막는다.
- 설정 UI: 사이드바 좌측 하단 이름/아바타 클릭(`src/components/UserMenu.tsx`) → 위로 펼쳐지는 메뉴의 "시스템 설정" → "시스템 설정" 팝업(`src/components/SystemSettings.tsx`, 좌측 설정 항목 / 우측 상세 조정) → 테마 → 다크 모드 활성화/비활성화.
- 테마 전환 시 급격한 색 변화를 막기 위해 globals.css에서 전역 `background-color/color/border-color 0.25s` 트랜지션을 건다. 개별 컴포넌트가 자체 `transition`을 선언하면 그쪽이 우선(빠른 hover 유지)이므로 신경쓸 필요 없다.

### 토큰 이중 정의 (globals.css)

| 토큰 | 라이트 | 다크 |
|---|---|---|
| `--color-primary` | `#3D63DD` | `#6D87F0` |
| `--color-primary-light` | `#EEF3FF` | `#202B4E` |
| `--color-success` / `-light` | `#059669` / `#ECFDF5` | `#34D399` / `#102E24` |
| `--color-warning` / `-light` | `#D97706` / `#FFFBEB` | `#FBBF24` / `#33270F` |
| `--color-danger` / `-light` | `#DC2626` / `#FEF2F2` | `#F87171` / `#3A1D1D` |
| `--color-bg` | `#F3F4F8` | `#101216` |
| `--color-surface` | `#FFFFFF` | `#1A1D24` |
| `--color-text` | `#111827` | `#E7E9EF` |
| `--color-text-secondary` | `#6B7280` | `#9BA1AF` |
| `--color-border` | `#E5E7EB` | `#3D4352` (다크에서 경계가 흐릿하지 않도록 충분히 밝게) |
| `--category-badge-text-mix` | `100%` | `62%` (뱃지 텍스트에 흰색을 섞어 밝게) |

`color-scheme`도 함께 전환되어 네이티브 컨트롤(date/checkbox/select 등)이 자동으로 다크 스타일을 쓴다.

### 다크 모드 설계 규칙

1. **색은 반드시 토큰으로.** `#fff`, `#F3F4F8` 같은 표면/배경/텍스트/보더 하드코딩 금지. 라이트에서 흰 배경이 필요하면 `var(--color-surface)`, 회색 배경은 `var(--color-bg)`.
2. **예외적으로 허용되는 하드코딩**: 컬러 배경 위 흰 텍스트(`color: #fff` on primary 버튼), 오버레이(`rgba(0,0,0,0.4)`), 다크 툴팁(`rgba(20,20,20,0.85)` + 흰 텍스트) — 이들은 양쪽 테마에서 모두 성립한다.
3. **옅은 색 배경/보더가 필요하면 고정 파스텔 hex를 쓰지 말 것.** 배경은 `rgba(r, g, b, 0.12)` 틴트(카테고리 뱃지 방식), 보더는 `color-mix(in srgb, var(--color-danger) 35%, transparent)` 방식 — 이러면 다크에서도 자연스럽다.
4. **카테고리 뱃지처럼 데이터가 색을 가지는 경우** `categoryBadgeStyle()`(src/lib/categoryColors.ts)을 재사용한다. 이미 `--category-badge-text-mix`로 다크에서 텍스트를 밝게 보정한다.
5. **새 토큰이 필요하면** 라이트/다크 양쪽 값을 반드시 함께 정의하고 위 표에 추가한다.
6. **검증**: 페이지를 만들었으면 시스템 설정에서 다크 모드를 켜고 실제로 확인한다. 특히 보더 경계, 옅은 배경 위 텍스트, 그림자 대비를 본다.

---

### 향후 확장 고려사항

- **알바생 전용 테마**: 현재 사장과 같은 블루 계열 사용. 구분이 필요하면 알바생은 teal 계열 검토 가능
- **매장별 컬러**: 향후 매장마다 색상 커스터마이징이 필요할 경우 CSS custom property 레이어 분리
