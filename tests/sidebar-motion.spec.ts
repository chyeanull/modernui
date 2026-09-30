import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';

async function expectAligned(nav: Locator, target: string) {
  await expect
    .poll(() =>
      nav.evaluate((root, selector) => {
        const origin = root.querySelector('.sidebar-nav-content')!.getBoundingClientRect();
        const row = root.querySelector(selector)!.getBoundingClientRect();
        const indicator = root.querySelector('.nav-highlight-active')!;
        const top = parseFloat(getComputedStyle(indicator).clipPath.slice(6));
        return Math.abs(top - (row.top - origin.top));
      }, target),
    )
    .toBeLessThan(1);
}

test('sidebar hover and active highlights slide between rows and preserve selection', async ({
  page,
}) => {
  await page.goto('/#/saved');
  const nav = page.locator('.sidebar .sidebar-nav');
  await nav.getByRole('link', { name: 'Design foundations' }).hover();
  await expect(nav.locator('.nav-highlight-hover')).toHaveCSS('opacity', '1');

  for (const [kind, target] of [
    ['hover', '#/research'],
    ['active', '#/foundations'],
  ] as const) {
    const motion = await nav.evaluate(
      async (root, { kind, target }) => {
        const row = root.querySelector<HTMLAnchorElement>(`a[href="${target}"]`)!;
        const content = root.querySelector('.sidebar-nav-content')!;
        const highlight = root.querySelector<HTMLElement>(`.nav-highlight-${kind}`)!;
        const top = () => parseFloat(getComputedStyle(highlight).clipPath.slice(6));
        const start = top();
        const box = row.getBoundingClientRect();
        const end = box.top - content.getBoundingClientRect().top;
        // Slow and seek the native transition so CI frame rate cannot skip the motion.
        highlight.style.transitionDuration = '1s, 120ms';
        row.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles: true,
            pointerType: 'mouse',
            clientX: box.x + 20,
            clientY: box.y + box.height / 2,
          }),
        );
        if (kind === 'active') row.click();
        let transition: Animation | undefined;
        for (let frame = 0; frame < 40 && !transition; frame++) {
          await new Promise(requestAnimationFrame);
          transition = highlight
            .getAnimations()
            .find(
              (animation) =>
                animation instanceof CSSTransition && animation.transitionProperty === 'clip-path',
            );
        }
        const frames: number[] = [];
        if (transition) {
          transition.pause();
          const duration = Number(transition.effect!.getTiming().duration);
          for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
            transition.currentTime = duration * progress;
            frames.push(top());
          }
          transition.finish();
        }
        highlight.style.removeProperty('transition-duration');
        return { start, end, frames };
      },
      { kind, target },
    );
    const low = Math.min(motion.start, motion.end);
    const high = Math.max(motion.start, motion.end);
    expect(
      motion.frames.some((top) => top > low + 1 && top < high - 1),
      `${kind}: ${JSON.stringify(motion)}`,
    ).toBe(true);
    expect(motion.frames.every((top) => top >= low - 1 && top <= high + 1)).toBe(true);
    expect(Math.abs(motion.frames.at(-1)! - motion.end)).toBeLessThan(1);
  }

  await nav.getByRole('link', { name: 'Your collection' }).hover();
  await nav.getByRole('link', { name: 'Research & sources' }).hover();
  await page.mouse.move(500, 100);
  await expect(nav.locator('.nav-highlight-hover')).toHaveCSS('opacity', '0');
  await expect(nav.getByRole('link', { name: 'Design foundations' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expectAligned(nav, 'a[href="#/foundations"]');
});

test('active highlight follows nested navigation, collapsed groups, scrolling, and text resizing', async ({
  page,
}) => {
  await page.goto('/#/pattern/thinking-orb');
  const nav = page.locator('.sidebar .sidebar-nav');
  const selected = 'a[href="#/pattern/thinking-orb"]';
  await nav.locator(selected).scrollIntoViewIfNeeded();
  await expectAligned(nav, selected);
  await nav.getByRole('button', { name: 'Expand Navigation', exact: true }).click();
  await nav.locator(selected).scrollIntoViewIfNeeded();
  await expectAligned(nav, selected);
  await nav.getByRole('button', { name: 'Collapse Visual effects', exact: true }).click();
  await expectAligned(nav, '.nav-category-row.active');
  await nav.getByRole('button', { name: 'Expand Visual effects', exact: true }).click();
  await expectAligned(nav, selected);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await nav.locator(selected).scrollIntoViewIfNeeded();
  await expectAligned(nav, selected);
  await expect(nav.locator('.nav-highlight-active')).toHaveCSS('opacity', '1');
});

test('keyboard navigation and reduced-motion preferences make the highlight update instantly', async ({
  page,
}) => {
  await page.goto('/');
  const nav = page.locator('.sidebar .sidebar-nav');
  const collection = nav.getByRole('link', { name: 'Your collection' });
  await collection.hover();
  await collection.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/saved/);
  await expect(nav.locator('.nav-highlight-active')).toHaveCSS('transition-property', 'none');
  await expectAligned(nav, 'a[href="#/saved"]');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await nav.getByRole('link', { name: 'Design foundations' }).click();
  await expect(nav.locator('.nav-highlight-active')).toHaveCSS('transition-property', 'none');
  await expectAligned(nav, 'a[href="#/foundations"]');
});

test('touch navigation retains the active page without a sticky hover highlight', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Open navigation' }).tap();
  await page.getByRole('dialog').getByRole('link', { name: 'Design foundations' }).tap();
  await expect(page).toHaveURL(/foundations/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open navigation' }).tap();
  const nav = page.locator('.mobile-sidebar .sidebar-nav');
  await expectAligned(nav, 'a[href="#/foundations"]');
  await expect(nav.locator('.nav-highlight-hover')).toHaveCSS('display', 'none');
  await context.close();
});
