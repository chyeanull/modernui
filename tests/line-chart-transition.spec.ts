import { test, expect } from '@playwright/test';

test('line chart morphs between datasets without moving its axes or resizing the preview', async ({
  page,
}) => {
  await page.goto('/#/pattern/line-chart-transition');
  const line = page.locator('.transition-chart-line');
  await expect(line).toHaveAttribute('d', /^M/);
  const first = await line.getAttribute('d');
  const preview = await page.locator('.demo-canvas').boundingBox();
  const axes = await page.locator('.transition-chart-svg text').allTextContents();
  const samples = page.evaluate(async () => {
    const line = document.querySelector('.transition-chart-line')!;
    const values: string[] = [];
    const start = performance.now();
    while (performance.now() - start < 900) {
      values.push(line.getAttribute('d')!);
      await new Promise(requestAnimationFrame);
    }
    return values;
  });
  await page.getByRole('button', { name: 'Yan', exact: true }).click();
  const frames = await samples;
  const second = await line.getAttribute('d');
  expect(second).not.toBe(first);
  expect(new Set(frames).size).toBeGreaterThan(5);
  expect(frames.some((path) => path !== first && path !== second)).toBe(true);
  await expect(page.getByRole('status').filter({ hasText: 'Latest score' })).toHaveText(
    'YanLatest score 44',
  );
  expect(await page.locator('.transition-chart-svg text').allTextContents()).toEqual(axes);
  expect((await page.locator('.demo-canvas').boundingBox())!.height).toBe(preview!.height);

  await page.getByRole('button', { name: 'Melanie', exact: true }).click();
  await page.getByRole('button', { name: 'Yan', exact: true }).click();
  await expect(line).toHaveAttribute('d', second!);
  await page.getByRole('button', { name: 'Melanie', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(line).toHaveAttribute('d', first!);
  await expect(page.getByRole('button', { name: 'Melanie', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('line chart works on mobile with reduced motion and exposes its source reference', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 850 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/pattern/line-chart-transition');
  const line = page.locator('.transition-chart-line');
  await expect(line).toHaveAttribute('d', /^M/);
  const first = await line.getAttribute('d');
  await page.getByRole('button', { name: 'Yan', exact: true }).click();
  const second = await line.getAttribute('d');
  expect(second).not.toBe(first);
  await page.waitForTimeout(120);
  expect(await line.getAttribute('d')).toBe(second);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.source-link')).toHaveAttribute(
    'href',
    'https://www.react-graph-gallery.com/line-chart#transition',
  );
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  await expect(page.locator('.source-view pre code')).toContainText(
    'export function TransitionLineChart',
  );
  await expect(page.locator('.source-view pre code')).toContainText('transitionLineData');
});
