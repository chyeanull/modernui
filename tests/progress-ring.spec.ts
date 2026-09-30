import { test, expect } from '@playwright/test';

for (const reduced of [false, true]) {
  test(`progress counts smoothly and completes with an upright checkmark${reduced ? ' with reduced motion' : ''}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await page.goto('/#/pattern/progress-ring');
    const progress = page.getByRole('progressbar', { name: 'Sample export progress' });
    const burst = page.locator('.ring-burst-particle');
    await expect(burst).toHaveCount(0);
    const samples = await progress.evaluateHandle((el) => {
      const frames: { value: number; label: number; arc: number }[] = [];
      const fill = el.querySelector('.ring-fill')!;
      const observer = new MutationObserver(() => {
        frames.push({
          value: Number(el.getAttribute('aria-valuenow')),
          label: parseInt(el.parentElement!.querySelector('span')!.textContent!, 10),
          arc:
            100 *
            (1 -
              Number(fill.getAttribute('stroke-dashoffset')) /
                Number(fill.getAttribute('stroke-dasharray'))),
        });
      });
      observer.observe(el, { attributes: true, attributeFilter: ['aria-valuenow'] });
      return { frames, observer };
    });
    await page.getByRole('button', { name: 'Start export' }).click();
    await expect(progress).toHaveAttribute('aria-valuenow', '100');
    await expect(page.getByRole('status')).toHaveText('Sample export complete.');
    const frames = await samples.evaluate(({ frames, observer }) => {
      observer.disconnect();
      return frames;
    });
    expect(new Set(frames.map((frame) => frame.value)).size).toBeGreaterThan(40);
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      expect(frame.value).toBeGreaterThanOrEqual(i ? frames[i - 1].value : 0);
      expect(Math.abs(frame.arc - frame.value)).toBeLessThan(1.01);
      if (frame.value < 100) expect(frame.label).toBe(frame.value);
    }
    const check = page.locator('.ring-complete > svg');
    await expect(check).toBeVisible();
    await expect(check).toHaveCSS('transform', 'none');
    await expect(check).toHaveCSS('width', '32px');
    await expect(check).toHaveCSS('height', '32px');
    await expect(page.locator('.ring-complete')).toHaveCSS('opacity', '1');
    await expect(burst).toHaveCount(reduced ? 0 : 8);
    if (!reduced) await expect(burst.first()).toHaveCSS('opacity', '0');
    await page.getByRole('button', { name: 'Export again' }).click();
    await expect(check).toHaveCount(0);
    await expect(burst).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Cancel export' })).toBeVisible();
    await samples.dispose();
  });
}

test('progress can pause, resume, cancel, and reset without drifting', async ({ page }) => {
  await page.goto('/#/pattern/progress-ring');
  const progress = page.getByRole('progressbar');
  await page.getByRole('button', { name: 'Start export' }).click();
  await expect
    .poll(async () => Number(await progress.getAttribute('aria-valuenow')))
    .toBeGreaterThan(5);
  await page.getByRole('button', { name: 'Pause ambient motion' }).click();
  const paused = await progress.getAttribute('aria-valuenow');
  await page.waitForTimeout(200);
  await expect(progress).toHaveAttribute('aria-valuenow', paused!);
  await page.getByRole('button', { name: 'Resume ambient motion' }).click();
  await expect
    .poll(async () => Number(await progress.getAttribute('aria-valuenow')))
    .toBeGreaterThan(Number(paused));
  await page.getByRole('button', { name: 'Cancel export' }).click();
  const cancelled = await progress.getAttribute('aria-valuenow');
  await page.waitForTimeout(200);
  await expect(progress).toHaveAttribute('aria-valuenow', cancelled!);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('.progress-ring > span')).toHaveText('0%');
});
