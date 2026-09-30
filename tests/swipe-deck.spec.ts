import { test, expect, type Page } from '@playwright/test';

const activeCard = (page: Page) => page.locator('.swipe-layer[data-active] .swipe-card');
const currentIndex = (page: Page, index: number) =>
  expect(page.locator('.swipe-layer[data-active]')).toHaveAttribute('data-card', String(index));
async function drag(page: Page, distance: number, hold = 0) {
  const rect = (await activeCard(page).boundingBox())!;
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width / 2 + distance, rect.y + rect.height / 2, {
    steps: 12,
  });
  if (hold) await page.waitForTimeout(hold);
}

test('swipes follow the pointer, promote real cards, and leave in the chosen direction', async ({
  page,
}) => {
  await page.goto('/#/pattern/swipe-deck');
  await page.evaluate(() => document.fonts.ready);
  const canvas = await page.locator('.demo-canvas').boundingBox();
  await expect(page.locator('.swipe-layer')).toHaveCount(3);
  const first = (await activeCard(page).boundingBox())!;
  const next = page.locator('.swipe-layer[data-card="1"]');
  await expect(next).toHaveAttribute('inert');
  expect((await next.boundingBox())!.y + (await next.boundingBox())!.height).toBeGreaterThan(
    first.y + first.height,
  );
  const nextNode = await next.elementHandle();

  // A tiny, fast movement must not discard a card.
  await drag(page, 16);
  await page.mouse.up();
  await currentIndex(page, 0);
  await expect.poll(async () => (await activeCard(page).boundingBox())!.x).toBeCloseTo(first.x, 0);

  for (const [index, direction] of [
    [0, 1],
    [1, -1],
  ]) {
    await drag(page, direction * 115, 120);
    const card = activeCard(page);
    const moved = (await card.boundingBox())!;
    await expect(card.locator(direction > 0 ? '.swipe-save' : '.swipe-pass')).toHaveCSS(
      'opacity',
      '1',
    );
    const samples = await card.evaluateHandle((el) => {
      const positions: number[] = [];
      let running = true;
      const sample = () => {
        if (!running || !el.isConnected) return;
        positions.push(new DOMMatrix(getComputedStyle(el).transform).m41);
        requestAnimationFrame(sample);
      };
      sample();
      return {
        positions,
        stop: () => {
          running = false;
        },
      };
    });
    expect(direction * (moved.x - first.x)).toBeGreaterThan(60);
    await page.mouse.up();
    await currentIndex(page, index + 1);
    await expect(page.locator('.swipe-layer[data-exiting]')).toHaveCount(0);
    const positions = await samples.evaluate(({ positions, stop }) => {
      stop();
      return positions;
    });
    expect(positions.length).toBeGreaterThan(2);
    expect(positions.some((x) => direction * x > 250)).toBe(true);
    positions
      .slice(1)
      .forEach((x, at) => expect(direction * (x - positions[at])).toBeGreaterThanOrEqual(-1));
    await samples.dispose();
  }
  expect(await nextNode!.evaluate((node) => node.dataset.card)).toBe('1');
  await expect(page.getByRole('status')).toHaveText('Passed · 1 in your collection');
  await page.getByRole('button', { name: 'Undo last choice' }).click();
  await currentIndex(page, 1);
  await expect.poll(async () => (await activeCard(page).boundingBox())!.x).toBeCloseTo(first.x, 0);
  await expect(page.getByRole('status')).toHaveText('Saved · 1 in your collection');
  expect(await page.locator('.demo-canvas').boundingBox()).toEqual(canvas);
});

test('rapid decisions, completion, undo, and keyboard navigation preserve deck state', async ({
  page,
}) => {
  await page.goto('/#/pattern/swipe-deck');
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Save card' }).click();
    await page.getByRole('button', { name: 'Undo last choice' }).click();
  }
  await currentIndex(page, 0);
  await expect(page.locator('.swipe-layer')).toHaveCount(3);
  await expect
    .poll(() =>
      activeCard(page).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
    )
    .toBeCloseTo(0, 0);
  await page.getByRole('button', { name: 'Save card' }).evaluate((button) => {
    for (let i = 0; i < 8; i++)
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  });
  await expect(page.getByText('All explored.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save card' })).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('Saved · 3 in your collection');
  await expect(page.locator('.swipe-layer')).toHaveCount(0);
  const deck = page.getByRole('group', { name: 'Inspiration deck', exact: true });
  await deck.focus();
  for (const index of [2, 1, 0]) {
    await page.keyboard.press('Backspace');
    await currentIndex(page, index);
  }
  await expect(page.getByRole('button', { name: 'Undo last choice' })).toBeDisabled();
  await page.keyboard.press('ArrowLeft');
  await currentIndex(page, 1);
  await expect(page.locator('.swipe-layer[data-exiting]')).toHaveCount(0);
  await expect(deck).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Save card' }).click();
  await currentIndex(page, 2);
  await expect(page.locator('.swipe-layer[data-exiting]')).toHaveCount(0);
});

test('touch swipes and cancellation work without resizing the mobile preview', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 900 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto('/#/pattern/swipe-deck');
  await activeCard(page).scrollIntoViewIfNeeded();
  const frame = (await page.locator('.demo-canvas').boundingBox())!;
  const client = await context.newCDPSession(page);
  const swipe = async (cancel: boolean) => {
    const card = (await activeCard(page).boundingBox())!;
    const x = card.x + card.width / 2,
      y = card.y + card.height / 2;
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let dx = 15; dx <= 120; dx += 15) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x + dx, y }],
      });
    }
    await client.send('Input.dispatchTouchEvent', {
      type: cancel ? 'touchCancel' : 'touchEnd',
      touchPoints: [],
    });
  };
  await swipe(true);
  await currentIndex(page, 0);
  await expect
    .poll(() =>
      activeCard(page).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
    )
    .toBeCloseTo(0, 0);
  await swipe(false);
  await currentIndex(page, 1);
  await expect(page.getByRole('status')).toHaveText('Saved · 1 in your collection');
  const after = (await page.locator('.demo-canvas').boundingBox())!;
  expect(after.height).toBe(frame.height);
  expect(after.width).toBe(frame.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
