import { useEffect, useId, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  Reorder,
  useMotionValue,
  usePresence,
  usePresenceData,
  useTransform,
} from 'motion/react';
import NumberFlow from '@number-flow/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  GripVertical,
  Heart,
  RotateCcw,
  X,
} from 'lucide-react';
import { DemoStack, Hint, spring, usePlayback } from './shared';

export function ChartScrubber() {
  const [index, setIndex] = useState(11);
  const id = useId();
  const grad = useId().replace(/:/g, '');
  const values = [24, 30, 27, 43, 38, 48, 42, 63, 57, 72, 64, 84];
  const points = values.map((v, i) => `${20 + i * 28},${150 - v * 1.3}`).join(' ');
  const x = 20 + index * 28,
    y = 150 - values[index] * 1.3;
  return (
    <DemoStack>
      <div className="chart-card">
        <div className="row">
          <span className="data-badge">
            +24.8% <ArrowUpRight size={11} />
          </span>
        </div>
        <div className="chart-value">
          <NumberFlow value={values[index] * 100} locales="en-US" />
          <span>
            visitors ·{' '}
            {
              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
                index
              ]
            }
          </span>
        </div>
        <svg
          className="line-chart"
          viewBox="0 0 350 170"
          aria-label="Sample monthly visitors"
          role="img"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setIndex(
              Math.max(
                0,
                Math.min(11, Math.round((((e.clientX - r.left) / r.width) * 350 - 20) / 28)),
              ),
            );
          }}
        >
          <defs>
            <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#688a70" stopOpacity=".22" />
              <stop offset="100%" stopColor="#688a70" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[40, 80, 120, 160].map((n) => (
            <path key={n} d={`M20 ${n}H330`} stroke="currentColor" opacity=".07" />
          ))}
          <path d={`M20 160 L${points} L328 160Z`} fill={`url(#${grad})`} />
          <polyline
            points={points}
            fill="none"
            stroke="#60836b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line
            x1={x}
            y1="20"
            x2={x}
            y2="160"
            stroke="currentColor"
            strokeDasharray="3 4"
            opacity=".3"
          />
          <circle cx={x} cy={y} r="5" fill="#60836b" stroke="var(--panel)" strokeWidth="3" />
        </svg>
        <input
          id={id}
          className="chart-range"
          aria-label="Explore month"
          type="range"
          min={0}
          max={11}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
        />
        <div className="row chart-labels">
          <span>JAN</span>
          <span>DEC</span>
        </div>
      </div>
    </DemoStack>
  );
}
export function AnimatedBars() {
  const [period, setPeriod] = useState('Week');
  const values = period === 'Week' ? [42, 70, 55, 90, 65, 82, 58] : [68, 48, 84, 52, 95, 62, 77];
  const labels =
    period === 'Week'
      ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      : ['1', '5', '10', '15', '20', '25', '30'];
  return (
    <DemoStack>
      <div className="chart-card">
        <div className="row">
          <div>
            <h3>Creative hours</h3>
          </div>
          <div className="small-segments">
            {['Week', 'Month'].map((x) => (
              <button
                key={x}
                aria-pressed={period === x}
                className={period === x ? 'active' : ''}
                onClick={() => setPeriod(x)}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
        <div className="bar-chart" aria-label={`Creative hours by ${period.toLowerCase()}`}>
          {values.map((n, i) => (
            <div className="bar-column" key={i}>
              <span>{(n / 10).toFixed(1)}</span>
              <div className="bar-track">
                <motion.i animate={{ transform: `scaleY(${n / 100})` }} transition={spring} />
              </div>
              <small>{labels[i]}</small>
            </div>
          ))}
        </div>
      </div>
    </DemoStack>
  );
}
export function DonutChart() {
  const [selected, setSelected] = useState(0);
  const values = [
    ['Design', 45, '#df7353'],
    ['Engineering', 35, '#7f9487'],
    ['Research', 20, '#b8a5cc'],
  ] as const;
  let offset = 0;
  return (
    <DemoStack>
      <div className="donut-demo">
        <div className="donut-visual">
          <svg
            viewBox="0 0 160 160"
            role="img"
            aria-label="Time allocation: Design 45%, Engineering 35%, Research 20%"
          >
            {values.map(([label, value, color], i) => {
              const start = offset;
              offset += value;
              return (
                <circle
                  key={label}
                  cx="80"
                  cy="80"
                  r="61"
                  fill="none"
                  stroke={color}
                  strokeWidth={selected === i ? 22 : 16}
                  strokeDasharray={`${(value - 1.5) * 3.832} ${383.2 - (value - 1.5) * 3.832}`}
                  strokeDashoffset={-start * 3.832}
                  transform="rotate(-90 80 80)"
                  opacity={selected === i ? 1 : 0.5}
                />
              );
            })}
          </svg>
          <span>
            <strong>
              {values[selected][1]}
              <small>%</small>
            </strong>
            <small>{values[selected][0]}</small>
          </span>
        </div>
        <div className="donut-legend">
          {values.map(([label, value, color], i) => (
            <button
              key={label}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              className={selected === i ? 'active' : ''}
            >
              <i style={{ background: color }} />
              {label}
              <b>{value}%</b>
            </button>
          ))}
        </div>
      </div>
    </DemoStack>
  );
}
export function SortableTable() {
  const [sort, setSort] = useState<'name' | 'progress'>('name');
  const [asc, setAsc] = useState(true);
  const uid = useId();
  const rows = [
    { name: 'Brand exploration', progress: 84 },
    { name: 'Component library', progress: 62 },
    { name: 'Motion studies', progress: 95 },
    { name: 'Website refresh', progress: 38 },
  ].sort(
    (a, b) =>
      (sort === 'name' ? a.name.localeCompare(b.name) : a.progress - b.progress) * (asc ? 1 : -1),
  );
  const change = (s: 'name' | 'progress') => {
    if (sort === s) setAsc(!asc);
    else {
      setSort(s);
      setAsc(true);
    }
  };
  return (
    <DemoStack>
      <div className="table-card">
        <table>
          <caption>Things taking shape</caption>
          <thead>
            <tr>
              {(['name', 'progress'] as const).map((s) => (
                <th key={s} aria-sort={sort === s ? (asc ? 'ascending' : 'descending') : 'none'}>
                  <button onClick={() => change(s)}>
                    {s === 'name' ? 'Project' : 'Progress'}
                    {sort === s ? (
                      asc ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )
                    ) : (
                      <ChevronDown size={12} />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <motion.tr layout key={row.name} layoutId={`${uid}-${row.name}`} transition={spring}>
                <td>
                  <span className="project-dot" />
                  {row.name}
                </td>
                <td>
                  <span className="table-progress">
                    <i style={{ transform: `scaleX(${row.progress / 100})` }} />
                  </span>
                  {row.progress}%
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoStack>
  );
}
export function FilterGrid() {
  const [filter, setFilter] = useState('All');
  const items = [
    ['Shapes', 'Design'],
    ['Composition', 'Design'],
    ['Notes', 'Research'],
    ['Type', 'Design'],
    ['Interviews', 'Research'],
    ['Prototype', 'Build'],
  ];
  const shown = items.filter((x) => filter === 'All' || x[1] === filter);
  return (
    <DemoStack className="filter-demo">
      <div className="small-segments">
        {['All', 'Design', 'Research', 'Build'].map((x) => (
          <button
            key={x}
            aria-pressed={filter === x}
            className={filter === x ? 'active' : ''}
            onClick={() => setFilter(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <motion.div layout className="filter-grid">
        <AnimatePresence>
          {shown.map(([title, type]) => (
            <motion.div
              layout
              key={title}
              className={`filter-tile tile-${items.findIndex((x) => x[0] === title)}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <span className="tile-shape" />
              <span>
                {title}
                <small>{type}</small>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <Hint>
        <span role="status">{shown.length} ideas, finding their place.</span>
      </Hint>
    </DemoStack>
  );
}
const swipeIdeas = ['A place to begin.', 'A different perspective.', 'Something worth keeping.'];
const swipeSpring = { type: 'spring', stiffness: 260, damping: 34 } as const;

function SwipeDeckCard({
  index,
  depth,
  progress,
  entry,
  instant,
  reduced,
  onMove,
  onChoose,
}: {
  index: number;
  depth: number;
  progress: number;
  entry: number;
  instant: boolean;
  reduced: boolean;
  onMove: (distance: number) => void;
  onChoose: (direction: number, index: number) => void;
}) {
  const [present, remove] = usePresence();
  const flow = usePresenceData() as { direction: number; instant: boolean; button: boolean };
  const latestFlow = useRef(flow);
  latestFlow.current = flow;
  const active = depth === 0 && present;
  const x = useMotionValue(instant ? 0 : entry);
  const rotation = useTransform(x, (value) => (reduced ? 0 : value / 25));
  const opacity = useTransform(x, [-420, -180, 180, 420], [0, 1, 1, 0]);
  const passOpacity = useTransform(x, [-92, -15, 0], [1, 0, 0]);
  const saveOpacity = useTransform(x, [0, 15, 92], [0, 0, 1]);
  const settling = useRef<ReturnType<typeof animate> | null>(null);
  // Keep the dragged value through release, exit, and undo: there is no snap back
  // before a committed card leaves. Presence keeps that card above the next one.
  useEffect(() => {
    settling.current?.stop();
    const next = latestFlow.current;
    settling.current = animate(
      x,
      present ? 0 : next.direction * 420,
      next.instant
        ? { duration: 0 }
        : present
          ? swipeSpring
          : {
              duration: next.button ? 0.6 : 0.28,
              ease: next.button ? [0.32, 0.72, 0, 1] : [0.23, 1, 0.32, 1],
            },
    );
    if (!present) void settling.current.then(() => remove?.());
    return () => settling.current?.stop();
  }, [present, x, remove]);
  const lift = depth === 1 ? Math.min(1, Math.abs(progress) / 92) : 0;
  return (
    <motion.div
      className="swipe-layer"
      data-card={index}
      data-active={active || undefined}
      data-exiting={!present || undefined}
      aria-hidden={!active}
      inert={!active}
      initial={false}
      animate={{
        transform: `translateY(${(depth - lift) * 10}px) scale(${1 - (depth - lift) * 0.045})`,
      }}
      transition={instant ? { duration: 0 } : swipeSpring}
      style={{ zIndex: present ? 3 - depth : 4 }}
    >
      <motion.div
        className={`swipe-card swipe-${index}`}
        role="group"
        aria-label={`${swipeIdeas[index]} Card ${index + 1} of ${swipeIdeas.length}`}
        drag={active ? 'x' : false}
        dragMomentum={false}
        style={{ x, rotate: rotation, opacity }}
        onDragStart={() => settling.current?.stop()}
        onDrag={(_, info) => onMove(Math.round(info.offset.x / 8) * 8)}
        onDragEnd={(event, info) => {
          onMove(0);
          const far = Math.abs(info.offset.x) >= 92;
          const flick = Math.abs(info.offset.x) >= 32 && Math.abs(info.velocity.x) >= 520;
          if (event.type !== 'pointercancel' && (far || flick)) {
            onChoose(Math.sign(far ? info.offset.x : info.velocity.x), index);
          } else {
            settling.current = animate(x, 0, reduced ? { duration: 0 } : swipeSpring);
          }
        }}
      >
        <span className="swipe-art" aria-hidden="true" />
        <h3>{swipeIdeas[index]}</h3>
        <small>Take what speaks to you.</small>
        <motion.span
          className="swipe-badge swipe-pass"
          style={{ opacity: passOpacity }}
          aria-hidden="true"
        >
          PASS
        </motion.span>
        <motion.span
          className="swipe-badge swipe-save"
          style={{ opacity: saveOpacity }}
          aria-hidden="true"
        >
          SAVE
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

export function SwipeDeck() {
  const [history, setHistory] = useState<number[]>([]);
  const choices = useRef<number[]>([]);
  const [flow, setFlow] = useState({ direction: 1, undo: false, instant: false, button: false });
  const [progress, setProgress] = useState(0);
  const { reduced } = usePlayback();
  const hintId = useId();
  const index = history.length;
  const done = index === swipeIdeas.length;
  const choose = (
    direction: number,
    at = choices.current.length,
    keyboard = false,
    button = false,
  ) => {
    if (at !== choices.current.length || at >= swipeIdeas.length) return;
    choices.current = [...choices.current, direction];
    setFlow({ direction, undo: false, instant: reduced || keyboard, button });
    setHistory(choices.current);
    setProgress(0);
  };
  const undo = (keyboard = false) => {
    const direction = choices.current.at(-1);
    if (!direction) return;
    choices.current = choices.current.slice(0, -1);
    setFlow({ direction, undo: true, instant: reduced || keyboard, button: false });
    setHistory(choices.current);
    setProgress(0);
  };
  return (
    <DemoStack>
      <div
        className="swipe-area"
        role="group"
        aria-roledescription="card deck"
        aria-label="Inspiration deck"
        aria-describedby={hintId}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            choose(event.key === 'ArrowLeft' ? -1 : 1, choices.current.length, true);
          } else if (event.key === 'Backspace' || event.key === 'Delete') {
            event.preventDefault();
            undo(true);
          }
        }}
      >
        {done && (
          <div className="swipe-empty">
            <Check size={26} />
            <h3>All explored.</h3>
            <p>Undo a choice to take another look.</p>
          </div>
        )}
        <AnimatePresence
          initial={false}
          custom={{
            direction: flow.direction,
            instant: reduced || flow.instant,
            button: flow.button,
          }}
        >
          {swipeIdeas.slice(index).map((_, depth) => (
            <SwipeDeckCard
              key={index + depth}
              index={index + depth}
              depth={depth}
              progress={progress}
              entry={depth === 0 && flow.undo ? flow.direction * 420 : 0}
              instant={reduced || flow.instant}
              reduced={reduced}
              onMove={setProgress}
              onChoose={choose}
            />
          ))}
        </AnimatePresence>
      </div>
      <div className="swipe-controls">
        <button
          aria-label="Pass on card"
          disabled={done}
          onClick={(event) => choose(-1, choices.current.length, event.detail === 0, true)}
        >
          <X size={21} />
        </button>
        <button
          aria-label="Undo last choice"
          disabled={!history.length}
          onClick={(event) => undo(event.detail === 0)}
        >
          <RotateCcw size={17} />
        </button>
        <button
          aria-label="Save card"
          disabled={done}
          onClick={(event) => choose(1, choices.current.length, event.detail === 0, true)}
        >
          <Heart size={21} />
        </button>
      </div>
      <div className="swipe-caption">
        <Hint>
          <span role="status">
            {history.length
              ? `${history.at(-1) === 1 ? 'Saved' : 'Passed'} · ${history.filter((choice) => choice === 1).length} in your collection`
              : 'Drag a card. Follow your instinct.'}
          </span>
        </Hint>
        <p className="demo-hint" aria-live="polite">
          {done
            ? 'All 3 cards explored.'
            : `Card ${index + 1} of ${swipeIdeas.length} · ${swipeIdeas.length - index} left`}
        </p>
      </div>
      <span id={hintId} className="sr-only">
        Swipe or use the buttons to choose. With the deck focused, use Left or Right arrow to decide
        and Backspace to undo.
      </span>
    </DemoStack>
  );
}
export function ReorderList() {
  const [items, setItems] = useState([
    'Make something useful',
    'Give it room to breathe',
    'Polish the little details',
  ]);
  const [message, setMessage] = useState('');
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setItems(next);
    setMessage(`${items[i]} moved to position ${i + d + 1}`);
  };
  return (
    <DemoStack>
      <div className="reorder-demo">
        <Reorder.Group axis="y" values={items} onReorder={setItems}>
          {items.map((item, i) => (
            <Reorder.Item value={item} key={item} className="reorder-row">
              <GripVertical size={17} className="grip" />
              <span>{item}</span>
              <div>
                <button
                  disabled={i === 0}
                  aria-label={`Move ${item} up`}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  disabled={i === items.length - 1}
                  aria-label={`Move ${item} down`}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={13} />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      <Hint>
        <span role="status">{message || 'Drag to reorder · or use the arrow buttons'}</span>
      </Hint>
    </DemoStack>
  );
}
export function ComparisonSlider() {
  const [value, setValue] = useState(50);
  const id = useId();
  return (
    <DemoStack className="comparison-demo">
      <div className="comparison-window">
        <div className="compare-art compare-before">
          <span className="compare-sun" />
          <i />
          <b />
          <strong>
            A quiet
            <br />
            perspective.
          </strong>
          <small>BEFORE</small>
        </div>
        <div
          className="compare-art compare-after"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          <span className="compare-sun" />
          <i />
          <b />
          <strong>
            A quiet
            <br />
            perspective.
          </strong>
          <small>AFTER</small>
        </div>
        <div className="compare-divider" style={{ left: `${value}%` }}>
          <span>
            <ArrowLeft size={12} />
            <ArrowRight size={12} />
          </span>
        </div>
        <input
          id={id}
          type="range"
          aria-label="Reveal after treatment"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>
      <Hint>{value}% revealed · drag to find the difference</Hint>
    </DemoStack>
  );
}
