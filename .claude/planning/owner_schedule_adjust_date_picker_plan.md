# 사장 스케줄 일자별 조정 달력 구현 계획

> **작업 에이전트 필수 스킬:** `superpowers:subagent-driven-development`를 사용해 작업 단위 구현과 리뷰를 진행한다. 각 단계는 체크박스로 추적한다.

**목표:** 일자별 조정의 네이티브 날짜 입력을 업무리스트 상단과 같은 단일 날짜 월간 팝업 달력으로 교체한다.

**구조:** 달력 상태와 날짜 계산은 새 `EmployeeScheduleDatePicker`에 캡슐화하고, 기존 관리자는 `schedDate`와 변경 콜백만 전달한다. 기존 회귀 테스트의 네이티브 입력 조작을 사용자 관점의 달력 조작으로 바꾸고, 달력 전용 E2E로 열기·월 이동·선택·닫기·모바일 폭을 검증한다.

**기술 스택:** Next.js, React, TypeScript, CSS Modules, Playwright

## 전체 제약

- AI 응답과 커밋 메시지는 한글로 작성한다.
- 코드 주석은 영어로 작성한다.
- 생성 파일을 제외한 소스 파일은 300줄 이하, 가능하면 200줄 이하로 유지한다.
- 업무리스트 달력 자체와 기존 스케줄 필터 계산은 변경하지 않는다.
- 라이트·다크 모드와 390px 모바일 폭을 지원한다.
- 커밋 형식은 `feat: {작업내역 한글}`을 사용한다.

---

### 작업 1: 일자별 조정 단일 날짜 달력

**파일:**

- 생성: `src/app/owner/attendance/EmployeeScheduleDatePicker.tsx`
- 생성: `src/app/owner/attendance/EmployeeScheduleDatePicker.module.css`
- 수정: `src/app/owner/attendance/EmployeeScheduleManager.tsx`
- 수정: `src/app/owner/attendance/EmployeeScheduleManager.module.css`
- 수정: `tests/e2e/schedule-management.spec.js`
- 생성: `tests/e2e/schedule-date-picker.spec.js`
- 수정: `.claude/history/2026-07-27.md`

**인터페이스:**

- 입력: `value: string`, `today: string`, `onChange: (value: string) => void`
- 출력: `EmployeeScheduleDatePicker` React 컴포넌트
- 관리자 연결: `value={schedDate}`, `today={TODAY}`, `onChange={setSchedDate}`
- 날짜 버튼 접근성 이름: `조정 날짜`
- 팝업 접근성 이름: `조정 날짜 선택`
- 날짜 셀 접근성 이름: `${year}년 ${month}월 ${day}일 선택`

- [ ] **1단계: 실패하는 달력 E2E 작성**

  `tests/e2e/schedule-date-picker.spec.js`에 다음 사용자 동작을 독립 테스트로 작성한다.

  ```js
  test('일자별 조정 날짜 버튼에서 월간 달력을 열고 날짜를 선택한다', async ({ page }) => {
    await page.goto('/owner/attendance/adjust')
    const trigger = page.getByRole('button', { name: '조정 날짜' })
    await expect(trigger).toContainText('6월 30일 (화)')
    await trigger.click()
    await expect(page.getByRole('dialog', { name: '조정 날짜 선택' })).toBeVisible()
    await expect(page.getByText('2026년 6월', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: '다음 달' }).click()
    await page.getByRole('button', { name: '2026년 7월 1일 선택' }).click()
    await expect(trigger).toContainText('7월 1일 (수)')
    await expect(page.getByRole('dialog', { name: '조정 날짜 선택' })).toBeHidden()
  })
  ```

  같은 파일에서 월 이동만으로 선택값이 변하지 않는 동작, 바깥 클릭과 ESC 닫기, 선택일 `aria-pressed`, 오늘 `aria-current="date"`, 390px 가로 넘침 없음도 검증한다.

- [ ] **2단계: 실패 상태 확인**

  실행:

  ```bash
  NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules \
    playwright test tests/e2e/schedule-date-picker.spec.js --reporter=line --workers=1
  ```

  예상: `조정 날짜` 버튼이나 `조정 날짜 선택` dialog를 찾지 못해 실패한다.

- [ ] **3단계: 달력 컴포넌트 최소 구현**

  `EmployeeScheduleDatePicker.tsx`에 다음 책임을 구현한다.

  ```ts
  type EmployeeScheduleDatePickerProps = {
    value: string
    today: string
    onChange: (value: string) => void
  }

  export default function EmployeeScheduleDatePicker({
    value,
    today,
    onChange,
  }: EmployeeScheduleDatePickerProps) {
    // open state, selected-month reset, Monday-first month grid,
    // month navigation, date selection, outside-click and ESC close
  }
  ```

  트리거는 `M월 D일 (요일)`을 표시하고 `aria-expanded`, `aria-haspopup="dialog"`, `aria-controls`를 제공한다. 팝업에는 이전·다음 달 버튼, 월요일 시작 7열, 전체 날짜 접근성 이름, 선택일 `aria-pressed`, 오늘 `aria-current="date"`를 제공한다. 날짜 선택은 `YYYY-MM-DD`로 즉시 `onChange`하고 닫으며, 월 이동과 취소 닫기는 값을 바꾸지 않는다.

- [ ] **4단계: 업무리스트 시각 패턴 적용**

  `EmployeeScheduleDatePicker.module.css`에 업무리스트 달력과 같은 272px 카드, 14px 모서리, 월 헤더, 7열 날짜 그리드, 선택일 원형 primary 배경, 토요일 primary, 일요일 danger 색상을 CSS 토큰으로 구현한다. 팝업은 트리거 아래 왼쪽에 배치하고 `max-width: calc(100vw - 32px)`로 390px 화면의 가로 넘침을 막는다.

  `EmployeeScheduleManager.tsx`에서 네이티브 `<input type="date">`를 다음 연결로 교체한다.

  ```tsx
  <EmployeeScheduleDatePicker
    value={schedDate}
    today={TODAY}
    onChange={setSchedDate}
  />
  ```

  `EmployeeScheduleManager.module.css`에서는 더 이상 쓰이지 않는 `.dateInput`만 제거하고 기존 `dateRow` 및 상태 표시 배치는 유지한다.

- [ ] **5단계: 기존 회귀 테스트를 달력 조작으로 갱신**

  `tests/e2e/schedule-management.spec.js`의 `input[aria-label="조정 날짜"]`에 대한 `.fill('2026-07-01')` 호출을 다음 사용자 동작으로 바꾼다.

  ```js
  await page.getByRole('button', { name: '조정 날짜' }).click()
  await page.getByRole('button', { name: '다음 달' }).click()
  await page.getByRole('button', { name: '2026년 7월 1일 선택' }).click()
  ```

  파일이 300줄을 넘지 않도록 중복 동작은 짧은 `selectNextMonthDate(page)` 헬퍼로 추출한다.

- [ ] **6단계: 기능 테스트 통과 확인**

  실행:

  ```bash
  NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules \
    playwright test tests/e2e/schedule-management.spec.js tests/e2e/schedule-date-picker.spec.js \
    --reporter=line --workers=1
  ```

  예상: 전체 통과.

- [ ] **7단계: 정적·빌드·시각 검증**

  실행:

  ```bash
  npm run lint
  git diff --check
  wc -l src/app/owner/attendance/EmployeeScheduleDatePicker.tsx \
    src/app/owner/attendance/EmployeeScheduleDatePicker.module.css \
    src/app/owner/attendance/EmployeeScheduleManager.tsx \
    src/app/owner/attendance/EmployeeScheduleManager.module.css \
    tests/e2e/schedule-management.spec.js
  npm run build
  ```

  Playwright로 1440px, 768px, 390px의 라이트·다크 화면을 캡처하고 달력 카드 위치, 선택일, 주말 색상, 가로 넘침이 없는지 직접 확인한다.

- [ ] **8단계: 이력 기록과 커밋**

  `.claude/history/2026-07-27.md`에 사용자 요청, 구현 범위, 테스트 결과를 기록한다.

  ```bash
  git add src/app/owner/attendance tests/e2e \
    .claude/history/2026-07-27.md
  git commit -m "feat: 스케줄 일자별 조정 달력 추가"
  ```
