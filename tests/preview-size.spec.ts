import { test, expect } from '@playwright/test';

for (const width of [1440, 360]) {
  test(`preview frame stays fixed through approval states at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#/pattern/approval-card');
    await page.evaluate(() => document.fonts.ready);
    const canvas = page.locator('.demo-canvas');
    const card = page.locator('.approval-card');
    const initialCard = (await card.boundingBox())!;
    const measurements = await page.evaluateHandle(() => {
      const canvas = document.querySelector('.demo-canvas')!;
      const playground = document.querySelector('.playground')!;
      const read = () => [
        canvas.getBoundingClientRect().width,
        canvas.getBoundingClientRect().height,
        playground.getBoundingClientRect().height,
      ];
      const frames = [read()];
      const observer = new ResizeObserver(() => frames.push(read()));
      observer.observe(canvas);
      observer.observe(playground);
      return { frames, observer };
    });

    await page.getByRole('button', { name: 'Looks good' }).click();
    await expect(page.getByText('A little progress, approved.')).toBeVisible();
    await expect
      .poll(async () => (await card.boundingBox())!.height)
      .toBeLessThan(initialCard.height - 50);
    await page.getByRole('button', { name: 'Replay', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Keep as is' })).toBeVisible();
    await page.getByRole('button', { name: 'Keep as is' }).click();
    await expect(page.getByText('No changes. All good.')).toBeVisible();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect
      .poll(async () => (await card.boundingBox())!.height)
      .toBeCloseTo(initialCard.height, 0);

    await page.getByRole('button', { name: 'Toggle compact preview' }).click();
    await page.getByRole('button', { name: 'Looks good' }).click();
    await expect(page.getByText('A little progress, approved.')).toBeVisible();
    await page.getByRole('button', { name: 'Toggle compact preview' }).click();

    const frames = await measurements.evaluate(({ frames, observer }) => {
      observer.disconnect();
      return frames;
    });
    for (const frame of frames) expect(frame).toEqual(frames[0]);
    const height = (await canvas.boundingBox())!.height;
    await page.setViewportSize({ width: width === 1440 ? 360 : 1440, height: 800 });
    await expect.poll(async () => (await canvas.boundingBox())!.height).toBe(height);
    await measurements.dispose();
  });
}
