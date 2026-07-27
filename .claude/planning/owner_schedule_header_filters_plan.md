# 사장 스케줄 헤더 검색·세부검색 구현 계획

> **에이전트 작업 필수 사항:** `superpowers:subagent-driven-development`를 사용해 작업 단위별 구현과 검토를 진행한다.

**목표:** 스케줄 이름 검색을 다른 사장 페이지와 같은 헤더 우측 제출형 검색으로 옮기고, 근무 시간 범위와 실제 근무 구간이 겹치는 직원만 표시하는 세부검색을 추가한다.

**구조:** `EmployeeScheduleHeader`가 공통 헤더와 펼침형 세부검색 UI를 렌더링하고, `useEmployeeScheduleFilters`가 이름·시간 필터 초안과 적용 상태 및 표시 직원 목록을 관리한다. `EmployeeScheduleManager`는 기존 스케줄 상태와 실제 근무 구간만 제공하며, 편집표는 검색 UI를 제거하고 표와 빈 결과만 담당한다.

**기술 스택:** Next.js 16, React 19, TypeScript, CSS Modules, Playwright 1.59.1

## 전체 제약

- 768px 이상에서 헤더 우측에 이름 검색 입력, `검색`, `세부 검색`을 배치한다.
- 768px 미만에서는 헤더 이름 검색을 숨기고 세부검색 버튼만 아이콘으로 표시한다.
- 세부검색 패널은 이름 검색, 필터 초기화, 근무 시간 시작·종료와 `적용` 버튼을 제공한다.
- 이름 검색은 Enter 또는 검색 버튼을 눌러 적용한다.
- 시간 범위는 초안 시작·종료가 모두 있고 `시작 < 종료`일 때만 `적용`할 수 있다.
- 근무 구간과 검색 구간은 `근무 시작 < 검색 종료 && 근무 종료 > 검색 시작`일 때 일치한다.
- 경계만 맞닿는 근무는 제외한다.
- 이름과 시간 필터는 AND 조건으로 결합한다.
- 기본 모드는 스케줄이 있고 근무 요일이 하나 이상인 직원의 기본 시간을 사용한다.
- 일자별 조정은 현재 선택 날짜의 실제 근무 여부와 조정 우선 시간을 사용한다.
- 이름·시간 필터는 표시 직원만 변경하며 스케줄, override, 저장 동작을 변경하지 않는다.
- `필터 초기화`는 이름 입력·적용 검색어·시간 초안·적용 범위를 모두 비운다.
- 세부검색 버튼은 패널이 열렸거나 적용 필터가 있으면 활성 스타일을 사용하고 숫자 배지는 추가하지 않는다.
- 헤더 검색 입력은 `헤더 직원 이름 검색`, 패널 검색 입력은 `세부검색 직원 이름 검색`으로 구분한다.
- 검색 버튼은 `헤더 직원 검색`, `세부검색 직원 검색`으로 구분한다.
- 시간 입력은 `근무 시간 시작`, `근무 시간 종료`, 적용 버튼은 `근무 시간 적용` 이름을 사용한다.
- 세부검색 버튼은 `aria-expanded`, `aria-controls`를 제공한다.
- 접힌 세부검색 패널의 내부 컨트롤은 접근성 트리와 키보드 탐색에서 제외한다.
- 모든 색은 기존 `--color-*` 토큰만 사용하고 라이트·다크 모드를 지원한다.
- 기존 저장 영역 위치·높이, 편집표 반응형 레이아웃, 편집 기능을 유지한다.
- 새 의존성이나 테스트 설정을 추가하지 않는다.
- 생성 파일을 제외한 소스 파일은 300줄 이하로 유지한다.

---

### Task 1: 표준 헤더 검색과 근무 시간 세부검색 구현

**파일:**

- 생성: `src/app/owner/attendance/EmployeeScheduleHeader.tsx`
- 생성: `src/app/owner/attendance/EmployeeScheduleHeader.module.css`
- 생성: `src/app/owner/attendance/useEmployeeScheduleFilters.ts`
- 수정: `src/app/owner/attendance/EmployeeScheduleManager.tsx`
- 수정: `src/app/owner/attendance/EmployeeScheduleManager.module.css`
- 수정: `src/app/owner/attendance/EmployeeScheduleTable.tsx`
- 수정: `src/app/owner/attendance/EmployeeScheduleTable.module.css`
- 수정: `tests/e2e/schedule-management.spec.js`
- 수정: `.claude/history/2026-07-27.md`

**인터페이스:**

```ts
export type EmployeeShift = {
  startTime: string
  endTime: string
} | null

export type ScheduleFilterControls = {
  advancedOpen: boolean
  hasActiveFilters: boolean
  searchText: string
  draftStart: string
  draftEnd: string
  canApplyTime: boolean
  timeMessage: string
  setSearchText: (value: string) => void
  setDraftStart: (value: string) => void
  setDraftEnd: (value: string) => void
  applySearch: () => void
  applyTimeRange: () => void
  toggleAdvanced: () => void
  resetFilters: () => void
}

export function useEmployeeScheduleFilters<T extends { name: string }>(
  employees: T[],
  getShift: (employee: T) => EmployeeShift,
): {
  visibleEmployees: T[]
  controls: ScheduleFilterControls
}
```

- [ ] **1단계: 실패하는 헤더·세부검색 E2E 작성**

기존 즉시검색 2건을 제출형 헤더 검색으로 바꾸고 다음 테스트를 추가한다.

```javascript
for (const [mode, path] of Object.entries(paths)) {
  test(`${mode} 헤더에서 직원 이름을 검색 버튼으로 적용한다`, async ({ page }) => {
    await open(page, path)

    const table = page.getByRole('table', {
      name: mode === 'base' ? '기본 스케줄 편집표' : '일자별 조정 편집표',
    })
    const search = page.getByRole('textbox', { name: '헤더 직원 이름 검색' })

    await search.fill(' 서 ')
    await page.getByRole('button', { name: '헤더 직원 검색' }).click()
    await expect(table.locator('[data-schedule-row]')).toHaveCount(2)
    await expect(table.getByText('이서윤', { exact: true })).toBeVisible()
    await expect(table.getByText('박서준', { exact: true })).toBeVisible()

    await search.fill('')
    await search.press('Enter')
    await expect(table.locator('[data-schedule-row]')).toHaveCount(4)
  })
}

test('모바일은 세부검색 패널에서 직원 이름을 검색한다', async ({ page }) => {
  await open(page, paths.base, 390, 844)

  await expect(page.getByRole('textbox', { name: '헤더 직원 이름 검색' })).toBeHidden()
  await page.getByRole('button', { name: '세부 검색' }).click()
  const search = page.getByRole('textbox', { name: '세부검색 직원 이름 검색' })
  await search.fill('김민수')
  await page.getByRole('button', { name: '세부검색 직원 검색' }).click()
  await expect(page.locator('[data-schedule-row]')).toHaveCount(1)
})

test('기본 스케줄은 겹치는 근무 시간 범위만 표시한다', async ({ page }) => {
  await open(page, paths.base)
  await page.getByRole('button', { name: '세부 검색' }).click()

  await page.getByLabel('근무 시간 시작').fill('10:00')
  await page.getByLabel('근무 시간 종료').fill('12:00')
  await page.getByRole('button', { name: '근무 시간 적용' }).click()

  const rows = page.getByRole('table', { name: '기본 스케줄 편집표' })
    .locator('[data-schedule-row]')
  await expect(rows).toHaveCount(2)
  await expect(page.getByText('김민수', { exact: true })).toBeVisible()
  await expect(page.getByText('박서준', { exact: true })).toBeVisible()
})

test('근무 종료와 검색 시작이 같으면 겹침에서 제외한다', async ({ page }) => {
  await open(page, paths.base)
  await page.getByRole('button', { name: '세부 검색' }).click()

  await page.getByLabel('근무 시간 시작').fill('18:00')
  await page.getByLabel('근무 시간 종료').fill('19:00')
  await page.getByRole('button', { name: '근무 시간 적용' }).click()

  await expect(page.getByText('김민수', { exact: true })).toHaveCount(0)
  await expect(page.getByText('이서윤', { exact: true })).toBeVisible()
  await expect(page.getByText('박서준', { exact: true })).toBeVisible()
})

test('일자별 조정 시간 필터는 선택 날짜와 휴무 조정을 반영한다', async ({ page }) => {
  await open(page, paths.adjust)
  await page.getByRole('button', { name: '세부 검색' }).click()
  await page.getByLabel('근무 시간 시작').fill('10:00')
  await page.getByLabel('근무 시간 종료').fill('12:00')
  await page.getByRole('button', { name: '근무 시간 적용' }).click()

  await expect(page.locator('[data-schedule-row]')).toHaveCount(1)
  await page.getByRole('button', { name: '김민수 휴무로 설정' }).click()
  await expect(page.locator('[data-schedule-row]')).toHaveCount(0)

  await page.getByRole('button', { name: '필터 초기화' }).click()
  await expect(page.locator('[data-schedule-row]')).toHaveCount(4)
  await expect(page.getByRole('button', { name: '김민수 휴무로 설정' }))
    .toHaveAttribute('aria-pressed', 'true')
})

test('불완전하거나 역전된 시간 범위는 적용할 수 없다', async ({ page }) => {
  await open(page, paths.base)
  await page.getByRole('button', { name: '세부 검색' }).click()

  const apply = page.getByRole('button', { name: '근무 시간 적용' })
  await page.getByLabel('근무 시간 시작').fill('18:00')
  await expect(apply).toBeDisabled()
  await page.getByLabel('근무 시간 종료').fill('18:00')
  await expect(apply).toBeDisabled()
  await expect(page.getByRole('status')).toContainText('종료 시간은 시작 시간보다 늦어야 합니다.')
})
```

기존 기본·일자별 조정 상태 보존 테스트는 헤더 검색을 Enter로 적용하고 빈 검색어를 Enter로 적용해 복원하도록 변경한다.

- [ ] **2단계: 새 헤더와 세부검색 부재로 실패 확인**

실행:

```bash
SCHEDULE_BASE_URL=http://localhost:3005 NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules playwright test tests/e2e/schedule-management.spec.js --grep "헤더|모바일은 세부검색|근무 시간 범위|근무 종료|일자별 조정 시간|역전된 시간|직원을 숨겨도" --reporter=line --workers=1
```

예상 결과: 헤더 검색·세부검색·시간 입력이 없어 대상 테스트가 실패한다.

- [ ] **3단계: 필터 상태와 시간 겹침 훅 작성**

`useEmployeeScheduleFilters.ts`에서 다음을 구현한다.

```ts
function toMinutes(value: string) {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

function overlaps(
  shift: Exclude<EmployeeShift, null>,
  rangeStart: string,
  rangeEnd: string,
) {
  const shiftStart = toMinutes(shift.startTime)
  const shiftEnd = toMinutes(shift.endTime)
  const filterStart = toMinutes(rangeStart)
  const filterEnd = toMinutes(rangeEnd)
  return shiftStart < filterEnd && shiftEnd > filterStart
}
```

- `searchText`와 `appliedSearch`를 분리한다.
- `draftStart`, `draftEnd`와 `appliedStart`, `appliedEnd`를 분리한다.
- 이름은 trim 후 한국어 로캘 소문자 부분 일치로 필터링한다.
- 유효한 적용 시간 범위가 있으면 `getShift`가 null이 아닌 직원 중 `overlaps`만 표시한다.
- `applyTimeRange`는 `canApplyTime`일 때만 적용값을 갱신한다.
- 한쪽 시간만 있으면 `시작과 종료 시간을 모두 입력하세요.`를 반환한다.
- 역전·동일 범위면 `종료 시간은 시작 시간보다 늦어야 합니다.`를 반환한다.
- `resetFilters`는 검색·시간 초안과 적용값을 모두 초기화한다.

- [ ] **4단계: 공통 헤더와 세부검색 패널 작성**

`EmployeeScheduleHeader.tsx`에서 기존 사장 페이지 구조를 따른다.

- `<header>`에 뒤로가기, 제목, 데스크톱 검색, 검색 버튼, 세부검색 버튼을 렌더링한다.
- 세부검색 패널 첫 행에 패널 검색, 검색 버튼, 필터 초기화를 렌더링한다.
- 두 번째 행에 시작·종료 `type="time"` 입력과 적용 버튼, 상태 안내를 렌더링한다.
- 세부검색 버튼에 `aria-expanded`, `aria-controls="schedule-advanced-search"`를 제공한다.
- 패널에 `id="schedule-advanced-search"`와 `aria-hidden`을 제공한다.
- 접힌 패널은 CSS `visibility:hidden`과 `pointer-events:none`으로 접근과 클릭을 막는다.
- 모든 버튼은 `type="button"`을 지정한다.
- 검색 아이콘과 슬라이더 아이콘은 보조 기술에서 숨긴다.

- [ ] **5단계: 표준 반응형 헤더 스타일 작성**

`EmployeeScheduleHeader.module.css`에서 `owner/employees` 패턴을 따른다.

- 기존 sticky 헤더 높이·위치와 페이지 여백을 유지한다.
- `.headerSearch`는 기본 숨김, 768px 이상 `display:flex`, `flex:1`, `min-width:0`, `max-width:400px`, `margin-left:auto`.
- 검색 입력·버튼·세부검색 버튼은 기존 토큰, 크기, hover, 활성 스타일을 사용한다.
- `.advBtnLabel`은 기본 숨김, 768px 이상 표시한다.
- `.advPanel`은 헤더 아래 sticky, 접힘 상태 `max-height:0`, `opacity:0`, `visibility:hidden`.
- 열린 패널은 `max-height:240px`, `padding:14px var(--page-x)`, `visibility:visible`, 하단 보더를 사용한다.
- 행 라벨 폭은 `52px`, 시간 범위 필드는 모바일 전체 폭, 768px 이상 `320px`를 사용한다.
- 오류·안내는 `--color-text-secondary`와 `--color-danger`를 사용한다.

- [ ] **6단계: Manager와 편집표 책임 연결**

`EmployeeScheduleManager.tsx`:

- `LiaAngleLeftSolid` import와 기존 header JSX를 제거하고 `EmployeeScheduleHeader`로 교체한다.
- 기존 이름 검색 상태·정규화·필터를 제거한다.
- `effectiveDay` 정의 뒤 `useEmployeeScheduleFilters`를 호출한다.
- 기본 모드는 스케줄과 근무 요일 존재를 확인해 shift를 반환한다.
- 일자별 조정은 `effectiveDay(employee.id, schedDate).working`일 때만 shift를 반환한다.
- 두 모드 모두 `filters.visibleEmployees`를 렌더링한다.
- 표에는 `empty`만 전달한다.

`EmployeeScheduleManager.module.css`:

- 새 헤더 모듈로 이동한 `.header`, `.backBtn`, `.heading` 규칙을 제거한다.
- 공통 flex 선택자에서 `.backBtn`만 제거하고 나머지 규칙은 유지한다.

`EmployeeScheduleTable.tsx`:

- 아이콘 import, query, onQueryChange, 검색 toolbar를 제거한다.
- `mode`, `children`, `empty`만 받는다.

`EmployeeScheduleTable.module.css`:

- `.searchToolbar`, `.search`, `.searchIcon`, 검색 input/button 규칙을 제거한다.
- 편집표·빈 결과·저장 영역 규칙은 유지한다.

- [ ] **7단계: 검색·세부검색과 전체 회귀 통과 확인**

실행:

```bash
SCHEDULE_BASE_URL=http://localhost:3005 NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules playwright test tests/e2e/schedule-management.spec.js --reporter=line --workers=1
```

예상 결과: 기존 회귀와 새 헤더·시간 범위 테스트가 모두 통과한다.

- [ ] **8단계: 시각·정적·빌드 검증**

- 1440×900에서 검색·검색 버튼·세부검색이 헤더 우측에 정렬되는지 확인한다.
- 768×900에서 헤더 컨트롤이 넘치거나 제목을 가리지 않는지 확인한다.
- 390×844에서 헤더 검색은 숨고 세부검색 패널 검색과 시간 필드가 전체 폭으로 표시되는지 확인한다.
- 기본·일자별 조정에서 시간 범위, 이름 교집합, 초기화, 빈 결과를 확인한다.
- 라이트·다크 모드에서 헤더 입력, 활성 세부검색 버튼, 패널, 오류 메시지 대비를 확인한다.
- 현재 3005 개발 서버를 보호하기 위해 빌드는 별도 임시 worktree에서 실행한다.

실행:

```bash
npx eslint src/app/owner/attendance/EmployeeScheduleManager.tsx src/app/owner/attendance/EmployeeScheduleHeader.tsx src/app/owner/attendance/EmployeeScheduleTable.tsx src/app/owner/attendance/useEmployeeScheduleFilters.ts tests/e2e/schedule-management.spec.js
git diff --check
wc -l src/app/owner/attendance/EmployeeScheduleManager.tsx src/app/owner/attendance/EmployeeScheduleManager.module.css src/app/owner/attendance/EmployeeScheduleHeader.tsx src/app/owner/attendance/EmployeeScheduleHeader.module.css src/app/owner/attendance/EmployeeScheduleTable.tsx src/app/owner/attendance/EmployeeScheduleTable.module.css src/app/owner/attendance/useEmployeeScheduleFilters.ts tests/e2e/schedule-management.spec.js
```

예상 결과: 변경 파일 린트·diff·격리 빌드 성공, 모든 소스 파일 300줄 이하.

- [ ] **9단계: 이력 기록, 커밋, 푸시**

`.claude/history/2026-07-27.md`에 헤더 검색·근무 시간 세부검색과 검증 결과를 추가한다.

```bash
git add src/app/owner/attendance/EmployeeScheduleHeader.tsx src/app/owner/attendance/EmployeeScheduleHeader.module.css src/app/owner/attendance/useEmployeeScheduleFilters.ts src/app/owner/attendance/EmployeeScheduleManager.tsx src/app/owner/attendance/EmployeeScheduleManager.module.css src/app/owner/attendance/EmployeeScheduleTable.tsx src/app/owner/attendance/EmployeeScheduleTable.module.css tests/e2e/schedule-management.spec.js .claude/history/2026-07-27.md
git commit -m "feat: 스케줄 헤더 근무시간 세부검색 추가"
git push
```
