import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`morphing modal interpolates its height without stretching content at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#/pattern/morphing-modal');
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('button', { name: 'Open a little possibility' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    for (const target of ['Privacy', 'Go back', 'Members', 'Go back', 'Personalize']) {
      const frames = await dialog.evaluate(async (popup, target) => {
        const read = () => {
          const rect = popup.getBoundingClientRect();
          const heading = popup
            .querySelector('.morph-dialog-view:not([inert]) h2')!
            .getBoundingClientRect();
          const close = popup.querySelector('.dialog-close')!.getBoundingClientRect();
          return {
            height: rect.height,
            center: rect.y + rect.height / 2,
            headingHeight: heading.height,
            closeHeight: close.height,
            exiting: popup.querySelectorAll('.morph-dialog-view[inert]').length,
          };
        };
        const frames = [read()];
        const button = [
          ...popup.querySelectorAll<HTMLButtonElement>('.morph-dialog-view:not([inert]) button'),
        ].find((el) => el.textContent?.trim().startsWith(target))!;
        button.click();
        const start = performance.now();
        while (performance.now() - start < 750) {
          await new Promise(requestAnimationFrame);
          frames.push(read());
        }
        return frames;
      }, target);
      const first = frames[0];
      const last = frames.at(-1)!;
      const low = Math.min(first.height, last.height);
      const high = Math.max(first.height, last.height);
      expect(high - low).toBeGreaterThan(15);
      expect(frames.some((frame) => frame.height > low + 2 && frame.height < high - 2)).toBe(true);
      expect(frames.some((frame) => frame.exiting > 0)).toBe(true);
      for (const frame of frames) {
        expect(Math.abs(frame.center - 500)).toBeLessThan(1);
        expect(Math.abs(frame.headingHeight - first.headingHeight)).toBeLessThan(1);
        expect(Math.abs(frame.closeHeight - first.closeHeight)).toBeLessThan(1);
        expect(frame.height).toBeGreaterThanOrEqual(low - 1);
        expect(frame.height).toBeLessThanOrEqual(high + 1);
      }
      await expect(page.locator('.morph-dialog-view')).toHaveCount(1);
      await expect(dialog).toHaveAccessibleName(
        target === 'Go back' ? 'Your creative space' : target,
      );
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
}

test('morphing modal handles rapid reversal, reopening, and short screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 400 });
  await page.goto('/#/pattern/morphing-modal');
  const trigger = page.getByRole('button', { name: 'Open a little possibility' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  for (let i = 0; i < 3; i++) {
    await dialog.getByRole('button', { name: /Privacy Your ideas/ }).click();
    await dialog
      .getByRole('button', { name: 'Go back' })
      .evaluate((button: HTMLButtonElement) => button.click());
  }
  await expect(dialog).toHaveAccessibleName('Your creative space');
  await expect(page.locator('.morph-dialog-view')).toHaveCount(1);
  await dialog.getByRole('button', { name: /Members Better/ }).click();
  await dialog.getByRole('button', { name: 'All done' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog).toHaveAccessibleName('Your creative space');
  const bounds = (await dialog.boundingBox())!;
  expect(bounds.y).toBeGreaterThanOrEqual(19);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(381);
  await page.mouse.click(5, 5);
  await expect(dialog).toHaveCount(0);
});

test('morphing modal keeps reduced-motion and keyboard view changes immediate', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/pattern/morphing-modal');
  const trigger = page.getByRole('button', { name: 'Open a little possibility' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /Privacy Your ideas/ }).click();
  await expect(dialog).toHaveCSS('transform', 'none');
  await expect(page.locator('.morph-dialog-view')).toHaveCount(1);
  await expect(page.locator('.morph-dialog-view')).toHaveCSS('filter', 'blur(0px)');
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await dialog.getByRole('button', { name: /Privacy Your ideas/ }).focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toHaveCSS('transform', 'none');
  await expect(page.locator('.morph-dialog-view')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
