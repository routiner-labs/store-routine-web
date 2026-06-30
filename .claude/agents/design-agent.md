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

### 향후 확장 고려사항

- **다크 모드**: blue-900(`#162577`)을 배경으로, blue-300(`#93A8FA`)을 프라이머리로 전환
- **알바생 전용 테마**: 현재 사장과 같은 블루 계열 사용. 구분이 필요하면 알바생은 teal 계열 검토 가능
- **매장별 컬러**: 향후 매장마다 색상 커스터마이징이 필요할 경우 CSS custom property 레이어 분리
