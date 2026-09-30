import { test, expect } from '@playwright/test';

test('border beam stays visible in both themes and pauses without resetting', async ({ page }) => {
  await page.goto('/#/pattern/border-beam');
  const card = page.locator('.beam-card');
  const beam = page.locator('.beam-track').last();
  const transform = () => beam.evaluate((el) => getComputedStyle(el, '::before').transform);
  await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.getByRole('button', { name: 'Change preview background' })).toHaveCount(0);
  const initial = await transform();
  await expect.poll(transform).not.toBe(initial);

  await page.getByRole('button', { name: 'Pause the light' }).click();
  await expect(page.getByRole('button', { name: 'Let it shine' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  // Allow the browser to commit the pause before comparing animation frames.
  await page.evaluate(() => new Promise(requestAnimationFrame));
  const paused = await transform();
  await page.waitForTimeout(150);
  expect(await transform()).toBe(paused);
  await page.getByRole('button', { name: 'Let it shine' }).click();
  await expect.poll(transform).not.toBe(paused);
  await page.getByRole('button', { name: 'Pause ambient motion' }).click();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  const globallyPaused = await transform();
  await page.waitForTimeout(150);
  expect(await transform()).toBe(globallyPaused);
  await page.getByRole('button', { name: 'Resume ambient motion' }).click();

  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('.beam-content')).toHaveCSS('color', 'rgb(50, 35, 44)');
  await page.setViewportSize({ width: 360, height: 850 });
  const rect = (await card.boundingBox())!;
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.x + rect.width).toBeLessThanOrEqual(360);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() => beam.evaluate((el) => getComputedStyle(el, '::before').animationName))
    .toBe('none');
  await expect(card).toBeVisible();
});
