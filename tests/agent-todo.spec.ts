import { expect, test } from '@playwright/test';

test('agent plan pauses, completes, collapses, reopens and replays', async ({ page }) => {
  await page.goto('/#/pattern/agent-todo-list');
  const demo = page.locator('.agent-todo-demo');
  const header = demo.getByRole('button', { name: /Implementation plan/ });
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect(demo.getByRole('listitem')).toHaveCount(4);
  await demo.getByRole('button', { name: 'Pause', exact: true }).click();
  const progress = await demo.locator('.agent-todo-percent').innerText();
  await page.waitForTimeout(650);
  await expect(demo.locator('.agent-todo-percent')).toHaveText(progress);
  const preview = await page.locator('.demo-canvas').boundingBox();
  await header.focus();
  await page.keyboard.press('Enter');
  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await expect(demo.getByRole('list')).toHaveCount(0);
  await expect(demo.locator('.agent-todo-disclosure')).toHaveCSS('transition-duration', '0s');
  await header.click();
  await page.getByLabel('Timer speed').selectOption('1.5');
  await demo.getByRole('button', { name: 'Resume', exact: true }).click();
  await expect(demo.getByRole('status')).toHaveText('4 of 4 tasks completed. Plan finished.', {
    timeout: 12000,
  });
  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.demo-canvas')).toHaveCSS('height', `${preview!.height}px`);
  await header.click();
  await expect(demo.locator('.agent-todo-row[data-status="complete"]')).toHaveCount(4);
  await demo.getByRole('button', { name: 'Replay', exact: true }).click();
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect(demo.getByRole('status')).toHaveText('0 of 4 tasks completed.');
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  await expect(page.locator('pre code')).toContainText('export function AgentTodoList');
});

test('agent plan respects reduced motion and fits mobile; scroll expansion belongs to visual effects', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 360, height: 850 });
  await page.goto('/#/pattern/agent-todo-list');
  const demo = page.locator('.agent-todo-demo');
  await expect(demo).toHaveAttribute('data-reduced', 'true');
  expect(
    await demo
      .locator('.agent-todo-progress')
      .first()
      .evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration)),
  ).toBeLessThanOrEqual(0.001);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/#/category/workflow');
  await expect(page.locator('[data-pattern="agent-todo-list"]')).toHaveCount(1);
  await expect(page.locator('[data-pattern="scroll-expand"]')).toHaveCount(0);
  await page.goto('/#/category/visual');
  await expect(page.locator('.pattern-card')).toHaveCount(9);
  await expect(page.locator('[data-pattern="scroll-expand"]')).toHaveCount(1);
  await page.goto('/#/pattern/scroll-expand');
  await expect(page.locator('.topbar-breadcrumb')).toContainText('Visual effects');
  await expect(page.locator('.scroll-expand')).toBeVisible();
});
