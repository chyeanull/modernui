import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { usePlayback } from '../demos/shared';

type Bounds = { x: number; y: number; width: number; height: number };
const rowSelector = '.nav-item, .nav-category-row, .nav-children > a';
const activeSelector = '.nav-item.active, .nav-category-row.active, .nav-children > a.active';

function sameBounds(a: Bounds | null, b: Bounds | null) {
  return (
    a === b ||
    !!(a && b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height)
  );
}

function clip(bounds: Bounds | null) {
  if (!bounds) return 'inset(0 100% 100% 0 round 6px)';
  const { x, y, width, height } = bounds;
  return `inset(${y}px calc(100% - ${x + width}px) calc(100% - ${y + height}px) ${x}px round 6px)`;
}

export function SidebarNav({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState<Bounds | null>(null);
  const [hover, setHover] = useState<Bounds | null>(null);
  const [keyboard, setKeyboard] = useState(true);
  const { reduced } = usePlayback();

  const measure = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    const origin = content.getBoundingClientRect();
    const bounds = (row: Element | null): Bounds | null => {
      if (!row || !origin.width || !row.getClientRects().length) return null;
      const rect = row.getBoundingClientRect();
      const round = (value: number) => Math.round(value * 100) / 100;
      return {
        x: round(rect.x - origin.x),
        y: round(rect.y - origin.y),
        width: round(rect.width),
        height: round(rect.height),
      };
    };
    const selected = content.querySelector(activeSelector);
    const underPointer = pointer.current
      ? document.elementFromPoint(pointer.current.x, pointer.current.y)?.closest(rowSelector)
      : null;
    const nextActive = bounds(selected);
    const nextHover =
      underPointer && content.contains(underPointer) && underPointer !== selected
        ? bounds(underPointer)
        : null;
    setActive((previous) => (sameBounds(previous, nextActive) ? previous : nextActive));
    // Keep the last geometry while fading out, so leaving never slides toward the origin.
    setHover((previous) => (sameBounds(previous, nextHover) ? previous : nextHover));
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [children, measure]);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    const onKeyboard = () => {
      pointer.current = null;
      setKeyboard(true);
      setHover(null);
    };
    const onPointerDown = () => setKeyboard(false);
    document.addEventListener('keydown', onKeyboard, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', onKeyboard, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches)
      return;
    pointer.current = { x: event.clientX, y: event.clientY };
    setKeyboard(false);
    measure();
  };

  return (
    <nav
      className="sidebar-nav"
      aria-label="Playbook navigation"
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        pointer.current = null;
        setHover(null);
      }}
      onScroll={measure}
    >
      <div
        className="sidebar-nav-content"
        ref={contentRef}
        data-instant={keyboard || reduced || undefined}
      >
        <NavHighlight kind="active" bounds={active} />
        <NavHighlight kind="hover" bounds={hover} />
        {children}
      </div>
    </nav>
  );
}

function NavHighlight({ kind, bounds }: { kind: 'active' | 'hover'; bounds: Bounds | null }) {
  const last = useRef<Bounds | null>(null);
  useLayoutEffect(() => {
    if (bounds) last.current = bounds;
  }, [bounds]);
  return (
    <span
      aria-hidden="true"
      className={`nav-highlight nav-highlight-${kind}`}
      data-initial={!last.current || undefined}
      data-visible={!!bounds}
      style={{ clipPath: clip(bounds || last.current), opacity: bounds ? 1 : 0 }}
    />
  );
}
