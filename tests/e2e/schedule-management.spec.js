import { test, expect } from 'playwright/test'

const paths = {
  base: '/owner/attendance/schedule',
  adjust: '/owner/attendance/adjust',
}
const baseURL = process.env.SCHEDULE_BASE_URL || 'http://127.0.0.1:3005'

async function open(page, path, width = 1440, height = 900) {
  await page.setViewportSize({ width, height })
  await page.goto(`${baseURL}${path}`)
}

async function expectNoPageOverflow(page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
  ).toBe(false)
}

for (const [mode, path] of Object.entries(paths)) {
  for (const width of [1024, 768, 390]) {
    test(`${mode} ${width}px에서 페이지 가로 넘침이 없다`, async ({ page }) => {
      await open(page, path, width)
      await expectNoPageOverflow(page)
    })
  }
}

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

for (const [width, expectedHeight] of [[1440, 59], [1024, 59], [1023, 101], [768, 101]]) {
  test(`${width}px에서 저장 영역과 프로필 영역의 상단선이 정렬된다`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, paths.base, width)

    const profile = await page.locator('[data-owner-user-section]').boundingBox()
    const footer = await page.locator('[data-schedule-footer]').boundingBox()

    expect(profile).not.toBeNull()
    expect(footer).not.toBeNull()
    expect(profile.height).toBe(expectedHeight)
    expect(footer.height).toBe(expectedHeight)
    expect(footer.y).toBe(profile.y)
  })
}

test('390px에서 저장 영역의 기존 높이와 우측 하단 배치를 유지한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, paths.base, 390, 844)

  const footerLocator = page.locator('[data-schedule-footer]')
  const footer = await footerLocator.boundingBox()
  const save = await page.locator('[data-schedule-footer] button').boundingBox()
  const paddingRight = await footerLocator.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).paddingRight),
  )

  expect(footer).not.toBeNull()
  expect(save).not.toBeNull()
  expect(footer.height).toBe(63)
  expect(footer.y).toBeGreaterThan(844 / 2)
  expect(footer.x + footer.width - (save.x + save.width)).toBe(paddingRight)
})

test('1440px 기본 스케줄 표는 의미 있는 헤더와 인접한 시간 열을 제공한다', async ({ page }) => {
  await open(page, paths.base)

  const table = page.getByRole('table', { name: '기본 스케줄 편집표' })
  await expect(table).toBeVisible()
  await expect(table.getByRole('columnheader', { name: '직원' })).toBeVisible()
  await expect(table.getByRole('columnheader', { name: '근무 요일' })).toBeVisible()
  await expect(table.getByRole('columnheader', { name: '근무 시간' })).toBeVisible()
  await expect(table.getByRole('columnheader', { name: '관리' })).toBeVisible()

  const sunday = await page.getByRole('button', { name: '김민수 일요일 근무 설정' }).boundingBox()
  const start = await page.getByLabel('김민수 시작 시간').boundingBox()
  expect(sunday).not.toBeNull()
  expect(start).not.toBeNull()
  expect(start.x - (sunday.x + sunday.width)).toBeLessThanOrEqual(32)
})

test('1440px 일자별 조정 표는 의미 있는 헤더와 인접한 시간 열을 제공한다', async ({ page }) => {
  await open(page, paths.adjust)

  const table = page.getByRole('table', { name: '일자별 조정 편집표' })
  await expect(table).toBeVisible()
  await expect(table.getByRole('columnheader', { name: '근무 여부' })).toBeVisible()
  await expect(table.getByRole('columnheader', { name: '근무 시간' })).toBeVisible()
  await expect(table.getByRole('columnheader', { name: '관리' })).toBeVisible()

  const off = await page.getByRole('button', { name: '김민수 휴무로 설정' }).boundingBox()
  const start = await page.getByLabel('김민수 시작 시간').boundingBox()
  expect(off).not.toBeNull()
  expect(start).not.toBeNull()
  expect(start.x - (off.x + off.width)).toBeLessThanOrEqual(32)
})

test('데스크톱에서 사장 사이드바를 유지한다', async ({ page }) => {
  await open(page, paths.base)

  const navigation = page.getByRole('navigation')
  const table = page.getByRole('table', { name: '기본 스케줄 편집표' })
  await expect(navigation).toBeVisible()
  const navBox = await navigation.boundingBox()
  const tableBox = await table.boundingBox()
  expect(navBox).not.toBeNull()
  expect(tableBox).not.toBeNull()
  expect(tableBox.x).toBeGreaterThanOrEqual(navBox.x + navBox.width)
})

test('기본 스케줄의 접근 가능한 토글과 시간 입력이 동작한다', async ({ page }) => {
  await open(page, paths.base)

  const monday = page.getByRole('button', { name: '김민수 월요일 근무 설정' })
  const wasPressed = await monday.getAttribute('aria-pressed')
  await monday.click()
  await expect(monday).toHaveAttribute('aria-pressed', wasPressed === 'true' ? 'false' : 'true')

  const start = page.getByLabel('김민수 시작 시간')
  await start.fill('10:00')
  await expect(start).toHaveValue('10:00')
  await expect(page.getByRole('button', { name: '김민수 스케줄 삭제' })).toBeVisible()
})

test('일자별 조정의 접근 가능한 날짜·상태·시간 컨트롤이 동작한다', async ({ page }) => {
  await open(page, paths.adjust)

  const date = page.getByLabel('조정 날짜')
  await date.fill('2026-07-01')
  await expect(date).toHaveValue('2026-07-01')

  const start = page.getByLabel('김민수 시작 시간')
  await start.fill('10:00')
  await expect(start).toHaveValue('10:00')

  const work = page.getByRole('button', { name: '김민수 근무로 설정' })
  const off = page.getByRole('button', { name: '김민수 휴무로 설정' })
  await expect(work).toBeEnabled()
  await expect(off).toBeEnabled()
  await work.click()
})
