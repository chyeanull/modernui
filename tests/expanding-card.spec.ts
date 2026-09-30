import { test, expect } from '@playwright/test';

for (const width of [1440, 360]) {
  test(`expanding card reveals smoothly without distortion or preview shifts at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#/pattern/expanding-card');
    await page.evaluate(() => document.fonts.ready);
    const card = page.locator('.expanding-note');
    for (const opening of [true, false]) {
      const frames = await card.evaluate(async (card) => {
        const read = () => {
          const rect = card.getBoundingClientRect();
          const measure = (selector: string) =>
            card.querySelector(selector)!.getBoundingClientRect();
          return {
            height: rect.height,
            center: rect.y + rect.height / 2,
            art: measure('.note-art').height,
            title: measure('h3').height,
            buttonWidth: measure('button').width,
            preview: document.querySelector('.demo-canvas')!.getBoundingClientRect().height,
          };
        };
        const frames = [read()];
        card
          .querySelector('button')!
          .dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
        const start = performance.now();
        while (performance.now() - start < 450) {
          await new Promise(requestAnimationFrame);
          frames.push(read());
        }
        return frames;
      });
      const first = frames[0],
        last = frames.at(-1)!;
      const low = Math.min(first.height, last.height),
        high = Math.max(first.height, last.height);
      expect(high - low).toBeGreaterThan(50);
      expect(frames.some((frame) => frame.height > low + 2 && frame.height < high - 2)).toBe(true);
      frames.forEach((frame, index) => {
        expect(Math.abs(frame.center - first.center)).toBeLessThan(1);
        expect(frame.art).toBe(first.art);
        expect(frame.title).toBe(first.title);
        expect(frame.buttonWidth).toBe(first.buttonWidth);
        expect(frame.preview).toBe(first.preview);
        if (index) {
          if (opening) expect(frame.height).toBeGreaterThanOrEqual(frames[index - 1].height - 0.1);
          else expect(frame.height).toBeLessThanOrEqual(frames[index - 1].height + 0.1);
        }
      });
      await expect(card.getByRole('button')).toHaveAttribute('aria-expanded', String(opening));
      await expect(page.locator('.note-reveal')).toHaveAttribute('aria-hidden', String(!opening));
    }
  });
}

test('expanding card reverses mid-animation and honors keyboard and reduced motion', async ({
  page,
}) => {
  await page.goto('/#/pattern/expanding-card');
  const card = page.locator('.expanding-note');
  const initialHeight = (await card.boundingBox())!.height;
  await card.evaluate(async (card) => {
    for (let i = 0; i < 6; i++) {
      card
        .querySelector('button')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
  });
  await expect(card.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(async () => (await card.boundingBox())!.height).toBe(initialHeight);
  await expect(page.locator('.note-reveal')).toHaveAttribute('inert', '');
  const trigger = page.getByRole('button', { name: 'Read the field note' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.note-reveal')).toHaveCSS('transition-duration', '0s');
  await expect(page.getByRole('button', { name: 'Close the note' })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.getByRole('button', { name: 'Read the field note' }).click();
  await expect(card).toHaveAttribute('data-instant', 'true');
  await expect(page.locator('.note-reveal')).not.toHaveAttribute('inert');
  await expect(page.locator('.note-reveal')).toHaveCSS('opacity', '1');
});
