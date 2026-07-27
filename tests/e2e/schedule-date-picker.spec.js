import { test, expect } from 'playwright/test'

const baseURL = process.env.SCHEDULE_BASE_URL || 'http://localhost:3005'

async function open(page, width = 1440, height = 900) {
  await page.setViewportSize({ width, height })
  await page.goto(`${baseURL}/owner/attendance/adjust`)
}

async function clickOutsidePicker(page) {
  const guide = await page.getByText('선택한 날짜만 근무·휴무·시간을 조정합니다. 기본 스케줄은 바뀌지 않습니다.').boundingBox()
  expect(guide).not.toBeNull()
  await page.mouse.click(guide.x + guide.width / 2, guide.y + guide.height / 2)
}

test('일자별 조정 날짜 버튼에서 월간 달력을 열고 날짜를 선택한다', async ({ page }) => {
  await open(page)
  const trigger = page.getByRole('button', { name: '조정 날짜' })
  await expect(trigger).toContainText('6월 30일 (화)')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('dialog', { name: '조정 날짜 선택' })).toBeVisible()
  await expect(page.getByText('2026년 6월', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '다음 달' }).click()
  await page.getByRole('button', { name: '2026년 7월 1일 선택' }).click()
  await expect(trigger).toContainText('7월 1일 (수)')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('dialog', { name: '조정 날짜 선택' })).toBeHidden()
})

test('월 이동과 취소는 선택한 날짜를 바꾸지 않는다', async ({ page }) => {
  await open(page)
  const trigger = page.getByRole('button', { name: '조정 날짜' })
  await trigger.click()
  await page.getByRole('button', { name: '다음 달' }).click()
  await expect(trigger).toContainText('6월 30일 (화)')
  await clickOutsidePicker(page)
  await expect(page.getByRole('dialog', { name: '조정 날짜 선택' })).toBeHidden()
  await expect(trigger).toContainText('6월 30일 (화)')
})

test('12월과 1월 경계 이동은 연도를 바꾸고 선택 날짜는 유지한다', async ({ page }) => {
  await open(page)
  const trigger = page.getByRole('button', { name: '조정 날짜' })
  await trigger.click()
  const nextMonth = page.getByRole('button', { name: '다음 달' })
  for (let count = 0; count < 6; count += 1) await nextMonth.click()
  await expect(page.getByText('2026년 12월', { exact: true })).toBeVisible()
  await nextMonth.click()
  await expect(page.getByText('2027년 1월', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '이전 달' }).click()
  await expect(page.getByText('2026년 12월', { exact: true })).toBeVisible()
  await expect(trigger).toContainText('6월 30일 (화)')
})

test('바깥 클릭과 ESC로 월간 달력을 닫는다', async ({ page }) => {
  await open(page)
  const trigger = page.getByRole('button', { name: '조정 날짜' })
  await trigger.click()
  await clickOutsidePicker(page)
  await expect(page.getByRole('dialog', { name: '조정 날짜 선택' })).toBeHidden()
  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: '조정 날짜 선택' })).toBeHidden()
})

test('조정 컨트롤을 향한 바깥 클릭은 달력만 닫고 근무 상태를 바꾸지 않는다', async ({ page }) => {
  await open(page)
  const work = page.getByRole('button', { name: '최수아 근무로 설정' })
  const workBox = await work.boundingBox()
  expect(workBox).not.toBeNull()
  await expect(work).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByLabel('최수아 시작 시간')).toHaveCount(0)
  await page.getByRole('button', { name: '조정 날짜' }).click()
  await page.mouse.click(workBox.x + workBox.width / 2, workBox.y + workBox.height / 2)
  await expect(page.getByRole('dialog', { name: '조정 날짜 선택' })).toBeHidden()
  await expect(work).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByLabel('최수아 시작 시간')).toHaveCount(0)
})

test('선택일과 오늘을 접근 가능한 현재 날짜로 표시한다', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: '조정 날짜' }).click()
  await expect(page.getByRole('button', { name: '2026년 6월 30일 선택' }))
    .toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: '2026년 6월 30일 선택' }))
    .toHaveAttribute('aria-current', 'date')
  await expect(page.getByRole('button', { name: '2026년 6월 29일 선택' }))
    .toHaveAttribute('aria-pressed', 'false')
})

test('390px에서 열린 달력이 가로 넘침 없이 표시된다', async ({ page }) => {
  await open(page, 390, 844)
  await page.getByRole('button', { name: '조정 날짜' }).click()
  await expect(page.getByRole('dialog', { name: '조정 날짜 선택' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
})
