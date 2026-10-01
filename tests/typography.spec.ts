import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ reducedMotion: 'reduce' });

const routes = ['', 'pattern/motion-tabs', 'research', 'foundations', 'saved'];

async function auditShell(page: Page, minimum = 12) {
  const issues = await page.evaluate((minimum) => {
    const failures: string[] = [];
    if (document.documentElement.scrollWidth > innerWidth + 1)
      failures.push('Page overflows horizontally');
    for (const element of document.querySelectorAll<HTMLElement>(
      '.app-main *, .sidebar *, .mobile-sidebar *, .app-command *',
    )) {
      if (
        !element.checkVisibility() ||
        element.closest('.playground, .card-preview, .sr-only, [aria-hidden="true"]')
      )
        continue;
      if (
        ![...element.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        )
      )
        continue;
      const style = getComputedStyle(element);
      const size = parseFloat(style.fontSize);
      const text = element.textContent?.trim().slice(0, 55);
      if (size > 0 && size < minimum) failures.push(`${text}: ${size}px text`);
      if (element.getBoundingClientRect().right > innerWidth + 1)
        failures.push(`${text}: outside viewport`);
      if (
        element.clientWidth > 0 &&
        element.scrollWidth > element.clientWidth + 2 &&
        ['hidden', 'clip'].includes(style.overflowX)
      )
        failures.push(`${text}: clipped`);
    }
    return failures;
  }, minimum);
  expect(issues).toEqual([]);
}

for (const width of [320, 768, 1440]) {
  test(`app typography stays readable and reflows at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(`/#/${route}`);
      await expect(page.locator('main')).toBeVisible();
      await auditShell(page);
    }
  });
}

for (const width of [768, 1440]) {
  test(`app text supports 200% enlargement at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(`/#/${route}`);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%';
      });
      await auditShell(page, 24);
    }
  });
}

test('increased text spacing preserves the app content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  for (const route of routes) {
    await page.goto(`/#/${route}`);
    await page.addStyleTag({
      content: `
      :is(.app-main, .sidebar) :not(:where(.playground, .playground *, .card-preview, .card-preview *)) {
        line-height: 1.5 !important;
        letter-spacing: .12em !important;
        word-spacing: .16em !important;
      }
      :is(.app-main, .sidebar) p:not(:where(.playground *, .card-preview *)) { margin-bottom: 2em !important; }
    `,
    });
    await auditShell(page);
  }
});

test('navigation and search stay readable with enlarged text', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1000 });
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await auditShell(page, 24);
  await page.getByRole('dialog').getByRole('link', { name: 'Research & sources' }).click();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('combobox')).toBeVisible();
  await expect(page.getByRole('combobox')).toHaveCSS('font-size', '32px');
  await auditShell(page, 24);
  await page.getByRole('combobox').fill('tabs');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/motion-tabs/);
});

test('app type is larger while playground and source sizes are preserved', async ({ page }) => {
  await page.goto('/#/pattern/motion-tabs');
  await expect(page.locator('.nav-item').first()).toHaveCSS('font-size', '16px');
  await expect(page.locator('.detail-title p')).toHaveCSS('font-size', '16px');
  await expect(page.locator('.pattern-notes p').first()).toHaveCSS('font-size', '16px');
  await expect(page.locator('.control-tab').first()).toHaveCSS('font-size', '13px');
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  await expect(page.locator('.source-view pre')).toHaveCSS('font-size', '11px');
  await expect(page.locator('.source-view pre')).toHaveCSS('line-height', '20.35px');
});

test('foundations and app search have no serious text accessibility violations', async ({
  page,
}) => {
  for (const route of ['foundations', '']) {
    await page.goto(`/#/${route}`);
    if (!route) await page.keyboard.press('Control+k');
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations
        .filter((v) => ['critical', 'serious'].includes(v.impact || ''))
        .map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.html) })),
    ).toEqual([]);
  }
});
