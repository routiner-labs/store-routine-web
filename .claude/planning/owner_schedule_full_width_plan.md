# 사장 스케줄 관리 웹 전체 폭 구현 계획

> **에이전트 작업 필수 사항:** `superpowers:subagent-driven-development`를 사용해 작업 단위별 구현과 검토를 진행한다.

**목표:** 기본 스케줄과 일자별 조정 화면이 768px 이상에서 사장 사이드바 오른쪽 콘텐츠 영역 전체를 사용하도록 한다.

**구조:** 두 경로가 공유하는 `EmployeeScheduleManager.module.css`의 데스크톱 미디어쿼리만 수정한다. 기능 로직과 모바일 레이아웃은 유지하고, 임시 Playwright 테스트로 변경 전 실패와 변경 후 성공을 확인한다.

**기술 스택:** Next.js 16, React 19, TypeScript, CSS Modules, 전역 Playwright 1.59.1

## 전체 제약

- 사장 공통 사이드바와 상단 구조를 유지한다.
- 768px 미만 모바일 레이아웃은 변경하지 않는다.
- 기본 스케줄과 일자별 조정의 상태 및 저장 동작을 변경하지 않는다.
- 새로운 프로젝트 의존성이나 테스트 설정을 추가하지 않는다.
- 제품 소스 변경은 `EmployeeScheduleManager.module.css` 한 파일로 제한한다.

---

### Task 1: 스케줄 관리 본문을 웹 콘텐츠 폭으로 확장

**파일:**

- 임시 생성: `/tmp/store-routine-web-schedule-full-width.spec.js`
- 수정: `src/app/owner/attendance/EmployeeScheduleManager.module.css`
- 수정: `.claude/history/2026-07-27.md`

**인터페이스:**

- 입력: `/owner/attendance/schedule`, `/owner/attendance/adjust`
- 출력: 768px 이상에서 `.body`의 계산 폭이 스케줄 페이지 루트의 계산 폭과 동일

- [ ] **1단계: 실패하는 임시 브라우저 테스트 작성**

```javascript
const { test, expect } = require('playwright/test')

const routes = [
  '/owner/attendance/schedule',
  '/owner/attendance/adjust',
]

for (const route of routes) {
  test(`${route} 웹 본문이 콘텐츠 폭을 채운다`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`http://127.0.0.1:3005${route}`)

    const body = page.locator('h1').locator('xpath=../following-sibling::div[1]')
    const root = body.locator('..')
    const bodyBox = await body.boundingBox()
    const rootBox = await root.boundingBox()

    expect(bodyBox).not.toBeNull()
    expect(rootBox).not.toBeNull()
    expect(bodyBox.width).toBe(rootBox.width)
  })
}

test('모바일 스케줄 화면에 가로 스크롤이 없다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:3005/owner/attendance/schedule')
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasHorizontalOverflow).toBe(false)
})
```

- [ ] **2단계: 테스트가 기존 860px 제한 때문에 실패하는지 확인**

실행:

```bash
NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules playwright test /tmp/store-routine-web-schedule-full-width.spec.js --reporter=line --workers=1
```

예상 결과: 두 데스크톱 테스트가 `860`과 콘텐츠 영역 폭의 차이로 실패하고 모바일 가로 스크롤 검증은 통과한다.

- [ ] **3단계: 데스크톱 본문 최대 너비 제한 해제**

`src/app/owner/attendance/EmployeeScheduleManager.module.css`의 기존 `@media (min-width: 768px)` 블록에 다음 규칙을 추가한다.

```css
@media (min-width: 768px) {
  .body {
    max-width: none;
  }

  .row {
    display: grid;
    grid-template-columns: 130px 1fr auto;
    align-items: center;
    gap: 12px;
  }
}
```

- [ ] **4단계: 브라우저 테스트가 모두 통과하는지 확인**

실행:

```bash
NODE_PATH=/home/cheykim/.nvm/versions/node/v24.12.0/lib/node_modules playwright test /tmp/store-routine-web-schedule-full-width.spec.js --reporter=line --workers=1
```

예상 결과: 기본 스케줄, 일자별 조정, 모바일 가로 스크롤 검증 3건 모두 통과한다.

- [ ] **5단계: 라이트·다크 화면과 정적 검증**

Playwright로 두 경로를 1440×900 및 390×844에서 캡처해 본문 폭과 컨트롤 배치를 확인한다. `data-theme`을 `light`, `dark`로 각각 설정해 배경, 보더, 텍스트 대비를 확인한다.

실행:

```bash
npm run lint
npm run build
git diff --check
```

예상 결과: 모든 명령이 종료 코드 0으로 완료된다.

- [ ] **6단계: 작업 이력 기록**

`.claude/history/2026-07-27.md`에 변경 파일, 변경 이유, 768px 기준 결정, 기본 스케줄·일자별 조정 및 모바일 검증 결과를 추가한다.

- [ ] **7단계: 소단위 커밋과 푸시**

```bash
git add src/app/owner/attendance/EmployeeScheduleManager.module.css .claude/history/2026-07-27.md
git commit -m "feat: 스케줄 관리 화면 웹 너비 확장"
git push
```
