# 사장 스케줄 직원 이름 검색 구현 계획

> **에이전트 작업 필수 사항:** `superpowers:subagent-driven-development`를 사용해 작업 단위별 구현과 검토를 진행한다.

**목표:** 기본 스케줄과 일자별 조정 편집표에서 직원 이름 일부를 입력해 표시할 직원 행을 즉시 필터링한다.

**구조:** `EmployeeScheduleManager`가 검색어와 필터링된 활성 직원 목록을 소유한다. `EmployeeScheduleTable`은 편집표 바깥의 공통 검색 입력과 편집표 안의 빈 결과 행을 렌더링하며, 기존 스케줄과 일자별 조정 상태는 직원 ID 기준으로 유지한다.

**기술 스택:** Next.js 16, React 19, TypeScript, CSS Modules, Playwright 1.59.1

## 전체 제약

- 기본 스케줄과 일자별 조정 모두 같은 이름 검색 UI와 동작을 사용한다.
- 검색은 활성 직원 이름의 부분 일치 방식이며 입력 즉시 적용한다.
- 검색어 앞뒤 공백을 무시하고 검색어가 비어 있으면 활성 직원 전체를 표시한다.
- 검색으로 숨겨진 직원의 스케줄과 일자별 조정 상태를 삭제하거나 초기화하지 않는다.
- 검색창은 768px 이상에서 편집표 우측에 배치하고 768px 미만에서 전체 폭을 사용한다.
- 검색 결과가 없으면 편집표 안에 `검색 결과가 없습니다.`를 표시한다.
- 검색 입력의 접근 가능한 이름은 `직원 이름 검색`, 지우기 버튼은 `직원 검색어 지우기`로 지정한다.
- 모든 색은 기존 `--color-*` 토큰만 사용하고 라이트·다크 모드를 지원한다.
- 저장 영역 위치와 높이, 저장 동작, 기존 편집 동작을 변경하지 않는다.
- 새 의존성이나 테스트 설정을 추가하지 않는다.
- 생성 파일을 제외한 소스 파일은 300줄 이하로 유지한다.

---

### Task 1: 스케줄 직원 이름 검색 구현

**파일:**

- 수정: `src/app/owner/attendance/EmployeeScheduleManager.tsx`
- 수정: `src/app/owner/attendance/EmployeeScheduleTable.tsx`
- 수정: `src/app/owner/attendance/EmployeeScheduleTable.module.css`
- 수정: `tests/e2e/schedule-management.spec.js`
- 수정: `.claude/history/2026-07-27.md`

**인터페이스:**

- `EmployeeScheduleTable` 추가 입력:
  - `query: string`
  - `onQueryChange: (value: string) => void`
  - `empty: boolean`
- 검색 입력: `aria-label="직원 이름 검색"`
- 검색어 지우기: `aria-label="직원 검색어 지우기"`
- 빈 결과: `검색 결과가 없습니다.`

- [ ] **1단계: 실패하는 이름 검색 E2E 작성**

`tests/e2e/schedule-management.spec.js`에 두 경로 공통 검색 테스트와 편집 상태 유지 테스트를 추가한다.

```javascript
for (const [mode, path] of Object.entries(paths)) {
  test(`${mode} 스케줄에서 직원 이름 일부로 즉시 검색하고 초기화한다`, async ({ page }) => {
    await open(page, path)

    const table = page.getByRole('table', {
      name: mode === 'base' ? '기본 스케줄 편집표' : '일자별 조정 편집표',
    })
    const search = page.getByRole('textbox', { name: '직원 이름 검색' })

    await expect(search).toBeVisible({ timeout: 2000 })
    await expect(table.locator('[data-schedule-row]')).toHaveCount(4)

    await search.fill(' 서 ')
    await expect(table.locator('[data-schedule-row]')).toHaveCount(2)
    await expect(table.getByText('이서윤', { exact: true })).toBeVisible()
    await expect(table.getByText('박서준', { exact: true })).toBeVisible()
    await expect(table.getByText('김민수', { exact: true })).toHaveCount(0)

    await search.fill('없는직원')
    await expect(table.locator('[data-schedule-row]')).toHaveCount(0)
    await expect(table.getByText('검색 결과가 없습니다.', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: '직원 검색어 지우기' }).click()
    await expect(search).toHaveValue('')
    await expect(table.locator('[data-schedule-row]')).toHaveCount(4)
  })
}

test('검색으로 직원을 숨겨도 기본 스케줄 편집값을 유지한다', async ({ page }) => {
  await open(page, paths.base)

  const search = page.getByRole('textbox', { name: '직원 이름 검색' })
  const start = page.getByLabel('김민수 시작 시간')

  await expect(search).toBeVisible({ timeout: 2000 })
  await start.fill('10:00')
  await search.fill('이서윤')
  await expect(start).toHaveCount(0)
  await page.getByRole('button', { name: '직원 검색어 지우기' }).click()
  await expect(page.getByLabel('김민수 시작 시간')).toHaveValue('10:00')
})
```

- [ ] **2단계: 검색 UI 부재로 실패하는지 확인**

실행:

```bash
SCHEDULE_BASE_URL=http://localhost:3005 NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules playwright test tests/e2e/schedule-management.spec.js --grep "직원 이름|직원을 숨겨도" --reporter=line --workers=1
```

예상 결과: `직원 이름 검색` 입력을 찾지 못해 3건 모두 실패한다.

- [ ] **3단계: 검색 상태와 필터링된 직원 목록 추가**

`EmployeeScheduleManager.tsx`에서 활성 직원 계산 직후 다음 표현 상태를 추가한다.

```tsx
const [employeeQuery, setEmployeeQuery] = useState('')
const normalizedQuery = employeeQuery.trim().toLocaleLowerCase('ko-KR')
const visibleEmployees = normalizedQuery
  ? activeEmployees.filter((employee) =>
      employee.name.toLocaleLowerCase('ko-KR').includes(normalizedQuery),
    )
  : activeEmployees
```

- 두 모드의 `activeEmployees.map(...)`을 `visibleEmployees.map(...)`으로 변경한다.
- 두 `EmployeeScheduleTable`에 `query`, `onQueryChange`, `empty`을 전달한다.
- 검색은 렌더링 목록에만 적용하고 `schedules`, `overrides`, 저장 함수는 변경하지 않는다.
- `EmployeeScheduleManager.tsx`를 300줄 이하로 유지하기 위해 검색 UI 마크업은 추가하지 않는다.

- [ ] **4단계: 공통 검색 UI와 빈 결과 행 추가**

`EmployeeScheduleTable.tsx`에 `LiaSearchSolid`, `LiaTimesSolid`을 가져오고 추가 입력을 받는다.

```tsx
<>
  <div className={styles.searchToolbar}>
    <label className={styles.search}>
      <LiaSearchSolid className={styles.searchIcon} aria-hidden="true" />
      <input
        type="text"
        aria-label="직원 이름 검색"
        placeholder="직원 이름 검색"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      {query && (
        <button
          type="button"
          aria-label="직원 검색어 지우기"
          onClick={() => onQueryChange('')}
        >
          <LiaTimesSolid aria-hidden="true" />
        </button>
      )}
    </label>
  </div>
  <div role="table" aria-label={label} className={tableClassName}>
    <div role="row" className={styles.head}>
      ...
    </div>
    {empty ? (
      <div role="row" className={styles.emptyRow}>
        <span role="cell" aria-colspan={4}>검색 결과가 없습니다.</span>
      </div>
    ) : children}
  </div>
</>
```

- 검색 도구는 `role="table"` 바깥의 형제로 렌더링한다.
- 검색 아이콘과 지우기 아이콘은 보조 기술에서 숨긴다.
- 빈 결과는 실제 표 행·셀 의미를 유지한다.

- [ ] **5단계: 반응형 검색 및 빈 결과 스타일 추가**

`EmployeeScheduleTable.module.css`에 다음 스타일을 추가한다.

- `.searchToolbar`: 편집표 위에 배치하며 `display:flex`, `justify-content:flex-end`, `margin:8px 0 4px`을 사용한다.
- `.search`: `position:relative`, 모바일 `width:100%`, 768px 이상 `width:280px`.
- 입력: 전체 폭, 38px 높이, 좌우 아이콘 공간, 토큰 기반 배경·보더·텍스트, 포커스 시 `--color-primary`.
- 검색 아이콘: 왼쪽 절대 위치, `--color-text-secondary`.
- 지우기 버튼: 오른쪽 절대 위치, 28px 정사각형, 토큰 기반 hover.
- `.emptyRow`: 편집표의 전체 열을 차지하고 최소 높이와 중앙 정렬, `--color-text-secondary`.
- 기존 편집표의 반응형 열과 페이지 가로 넘침 규칙을 변경하지 않는다.

- [ ] **6단계: 검색 테스트와 전체 회귀 테스트 통과 확인**

실행:

```bash
SCHEDULE_BASE_URL=http://localhost:3005 NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules playwright test tests/e2e/schedule-management.spec.js --reporter=line --workers=1
```

예상 결과: 기존 16건과 검색 3건, 총 19건 통과.

- [ ] **7단계: 시각·정적·빌드 검증**

- 1440×900에서 검색창이 편집표 우측에 정렬되는지 확인한다.
- 768×900과 390×844에서 검색창이 가로로 넘치지 않고 모바일에서 전체 폭인지 확인한다.
- 기본 스케줄과 일자별 조정의 검색 결과, 빈 결과, 검색 초기화를 확인한다.
- 라이트·다크 모드에서 입력, 아이콘, 포커스, 빈 결과 대비를 확인한다.
- 현재 3005 개발 서버를 보호하기 위해 프로덕션 빌드는 별도 임시 작업 트리에서 실행한다.

실행:

```bash
npx eslint src/app/owner/attendance/EmployeeScheduleManager.tsx src/app/owner/attendance/EmployeeScheduleTable.tsx tests/e2e/schedule-management.spec.js
git diff --check
wc -l src/app/owner/attendance/EmployeeScheduleManager.tsx src/app/owner/attendance/EmployeeScheduleTable.tsx src/app/owner/attendance/EmployeeScheduleTable.module.css tests/e2e/schedule-management.spec.js
```

예상 결과: 변경 파일 린트와 diff 검사 및 별도 작업 트리 빌드 성공, 모든 소스 파일 300줄 이하.

- [ ] **8단계: 이력 기록, 커밋, 푸시**

`.claude/history/2026-07-27.md`에 검색 동작과 검증 결과를 추가한다.

```bash
git add src/app/owner/attendance/EmployeeScheduleManager.tsx src/app/owner/attendance/EmployeeScheduleTable.tsx src/app/owner/attendance/EmployeeScheduleTable.module.css tests/e2e/schedule-management.spec.js .claude/history/2026-07-27.md
git commit -m "feat: 스케줄 직원 이름 검색 추가"
git push
```
