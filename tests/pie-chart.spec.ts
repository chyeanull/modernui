import { test, expect } from '@playwright/test';

test('pie draws on load and Redraw replays all three segments without resizing', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const frames: string[] = [];
    Object.assign(window, { pieFrames: frames });
    new MutationObserver(() => {
      const path = document.querySelector('.basic-pie-slice');
      if (path) frames.push(path.getAttribute('d')!);
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['d'] });
  });
  await page.goto('/#/pattern/basic-pie-chart');
  const slices = page.locator('.basic-pie-slice');
  await expect(slices).toHaveCount(3);
  await page.waitForTimeout(950);
  const finalPaths = await slices.evaluateAll((paths) =>
    paths.map((path) => path.getAttribute('d')),
  );
  expect(
    await page.evaluate(
      () => new Set((window as unknown as { pieFrames: string[] }).pieFrames).size,
    ),
  ).toBeGreaterThan(5);
  const preview = await page.locator('.demo-canvas').boundingBox();
  const replayFrames = await page.evaluate(async () => {
    const frames: string[] = [];
    (document.querySelector('.basic-pie-redraw') as HTMLButtonElement).click();
    const start = performance.now();
    while (performance.now() - start < 950) {
      frames.push(document.querySelector('.basic-pie-slice')!.getAttribute('d')!);
      await new Promise(requestAnimationFrame);
    }
    return frames;
  });
  expect(new Set(replayFrames).size).toBeGreaterThan(5);
  expect(await slices.evaluateAll((paths) => paths.map((path) => path.getAttribute('d')))).toEqual(
    finalPaths,
  );
  expect((await page.locator('.demo-canvas').boundingBox())!.height).toBe(preview!.height);
  await page
    .getByRole('button', { name: 'Redraw', exact: true })
    .click({ clickCount: 3, delay: 80 });
  await page.waitForTimeout(950);
  expect(await slices.evaluateAll((paths) => paths.map((path) => path.getAttribute('d')))).toEqual(
    finalPaths,
  );
  await expect(page.getByRole('list', { name: 'Chart values' }).getByRole('listitem')).toHaveCount(
    3,
  );
  await expect(page.locator('.source-link')).toHaveAttribute(
    'href',
    'https://mui.com/x/react-charts/pie/',
  );
});

test('pie respects reduced motion, fits mobile, and includes its complete source', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 850 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/pattern/basic-pie-chart');
  const slices = page.locator('.basic-pie-slice');
  await expect(slices).toHaveCount(3);
  const finalPaths = await slices.evaluateAll((paths) =>
    paths.map((path) => path.getAttribute('d')),
  );
  await page.getByRole('button', { name: 'Redraw', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
  expect(await slices.evaluateAll((paths) => paths.map((path) => path.getAttribute('d')))).toEqual(
    finalPaths,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  await expect(page.locator('.source-view pre code')).toContainText(
    'export function BasicPieChart',
  );
  await expect(page.locator('.source-view pre code')).toContainText('function basicPieArc');
  await expect(page.locator('.source-view pre code')).toContainText('function BasicPieSlice');
});
