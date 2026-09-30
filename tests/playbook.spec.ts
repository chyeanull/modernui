import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { categories, patterns } from '../src/data/patterns';

test('catalog filters, saved patterns, and theme survive reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.pattern-card')).toHaveCount(64);
  await expect(page.getByRole('textbox', { name: 'Filter patterns' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^(Grid|List) view$/ })).toHaveCount(0);
  await expect(page.locator('.pattern-grid')).toHaveCSS('display', 'grid');
  await page.getByRole('button', { name: 'The highlights' }).click();
  await expect(page.locator('.pattern-card')).toHaveCount(
    patterns.filter((pattern) => pattern.featured).length,
  );
  await page.getByRole('button', { name: /All patterns/ }).click();
  await page.getByRole('button', { name: 'Save Shader mesh', exact: true }).click();
  await page.getByRole('link', { name: /Your collection/ }).click();
  await expect(page.locator('.pattern-card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.pattern-card h2')).toHaveText('Shader mesh');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Unsave Shader mesh' }).click();
  await expect(page.getByText('A little room for inspiration.')).toBeVisible();
});

test('command search supports keyboard selection and Escape', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('combobox').fill('hold to confirm');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/hold-confirm/);
  await expect(dialog).not.toBeVisible();
  await page.keyboard.press('/');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

for (const category of categories) {
  test(`${category.name}: all eight examples render and expose their own source`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const pattern of patterns.filter((p) => p.category === category.id)) {
      await page.goto(`/#/pattern/${pattern.id}`);
      await expect(page.locator('h1')).toHaveText(`${pattern.name}.`);
      await expect(page.locator('.demo-viewport')).toBeVisible();
      await expect(page.getByText('This preview needs a refresh.')).toHaveCount(0);
      await page.getByRole('button', { name: 'Source', exact: true }).click();
      const source = await page.locator('pre code').innerText();
      expect(source).toContain('export function ');
      expect(source.length).toBeGreaterThan(200);
      expect(source).toContain('return');
      await page.getByRole('button', { name: 'Playground', exact: true }).click();
    }
    expect(errors).toEqual([]);
  });
  test(`${category.name}: every example fits a narrow mobile viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const failures: string[] = [];
    for (const pattern of patterns.filter((p) => p.category === category.id)) {
      await page.goto(`/#/pattern/${pattern.id}`);
      await expect(page.locator('.demo-viewport')).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      if (overflow) failures.push(pattern.id);
      const bounds = await page.locator('.demo-viewport').boundingBox();
      expect(bounds?.width).toBeLessThanOrEqual(340);
    }
    expect(failures).toEqual([]);
  });
}

test('morphing dialog contains focus, changes views, dismisses, and restores focus', async ({
  page,
}) => {
  await page.goto('/#/pattern/morphing-modal');
  const trigger = page.getByRole('button', { name: 'Open a little possibility' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /Privacy Your ideas/ }).click();
  await expect(dialog.getByText('Only invited members can view your work.')).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    await expect
      .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
      .toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('hold confirmation cancels early and supports the keyboard', async ({ page }) => {
  await page.goto('/#/pattern/hold-confirm');
  const button = page.getByRole('button', { name: 'Hold to archive' });
  await button.focus();
  await page.keyboard.down('Space');
  await page.waitForTimeout(200);
  await page.keyboard.up('Space');
  await page.waitForTimeout(1500);
  await expect(button).toHaveText('Hold to archive');
  await button.focus();
  await page.keyboard.down('Space');
  await page.waitForTimeout(1550);
  await page.keyboard.up('Space');
  await expect(page.getByRole('button', { name: 'Archived safely' })).toBeVisible();
});

test('validation preserves layout and accepts a complete address', async ({ page }) => {
  await page.goto('/#/pattern/inline-validation');
  const submit = page.getByRole('button', { name: 'Prepare invitation' });
  const before = await submit.boundingBox();
  await page.getByLabel('Work email').fill('bad');
  await submit.click();
  await expect(page.getByText('That email needs another look.')).toBeVisible();
  const after = await submit.boundingBox();
  expect(after?.y).toBe(before?.y);
  await page.getByLabel('Work email').fill('hello@studio.com');
  await submit.click();
  await expect(page.getByText('Invitation prepared. This is a local demo.')).toBeVisible();
});

test('input studies support paste-like entry, tags, sliders, and toggles', async ({ page }) => {
  await page.goto('/#/pattern/otp-input');
  await page.getByRole('textbox', { name: 'Six-digit verification code' }).fill('123456');
  await expect(page.getByText('Code complete. Demo validation passed.')).toBeVisible();
  await page.goto('/#/pattern/tag-input');
  await page.getByLabel('What are you into?').fill('Craft');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Remove Craft' })).toBeVisible();
  await page.getByRole('button', { name: 'Remove Craft' }).click();
  await expect(page.getByRole('button', { name: 'Remove Craft' })).toHaveCount(0);
  await page.goto('/#/pattern/elastic-slider');
  await page.getByRole('slider').fill('80');
  await expect(page.locator('output')).toHaveText('80%');
  await page.goto('/#/pattern/segmented-toggle');
  const toggle = page.getByRole('switch', { name: 'Available for conversations' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByText('A little focus time.')).toBeVisible();
});

test('data patterns respond to keyboard controls and undo', async ({ page }) => {
  await page.goto('/#/pattern/chart-scrubber');
  await page.getByRole('slider', { name: 'Explore month' }).fill('0');
  await expect(page.locator('.chart-value')).toContainText('visitors · Jan');
  await page.goto('/#/pattern/sortable-table');
  await page.getByRole('button', { name: 'Progress' }).click();
  await expect(page.locator('tbody tr').first()).toContainText('Website refresh');
  await page.getByRole('button', { name: 'Progress' }).click();
  await expect(page.locator('tbody tr').first()).toContainText('Motion studies');
  await page.goto('/#/pattern/filter-grid');
  await page.getByRole('button', { name: 'Research', exact: true }).click();
  await expect(page.locator('.filter-tile')).toHaveCount(2);
  await page.goto('/#/pattern/reorder-list');
  await page.getByRole('button', { name: 'Move Polish the little details up' }).click();
  await expect(page.locator('.reorder-row').nth(1)).toContainText('Polish the little details');
  await page.goto('/#/pattern/swipe-deck');
  await page.getByRole('button', { name: 'Save card' }).click();
  await expect(page.getByText('Saved · 1 in your collection')).toBeVisible();
  await page.getByRole('button', { name: 'Undo last choice' }).click();
  await expect(page.getByText('A place to begin.', { exact: true })).toBeVisible();
});

test('AI flows are local, stoppable, and explicit about outcomes', async ({ page }) => {
  await page.goto('/#/pattern/prompt-composer');
  await page.getByRole('button', { name: 'Plan a project', exact: true }).click();
  await page.getByRole('button', { name: 'Submit sample prompt' }).click();
  await expect(page.getByText('Brief captured: “Plan a project”')).toBeVisible();
  await page.goto('/#/pattern/streaming-response');
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  const partial = await page.locator('.stream-text').innerText();
  await page.waitForTimeout(200);
  expect(await page.locator('.stream-text').innerText()).toBe(partial);
  await page.goto('/#/pattern/approval-card');
  await page.getByRole('button', { name: 'Keep as is' }).click();
  await expect(page.getByText('No changes. All good.')).toBeVisible();
  await page.goto('/#/pattern/adaptive-stepper');
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await page.getByRole('textbox', { name: 'Workspace name' }).fill('Sunday Studio');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Together', exact: true }).click();
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await expect(page.getByText('Sunday Studio', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Create sample space' }).click();
  await expect(page.getByText('Good things start here.')).toBeVisible();
});

test('upload keeps files local and provides completion feedback', async ({ page }) => {
  await page.goto('/#/pattern/file-upload');
  const sent: string[] = [];
  page.on('request', (r) => {
    if (r.method() === 'POST') sent.push(r.url());
  });
  await page.getByLabel('Choose a local file').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('A little idea.'),
  });
  await expect(page.getByText('notes.txt', { exact: true })).toBeVisible();
  await expect(page.getByText(/KB · Ready to use/)).toBeVisible();
  expect(sent).toEqual([]);
});

test('navigation interactions and context menus work', async ({ page }) => {
  await page.goto('/#/pattern/sliding-tabs');
  const tab = page.getByRole('tab', { name: 'Overview' });
  await tab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Activity' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.goto('/#/pattern/radial-menu');
  await page.getByRole('button', { name: 'Open creation menu' }).click();
  await page.getByRole('button', { name: 'Create Idea', exact: true }).click();
  await expect(page.getByText('Idea created')).toBeVisible();
  await page.goto('/#/pattern/context-menu');
  await page.getByRole('button', { name: 'Canvas actions' }).click();
  await page.getByRole('menuitem', { name: 'Duplicate' }).click();
  await expect(page.getByText('Duplicate selected')).toBeVisible();
});

test('mobile navigation closes on selection and source notes remain accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Expand Visual effects' }).click();
  await dialog.getByRole('link', { name: 'Shader mesh' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('h1')).toHaveText('Shader mesh.');
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  await expect(page.locator('pre code')).toContainText('getContext');
});

test('research lists sources used in the app and supports search', async ({ page }) => {
  await page.goto('/#/research');
  await expect(page.locator('.research-row')).toHaveCount(15);
  await page.getByRole('textbox', { name: 'Search research sources' }).fill('NumberFlow');
  await expect(page.locator('.research-row')).toHaveCount(1);
  await expect(page.locator('.research-status')).toHaveText('Reviewed');
  await page.getByRole('textbox', { name: 'Search research sources' }).fill('Buyers Edge');
  await expect(page.locator('.research-row')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'No matching sources.' })).toBeVisible();
});

test('reduced-motion preference applies globally and retains interactions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/pattern/thinking-orb');
  const duration = await page
    .locator('.orb-layer')
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(duration).toBe('none');
  await page.getByRole('button', { name: 'Speaking', exact: true }).click();
  await expect(page.locator('.thinking-orb')).toHaveClass(/orb-speaking/);
  await page.goto('/#/foundations');
  await page.getByRole('switch').click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-reduced', 'true');
});

test('representative screens have no serious or critical accessibility violations', async ({
  page,
}) => {
  const results: {
    route: string;
    id: string;
    impact: string | null | undefined;
    nodes: string[];
  }[] = [];
  for (const route of [
    '',
    'pattern/inline-validation',
    'pattern/otp-input',
    'pattern/sliding-tabs',
    'pattern/chart-scrubber',
    'pattern/morphing-modal',
    'research',
  ]) {
    await page.goto(`/#/${route}`);
    if (route === 'pattern/morphing-modal')
      await page.getByRole('button', { name: 'Open a little possibility' }).click();
    const audit = await new AxeBuilder({ page }).analyze();
    for (const v of audit.violations.filter((v) =>
      ['critical', 'serious'].includes(v.impact || ''),
    ))
      results.push({
        route,
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.html.slice(0, 200)),
      });
  }
  expect(results).toEqual([]);
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  const darkAudit = await new AxeBuilder({ page }).analyze();
  expect(
    darkAudit.violations.filter((v) => ['critical', 'serious'].includes(v.impact || '')),
  ).toEqual([]);
});

test('ambient pause freezes CSS effects and the keyboard skip link keeps the current route', async ({
  page,
}) => {
  await page.goto('/#/pattern/thinking-orb');
  await page.getByRole('button', { name: 'Pause ambient motion' }).click();
  await expect
    .poll(() =>
      page
        .locator('.orb-layer')
        .first()
        .evaluate((el) => getComputedStyle(el).animationPlayState),
    )
    .toBe('paused');
  await page.getByRole('button', { name: 'Resume ambient motion' }).click();
  await expect
    .poll(() =>
      page
        .locator('.orb-layer')
        .first()
        .evaluate((el) => getComputedStyle(el).animationPlayState),
    )
    .toBe('running');
  await page.getByRole('link', { name: 'Skip to content' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await expect(page).toHaveURL(/pattern\/thinking-orb/);
});
