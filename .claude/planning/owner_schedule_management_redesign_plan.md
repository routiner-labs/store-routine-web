# 사장 스케줄 관리 화면 재설계 구현 계획

> **에이전트 작업 필수 사항:** `superpowers:subagent-driven-development`를 사용해 작업 단위별 구현과 검토를 진행한다.

**목표:** 기본 스케줄과 일자별 조정을 웹에서 열 헤더가 있는 밀도 높은 편집표로 재구성하고 모바일 동작을 유지한다.

**구조:** 기존 스케줄 상태와 이벤트는 `EmployeeScheduleManager`에 유지한다. 표 헤더·래퍼와 반응형 편집표 스타일을 별도 컴포넌트로 분리해 기존 300줄 제한을 지키며, 임시 Playwright 테스트로 정보 간격과 화면 넘침을 검증한다.

**기술 스택:** Next.js 16, React 19, TypeScript, CSS Modules, 전역 Playwright 1.59.1

## 전체 제약

- 사장 공통 사이드바와 상단 구조를 유지한다.
- 기본 스케줄과 일자별 조정의 데이터, 상태, 이벤트, 저장 동작을 변경하지 않는다.
- 768px 미만의 기존 세로 흐름을 유지한다.
- 1024px 이상에서 `직원 / 근무 요일 또는 근무 여부 / 근무 시간 / 관리` 열을 표시한다.
- 시간 입력과 관리 버튼은 설정 영역 바로 다음에 배치하고 페이지 전체 가로 스크롤을 만들지 않는다.
- 색은 기존 `--color-*` 토큰만 사용한다.
- 새 의존성이나 프로젝트 테스트 설정을 추가하지 않는다.
- 생성 파일을 제외한 소스 파일은 300줄 이하로 유지한다.

---

### Task 1: 반응형 스케줄 편집표 구현

**파일:**

- 임시 생성: `/tmp/store-routine-web-schedule-redesign/playwright.config.js`
- 임시 생성: `/tmp/store-routine-web-schedule-redesign/schedule-redesign.spec.js`
- 생성: `src/app/owner/attendance/EmployeeScheduleTable.tsx`
- 생성: `src/app/owner/attendance/EmployeeScheduleTable.module.css`
- 수정: `src/app/owner/attendance/EmployeeScheduleManager.tsx`
- 수정: `src/app/owner/attendance/EmployeeScheduleManager.module.css`
- 수정: `.claude/history/2026-07-27.md`

**인터페이스:**

- `EmployeeScheduleTable({ mode, children })`
- `mode: 'base' | 'adjust'`
- `children: React.ReactNode`
- 기본 스케줄의 두 번째 열 제목은 `근무 요일`, 일자별 조정은 `근무 여부`

- [ ] **1단계: 임시 Playwright 설정과 실패 테스트 작성**

```javascript
// /tmp/store-routine-web-schedule-redesign/playwright.config.js
module.exports = {
  testDir: '.',
  outputDir: '/tmp/store-routine-web-schedule-redesign/results',
  use: { baseURL: 'http://127.0.0.1:3005' },
}
```

```javascript
// /tmp/store-routine-web-schedule-redesign/schedule-redesign.spec.js
const { test, expect } = require('playwright/test')

test('기본 스케줄은 헤더가 있고 요일 다음에 시간이 이어진다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/owner/attendance/schedule')

  await expect(page.getByText('근무 요일', { exact: true })).toBeVisible()
  await expect(page.getByText('근무 시간', { exact: true })).toBeVisible()
  await expect(page.getByText('관리', { exact: true })).toBeVisible()

  const sunday = await page.getByRole('button', { name: '일', exact: true }).first().boundingBox()
  const startTime = await page.locator('input[type="time"]').first().boundingBox()
  expect(sunday).not.toBeNull()
  expect(startTime).not.toBeNull()
  expect(startTime.x - (sunday.x + sunday.width)).toBeLessThanOrEqual(32)
})

test('일자별 조정은 헤더가 있고 상태 다음에 시간이 이어진다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/owner/attendance/adjust')

  await expect(page.getByText('근무 여부', { exact: true })).toBeVisible()
  await expect(page.getByText('근무 시간', { exact: true })).toBeVisible()
  await expect(page.getByText('관리', { exact: true })).toBeVisible()

  const status = await page.getByRole('button', { name: '휴무', exact: true }).first().boundingBox()
  const startTime = await page.locator('input[type="time"]').first().boundingBox()
  expect(status).not.toBeNull()
  expect(startTime).not.toBeNull()
  expect(startTime.x - (status.x + status.width)).toBeLessThanOrEqual(32)
})

for (const width of [1024, 768, 390]) {
  test(`${width}px에서 페이지 가로 넘침이 없다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/owner/attendance/schedule')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(overflow).toBe(false)
  })
}
```

- [ ] **2단계: 기존 화면에서 테스트 실패 확인**

실행:

```bash
NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules playwright test -c /tmp/store-routine-web-schedule-redesign/playwright.config.js --reporter=line --workers=1
```

예상 결과: 데스크톱 2건은 열 헤더 부재로 실패하고, 가로 넘침 검증은 통과한다.

- [ ] **3단계: 편집표 래퍼 컴포넌트 작성**

```tsx
import type { ReactNode } from 'react'
import styles from './EmployeeScheduleTable.module.css'

export default function EmployeeScheduleTable({
  mode,
  children,
}: {
  mode: 'base' | 'adjust'
  children: ReactNode
}) {
  return (
    <div className={`${styles.table} ${mode === 'base' ? styles.base : styles.adjust}`}>
      <div className={styles.head}>
        <span>직원</span>
        <span>{mode === 'base' ? '근무 요일' : '근무 여부'}</span>
        <span>근무 시간</span>
        <span>관리</span>
      </div>
      {children}
    </div>
  )
}
```

- [ ] **4단계: 기존 화면을 편집표로 연결**

`EmployeeScheduleManager.tsx`에서 두 직원 목록을 각각 `EmployeeScheduleTable`로 감싼다.

- 페이지 본문에 `data-schedule-body`를 지정한다.
- 직원 행에 `data-schedule-row`를 지정한다.
- 시간 영역에 `data-schedule-time`을 지정한다.
- 일자별 조정 날짜 행에 `data-schedule-context`를 지정한다.
- 기존 이벤트 핸들러와 조건부 렌더링은 변경하지 않는다.

- [ ] **5단계: 반응형 편집표 스타일 작성**

`EmployeeScheduleTable.module.css`에서 다음을 구현한다.

- 768px 이상: `data-schedule-body` 최대 너비 해제.
- 768~1023px: `130px / 1fr` 두 열로 직원 정보와 설정·시간을 두 줄 배치.
- 1024px 이상: 표면 카드, 열 헤더, 모드별 열 너비, 행 보더 적용.
- 기본 스케줄 최소 표 너비 `800px`, 일자별 조정 최소 표 너비 `720px`.
- 시간 영역은 세 번째 열부터 마지막 열까지 걸치고 관리 버튼은 `margin-left: auto`.
- 표 래퍼만 `overflow-x: auto`, 페이지 전체는 넘치지 않게 유지.
- 날짜 컨텍스트 행은 웹에서 표면·보더·반응형 여백 토큰을 사용한다.

`EmployeeScheduleManager.module.css`에서는 이전 `.body { max-width: none; }` 데스크톱 재정의만 제거해 300줄 미만으로 유지한다.

- [ ] **6단계: Playwright 테스트 통과 확인**

실행:

```bash
NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules playwright test -c /tmp/store-routine-web-schedule-redesign/playwright.config.js --reporter=line --workers=1
```

예상 결과: 데스크톱 편집표 2건과 1024·768·390px 가로 넘침 3건, 총 5건 통과.

- [ ] **7단계: 시각 및 정적 검증**

- 두 경로를 1440×900, 1024×768, 768×900, 390×844로 캡처한다.
- 라이트·다크 모드에서 헤더, 행, 입력, 선택 상태, 보더 대비를 확인한다.
- 기본 스케줄의 생성·요일·시간·삭제와 일자별 조정의 날짜·근무/휴무·시간·기본 복귀를 브라우저에서 확인한다.

실행:

```bash
npm run build
npm run lint
git diff --check
wc -l src/app/owner/attendance/EmployeeScheduleManager.tsx src/app/owner/attendance/EmployeeScheduleManager.module.css src/app/owner/attendance/EmployeeScheduleTable.tsx src/app/owner/attendance/EmployeeScheduleTable.module.css
```

예상 결과: 빌드와 diff 검증 성공, 각 소스 300줄 이하. 린트의 기존 범위 밖 오류와 경고는 별도 기록한다.

- [ ] **8단계: 이력 기록, 커밋, 푸시**

`.claude/history/2026-07-27.md`에 재설계와 검증 결과를 추가한다.

```bash
git add src/app/owner/attendance/EmployeeScheduleTable.tsx src/app/owner/attendance/EmployeeScheduleTable.module.css src/app/owner/attendance/EmployeeScheduleManager.tsx src/app/owner/attendance/EmployeeScheduleManager.module.css .claude/history/2026-07-27.md
git commit -m "feat: 스케줄 관리 화면 편집표로 개선"
git push
```
