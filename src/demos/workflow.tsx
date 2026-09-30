import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
export function ReasoningPanel() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <DemoStack>
      <div className="reasoning-card">
        <button
          className="reasoning-trigger"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          <span className="assistant-avatar">
            <Sparkles size={16} />
          </span>
          <span>
            Three steps, one useful answer.<small>Activity complete · sample log</small>
          </span>
          <ChevronDown size={17} style={{ transform: open ? 'rotate(180deg)' : undefined }} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              id={id}
              className="reasoning-log"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {[
                ['Read the project brief', 'Identified audience and constraints.'],
                ['Compared three directions', 'Reviewed hierarchy, navigation, and tone.'],
                ['Prepared the recommendation', 'A quiet canvas with one warm accent.'],
              ].map(([title, desc]) => (
                <div key={title}>
                  <Check size={14} />
                  <span>
                    {title}
                    <small>{desc}</small>
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="reasoning-answer">Start with less. Give the useful things more room.</div>
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
export function AdaptiveStepper() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('Personal');
  const id = useId();
  return (
    <DemoStack>
      <motion.div layout className="stepper-card" transition={spring}>
        <div className="stepper-progress">
          {[0, 1, 2].map((n) => (
            <span key={n} className={step >= n ? 'active' : ''}>
              {step > n ? <Check size={13} /> : n + 1}
            </span>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <span className="demo-eyebrow">
              {step === 3 ? 'COMPLETE' : `STEP ${step + 1} OF 3`}
            </span>
            <h3>
              {
                [
                  'Give your space a name.',
                  'Room for just you. Or a few.',
                  'Does this feel like you?',
                  'Good things start here.',
                ][step]
              }
            </h3>
            {step === 0 ? (
              <>
                <label htmlFor={id} className="sr-only">
                  Workspace name
                </label>
                <input
                  id={id}
                  className="plain-input"
                  placeholder="e.g. The Sunday Studio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </>
            ) : step === 1 ? (
              <div className="plan-options">
                {['Personal', 'Together'].map((x) => (
                  <button
                    key={x}
                    aria-pressed={plan === x}
                    className={plan === x ? 'active' : ''}
                    onClick={() => setPlan(x)}
                  >
                    {x}
                    {plan === x && <Check size={16} />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="workspace-summary">
                <span className="demo-symbol">
                  <Sparkles size={23} />
                </span>
                <strong>{name}</strong>
                <small>
                  {plan === 'Personal'
                    ? 'A little space for your ideas.'
                    : 'A little space for shared ideas.'}
                </small>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="row stepper-actions">
          {step > 0 && step < 3 ? (
            <button className="demo-text-button" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <span />
          )}
          <button
            className="demo-button primary"
            disabled={step === 0 && !name.trim()}
            onClick={() => {
              if (step === 3) {
                setStep(0);
                setName('');
              } else setStep(step + 1);
            }}
          >
            {['Continue', 'Review', 'Create sample space', 'Start again'][step]}
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </DemoStack>
  );
}
export function ScrollExpand() {
  const [progress, setProgress] = useState(0);
  const { reduced } = usePlayback();
  const scale = reduced ? 1 : 0.58 + progress * 0.42;
  return (
    <div
      className="scroll-expand"
      tabIndex={0}
      aria-label="Scrollable landscape expansion demo"
      onScroll={(e) => setProgress(Math.min(1, e.currentTarget.scrollTop / 240))}
    >
      <div className="scroll-expand-track">
        <div className="scroll-expand-sticky">
          <div
            className="expand-landscape"
            style={{
              transform: `scale(${scale})`,
              borderRadius: reduced ? 0 : 48 * (1 - progress),
            }}
          >
            <span className="landscape-sun" />
            <i className="landscape-hill landscape-far" />
            <i className="landscape-hill landscape-near" />
            <div>
              <h3>
                Let the world
                <br />
                open up.
              </h3>
            </div>
          </div>
          <span className="scroll-instruction">
            {progress > 0.8 ? 'A little more room to breathe.' : 'SCROLL TO EXPLORE ↓'}
          </span>
        </div>
      </div>
    </div>
  );
}
