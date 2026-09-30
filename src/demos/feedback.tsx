import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  Copy,
  Download,
  Heart,
  LoaderCircle,
  Music,
  Pause,
  Play,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  copyText,
  DemoStack,
  Hint,
  Replay,
  spring,
  usePlayback,
  useTicker,
  useTimers,
} from './shared';

export function MorphingButton() {
  const [state, setState] = useState<'idle' | 'saving' | 'done'>('idle');
  const later = useTimers();
  return (
    <DemoStack>
      <motion.button
        layout
        className={`morph-button ${state}`}
        transition={spring}
        disabled={state === 'saving'}
        onClick={() => {
          if (state === 'done') {
            setState('idle');
            return;
          }
          setState('saving');
          later(() => setState('done'), 1500);
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            className="row"
            key={state}
            initial={{ opacity: 0, transform: 'translateY(5px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transform: 'translateY(-5px)' }}
            transition={{ duration: 0.15 }}
          >
            {state === 'idle' ? (
              <>
                <Plus size={17} />
                Save changes
              </>
            ) : state === 'saving' ? (
              <>
                <LoaderCircle size={17} className="spin" />
                Saving changes
              </>
            ) : (
              <>
                <Check size={17} />
                Changes saved
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <Hint>
        <span role="status">
          {state === 'done'
            ? 'All set. Click again to reset.'
            : state === 'saving'
              ? 'Putting everything in place…'
              : 'A button that keeps you in the loop.'}
        </span>
      </Hint>
    </DemoStack>
  );
}
export function HoldConfirm() {
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const start = () => {
    if (done || timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      setDone(true);
      setHolding(false);
      timer.current = null;
    }, 1400);
  };
  return (
    <DemoStack>
      <button
        className={`hold-button ${holding ? 'holding' : ''} ${done ? 'done' : ''}`}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          start();
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
        onBlur={cancel}
        onKeyDown={(e) => {
          if ([' ', 'Enter'].includes(e.key)) {
            e.preventDefault();
            if (!e.repeat) start();
          }
          if (e.key === 'Escape') cancel();
        }}
        onKeyUp={(e) => {
          if ([' ', 'Enter'].includes(e.key)) {
            e.preventDefault();
            cancel();
          }
        }}
      >
        <span className="hold-fill" />
        <span className="row">
          {done ? <Check size={17} /> : <Trash2 size={16} />}{' '}
          {done ? 'Archived safely' : 'Hold to archive'}
        </span>
      </button>
      <Hint>
        <span role="status">
          {done
            ? 'Demo item archived.'
            : holding
              ? 'Keep holding…'
              : 'Hold for 1.4 seconds · release to cancel'}
        </span>
      </Hint>
      {done && <Replay onClick={() => setDone(false)} />}
    </DemoStack>
  );
}
export function ToastStack() {
  const [count, setCount] = useState(0);
  const send = () => {
    setCount((c) => c + 1);
    toast.success('Added to your collection', {
      description: 'A good idea, saved for later.',
      action: {
        label: 'Undo',
        onClick: () => {
          setCount((c) => Math.max(0, c - 1));
          toast('Removed from collection');
        },
      },
    });
  };
  return (
    <DemoStack>
      <div className="toast-illustration" aria-hidden="true">
        <div />
        <div />
        <div>
          <span className="success-icon">
            <Check size={17} />
          </span>
          <span>
            Good things, saved.<small>Your collection is growing.</small>
          </span>
        </div>
      </div>
      <button className="demo-button" onClick={send}>
        <Bell size={16} /> Send a notification
      </button>
      <Hint>
        {count ? `${count} saved in this session` : 'A quiet nudge in the right direction.'}
      </Hint>
    </DemoStack>
  );
}
export function LikeBurst() {
  const [liked, setLiked] = useState(false);
  const { reduced } = usePlayback();
  return (
    <DemoStack>
      <button
        aria-label={liked ? 'Unlike this idea' : 'Like this idea'}
        aria-pressed={liked}
        className={`like-button ${liked ? 'liked' : ''}`}
        onClick={() => setLiked(!liked)}
      >
        <Heart size={35} fill={liked ? 'currentColor' : 'none'} />
        {liked &&
          !reduced &&
          Array.from({ length: 8 }, (_, i) => (
            <i
              className="burst-particle"
              key={i}
              style={{ '--angle': `${i * 45}deg` } as React.CSSProperties}
            />
          ))}
      </button>
      <span className="like-count">{liked ? '129' : '128'} little appreciations</span>
      <Hint>{liked ? 'A little love goes a long way.' : 'Some things deserve a little love.'}</Hint>
    </DemoStack>
  );
}
export function CopyButton() {
  const [state, setState] = useState('idle');
  const later = useTimers();
  return (
    <DemoStack>
      <div className="copy-token">
        <span className="token-swatch" />
        <code>#ED5B35</code>
        <button
          className={state === 'copied' ? 'copied' : ''}
          aria-label="Copy color token"
          onClick={async () => {
            const ok = await copyText('#ED5B35');
            setState(ok ? 'copied' : 'error');
            later(() => setState('idle'), 2200);
          }}
        >
          {state === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          <span>{state === 'copied' ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <Hint>
        <span role="status">
          {state === 'error'
            ? 'Clipboard unavailable. Select and copy the token above.'
            : state === 'copied'
              ? 'Ready to paste into your next idea.'
              : 'A warm accent, ready to borrow.'}
        </span>
      </Hint>
    </DemoStack>
  );
}
export function ProgressRing() {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);
  const elapsed = useRef(0);
  const { paused, speed, reduced } = usePlayback();
  const circumference = 2 * Math.PI * 49;
  useEffect(() => {
    if (!running || paused) return;
    let previous = performance.now();
    let frame: number;
    const tick = (now: number) => {
      elapsed.current = Math.min(2800, elapsed.current + Math.max(0, now - previous) * speed);
      previous = now;
      const next = (elapsed.current / 2800) * 100;
      setValue(next);
      if (next === 100) setRunning(false);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, paused, speed]);
  return (
    <DemoStack>
      <div className="progress-ring">
        <svg
          viewBox="0 0 120 120"
          role="progressbar"
          aria-label="Sample export progress"
          aria-valuenow={Math.floor(value)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <circle cx="60" cy="60" r="49" className="ring-track" />
          <circle
            cx="60"
            cy="60"
            r="49"
            className="ring-fill"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / 100)}
          />
        </svg>
        {value === 100 &&
          !reduced &&
          Array.from({ length: 8 }, (_, i) => (
            <i
              key={i}
              className="burst-particle ring-burst-particle"
              aria-hidden="true"
              style={{ '--angle': `${i * 45}deg` } as React.CSSProperties}
            />
          ))}
        {value === 100 ? (
          <motion.span
            className="ring-complete"
            aria-hidden="true"
            initial={reduced ? false : { opacity: 0, transform: 'scale(0.95)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <Check size={32} strokeWidth={2.5} />
          </motion.span>
        ) : (
          <span aria-hidden="true">
            {Math.floor(value)}
            <small>%</small>
          </span>
        )}
      </div>
      <button
        className="demo-button"
        onClick={() => {
          if (running) {
            setRunning(false);
            return;
          }
          elapsed.current = 0;
          setValue(0);
          setRunning(true);
        }}
      >
        {running ? (
          <>
            <X size={15} />
            Cancel export
          </>
        ) : (
          <>
            <Download size={15} />
            {value === 100 ? 'Export again' : 'Start export'}
          </>
        )}
      </button>
      <Hint>
        <span role="status">
          {value === 100 ? 'Sample export complete.' : 'Simulated export · no file is generated'}
        </span>
      </Hint>
    </DemoStack>
  );
}
export function LiveActivity() {
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(true);
  return (
    <DemoStack>
      <motion.div
        layout
        transition={spring}
        className={`live-island ${expanded ? 'expanded' : ''}`}
      >
        <button
          className="island-summary"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <span className="album-art">
            <Music size={20} />
          </span>
          <span>Somewhere, softly{expanded && <small>Studio sessions · 03</small>}</span>
          <span className={`equalizer ${playing ? '' : 'stopped'}`} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} />
            ))}
          </span>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="island-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="music-progress">
                <span />
              </div>
              <div className="row">
                <small>1:24</small>
                <button
                  onClick={() => setPlaying(!playing)}
                  aria-label={playing ? 'Pause visualizer' : 'Play visualizer'}
                >
                  {playing ? <Pause size={22} /> : <Play size={22} />}
                </button>
                <small>3:48</small>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <Hint>Tap to {expanded ? 'collapse' : 'expand'} · visual playback demo</Hint>
    </DemoStack>
  );
}
export function NotificationStack() {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState([
    'Maya left a note on your design',
    'Your weekly digest is ready',
    'Alex joined the workspace',
  ]);
  return (
    <DemoStack>
      <div className={`notification-pile ${expanded ? 'expanded' : ''}`}>
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              layout
              key={item}
              className="notification-card"
              style={
                expanded
                  ? {}
                  : {
                      position: i === 0 ? 'relative' : 'absolute',
                      inset: '0',
                      transform: `translateY(${i * 9}px) scale(${1 - i * 0.05})`,
                      zIndex: 3 - i,
                      opacity: 1 - i * 0.18,
                    }
              }
              exit={{ opacity: 0, transform: 'translateX(30px)' }}
              transition={spring}
            >
              <span className="notification-avatar">{['M', '↗', 'A'][i]}</span>
              <span>
                {item}
                <small>Studio workspace · just now</small>
              </span>
              {expanded && (
                <button
                  aria-label={`Dismiss ${item}`}
                  onClick={() => setItems(items.filter((x) => x !== item))}
                >
                  <X size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {!items.length && (
          <div className="notification-empty">
            <CheckCheck size={28} />
            <p>All caught up.</p>
          </div>
        )}
      </div>
      {!!items.length ? (
        <button
          className="demo-text-button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? 'Collapse' : `View ${items.length} notifications`}
          <ChevronDown size={14} />
        </button>
      ) : (
        <Replay
          onClick={() => {
            setItems([
              'Maya left a note on your design',
              'Your weekly digest is ready',
              'Alex joined the workspace',
            ]);
            setExpanded(false);
          }}
        />
      )}
    </DemoStack>
  );
}
