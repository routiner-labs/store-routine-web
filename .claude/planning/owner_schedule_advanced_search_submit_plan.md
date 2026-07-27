# 스케줄 세부검색 단일 확정 구현 계획

> **에이전트 작업 필수 사항:** `superpowers:subagent-driven-development`를 사용해 작업 단위별 구현과 검토를 진행한다. 각 단계는 체크박스로 추적한다.

**목표:** 세부검색의 이름과 근무시간을 `검색` 버튼을 눌렀을 때만 함께 적용하고, 헤더와 세부검색 버튼의 화면 문구를 `검색`으로 통일한다.

**구조:** `useEmployeeScheduleFilters`는 헤더 이름 검색과 세부검색 전체 적용을 별도 액션으로 제공한다. `EmployeeScheduleHeader`는 시간 전용 적용 버튼을 제거하고 세부검색의 단일 검색 버튼으로 이름·시간 초안을 확정하며, 기존 필터 판정과 편집 상태는 변경하지 않는다.

**기술 스택:** Next.js 16, React 19, TypeScript, CSS Modules, Playwright 1.59.1

## 전체 제약

- 헤더 검색은 이름만 적용한다.
- 세부검색 검색은 이름과 근무시간 초안을 함께 적용한다.
- 세부검색 입력 변경만으로 목록을 갱신하지 않는다.
- 시작·종료 시간이 모두 비어 있으면 시간 필터를 해제할 수 있다.
- 불완전하거나 `시작 >= 종료`인 시간 범위에서는 세부검색 검색을 비활성화한다.
- 헤더와 세부검색 버튼의 화면 텍스트는 모두 `검색`이다.
- 접근 가능한 이름은 각각 `헤더 직원 검색`, `세부검색 검색`으로 구분한다.
- 필터 초기화, 시간 겹침 판정, 기본·일자별 조정 기준, 편집 상태와 저장 동작은 유지한다.
- 색상은 기존 CSS 토큰을 사용하고 라이트·다크 모드를 유지한다.
- 새 의존성을 추가하지 않는다.
- 변경 소스와 E2E 파일은 300줄 이하를 유지한다.

---

### Task 1: 세부검색 단일 확정 동작

**파일:**

- 수정: `tests/e2e/schedule-management.spec.js`
- 수정: `src/app/owner/attendance/useEmployeeScheduleFilters.ts`
- 수정: `src/app/owner/attendance/EmployeeScheduleHeader.tsx`
- 수정: `src/app/owner/attendance/EmployeeScheduleHeader.module.css`
- 수정: `.claude/history/2026-07-27.md`

**인터페이스:**

- 입력: `searchText`, `draftStart`, `draftEnd`
- 출력: `applySearch()`는 헤더 이름만 적용
- 출력: `applyAdvancedSearch()`는 이름과 유효한 시간 범위를 함께 적용
- 출력: `canApplyAdvanced`는 시간 초안이 비어 있거나 유효한 범위일 때 `true`

- [ ] **1단계: 실패하는 E2E 작성**

`tests/e2e/schedule-management.spec.js`에서 시간 입력과 확정 액션을 분리한다.

```js
async function fillTimeRange(page, start, end) {
  await page.getByLabel('근무 시간 시작').fill(start)
  await page.getByLabel('근무 시간 종료').fill(end)
}

async function applyAdvancedSearch(page) {
  await page.getByRole('button', { name: '세부검색 검색' }).click()
}
```

기존 세부검색 시나리오에 버튼을 누르기 전 결과 유지와 버튼 문구를 추가한다.

```js
const advancedSearch = page.getByRole('button', { name: '세부검색 검색' })
await expect(advancedSearch).toHaveText('검색')
await fillTimeRange(page, '10:00', '12:00')
await expect(page.locator('[data-schedule-row]')).toHaveCount(4)
await advancedSearch.click()
await expect(page.locator('[data-schedule-row]')).toHaveCount(2)
```

모바일 이름 검색도 입력만으로 결과가 변하지 않는지 확인한다.

```js
await search.fill('김민수')
await expect(page.locator('[data-schedule-row]')).toHaveCount(4)
await page.getByRole('button', { name: '세부검색 검색' }).click()
await expect(page.locator('[data-schedule-row]')).toHaveCount(1)
```

헤더 검색 버튼은 접근 가능한 이름을 유지하면서 화면 텍스트만 확인한다.

```js
const headerSearch = page.getByRole('button', { name: '헤더 직원 검색' })
await expect(headerSearch).toHaveText('검색')
```

불완전·역전 범위 테스트는 세부검색 검색 버튼이 비활성인지 확인한다.

```js
const searchButton = page.getByRole('button', { name: '세부검색 검색' })
await expect(searchButton).toBeEnabled()
await page.getByLabel('근무 시간 시작').fill('18:00')
await expect(searchButton).toBeDisabled()
await page.getByLabel('근무 시간 종료').fill('17:00')
await expect(searchButton).toBeDisabled()
```

- [ ] **2단계: RED 확인**

실행:

```bash
NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules playwright test tests/e2e/schedule-management.spec.js --grep "헤더에서|모바일은|겹치는 근무|교집합|근무 종료|일자별 조정 시간|불완전|한쪽 시간" --reporter=line --workers=1
```

예상 결과: `세부검색 검색` 버튼이 없고 기존 시간 적용이 별도 버튼에서 즉시 확정되므로 실패한다.

- [ ] **3단계: 필터 확정 인터페이스 구현**

`ScheduleFilterControls`에서 시간 전용 확정 인터페이스를 단일 세부검색 확정으로 교체한다.

```ts
export type ScheduleFilterControls = {
  canApplyAdvanced: boolean
  applySearch: () => void
  applyAdvancedSearch: () => void
  // 기존 검색·시간 초안·패널·초기화 필드는 유지
}
```

`useEmployeeScheduleFilters`에서 빈 시간 범위는 유효한 세부검색으로 취급하고, 세부검색 확정 시 이름과 시간을 함께 복사한다.

```ts
const canApplyAdvanced = timeMessageKind === 'none'

applyAdvancedSearch: () => {
  if (!canApplyAdvanced) return
  setAppliedSearch(searchText)
  setAppliedStart(draftStart)
  setAppliedEnd(draftEnd)
},
```

기존 `applySearch`는 이름만 갱신하고 적용된 시간 범위를 유지한다.

- [ ] **4단계: 헤더와 패널 UI 구현**

헤더 버튼은 접근 가능한 이름과 화면 문구를 분리한다.

```tsx
<button
  type="button"
  className={styles.searchBtn}
  aria-label="헤더 직원 검색"
  onClick={controls.applySearch}
>
  검색
</button>
```

세부검색 버튼은 전체 초안을 확정하고, 시간 행의 별도 적용 버튼은 제거한다.

```tsx
<button
  type="button"
  className={styles.searchBtn}
  aria-label="세부검색 검색"
  disabled={!controls.canApplyAdvanced}
  onClick={controls.applyAdvancedSearch}
>
  검색
</button>
```

패널 이름 입력의 Enter는 `applyAdvancedSearch`, 헤더 이름 입력의 Enter는 `applySearch`를 호출한다. CSS는 `.searchBtn:disabled`에 기존 비활성 스타일을 적용하고 사용하지 않는 `.applyBtn` 규칙을 제거한다.

- [ ] **5단계: GREEN과 회귀 검증**

실행:

```bash
NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules playwright test tests/e2e/schedule-management.spec.js --reporter=line --workers=1
npx eslint src/app/owner/attendance/EmployeeScheduleHeader.tsx src/app/owner/attendance/useEmployeeScheduleFilters.ts tests/e2e/schedule-management.spec.js
git diff --check
```

예상 결과: 스케줄 E2E 전체 통과, 린트와 diff 검사 통과, 모든 변경 파일 300줄 이하.

- [ ] **6단계: 반응형·다크모드와 빌드 검증**

- `1440x900`, `768x900`, `390x844`에서 세부검색 패널을 열고 단일 검색 버튼의 배치와 가로 넘침을 확인한다.
- 라이트·다크 모드에서 검색 버튼의 기본·비활성 상태를 확인한다.
- 활성 개발 서버의 `.next`를 건드리지 않도록 detached 임시 worktree에서 `npm run build`를 실행한다.

- [ ] **7단계: 기록·커밋·푸시**

`.claude/history/2026-07-27.md`에 변경 파일, 단일 확정 동작, 검증 결과를 추가한다.

```bash
git add \
  src/app/owner/attendance/EmployeeScheduleHeader.tsx \
  src/app/owner/attendance/EmployeeScheduleHeader.module.css \
  src/app/owner/attendance/useEmployeeScheduleFilters.ts \
  tests/e2e/schedule-management.spec.js \
  .claude/history/2026-07-27.md
git commit -m "feat: 스케줄 세부검색 검색 확정 적용"
git push origin mockup_v2_codex
```
