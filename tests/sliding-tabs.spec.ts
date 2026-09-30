import { test, expect } from '@playwright/test';

for (const width of [1440, 360]) {
  test(`sliding tabs stay on one horizontal track at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#/pattern/sliding-tabs');
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();

    for (const label of ['Settings', 'Overview', 'Activity']) {
      const motion = await page.locator('.segmented').evaluate(async (list, label) => {
        const highlight = () => list.querySelector('.segment-highlight')!.getBoundingClientRect();
        const start = highlight().toJSON();
        const trackTop = list.getBoundingClientRect().top;
        const target = [...list.querySelectorAll<HTMLElement>('[role="tab"]')].find(
          (tab) => tab.textContent === label,
        )!;
        const end = target.getBoundingClientRect().toJSON();
        const frames: { x: number; y: number; width: number; trackTop: number }[] = [];
        target.click();
        const started = performance.now();
        while (performance.now() - started < 400) {
          await new Promise(requestAnimationFrame);
          const rect = highlight();
          frames.push({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            trackTop: list.getBoundingClientRect().top,
          });
        }
        return { start, end, trackTop, frames };
      }, label);

      const left = Math.min(motion.start.x, motion.end.x);
      const right = Math.max(motion.start.x, motion.end.x);
      expect(motion.frames.some((frame) => frame.x > left + 1 && frame.x < right - 1)).toBe(true);
      for (const frame of motion.frames) {
        expect(Math.abs(frame.y - motion.start.y)).toBeLessThan(1);
        expect(Math.abs(frame.trackTop - motion.trackTop)).toBeLessThan(1);
        expect(Math.abs(frame.width - motion.start.width)).toBeLessThan(1);
        expect(frame.x).toBeGreaterThanOrEqual(left - 1);
        expect(frame.x).toBeLessThanOrEqual(right + 1);
      }
      expect(Math.abs(motion.frames.at(-1)!.x - motion.end.x)).toBeLessThan(1);
      await expect(page.getByRole('tab', { name: label })).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tabpanel')).toHaveCount(1);
    }
  });
}

test('sliding tabs handle quick reversals, keyboard input, and reduced motion', async ({
  page,
}) => {
  await page.goto('/#/pattern/sliding-tabs');
  const overview = page.getByRole('tab', { name: 'Overview' });
  const settings = page.getByRole('tab', { name: 'Settings' });
  const indicator = page.locator('.segment-highlight');
  await settings.click();
  await overview.click();
  await settings.click();
  await expect
    .poll(async () => {
      const tab = await settings.boundingBox();
      const highlight = await indicator.boundingBox();
      return Math.abs(tab!.x - highlight!.x) + Math.abs(tab!.y - highlight!.y);
    })
    .toBeLessThan(1);

  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'Activity' })).toBeFocused();
  await expect(indicator).toHaveCSS('transition-duration', '0s');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await overview.click();
  await expect(overview).toHaveAttribute('aria-selected', 'true');
  const reducedDuration = await indicator.evaluate((el) =>
    parseFloat(getComputedStyle(el).transitionDuration),
  );
  expect(reducedDuration).toBeLessThan(0.001);
  expect(
    Math.abs((await indicator.boundingBox())!.x - (await overview.boundingBox())!.x),
  ).toBeLessThan(1);
});
