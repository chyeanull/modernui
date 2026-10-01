import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  Code,
  File,
  Globe,
  Image,
  LoaderCircle,
  ListTodo,
  Pause,
  Paperclip,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Upload,
  X,
} from 'lucide-react';
import { DemoStack, Hint, Replay, spring, usePlayback, useTicker } from './shared';

export function AgentTodoList() {
  const tasks = [
    'Review the project structure',
    'Build the new component',
    'Check keyboard interactions',
    'Prepare the finished preview',
  ];
  const ticksPerTask = 8;
  const total = tasks.length * ticksPerTask;
  const [{ tick, open }, setRun] = useState({ tick: 0, open: true });
  const [running, setRunning] = useState(true);
  const [keyboard, setKeyboard] = useState(false);
  const { reduced, paused } = usePlayback();
  const id = useId();
  const completed = Math.floor(tick / ticksPerTask);
  const finished = tick === total;
  useTicker(
    () =>
      setRun((current) => {
        const next = Math.min(current.tick + 1, total);
        return { tick: next, open: next === total ? false : current.open };
      }),
    running && !finished ? 280 : null,
  );
  return (
    <div className="agent-todo-demo" data-reduced={reduced || undefined}>
      <section className="agent-todo-card" aria-label="Agent task plan" data-complete={finished}>
        <button
          id={`${id}-trigger`}
          className="agent-todo-header"
          aria-expanded={open}
          aria-controls={`${id}-tasks`}
          onPointerDown={() => setKeyboard(false)}
          onKeyDown={() => setKeyboard(true)}
          onClick={() => setRun((current) => ({ ...current, open: !current.open }))}
        >
          <span className="agent-todo-heading-icon" aria-hidden="true">
            <ListTodo size={19} style={{ opacity: finished ? 0 : 1 }} />
            <span className="agent-todo-success" style={{ opacity: finished ? 1 : 0 }}>
              <Check size={14} />
            </span>
          </span>
          <span className="agent-todo-title">Implementation plan</span>
          <span className="sr-only">
            {completed} of {tasks.length} tasks completed
          </span>
          <span className="agent-todo-count" aria-hidden="true">
            <NumberFlow value={completed} animated={!reduced} />/{tasks.length}
          </span>
          <ChevronDown
            size={15}
            className="agent-todo-chevron"
            aria-hidden="true"
            style={{
              transform: `rotate(${open ? 180 : 0}deg)`,
              transitionDuration: reduced || keyboard ? '0s' : undefined,
            }}
          />
        </button>
        <div
          id={`${id}-tasks`}
          role="region"
          aria-labelledby={`${id}-trigger`}
          aria-hidden={!open}
          inert={!open}
          className="agent-todo-disclosure"
          data-open={open}
          style={{ transitionDuration: reduced || keyboard ? '0s' : undefined }}
        >
          <div className="agent-todo-clip">
            <ol className="agent-todo-list">
              {tasks.map((title, index) => {
                const status =
                  index < completed ? 'complete' : index === completed ? 'running' : 'pending';
                const progress =
                  status === 'running'
                    ? Math.round((((tick % ticksPerTask) + 1) / ticksPerTask) * 100)
                    : 0;
                return (
                  <li key={title} className="agent-todo-row" data-status={status}>
                    <svg className="agent-todo-mark" viewBox="0 0 24 24" aria-hidden="true">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeDasharray={status === 'pending' ? '2 3' : undefined}
                        opacity={status === 'running' ? 0.2 : 0.65}
                      />
                      <circle
                        className="agent-todo-progress"
                        cx="12"
                        cy="12"
                        r="9"
                        pathLength="100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="100"
                        strokeDashoffset={100 - progress}
                        opacity={status === 'running' ? 1 : 0}
                        transform="rotate(-90 12 12)"
                      />
                      <path
                        className="agent-todo-check"
                        d="m7.5 12 3 3 6-6"
                        pathLength="1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="1"
                        strokeDashoffset={status === 'complete' ? 0 : 1}
                        opacity={status === 'complete' ? 1 : 0}
                      />
                    </svg>
                    <span className="sr-only">
                      {status === 'complete'
                        ? 'Completed'
                        : status === 'running'
                          ? 'In progress'
                          : 'Pending'}
                      :{' '}
                    </span>
                    <span className="agent-todo-task">
                      <span>{title}</span>
                    </span>
                    {status === 'running' && (
                      <span className="agent-todo-percent">{progress}%</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>
      <div className="agent-todo-controls">
        <span className="agent-todo-caption">
          {finished
            ? 'All tasks complete'
            : paused || !running
              ? 'Sample run paused'
              : 'Sample agent run'}
        </span>
        {!finished && (
          <button
            className="demo-text-button"
            disabled={paused}
            onClick={() => setRunning((value) => !value)}
          >
            {running ? <Pause size={13} /> : <Play size={13} />}
            {running ? 'Pause' : 'Resume'}
          </button>
        )}
        <Replay
          onClick={() => {
            setRun({ tick: 0, open: true });
            setRunning(true);
            setKeyboard(false);
          }}
        />
      </div>
      <span className="sr-only" role="status">
        {completed} of {tasks.length} tasks completed{finished ? '. Plan finished.' : '.'}
      </span>
    </div>
  );
}

export function PromptComposer() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');
  const id = useId();
  return (
    <DemoStack>
      <div className="composer-demo">
        <Sparkles size={26} />
        <h3>Where shall we begin?</h3>
        <form
          className="prompt-composer"
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) {
              setResult(value.trim());
              setValue('');
            }
          }}
        >
          <label htmlFor={id} className="sr-only">
            Describe your idea
          </label>
          <textarea
            id={id}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="A small idea. A big possibility…"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="row">
            <span>
              <Sparkles size={13} /> Creative mode
            </span>
            <button type="submit" disabled={!value.trim()} aria-label="Submit sample prompt">
              <ArrowUp size={18} />
            </button>
          </div>
        </form>
        <div className="suggestion-chips">
          {['Explore an idea', 'Plan a project', 'Find inspiration'].map((x) => (
            <button key={x} onClick={() => setValue(x)}>
              {x}
            </button>
          ))}
        </div>
        <p className="composer-result" role="status">
          {result ? `Brief captured: “${result}”` : 'Local playground · no model connected'}
        </p>
      </div>
    </DemoStack>
  );
}
export function StreamingResponse() {
  const text =
    'The best interfaces make complex things feel simple. Start with a clear hierarchy, give every action a useful response, and leave enough room for the content to breathe. Then polish the transitions between those moments.';
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const { reduced } = usePlayback();
  useTicker(
    () =>
      setCount((c) => {
        const next = Math.min(text.length, c + 3);
        if (next === text.length) setRunning(false);
        return next;
      }),
    running ? 32 : null,
  );
  return (
    <DemoStack>
      <div className="stream-card">
        <div className="row">
          <span className="assistant-avatar">
            <Sparkles size={16} />
          </span>
          <strong>A little perspective</strong>
          <small>Sample response</small>
        </div>
        <div className="stream-text" aria-hidden="true">
          {count ? (
            text.slice(0, count)
          ) : (
            <span className="muted">A considered answer is worth a little patience.</span>
          )}
          {running && <span className="text-caret" />}
        </div>
        <span className="sr-only" role="status">
          {count === text.length
            ? text
            : running
              ? 'Generating sample response.'
              : 'Ready to generate a sample response.'}
        </span>
        <div className="row">
          <span className="sample-label">SIMULATED · NO API</span>
          <button
            className="demo-text-button"
            onClick={() => {
              if (running) setRunning(false);
              else {
                setCount(reduced ? text.length : 0);
                setRunning(!reduced);
              }
            }}
          >
            {running ? (
              <>
                <Square size={12} /> Stop
              </>
            ) : (
              <>
                <Play size={12} />
                {count ? 'Replay' : 'Generate'}
              </>
            )}
          </button>
        </div>
      </div>
    </DemoStack>
  );
}
export function ToolCalls() {
  const [step, setStep] = useState(-1);
  const tasks = [
    ['Search the references', Search],
    ['Compare the patterns', Globe],
    ['Prepare the collection', Code],
  ] as const;
  useTicker(() => setStep((s) => s + 1), step >= 0 && step < 3 ? 1100 : null);
  return (
    <DemoStack>
      <div className="tools-card">
        <div className="row">
          <span className="sample-label">SIMULATED</span>
        </div>
        {tasks.map(([name, Icon], i) => (
          <div className={`tool-row ${step === i ? 'running' : ''}`} key={name}>
            <span className="tool-status">
              {step > i ? (
                <Check size={15} />
              ) : step === i ? (
                <LoaderCircle size={15} className="spin" />
              ) : (
                <Icon size={15} />
              )}
            </span>
            <span>{name}</span>
            <small>{step > i ? 'Complete' : step === i ? 'Working' : 'Queued'}</small>
          </div>
        ))}
        <button
          className="demo-button full"
          disabled={step >= 0 && step < 3}
          onClick={() => setStep(0)}
        >
          {step === 3 ? (
            <>
              <Check size={15} /> Run again
            </>
          ) : (
            <>
              <Play size={15} /> Run the workflow
            </>
          )}
        </button>
        <span className="sr-only" role="status">
          {step === 3
            ? 'All three sample tasks completed.'
            : step >= 0
              ? `${tasks[step]?.[0]} in progress`
              : 'Ready to run.'}
        </span>
      </div>
    </DemoStack>
  );
}
export function ApprovalCard() {
  const [state, setState] = useState('pending');
  return (
    <DemoStack>
      <motion.div layout className="approval-card" transition={spring}>
        <span className="approval-icon">
          <ShieldCheck size={25} />
        </span>
        <h3>
          {state === 'pending'
            ? 'Ready for the next step?'
            : state === 'approved'
              ? 'A little progress, approved.'
              : 'No changes. All good.'}
        </h3>
        <p>
          {state === 'pending'
            ? 'I’ve prepared a clearer structure for your collection. Take a look before we apply it.'
            : state === 'approved'
              ? 'The sample collection is now organized.'
              : 'The sample collection stays as it was.'}
        </p>
        {state === 'pending' ? (
          <>
            <div className="approval-diff">
              <span>12 ungrouped items</span>
              <ArrowDown size={14} />
              <strong>3 thoughtful collections</strong>
            </div>
            <div className="row">
              <button className="demo-button" onClick={() => setState('declined')}>
                Keep as is
              </button>
              <button className="demo-button primary" onClick={() => setState('approved')}>
                <Check size={15} /> Looks good
              </button>
            </div>
          </>
        ) : (
          <Replay onClick={() => setState('pending')} />
        )}
        <small className="demo-hint">Local example · no external changes</small>
      </motion.div>
    </DemoStack>
  );
}
export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const select = (f?: File) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setError('Please choose a file smaller than 10 MB.');
      return;
    }
    setFile(f);
    setProgress(0);
    setError('');
  };
  useTicker(() => setProgress((p) => Math.min(100, p + 10)), file && progress < 100 ? 160 : null);
  return (
    <DemoStack>
      <div
        className={`dropzone ${drag ? 'dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          select(e.dataTransfer.files[0]);
        }}
      >
        {file ? (
          <>
            <span className="demo-symbol">
              {progress === 100 ? <Check size={28} /> : <File size={28} />}
            </span>
            <h3 className="upload-filename">{file.name}</h3>
            <p>
              {(file.size / 1024).toFixed(1)} KB ·{' '}
              {progress === 100 ? 'Ready to use' : `Preparing ${progress}%`}
            </p>
            <div
              className="upload-progress"
              role="progressbar"
              aria-label="Local file preparation"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
            <button
              className="demo-text-button"
              onClick={() => {
                setFile(null);
                setProgress(0);
                if (input.current) input.current.value = '';
              }}
            >
              Choose another file
            </button>
          </>
        ) : (
          <>
            <span className="demo-symbol">
              <Upload size={27} />
            </span>
            <h3>Drop something good here.</h3>
            <p>Or choose a file from your computer.</p>
            <button className="demo-button" onClick={() => input.current?.click()}>
              Browse files <ArrowUp size={15} />
            </button>
          </>
        )}
        <input
          className="sr-only"
          ref={input}
          type="file"
          tabIndex={-1}
          aria-label="Choose a local file"
          onChange={(e) => select(e.target.files?.[0])}
        />
      </div>
      <Hint>
        <span role="status">{error || 'Up to 10 MB · files stay in your browser'}</span>
      </Hint>
    </DemoStack>
  );
}
export function Stepper() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('Personal');
  const [keyboard, setKeyboard] = useState(false);
  const { reduced } = usePlayback();
  const id = useId();
  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };
  return (
    <DemoStack>
      <div
        className="rb-stepper"
        data-instant={reduced || keyboard || undefined}
        onKeyDownCapture={() => setKeyboard(true)}
        onPointerDownCapture={() => setKeyboard(false)}
      >
        <ol className="rb-stepper-indicators" aria-label="Setup progress">
          {['Welcome', 'Workspace', 'Plan', 'Review'].map((label, index) => (
            <li key={label}>
              <button
                aria-label={`Go to step ${index + 1}: ${label}`}
                aria-current={step === index ? 'step' : undefined}
                disabled={index > 1 && !name.trim()}
                data-state={step > index ? 'complete' : step === index ? 'active' : 'pending'}
                onClick={() => go(index)}
              >
                {step > index ? <Check size={16} /> : step === index ? <span /> : index + 1}
              </button>
              {index < 3 && (
                <span className="rb-stepper-connector">
                  <i style={{ transform: `scaleX(${step > index ? 1 : 0})` }} />
                </span>
              )}
            </li>
          ))}
        </ol>
        <div className="rb-stepper-stage">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={step}
              className="rb-stepper-content"
              custom={direction}
              variants={{
                enter: (dir: number) => ({ opacity: 0, transform: `translateX(${dir * 32}px)` }),
                shown: { opacity: 1, transform: 'translateX(0px)' },
                leave: (dir: number) => ({ opacity: 0, transform: `translateX(${-dir * 24}px)` }),
              }}
              initial="enter"
              animate="shown"
              exit="leave"
              transition={{ duration: reduced || keyboard ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              <h3>
                {
                  [
                    'A new space for your ideas.',
                    'What should we call it?',
                    'Choose how you work.',
                    'Ready to make it yours?',
                    'Your workspace is ready.',
                  ][step]
                }
              </h3>
              {step === 0 ? (
                <>
                  <p>Set up a sample workspace in a few small steps.</p>
                  <div className="rb-stepper-welcome">
                    <Sparkles size={35} />
                    <span>Make something worth sharing.</span>
                  </div>
                </>
              ) : step === 1 ? (
                <>
                  <p>You can change this later.</p>
                  <label htmlFor={id}>Workspace name</label>
                  <input
                    id={id}
                    className="plain-input"
                    value={name}
                    placeholder="The Sunday Studio"
                    onChange={(event) => setName(event.target.value)}
                  />
                </>
              ) : step === 2 ? (
                <>
                  <p>A little room for you, or for the whole team.</p>
                  <div className="plan-options">
                    {['Personal', 'Together'].map((option) => (
                      <button
                        key={option}
                        className={plan === option ? 'active' : ''}
                        aria-pressed={plan === option}
                        onClick={() => setPlan(option)}
                      >
                        {option}
                        {plan === option && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p>
                    {step === 4
                      ? 'This local demo has completed its setup.'
                      : 'Review your choices before completing setup.'}
                  </p>
                  <div className="rb-stepper-summary">
                    <strong>{name || 'Your workspace'}</strong>
                    <span>{plan} workspace</span>
                    {step === 4 && <Check size={22} />}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="rb-stepper-footer">
          {step > 0 && step < 4 ? (
            <button className="demo-text-button" onClick={() => go(step - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            className="demo-button primary"
            disabled={step === 1 && !name.trim()}
            onClick={() => (step === 4 ? (setName(''), setPlan('Personal'), go(0)) : go(step + 1))}
          >
            {step === 4 ? 'Start again' : step === 3 ? 'Complete' : 'Continue'}
            <ArrowRight size={14} />
          </button>
        </div>
        <span className="sr-only" role="status">
          {step === 4 ? 'Setup complete' : `Step ${step + 1} of 4`}
        </span>
      </div>
    </DemoStack>
  );
}

export function LatticeLoader() {
  const [pattern, setPattern] = useState('Orbit');
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working');
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const { reduced, paused, speed } = usePlayback();
  useTicker(() => setElapsed((time) => time + 1), status === 'working' && playing ? 100 : null);
  const grid = pattern === 'Orbit' ? 3 : 4;
  const cells = Array.from({ length: grid * grid }, (_, index) => {
    const x = index % grid,
      y = Math.floor(index / grid);
    return pattern === 'Orbit'
      ? [0, 1, 2, 7, -1, 3, 6, 5, 4][index]
      : pattern === 'Sweep'
        ? x + y
        : Math.max(Math.abs(x - 1.5), Math.abs(y - 1.5));
  });
  const marks =
    status === 'error'
      ? grid === 3
        ? [0, 2, 4, 6, 8]
        : [0, 3, 5, 6, 9, 10, 12, 15]
      : grid === 3
        ? [2, 3, 5, 7]
        : [7, 8, 10, 13];
  const restart = () => {
    setElapsed(0);
    setStatus('working');
    setPlaying(true);
  };
  return (
    <DemoStack>
      <div className="lattice-demo" data-state={status}>
        <div
          className="lattice-matrix"
          aria-hidden="true"
          style={{ gridTemplateColumns: `repeat(${grid}, 7px)` }}
        >
          {cells.map((phase, index) => (
            <span
              key={`${pattern}-${index}`}
              className="lattice-cell"
              data-on={marks.includes(index)}
              data-hole={phase < 0}
              style={{
                animationDelay: `${(-phase * 0.12) / speed}s`,
                animationDuration: `${(pattern === 'Orbit' ? 1.2 : 1.05) / speed}s`,
                animationPlayState:
                  playing && !paused && !reduced && status === 'working' ? 'running' : 'paused',
                animationName: reduced || status !== 'working' || phase < 0 ? 'none' : undefined,
              }}
            />
          ))}
        </div>
        <strong>
          {status === 'working'
            ? playing && !paused
              ? 'Thinking'
              : 'Paused'
            : status === 'done'
              ? 'Done in'
              : 'Failed after'}
        </strong>
        <span className="lattice-timer" aria-hidden="true">
          {(elapsed / 10).toFixed(1)}s
        </span>
        <span role="status" className="sr-only">
          {status === 'working'
            ? 'Sample agent task in progress'
            : status === 'done'
              ? 'Sample agent task completed'
              : 'Sample agent task failed'}
        </span>
      </div>
      <div className="small-segments" aria-label="Lattice pattern">
        {['Orbit', 'Sweep', 'Pulse'].map((name) => (
          <button
            key={name}
            className={pattern === name ? 'active' : ''}
            aria-pressed={pattern === name}
            onClick={() => setPattern(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="lattice-actions">
        {status === 'working' ? (
          <>
            <button className="demo-text-button" onClick={() => setPlaying(!playing)}>
              {playing ? 'Pause' : 'Resume'}
            </button>
            <button className="demo-button" onClick={() => setStatus('done')}>
              <Check size={14} />
              Complete
            </button>
            <button className="demo-text-button" onClick={() => setStatus('error')}>
              Fail
            </button>
          </>
        ) : (
          <Replay onClick={restart} />
        )}
      </div>
      <Hint>Simulated agent activity</Hint>
    </DemoStack>
  );
}
