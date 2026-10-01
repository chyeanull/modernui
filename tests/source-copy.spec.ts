import { test, expect } from '@playwright/test';
import { categories, patterns } from '../src/data/patterns';
import { generatePatternSources } from '../scripts/pattern-sources.mjs';
import type { StandaloneSource } from '../scripts/pattern-sources.mjs';

let bundles: Record<string, StandaloneSource>;
test.beforeAll(async () => {
  bundles = await generatePatternSources();
});

for (const category of categories) {
  test(`${category.name}: every Source tab matches the current standalone export and copies exactly`, async ({
    page,
    context,
  }) => {
    test.setTimeout(120000);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const pattern of patterns.filter((pattern) => pattern.category === category.id)) {
      const bundle = bundles[pattern.id];
      await page.goto(`/#/pattern/${pattern.id}`);
      await page.getByRole('button', { name: 'Source', exact: true }).click();
      await expect(page.locator('.source-file-header strong')).toHaveText(bundle.filename);
      await expect
        .poll(() => page.locator('.source-view pre code').textContent())
        .toBe(bundle.source);
      const commands = page.locator('.source-command code');
      await expect(commands).toHaveText(
        bundle.install ? [bundle.install, bundle.usage] : [bundle.usage],
      );
      await page.getByRole('button', { name: 'Copy component', exact: true }).click();
      expect(await page.evaluate(() => navigator.clipboard.readText()), pattern.id).toBe(
        bundle.source,
      );
    }
    expect(errors).toEqual([]);
  });
}

test('source provides one complete file, exact dependencies, and working copy actions', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#/pattern/progress-ring');
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  const code = page.locator('.source-view pre code');
  await expect(code).toContainText('export function ProgressRing');
  const source = await code.innerText();
  expect(source).toContain('const styles =');
  expect(source).toContain('function usePlayback');
  expect(source).not.toContain("from './shared'");
  expect(source).not.toContain("from 'sonner'");
  await expect(page.getByRole('button', { name: 'Shared helpers', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Copy install command' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    bundles['progress-ring'].install,
  );
  await page.getByRole('button', { name: 'Copy component', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(source);
  await page.getByRole('button', { name: 'Copy usage example' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "import { ProgressRing } from './ProgressRing';\n\nexport default function App() {\n  return <ProgressRing />;\n}",
  );

  // Exercise the fallback used by local-network HTTP previews.
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new Error('Clipboard API unavailable');
    };
  });
  await page.getByRole('button', { name: 'Copy component', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(source);
  await expect(page.getByRole('button', { name: 'Copy component', exact: true })).toBeFocused();
});

test('source setup stays readable on mobile and includes the grain playback dependency', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/#/pattern/grain-gradient');
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  await expect(page.locator('.source-view pre code')).toContainText(
    'export function GrainGradient',
  );
  await expect(page.locator('.source-command code').first()).toHaveText(
    bundles['grain-gradient'].install,
  );
  expect(bundles['grain-gradient'].packages).toContain('motion');
  await expect(page.getByRole('button', { name: 'Copy install command' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
