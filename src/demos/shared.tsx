import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { RotateCcw } from 'lucide-react';

export const PlaybackContext = createContext({ paused: false, speed: 1, reduced: false });
export const spring = { type: 'spring', duration: 0.5, bounce: 0.2 } as const;
export function usePlayback() {
  const value = useContext(PlaybackContext);
  const system = useReducedMotion();
  return { ...value, reduced: value.reduced || !!system };
}
export function useTicker(callback: () => void, delay: number | null) {
  const saved = useRef(callback);
  const { paused, speed } = usePlayback();
  useEffect(() => {
    saved.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null || paused) return;
    const timer = window.setInterval(() => saved.current(), delay / speed);
    return () => window.clearInterval(timer);
  }, [delay, paused, speed]);
}
export function useTimers() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (callback: () => void, delay: number) => {
    timers.current.push(setTimeout(callback, delay));
  };
}
export function Hint({ children }: { children: ReactNode }) {
  return <p className="demo-hint">{children}</p>;
}
export function DemoStack({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`demo-stack ${className}`}>{children}</div>;
}
export function Replay({ onClick }: { onClick: () => void }) {
  return (
    <button className="demo-text-button" onClick={onClick}>
      <RotateCcw size={13} /> Replay
    </button>
  );
}
export function useLocalState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage may be disabled. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Local-network HTTP previews do not expose the Clipboard API.
    const previousFocus = document.activeElement as HTMLElement | null;
    const selection = document.getSelection();
    const ranges = selection
      ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange())
      : [];
    const input = document.createElement('textarea');
    input.value = value;
    input.readOnly = true;
    input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(input);
    input.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      input.remove();
      previousFocus?.focus({ preventScroll: true });
      if (selection) {
        selection.removeAllRanges();
        for (const range of ranges) selection.addRange(range);
      }
    }
  }
}
