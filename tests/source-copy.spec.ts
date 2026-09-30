import { test, expect } from '@playwright/test';

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
    'npm install lucide-react@1.49.0 motion@13.4.6',
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

test('source setup stays readable on mobile and omits unnecessary installation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/#/pattern/grain-gradient');
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  await expect(page.locator('.source-view pre code')).toContainText(
    'export function GrainGradient',
  );
  await expect(page.getByText('No extra packages needed beyond React.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy install command' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
