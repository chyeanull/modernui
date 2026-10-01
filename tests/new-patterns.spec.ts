import { expect, test } from '@playwright/test';

const additions = [
  'motion-tabs',
  'motion-input',
  'motion-select',
  'motion-combobox',
  'motion-checkbox',
  'motion-radio-group',
  'motion-multi-select',
  'comet-dial',
  'lattice-loader',
  'records-table',
  'filter-table',
];

test('motion tabs, field validation, checkbox group and radios support the keyboard', async ({
  page,
}) => {
  await page.goto('/#/pattern/motion-tabs');
  await page.getByRole('tab', { name: 'Overview', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Activity', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByRole('button', { name: 'Underline', exact: true }).click();
  await expect(page.locator('.control-tabs')).toHaveAttribute('data-variant', 'underline');
  await page.goto('/#/pattern/motion-input');
  await page.getByLabel('Email', { exact: true }).fill('broken');
  await page.getByLabel('Email', { exact: true }).blur();
  await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Email', { exact: true }).fill('hello@studio.com');
  await expect(page.getByText('Looks good.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
  await page.goto('/#/pattern/motion-checkbox');
  const parent = page.getByRole('checkbox', { name: 'All notifications', exact: true });
  await expect(parent).toHaveJSProperty('indeterminate', true);
  await parent.focus();
  await page.keyboard.press('Space');
  await expect(parent).toBeChecked();
  await page.getByRole('checkbox', { name: 'Weekly summary', exact: true }).uncheck();
  await expect(parent).toHaveJSProperty('indeterminate', true);
  await page.goto('/#/pattern/motion-radio-group');
  await page.getByRole('radio', { name: /Pro/ }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio', { name: /Team/ })).toBeChecked();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio', { name: /Starter/ })).toBeChecked();
});

test('select, combobox and multi select filter, select, clear and dismiss their portals', async ({
  page,
}) => {
  await page.goto('/#/pattern/motion-select');
  const trigger = page.locator('.control-select-trigger');
  await trigger.click();
  await page.getByRole('option', { name: 'Vite', exact: true }).click();
  await expect(trigger).toContainText('Vite');
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(trigger).toContainText('Next.js');
  await page.goto('/#/pattern/motion-combobox');
  const input = page.getByRole('combobox', { name: 'Next destination' });
  await input.fill('zzzz');
  await expect(page.getByText('No destinations found.')).toBeVisible();
  await input.fill('Lis');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('Lisbon');
  await page.getByRole('button', { name: 'Clear destination' }).click();
  await expect(input).toHaveValue('');
  await page.keyboard.press('Escape');
  await expect(page.locator('.control-popup')).toHaveCount(0);
  await page.goto('/#/pattern/motion-multi-select');
  await page.getByRole('button', { name: 'Remove Design', exact: true }).click();
  await expect(page.locator('.control-chip')).toHaveCount(1);
  await page.getByRole('combobox', { name: 'Invite teams' }).fill('Res');
  await page.getByRole('option', { name: 'Research', exact: true }).click();
  await expect(page.locator('.control-chip')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(page.locator('.control-popup')).toHaveCount(0);
});

test('record selection and sorting work; status filters track edited tasks', async ({ page }) => {
  await page.goto('/#/pattern/records-table');
  await page.getByRole('checkbox', { name: 'Select Alder Studio', exact: true }).check();
  await expect(
    page.getByRole('checkbox', { name: 'Select all records', exact: true }),
  ).toHaveJSProperty('indeterminate', true);
  await page.getByRole('checkbox', { name: 'Select all records', exact: true }).check();
  await expect(page.locator('.records-toolbar [role="status"]')).toHaveText('6 selected');
  await page.getByRole('button', { name: 'Company', exact: true }).click();
  await expect(page.locator('.record-name').first()).toContainText('Morrow House');
  await page.getByRole('button', { name: 'Show categories for Alder Studio' }).click();
  await expect(page.getByText('Strategy', { exact: true })).toBeVisible();
  await page.goto('/#/pattern/filter-table');
  await page.getByRole('button', { name: 'To do 2', exact: true }).click();
  await expect(page.locator('.records-footer [role="status"]')).toHaveText('2 tasks shown');
  await page.getByRole('button', { name: 'Move Review the homepage to In progress' }).click();
  await expect(page.locator('.records-footer [role="status"]')).toHaveText('1 task shown');
  await page.getByRole('button', { name: 'Move Prepare the launch notes to In progress' }).click();
  await expect(page.getByText('No tasks in this state.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Show all tasks' }).click();
  await expect(page.locator('.records-footer [role="status"]')).toHaveText('5 tasks shown');
});

test('comet dial supports drag, cancellation and bounded keyboard adjustments', async ({
  page,
}) => {
  await page.goto('/#/pattern/comet-dial');
  const dial = page.getByRole('slider', { name: 'Intensity' });
  await dial.focus();
  await page.keyboard.press('Home');
  await expect(dial).toHaveAttribute('aria-valuenow', '0');
  await page.keyboard.press('ArrowLeft');
  await expect(dial).toHaveAttribute('aria-valuenow', '0');
  await page.keyboard.press('End');
  await expect(dial).toHaveAttribute('aria-valuenow', '100');
  await page.keyboard.press('PageDown');
  await expect(dial).toHaveAttribute('aria-valuenow', '90');
  const box = (await dial.boundingBox())!;
  const point = (angle: number) => ({
    x: box.x + box.width * (0.5 + 0.4 * Math.cos((angle * Math.PI) / 180)),
    y: box.y + box.height * (0.5 + 0.4 * Math.sin((angle * Math.PI) / 180)),
  });
  const start = point(220),
    end = point(310);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await expect
    .poll(async () => Number(await dial.getAttribute('aria-valuenow')))
    .toBeGreaterThan(50);
  await page.mouse.up();
  await page.waitForTimeout(650);
  expect(Number(await dial.getAttribute('aria-valuenow'))).toBeLessThanOrEqual(100);
  const previous = await dial.getAttribute('aria-valuenow');
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await dial.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse' });
  await expect(dial).toHaveAttribute('aria-valuenow', previous!);
  await page.mouse.up();
});

test('comet dial follows small drags continuously and its trail fades while held still', async ({
  page,
}) => {
  await page.goto('/#/pattern/comet-dial');
  const dial = page.getByRole('slider', { name: 'Intensity' });
  const box = (await dial.boundingBox())!;
  const point = (angle: number) => ({
    x: box.x + box.width * (0.5 + 0.4 * Math.cos((angle * Math.PI) / 180)),
    y: box.y + box.height * (0.5 + 0.4 * Math.sin((angle * Math.PI) / 180)),
  });
  const start = point(110 + 62 * 3.2);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  const positions: number[] = [];
  for (let step = 1; step <= 24; step++) {
    const next = point(110 + 62 * 3.2 + step * 0.15);
    await page.mouse.move(next.x, next.y);
    await page.evaluate(() => new Promise(requestAnimationFrame));
    positions.push(Number(await page.locator('.comet-head').getAttribute('cx')));
  }
  // Sub-percent pointer movements must move the dot, even when the label stays rounded.
  expect(new Set(positions.map((value) => value.toFixed(3))).size).toBeGreaterThan(20);
  for (let step = 1; step < positions.length; step++)
    expect(positions[step] - positions[step - 1]).toBeGreaterThan(0);
  await expect
    .poll(async () =>
      page
        .locator('.comet-tail')
        .evaluateAll((paths) =>
          Math.max(0, ...paths.map((path) => Number(getComputedStyle(path).opacity))),
        ),
    )
    .toBeLessThan(0.01);
  await page.mouse.up();
});

test('animated grain changes pixels and freezes on pause; lattice resolves and replays', async ({
  page,
}) => {
  await page.goto('/#/pattern/grain-gradient');
  const canvas = page.locator('.grain-noise');
  const pixels = () =>
    canvas.evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      return [...canvas.getContext('2d')!.getImageData(0, 0, 8, 8).data].join(',');
    });
  const first = await pixels();
  await page.waitForTimeout(150);
  expect(await pixels()).not.toBe(first);
  await page.getByRole('button', { name: 'Pause grain', exact: true }).click();
  const still = await pixels();
  await page.waitForTimeout(150);
  expect(await pixels()).toBe(still);
  await page.goto('/#/pattern/lattice-loader');
  await page
    .locator('.lattice-actions')
    .getByRole('button', { name: 'Pause', exact: true })
    .click();
  const elapsed = await page.locator('.lattice-timer').innerText();
  await page.waitForTimeout(220);
  await expect(page.locator('.lattice-timer')).toHaveText(elapsed);
  await page.getByRole('button', { name: 'Sweep', exact: true }).click();
  await expect(page.locator('.lattice-cell')).toHaveCount(16);
  await page.getByRole('button', { name: 'Complete', exact: true }).click();
  await expect(page.locator('.lattice-demo')).toHaveAttribute('data-state', 'done');
  await page.getByRole('button', { name: 'Replay', exact: true }).click();
  await page.getByRole('button', { name: 'Fail', exact: true }).click();
  await expect(page.locator('.lattice-demo [role="status"]')).toHaveText(
    'Sample agent task failed',
  );
});

test('all additions render on mobile, respect reduced motion and retain fixed previews', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 360, height: 850 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const id of [...additions, 'adaptive-stepper', 'grain-gradient']) {
    await page.goto('/#/pattern/' + id);
    await expect(page.locator('.demo-viewport')).toBeVisible();
    await expect(page.getByText('This preview needs a refresh.')).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      id,
    ).toBe(true);
    await expect(page.locator('.demo-canvas')).toHaveCSS('height', '560px');
  }
  await page.goto('/#/category/workflow');
  await expect(page.locator('[data-pattern="reasoning-panel"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('touch dropdowns open on the first tap after dragging the comet dial', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 850 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  try {
    await page.goto('http://localhost:5173/#/pattern/comet-dial');
    const dial = page.getByRole('slider', { name: 'Intensity' });
    await dial.scrollIntoViewIfNeeded();
    const box = (await dial.boundingBox())!;
    const cdp = await context.newCDPSession(page);
    const point = (angle: number) => ({
      x: box.x + box.width * (0.5 + 0.4 * Math.cos((angle * Math.PI) / 180)),
      y: box.y + box.height * (0.5 + 0.4 * Math.sin((angle * Math.PI) / 180)),
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(175)] });
    for (const angle of [195, 215, 235, 255, 275])
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [point(angle)],
      });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    for (const [id, trigger, option] of [
      ['motion-multi-select', 'Show teams', 'Product'],
      ['motion-combobox', 'Show destinations', 'Lisbon'],
      ['motion-select', 'Framework', 'Vite'],
    ]) {
      await page.goto('http://localhost:5173/#/pattern/' + id);
      await page
        .getByRole(id === 'motion-select' ? 'combobox' : 'button', { name: trigger, exact: true })
        .tap();
      await expect(page.locator('.control-popup')).toBeVisible();
      await page.getByRole('option', { name: option, exact: true }).tap();
      if (id === 'motion-multi-select')
        await expect(
          page.getByRole('button', { name: 'Remove Product', exact: true }),
        ).toBeVisible();
      if (id === 'motion-combobox')
        await expect(page.getByRole('combobox', { name: 'Next destination' })).toHaveValue(
          'Lisbon',
        );
      if (id === 'motion-select')
        await expect(page.locator('.control-select-trigger')).toContainText('Vite');
    }
  } finally {
    await context.close();
  }
});
