import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { chromium, expect } from '@playwright/test';
import { parse } from '@babel/parser';
import { generatePatternSources } from './pattern-sources.mjs';

const root = process.cwd();
const fresh = process.argv.includes('--fresh');
const directory = await mkdtemp(resolve(fresh ? tmpdir() : root, '.standalone-check-'));
let server;
let browser;
try {
  const sources = await generatePatternSources(root);
  const requested = process.argv.slice(2).filter((argument) => argument !== '--fresh');
  const ids = requested.length ? requested : Object.keys(sources);
  for (const id of ids) assert(sources[id], `Unknown pattern: ${id}`);
  if (fresh) {
    const app = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
    const packages = new Set([
      'react',
      'react-dom',
      ...Object.values(sources).flatMap((entry) => entry.packages),
    ]);
    await writeFile(
      resolve(directory, 'package.json'),
      JSON.stringify({
        name: 'standalone-pattern-audit',
        private: true,
        type: 'module',
        dependencies: Object.fromEntries(
          [...packages].map((name) => [name, app.dependencies[name]]),
        ),
        devDependencies: Object.fromEntries(
          ['@types/react', '@types/react-dom'].map((name) => [name, app.devDependencies[name]]),
        ),
      }),
    );
    execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
      cwd: directory,
      stdio: 'inherit',
    });
    console.log('Installed the exact Source-tab dependencies in a fresh project outside the app.');
  }
  await mkdir(resolve(directory, 'components'));
  for (const entry of Object.values(sources)) {
    const ast = parse(entry.source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
    for (const node of ast.program.body) {
      if (node.type !== 'ImportDeclaration') continue;
      const from = node.source.value;
      assert(!from.startsWith('.') && !from.startsWith('/'), `${entry.name}: local import ${from}`);
      const packageName = from.startsWith('@')
        ? from.split('/').slice(0, 2).join('/')
        : from.split('/')[0];
      assert(
        packageName === 'react' || entry.packages.includes(packageName),
        `${entry.name}: missing install instruction for ${from}`,
      );
    }
    await writeFile(resolve(directory, 'components', entry.filename), entry.source);
    // Execute the same import and default App component shown in step 3.
    await writeFile(resolve(directory, 'components', `${entry.name}Usage.tsx`), entry.usage);
  }
  await writeFile(
    resolve(directory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        jsx: 'react-jsx',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        verbatimModuleSyntax: true,
        types: ['react', 'react-dom'],
      },
      include: ['components/*.tsx'],
    }),
  );
  execFileSync(
    resolve(root, 'node_modules/.bin/tsc'),
    ['-p', resolve(directory, 'tsconfig.json')],
    { stdio: 'inherit' },
  );
  console.log(
    `All ${Object.keys(sources).length} standalone files compile with strict unused-import checks.`,
  );

  await writeFile(
    resolve(directory, 'index.html'),
    '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><button id="unrelated" class="demo-button">Unrelated button</button><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
  );
  await writeFile(
    resolve(directory, 'main.tsx'),
    `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    const modules = import.meta.glob('./components/*.tsx');
    const name = new URLSearchParams(location.search).get('component');
    const module = await modules['./components/' + name + 'Usage.tsx']();
    const Component = module.default;
    createRoot(document.getElementById('root')!).render(<React.StrictMode><Component /></React.StrictMode>);
  `,
  );
  server = await createServer({
    configFile: false,
    root: directory,
    cacheDir: resolve(directory, '.vite'),
    plugins: [react()],
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'error',
  });
  await server.listen();
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1000, height: 850 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const visit = async (id) => {
    await page.goto(`${base}/?component=${sources[id].name}`);
    await expect(page.locator('[data-pattern-root]')).toBeVisible();
  };
  for (const width of [1000, 360]) {
    await page.setViewportSize({ width, height: 850 });
    for (const id of ids) {
      await visit(id);
      const state = await page.evaluate(() => {
        const root = document.querySelector('[data-pattern-root]');
        const probe = getComputedStyle(document.querySelector('#unrelated'));
        return {
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          textColor: getComputedStyle(root).getPropertyValue('--text').trim(),
          unrelatedDisplay: probe.display,
          unrelatedBorder: probe.borderTopStyle,
        };
      });
      assert(!state.overflow, `${id} overflows at ${width}px`);
      assert.equal(state.textColor, '#292b28', `${id}: missing theme`);
      assert.equal(state.unrelatedDisplay, 'inline-block', `${id}: leaked layout styles`);
      assert.equal(state.unrelatedBorder, 'outset', `${id}: leaked button styles`);
    }
    console.log(
      `${ids.length} standalone examples render at ${width}px without app CSS or global style leaks.`,
    );
  }
  await page.setViewportSize({ width: 1000, height: 850 });
  if (ids.includes('basic-pie-chart')) {
    await visit('basic-pie-chart');
    const slices = page.locator('.basic-pie-slice');
    await expect(slices).toHaveCount(3);
    await page.waitForTimeout(950);
    const complete = await slices.first().getAttribute('d');
    await page.getByRole('button', { name: 'Redraw', exact: true }).click();
    await expect(slices.first()).not.toHaveAttribute('d', complete);
    await expect(slices.first()).toHaveAttribute('d', complete);
  }
  if (ids.includes('line-chart-transition')) {
    await visit('line-chart-transition');
    const line = page.locator('.transition-chart-line');
    const before = await line.getAttribute('d');
    await page.getByRole('button', { name: 'Yan', exact: true }).click();
    await expect(line).not.toHaveAttribute('d', before);
    await expect(page.locator('.transition-chart-footer [role="status"]')).toContainText(
      'Latest score 44',
    );
    await page.getByRole('button', { name: 'Melanie', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(line).toHaveAttribute('d', before);
  }
  if (ids.includes('comet-dial')) {
    await visit('comet-dial');
    const dial = page.getByRole('slider', { name: 'Intensity' });
    await dial.focus();
    await page.keyboard.press('Home');
    await expect(dial).toHaveAttribute('aria-valuenow', '0');
    await page.keyboard.press('End');
    await expect(dial).toHaveAttribute('aria-valuenow', '100');
    // Small pointer changes must retain the continuous motion of the live example.
    const box = await dial.boundingBox();
    const point = (angle) => ({
      x: box.x + box.width * (0.5 + 0.4 * Math.cos((angle * Math.PI) / 180)),
      y: box.y + box.height * (0.5 + 0.4 * Math.sin((angle * Math.PI) / 180)),
    });
    const start = point(310);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.waitForTimeout(650);
    const positions = [];
    for (let step = 1; step <= 24; step++) {
      const next = point(310 + step * 0.15);
      await page.mouse.move(next.x, next.y);
      await page.evaluate(() => new Promise(requestAnimationFrame));
      positions.push(Number(await page.locator('.comet-head').getAttribute('cx')).toFixed(3));
    }
    assert(new Set(positions).size > 20, 'Copied comet dial snaps small drags');
    await expect(dial).toHaveCSS('outline-style', 'none');
    await page.mouse.up();
  }
  if (ids.includes('grain-gradient')) {
    await visit('grain-gradient');
    const pixels = () =>
      page
        .locator('.grain-noise')
        .evaluate((canvas) => [...canvas.getContext('2d').getImageData(0, 0, 8, 8).data].join(','));
    const before = await pixels();
    await expect.poll(pixels).not.toBe(before);
    await page.getByRole('button', { name: 'Pause grain', exact: true }).click();
    const paused = await pixels();
    await page.waitForTimeout(150);
    assert.equal(await pixels(), paused, 'Copied grain continues after pause');
  }
  if (ids.includes('adaptive-stepper')) {
    await visit('adaptive-stepper');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
    await page.getByRole('textbox').fill('Copied workspace');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: /Together/ }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: 'Complete', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your workspace is ready.' })).toBeVisible();
  }
  if (ids.includes('records-table')) {
    await visit('records-table');
    await page.getByRole('checkbox', { name: 'Select all records', exact: true }).check();
    await expect(page.locator('.records-toolbar [role="status"]')).toHaveText('6 selected');
    await page.getByRole('button', { name: 'Company', exact: true }).click();
    await expect(page.locator('.record-name').first()).toContainText('Morrow House');
  }
  if (ids.includes('filter-table')) {
    await visit('filter-table');
    await page.getByRole('button', { name: 'To do 2', exact: true }).click();
    await expect(page.locator('.records-footer [role="status"]')).toHaveText('2 tasks shown');
    await page.getByRole('button', { name: 'Move Review the homepage to In progress' }).click();
    await expect(page.locator('.records-footer [role="status"]')).toHaveText('1 task shown');
  }
  if (ids.includes('lattice-loader')) {
    await visit('lattice-loader');
    await page.getByRole('button', { name: 'Sweep', exact: true }).click();
    await expect(page.locator('.lattice-cell')).toHaveCount(16);
    await page.getByRole('button', { name: 'Complete', exact: true }).click();
    await expect(page.locator('.lattice-demo')).toHaveAttribute('data-state', 'done');
    await page.getByRole('button', { name: 'Replay', exact: true }).click();
    await page.getByRole('button', { name: 'Fail', exact: true }).click();
    await expect(page.locator('.lattice-demo')).toHaveAttribute('data-state', 'error');
  }
  for (const id of ['motion-select', 'motion-combobox', 'motion-multi-select'].filter((id) =>
    ids.includes(id),
  )) {
    await visit(id);
    if (id === 'motion-select') {
      await page.locator('.control-select-trigger').click();
    } else {
      await page.getByRole('combobox').fill(id === 'motion-combobox' ? 'Lis' : 'Res');
    }
    const popup = page.locator('.control-popup');
    await expect(popup).toBeVisible();
    await expect(popup).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(popup.locator('.control-option').first()).toHaveCSS('font-size', '14px');
    await page
      .getByRole('option', {
        name: id === 'motion-select' ? 'Vite' : id === 'motion-combobox' ? 'Lisbon' : 'Research',
        exact: true,
      })
      .click();
    if (id === 'motion-select')
      await expect(page.locator('.control-select-trigger')).toContainText('Vite');
    if (id === 'motion-combobox') await expect(page.getByRole('combobox')).toHaveValue('Lisbon');
    if (id === 'motion-multi-select')
      await expect(
        page.getByRole('button', { name: 'Remove Research', exact: true }),
      ).toBeVisible();
    await page.keyboard.press('Escape');
  }
  await visit('swipe-deck');
  await expect(page.locator('.swipe-layer')).toHaveCount(3);
  await page.getByRole('button', { name: 'Save card' }).click();
  await expect(page.locator('.swipe-layer')).toHaveCount(2);
  await expect(page.getByRole('status')).toHaveText('Saved · 1 in your collection');
  await page.getByRole('button', { name: 'Undo last choice' }).click();
  await expect(page.locator('.swipe-layer[data-active]')).toHaveAttribute('data-card', '0');
  await expect
    .poll(() =>
      page
        .locator('.swipe-layer[data-active] .swipe-card')
        .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
    )
    .toBeCloseTo(0, 0);
  await visit('expanding-card');
  const card = page.locator('.expanding-note');
  const closedHeight = (await card.boundingBox()).height;
  await page.getByRole('button', { name: 'Read the field note' }).click();
  await expect(page.locator('.note-reveal')).toHaveCSS('opacity', '1');
  await expect
    .poll(async () => (await card.boundingBox()).height)
    .toBeGreaterThan(closedHeight + 50);
  await expect(page.locator('.note-art')).toHaveCSS('height', '115px');
  await page.getByRole('button', { name: 'Close the note' }).click();
  await expect.poll(async () => (await card.boundingBox()).height).toBe(closedHeight);
  await visit('approval-card');
  await page.getByRole('button', { name: 'Looks good' }).click();
  await expect(page.getByText('A little progress, approved.')).toBeVisible();
  await visit('progress-ring');
  await page.getByRole('button', { name: 'Start export' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  await expect(page.locator('.ring-complete > svg')).toHaveCSS('transform', 'none');
  await expect(page.locator('.ring-burst-particle')).toHaveCount(8);
  await visit('motion-tabs');
  await page.getByRole('tab', { name: 'Activity' }).click();
  await expect(page.getByRole('tab', { name: 'Activity' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await visit('morphing-modal');
  await page.getByRole('button', { name: 'Open a little possibility' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('.morph-dialog-viewport')).toHaveCSS('position', 'fixed');
  await expect(dialog).toHaveCSS('position', 'relative');
  await dialog.getByRole('button', { name: /Privacy Your ideas/ }).click();
  await expect(dialog.getByText('Only invited members can view your work.')).toBeVisible();
  await expect(page.locator('.morph-dialog-view')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await visit('command-menu');
  await page.getByRole('button', { name: /Open command menu/ }).click();
  await page.getByRole('combobox').fill('calendar');
  await expect(page.getByRole('option', { name: 'Open calendar' })).toHaveCSS('display', 'flex');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Open calendar selected')).toBeVisible();
  await visit('toast-stack');
  await page.getByRole('button', { name: 'Send a notification' }).click();
  await expect(page.getByText('Added to your collection', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByText('Removed from collection', { exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await visit('progress-ring');
  await page.getByRole('button', { name: 'Start export' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  await expect(page.locator('.ring-burst-particle')).toHaveCount(0);
  assert.deepEqual(errors, []);
  console.log(
    'Standalone approval, progress, tabs, portal dialog, command search, toast undo, and reduced motion checks passed.',
  );
} finally {
  await browser?.close();
  await server?.close();
  await rm(directory, { recursive: true, force: true });
}
