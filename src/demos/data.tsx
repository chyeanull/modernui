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
import type { MotionValue } from 'motion/react';
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

const basicPieData = [
  { label: 'Series A', value: 10, color: '#e97946' },
  { label: 'Series B', value: 15, color: '#7d9c85' },
  { label: 'Series C', value: 20, color: '#9290bd' },
];

function basicPieArc(start: number, end: number) {
  const point = (angle: number) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return `${120 + 104 * Math.cos(radians)},${120 + 104 * Math.sin(radians)}`;
  };
  return `M120,120 L${point(start)} A104,104 0 ${end - start > 180 ? 1 : 0},1 ${point(end)} Z`;
}

function BasicPieSlice({
  start,
  end,
  color,
  progress,
}: {
  start: number;
  end: number;
  color: string;
  progress: MotionValue<number>;
}) {
  const path = useTransform(progress, (value) => basicPieArc(start * value, end * value));
  return <motion.path className="basic-pie-slice" d={path} fill={color} />;
}

export function BasicPieChart() {
  const [replay, setReplay] = useState(0);
  const { reduced, speed } = usePlayback();
  const progress = useMotionValue(reduced ? 1 : 0);
  const id = useId();
  const total = basicPieData.reduce((sum, segment) => sum + segment.value, 0);

  useEffect(() => {
    progress.jump(reduced ? 1 : 0);
    if (reduced) return;
    const animation = animate(progress, 1, {
      duration: 0.8 / speed,
      ease: [0.23, 1, 0.32, 1],
    });
    return () => animation.stop();
  }, [progress, reduced, replay, speed]);

  return (
    <DemoStack>
      <div className="basic-pie-card">
        <div className="basic-pie-heading">
          <h2>Category share</h2>
          <button className="basic-pie-redraw" onClick={() => setReplay((value) => value + 1)}>
            <RotateCcw size={14} aria-hidden="true" />
            Redraw
          </button>
        </div>
        <svg className="basic-pie-svg" viewBox="0 0 240 240" role="img" aria-labelledby={id}>
          <title id={id}>Pie chart: Series A 10, Series B 15, Series C 20. Total 45.</title>
          {basicPieData.map((segment, index) => {
            const start = basicPieData.slice(0, index).reduce((sum, item) => sum + item.value, 0);
            return (
              <BasicPieSlice
                key={segment.label}
                start={(start / total) * 360}
                end={((start + segment.value) / total) * 360}
                color={segment.color}
                progress={progress}
              />
            );
          })}
        </svg>
        <ul className="basic-pie-legend" aria-label="Chart values">
          {basicPieData.map((segment) => (
            <li key={segment.label}>
              <span
                className="basic-pie-key"
                style={{ background: segment.color }}
                aria-hidden="true"
              />
              <span>{segment.label}</span>
              <strong>{segment.value}</strong>
            </li>
          ))}
        </ul>
      </div>
      <Hint>Three segments. Redraw to replay the entrance.</Hint>
    </DemoStack>
  );
}

const transitionLineData = [
  { name: 'Melanie', values: [28, 62, 45, 78, 52, 86, 64, 72, 48, 68] },
  { name: 'Yan', values: [72, 42, 66, 34, 78, 48, 82, 52, 88, 44] },
];

function transitionLinePath(values: number[]) {
  return values
    .map(
      (value, index) => `${index === 0 ? 'M' : 'L'}${44 + index * (416 / 9)},${204 - value * 1.7}`,
    )
    .join(' ');
}

export function TransitionLineChart() {
  const [selected, setSelected] = useState(0);
  const [keyboard, setKeyboard] = useState(false);
  const { reduced } = usePlayback();
  const id = useId();
  const dataset = transitionLineData[selected];
  return (
    <DemoStack>
      <div className="transition-chart-card">
        <div className="transition-chart-heading">
          <div>
            <h3>Scores over time</h3>
            <p>Two datasets. One shared scale.</p>
          </div>
          <div className="small-segments" role="group" aria-label="Choose chart dataset">
            {transitionLineData.map((series, index) => (
              <button
                key={series.name}
                aria-pressed={selected === index}
                className={selected === index ? 'active' : ''}
                onClick={(event) => {
                  setKeyboard(event.detail === 0);
                  setSelected(index);
                }}
              >
                {series.name}
              </button>
            ))}
          </div>
        </div>
        <svg
          className="transition-chart-svg"
          viewBox="0 0 480 244"
          role="img"
          aria-labelledby={`${id}-title ${id}-description`}
        >
          <title id={`${id}-title`}>{dataset.name}: sample scores over ten observations</title>
          <desc id={`${id}-description`}>
            A line chart on a fixed scale from 0 to 100. Scores: {dataset.values.join(', ')}.
          </desc>
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={tick} className="transition-chart-grid">
              <line x1="44" x2="460" y1={204 - tick * 1.7} y2={204 - tick * 1.7} />
              <text x="32" y={204 - tick * 1.7} textAnchor="end" dominantBaseline="middle">
                {tick}
              </text>
            </g>
          ))}
          {dataset.values.map((_, index) => (
            <text
              className="transition-chart-tick"
              key={index}
              x={44 + index * (416 / 9)}
              y="229"
              textAnchor="middle"
            >
              {index + 1}
            </text>
          ))}
          <motion.path
            className="transition-chart-line"
            initial={false}
            animate={{ d: transitionLinePath(dataset.values) }}
            transition={reduced || keyboard ? { duration: 0 } : { ...spring, bounce: 0 }}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="transition-chart-footer">
          <p role="status">
            <strong>{dataset.name}</strong>
            <span>Latest score {dataset.values.at(-1)}</span>
          </p>
          <span>Sample data</span>
        </div>
      </div>
      <Hint>Switch datasets to follow the change. The axes stay fixed.</Hint>
    </DemoStack>
  );
}

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

const sampleRecords = [
  {
    id: 'alder',
    name: 'Alder Studio',
    city: 'Copenhagen',
    tags: ['Design', 'Partner', 'Branding', 'Strategy'],
    days: 3,
    strength: 4,
  },
  {
    id: 'bloom',
    name: 'Bloom & Co.',
    city: 'Amsterdam',
    tags: ['Retail', 'Product', 'Research'],
    days: 18,
    strength: 2,
  },
  {
    id: 'common',
    name: 'Common Ground',
    city: 'Lisbon',
    tags: ['Workspace', 'Partner', 'Events'],
    days: 7,
    strength: 4,
  },
  {
    id: 'drift',
    name: 'Drift Supply',
    city: 'Oslo',
    tags: ['Supplier', 'Materials', 'Wholesale'],
    days: 42,
    strength: 1,
  },
  {
    id: 'forma',
    name: 'Forma Collective',
    city: 'Berlin',
    tags: ['Design', 'Research', 'Product', 'Partner'],
    days: 11,
    strength: 3,
  },
  {
    id: 'morrow',
    name: 'Morrow House',
    city: 'Stockholm',
    tags: ['Retail', 'Hospitality'],
    days: 0,
    strength: 0,
  },
];
function RecordCheckbox({
  label,
  checked,
  mixed = false,
  onChange,
}: {
  label: string;
  checked: boolean;
  mixed?: boolean;
  onChange: (on: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = mixed;
  }, [mixed]);
  return (
    <input
      ref={ref}
      className="records-checkbox"
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}
export function RecordsTable() {
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [sort, setSort] = useState<'name' | 'days' | 'strength'>('name');
  const [ascending, setAscending] = useState(true);
  const [inspected, setInspected] = useState<string | null>(null);
  const records = [...sampleRecords].sort(
    (a, b) =>
      (sort === 'name' ? a.name.localeCompare(b.name) : a[sort] - b[sort]) * (ascending ? 1 : -1),
  );
  const changeSort = (key: typeof sort) => {
    if (sort === key) setAscending(!ascending);
    else {
      setSort(key);
      setAscending(true);
    }
  };
  const current = sampleRecords.find((record) => record.id === inspected);
  return (
    <div className="records-demo">
      <div className="records-toolbar">
        <strong>Relationships</strong>
        <span role="status">
          {selected.length ? `${selected.length} selected` : `${records.length} records`}
        </span>
        {selected.length > 0 && (
          <button className="demo-text-button" onClick={() => setSelected([])}>
            Clear selection
          </button>
        )}
      </div>
      <div
        className="records-scroll"
        tabIndex={0}
        role="region"
        aria-label="Company records, scroll horizontally"
      >
        <table className="records-table">
          <caption className="sr-only">Sample company relationships</caption>
          <thead>
            <tr>
              <th>
                <RecordCheckbox
                  label="Select all records"
                  checked={selected.length === records.length}
                  mixed={selected.length > 0 && selected.length < records.length}
                  onChange={(on) => setSelected(on ? records.map((record) => record.id) : [])}
                />
              </th>
              {(
                [
                  ['name', 'Company'],
                  ['tags', 'Categories'],
                  ['days', 'Last interaction'],
                  ['strength', 'Connection'],
                ] as const
              ).map(([key, label]) => (
                <th
                  key={key}
                  scope="col"
                  aria-sort={key === sort ? (ascending ? 'ascending' : 'descending') : undefined}
                >
                  {key === 'tags' ? (
                    label
                  ) : (
                    <button onClick={() => changeSort(key)}>
                      {label}
                      {key === sort ? (
                        ascending ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ChevronDown size={12} />
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} data-selected={selected.includes(record.id)}>
                <td>
                  <RecordCheckbox
                    label={`Select ${record.name}`}
                    checked={selected.includes(record.id)}
                    onChange={(on) =>
                      setSelected((current) =>
                        on ? [...current, record.id] : current.filter((id) => id !== record.id),
                      )
                    }
                  />
                </td>
                <td>
                  <button className="record-name" onClick={() => setInspected(record.id)}>
                    <span className="record-avatar">{record.name[0]}</span>
                    <span>
                      {record.name}
                      <small>{record.city}</small>
                    </span>
                  </button>
                </td>
                <td>
                  <div className="record-tags">
                    {(expanded.includes(record.id) ? record.tags : record.tags.slice(0, 2)).map(
                      (tag) => (
                        <span key={tag}>{tag}</span>
                      ),
                    )}
                    {record.tags.length > 2 && (
                      <button
                        aria-label={`${expanded.includes(record.id) ? 'Hide' : 'Show'} categories for ${record.name}`}
                        onClick={() =>
                          setExpanded((current) =>
                            current.includes(record.id)
                              ? current.filter((id) => id !== record.id)
                              : [...current, record.id],
                          )
                        }
                      >
                        {expanded.includes(record.id) ? 'Less' : `+${record.tags.length - 2}`}
                      </button>
                    )}
                  </div>
                </td>
                <td>{record.days ? `${record.days} days ago` : 'No contact'}</td>
                <td>
                  <span className="record-strength">
                    <span aria-hidden="true">
                      {[1, 2, 3, 4].map((bar) => (
                        <i key={bar} data-lit={record.strength >= bar} />
                      ))}
                    </span>
                    {['No contact', 'Weak', 'Growing', 'Strong', 'Very strong'][record.strength]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="records-footer">
        {current ? (
          <>
            <span>
              <strong>{current.name}</strong> · {current.city} · {current.tags.join(', ')}
            </span>
            <button aria-label="Close record details" onClick={() => setInspected(null)}>
              <X size={16} />
            </button>
          </>
        ) : (
          <span>Select rows, sort a column, or open a record.</span>
        )}
      </div>
    </div>
  );
}
const initialFilterTasks = [
  { id: 1, title: 'Review the homepage', date: 'Oct 02', status: 'To do', owner: 'Alder Studio' },
  {
    id: 2,
    title: 'Build the design tokens',
    date: 'Oct 04',
    status: 'In progress',
    owner: 'Forma Collective',
  },
  {
    id: 3,
    title: 'Prepare the launch notes',
    date: 'Oct 06',
    status: 'To do',
    owner: 'Morrow House',
  },
  {
    id: 4,
    title: 'Test keyboard navigation',
    date: 'Oct 03',
    status: 'In progress',
    owner: 'Common Ground',
  },
  {
    id: 5,
    title: 'Share the first prototype',
    date: 'Oct 01',
    status: 'Completed',
    owner: 'Bloom & Co.',
  },
];
export function FilterTable() {
  const [filter, setFilter] = useState('All');
  const [tasks, setTasks] = useState(initialFilterTasks);
  const [keyboard, setKeyboard] = useState(false);
  const { reduced } = usePlayback();
  const id = useId();
  const statuses = ['To do', 'In progress', 'Completed'];
  const shown = tasks.filter((task) => filter === 'All' || task.status === filter);
  return (
    <div
      className="records-demo filter-table-demo"
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="table-filter-chips" aria-label="Filter tasks by status">
        {['All', ...statuses].map((name) => (
          <button key={name} aria-pressed={filter === name} onClick={() => setFilter(name)}>
            {filter === name && (
              <motion.span
                className="table-filter-active"
                layoutId={`${id}-filter`}
                transition={
                  reduced || keyboard
                    ? { duration: 0 }
                    : { duration: 0.22, ease: [0.23, 1, 0.32, 1] }
                }
              />
            )}
            <span>{name}</span>
            <small>
              {name === 'All' ? tasks.length : tasks.filter((task) => task.status === name).length}
            </small>
          </button>
        ))}
      </div>
      <div
        className="records-scroll"
        tabIndex={0}
        role="region"
        aria-label="Filtered tasks, scroll horizontally"
      >
        <table className="records-table filter-records">
          <caption className="sr-only">Sample tasks</caption>
          <thead>
            <tr>
              <th scope="col">Task</th>
              <th scope="col">Due</th>
              <th scope="col">Status</th>
              <th scope="col">Owner</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((task) => (
              <motion.tr
                key={task.id}
                layout="position"
                initial={reduced || keyboard ? false : { opacity: 0, transform: 'translateY(6px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                transition={{ duration: reduced || keyboard ? 0 : 0.2 }}
              >
                <td>{task.title}</td>
                <td>{task.date}</td>
                <td>
                  <button
                    className="table-status"
                    data-status={task.status}
                    aria-label={`Move ${task.title} to ${statuses[(statuses.indexOf(task.status) + 1) % 3]}`}
                    onClick={() =>
                      setTasks((current) =>
                        current.map((item) =>
                          item.id === task.id
                            ? { ...item, status: statuses[(statuses.indexOf(item.status) + 1) % 3] }
                            : item,
                        ),
                      )
                    }
                  >
                    <span />
                    {task.status}
                    <ChevronDown size={12} />
                  </button>
                </td>
                <td>{task.owner}</td>
              </motion.tr>
            ))}
            {!shown.length && (
              <tr>
                <td colSpan={4} className="table-empty">
                  No tasks in this state.{' '}
                  <button onClick={() => setFilter('All')}>Show all tasks</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="records-footer">
        <span role="status">
          {shown.length} {shown.length === 1 ? 'task' : 'tasks'} shown
        </span>
        <button
          className="demo-text-button"
          onClick={() => {
            setTasks(initialFilterTasks);
            setFilter('All');
          }}
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>
    </div>
  );
}
