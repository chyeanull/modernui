import { useEffect, useId, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { animate, motion, useMotionValue } from 'motion/react';
import { Tabs } from '@base-ui/react/tabs';
import { Select } from '@base-ui/react/select';
import { Combobox } from '@base-ui/react/combobox';
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  Plus,
  Search,
  Star,
  Sun,
  X,
} from 'lucide-react';
import { DemoStack, Hint, spring, usePlayback } from './shared';

export function InlineValidation() {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const id = useId();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const error = touched && !valid;
  return (
    <DemoStack>
      <form
        className="demo-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (valid) setSent(true);
        }}
      >
        <h3>Invite a fresh perspective.</h3>
        <label htmlFor={id}>Work email</label>
        <div className={`input-with-icon ${error ? 'invalid' : ''}`}>
          <Mail size={17} />
          <input
            id={id}
            value={value}
            type="email"
            autoComplete="email"
            placeholder="you@studio.com"
            aria-invalid={error}
            aria-describedby={`${id}-hint`}
            onChange={(e) => {
              setValue(e.target.value);
              setSent(false);
            }}
            onBlur={() => setTouched(true)}
          />
          {valid && <Check size={17} className="green" />}
        </div>
        <p
          className={`field-hint ${error ? 'error' : sent ? 'green' : ''}`}
          id={`${id}-hint`}
          role="status"
        >
          {sent
            ? 'Invitation prepared. This is a local demo.'
            : error
              ? value
                ? 'That email needs another look.'
                : 'Enter an email to continue.'
              : valid
                ? 'Looking good. Ready when you are.'
                : 'We’ll only use this to send the invitation.'}
        </p>
        <button className="demo-button primary full" type="submit">
          {sent ? 'Invitation ready' : 'Prepare invitation'}
          <Plus size={15} />
        </button>
      </form>
    </DemoStack>
  );
}
export function PasswordStrength() {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const id = useId();
  const rules = [
    ['At least 10 characters', value.length >= 10],
    ['Upper and lowercase', /[a-z]/.test(value) && /[A-Z]/.test(value)],
    ['A number or symbol', /[\d\W]/.test(value)],
  ] as const;
  const score = rules.filter((x) => x[1]).length;
  return (
    <DemoStack>
      <div className="demo-form">
        <label htmlFor={id}>Make it a strong one.</label>
        <div className="input-with-icon">
          <Lock size={17} />
          <input
            id={id}
            type={show ? 'text' : 'password'}
            value={value}
            autoComplete="new-password"
            placeholder="Create a password"
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <div className={`strength-bars strength-${score}`}>
          {rules.map((_, i) => (
            <i key={i} className={score > i ? 'filled' : ''} />
          ))}
        </div>
        <ul className="password-rules">
          {rules.map(([text, ok]) => (
            <li key={text} className={ok ? 'met' : ''}>
              {ok ? <Check size={13} /> : <span className="rule-dot" />}
              {text}
            </li>
          ))}
        </ul>
        <Hint>Illustrative feedback, not a security score.</Hint>
      </div>
    </DemoStack>
  );
}
export function OtpInput() {
  const [value, setValue] = useState('');
  const id = useId();
  return (
    <DemoStack>
      <span className="demo-symbol">
        <Mail size={25} />
      </span>
      <h3>Check your inbox.</h3>
      <label htmlFor={id} className="demo-hint">
        Enter your six-digit verification code.
      </label>
      <div className="otp-control">
        <div className="otp-slots" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className={value.length === i ? 'current' : ''}>
              {value[i] || '·'}
            </span>
          ))}
        </div>
        <input
          id={id}
          aria-label="Six-digit verification code"
          value={value}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
      </div>
      <Hint>
        <span role="status">
          {value.length === 6
            ? 'Code complete. Demo validation passed.'
            : 'Type or paste · any six digits work in this demo'}
        </span>
      </Hint>
    </DemoStack>
  );
}
export function TagInput() {
  const [tags, setTags] = useState(['Design', 'Curiosity']);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const id = useId();
  const add = () => {
    const tag = value.trim().replace(/,$/, '');
    if (!tag) return;
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setMessage('That tag is already here.');
      return;
    }
    setTags([...tags, tag]);
    setValue('');
    setMessage(`${tag} added`);
  };
  return (
    <DemoStack>
      <div className="demo-form">
        <label htmlFor={id}>What are you into?</label>
        <div className="tag-field">
          {tags.map((tag) => (
            <motion.span layout className="input-tag" key={tag} transition={spring}>
              {tag}
              <button
                aria-label={`Remove ${tag}`}
                onClick={() => {
                  setTags(tags.filter((t) => t !== tag));
                  setMessage(`${tag} removed`);
                }}
              >
                <X size={12} />
              </button>
            </motion.span>
          ))}
          <input
            id={id}
            value={value}
            placeholder="Add an interest…"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (['Enter', ','].includes(e.key)) {
                e.preventDefault();
                add();
              }
              if (e.key === 'Backspace' && !value) setTags(tags.slice(0, -1));
            }}
          />
        </div>
        <div className="row tag-actions">
          <span className="demo-hint" role="status">
            {message || 'Press Enter to add a tag.'}
          </span>
          <button className="demo-text-button" onClick={add}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
    </DemoStack>
  );
}
export function ElasticSlider() {
  const [value, setValue] = useState(64);
  const id = useId();
  return (
    <DemoStack>
      <div className="elastic-control">
        <div className="row">
          <label htmlFor={id}>A little more brightness.</label>
          <Sun size={20} />
        </div>
        <div className="slider-track">
          <motion.div
            className="value-bubble"
            layout="position"
            transition={spring}
            style={{ left: `calc(${value}% - ${value * 0.3}px)` }}
          >
            <output htmlFor={id}>{value}%</output>
          </motion.div>
          <input
            id={id}
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            style={{ '--range-value': `${value}%` } as React.CSSProperties}
          />
        </div>
        <div className="row muted">
          <Moon size={15} />
          <Sun size={19} />
        </div>
      </div>
      <Hint>Find your own kind of bright.</Hint>
    </DemoStack>
  );
}
export function ColorPicker() {
  const [index, setIndex] = useState(0);
  const colors = [
    ['Terracotta', '#e96a46'],
    ['Sage', '#768e77'],
    ['Periwinkle', '#858dc5'],
    ['Ochre', '#b48d46'],
  ];
  return (
    <DemoStack>
      <div
        className="color-object"
        style={{ '--object-color': colors[index][1] } as React.CSSProperties}
      >
        <span />
        <i />
        <b />
      </div>
      <div className="color-swatches" aria-label="Object color">
        {colors.map(([name, color], i) => (
          <button
            key={name}
            className={i === index ? 'active' : ''}
            style={{ background: color }}
            aria-label={name}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            {i === index && <Check size={17} />}
          </button>
        ))}
      </div>
      <Hint>
        {colors[index][0]} · {colors[index][1]}
      </Hint>
    </DemoStack>
  );
}
export function StarRating() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const labels = [
    'How did that feel?',
    'Not quite there.',
    'Room to grow.',
    'A good start.',
    'That feels good.',
    'A little bit exceptional.',
  ];
  return (
    <DemoStack>
      <span className="rating-face" aria-hidden="true">
        {rating === 5 ? '✺' : rating >= 3 ? '✧' : '✳'}
      </span>
      <h3>{labels[rating]}</h3>
      <div className="star-rating" onPointerLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            aria-label={`Rate ${n} out of 5`}
            aria-pressed={rating === n}
            className={n <= (hover || rating) ? 'selected' : ''}
            onClick={() => setRating(n)}
            onPointerEnter={() => setHover(n)}
          >
            <Star size={29} fill={n <= (hover || rating) ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
      <Hint>
        <span role="status">
          {rating
            ? `${rating} out of 5. Thanks for the perspective.`
            : 'A small moment for honest feedback.'}
        </span>
      </Hint>
    </DemoStack>
  );
}
export function SegmentedToggle() {
  const [on, setOn] = useState(true);
  return (
    <DemoStack>
      <div className="toggle-card">
        <span className={`availability-icon ${on ? 'on' : ''}`}>
          {on ? <Sun size={25} /> : <Moon size={25} />}
        </span>
        <div>
          <h3>{on ? 'Open to good things.' : 'A little focus time.'}</h3>
          <p>{on ? 'Available for a conversation' : 'Let the ideas find their way'}</p>
        </div>
        <button
          role="switch"
          aria-checked={on}
          aria-label="Available for conversations"
          className={`physical-switch ${on ? 'on' : ''}`}
          onClick={() => setOn(!on)}
        >
          <motion.span
            animate={{ transform: `translateX(${on ? 24 : 0}px)` }}
            transition={spring}
          />
        </button>
      </div>
      <Hint>{on ? 'Available' : 'Focus mode'} · make a little space for yourself</Hint>
    </DemoStack>
  );
}

export function MotionTabs() {
  const [value, setValue] = useState('Overview');
  const [variant, setVariant] = useState('Pill');
  const [keyboard, setKeyboard] = useState(false);
  const { reduced } = usePlayback();
  const options = ['Overview', 'Activity', 'Settings'];
  return (
    <DemoStack>
      <div className="small-segments" aria-label="Tab treatment">
        {['Pill', 'Segment', 'Underline'].map((name) => (
          <button
            key={name}
            className={variant === name ? 'active' : ''}
            aria-pressed={variant === name}
            onClick={() => setVariant(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <Tabs.Root
        value={value}
        onValueChange={setValue}
        className="control-tabs"
        data-variant={variant.toLowerCase()}
      >
        <Tabs.List
          activateOnFocus
          className="control-tab-list"
          aria-label="Workspace views"
          onKeyDown={() => setKeyboard(true)}
          onPointerDown={() => setKeyboard(false)}
        >
          <span
            className="control-tab-indicator"
            data-instant={keyboard || reduced || undefined}
            style={{ transform: `translateX(${options.indexOf(value) * 100}%)` }}
          />
          {options.map((name) => (
            <Tabs.Tab className="control-tab" key={name} value={name}>
              {name}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <div className="control-tab-panels">
          {options.map((name, i) => (
            <Tabs.Panel className="control-tab-panel" key={name} value={name}>
              <strong>
                {
                  [
                    'Your workspace, at a glance.',
                    'A record of the work.',
                    'Make this space yours.',
                  ][i]
                }
              </strong>
              <p>
                {
                  [
                    'Three projects ready for your next idea.',
                    'Your latest edits and shared updates live here.',
                    'Personalize your preferences and notifications.',
                  ][i]
                }
              </p>
            </Tabs.Panel>
          ))}
        </div>
      </Tabs.Root>
    </DemoStack>
  );
}

export function MotionInput() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('a-little-secret');
  const [query, setQuery] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const id = useId();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const error = touched && !!email && !valid;
  const { reduced } = usePlayback();
  const emailField = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!error || reduced) return;
    const feedback = emailField.current?.animate(
      [0, -4, 4, -2, 2, 0].map((offset) => ({ transform: `translateX(${offset}px)` })),
      { duration: 240, easing: 'linear' },
    );
    return () => feedback?.cancel();
  }, [error, reduced]);
  return (
    <div className="control-fields" data-instant={reduced || undefined}>
      <label htmlFor={`${id}-email`}>Email</label>
      <div ref={emailField} className="control-input-shell" data-error={error} data-success={valid}>
        <Mail size={17} />
        <input
          id={`${id}-email`}
          type="email"
          placeholder="you@studio.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={error}
          aria-describedby={`${id}-message`}
        />
        <svg
          className="control-success"
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ opacity: valid ? 1 : 0 }}
        >
          <path
            d="m5 12 4 4 10-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={valid ? 0 : 1}
          />
        </svg>
      </div>
      <p className="control-field-message" id={`${id}-message`} role="status">
        {error ? 'Enter a complete email address.' : valid ? 'Looks good.' : 'Use your work email.'}
      </p>
      <label htmlFor={`${id}-password`}>Password</label>
      <div className="control-input-shell">
        <Lock size={17} />
        <input
          id={`${id}-password`}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
        />
        <button
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      <label htmlFor={`${id}-search`}>Search</label>
      <div className="control-input-shell">
        <Search size={17} />
        <input
          id={`${id}-search`}
          placeholder="Search your workspace"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <button aria-label="Clear search" onClick={() => setQuery('')}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function useTouchPopup() {
  const [open, setOpen] = useState(false);
  const contact = useRef<{ x: number; y: number } | null>(null);
  return {
    open,
    setOpen,
    touchProps: {
      onTouchStart(event: TouchEvent<HTMLButtonElement>) {
        const touch = event.touches[0];
        contact.current =
          event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
      },
      onTouchMove(event: TouchEvent<HTMLButtonElement>) {
        const touch = event.touches[0];
        if (
          contact.current &&
          Math.hypot(touch.clientX - contact.current.x, touch.clientY - contact.current.y) > 8
        )
          contact.current = null;
      },
      onTouchCancel() {
        contact.current = null;
      },
      onTouchEnd(event: TouchEvent<HTMLButtonElement>) {
        if (!contact.current) return;
        contact.current = null;
        // A drag can suppress compatibility mouse events on the next tap.
        // Handle the completed touch and avoid a second synthesized activation.
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        setOpen((value) => !value);
      },
    },
  };
}

export function MotionSelect() {
  const { open, setOpen, touchProps } = useTouchPopup();
  const [value, setValue] = useState('Next.js');
  const [keyboard, setKeyboard] = useState(false);
  const { reduced } = usePlayback();
  const id = useId();
  const items = ['Next.js', 'Remix', 'Astro', 'Vite'];
  return (
    <DemoStack>
      <div
        className="control-fields"
        onKeyDownCapture={() => setKeyboard(true)}
        onPointerDownCapture={() => setKeyboard(false)}
      >
        <label id={id}>Framework</label>
        <Select.Root
          open={open}
          onOpenChange={setOpen}
          items={items.map((item) => ({ value: item, label: item }))}
          value={value}
          onValueChange={(next) => next && setValue(next)}
        >
          <Select.Trigger {...touchProps} className="control-select-trigger" aria-labelledby={id}>
            <Select.Value />
            <Select.Icon>
              <ChevronDown size={16} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner
              className="control-positioner"
              sideOffset={8}
              alignItemWithTrigger={false}
              positionMethod="fixed"
            >
              <Select.Popup
                className="control-popup"
                data-instant={keyboard || reduced || undefined}
              >
                <Select.List>
                  {items.map((item) => (
                    <Select.Item className="control-option" key={item} value={item}>
                      <Select.ItemText>{item}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check size={16} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
        <Hint>{value} selected</Hint>
      </div>
    </DemoStack>
  );
}

export function MotionCombobox() {
  const { open, setOpen, touchProps } = useTouchPopup();
  const [value, setValue] = useState<string | null>(null);
  const [keyboard, setKeyboard] = useState(false);
  const { reduced } = usePlayback();
  const id = useId();
  const cities = [
    'Amsterdam',
    'Berlin',
    'Copenhagen',
    'Kyoto',
    'Lisbon',
    'Melbourne',
    'Oslo',
    'Stockholm',
  ];
  return (
    <DemoStack>
      <div
        className="control-fields"
        onKeyDownCapture={() => setKeyboard(true)}
        onPointerDownCapture={() => setKeyboard(false)}
      >
        <label htmlFor={id}>Next destination</label>
        <Combobox.Root
          open={open}
          onOpenChange={setOpen}
          items={cities}
          value={value}
          onValueChange={setValue}
          autoHighlight
        >
          <Combobox.InputGroup className="control-input-shell">
            <Search size={17} />
            <Combobox.Input id={id} placeholder="Search a city…" />
            <Combobox.Clear aria-label="Clear destination">
              <X size={15} />
            </Combobox.Clear>
            <Combobox.Trigger {...touchProps} aria-label="Show destinations">
              <ChevronDown size={16} />
            </Combobox.Trigger>
          </Combobox.InputGroup>
          <Combobox.Portal>
            <Combobox.Positioner
              className="control-positioner"
              sideOffset={8}
              positionMethod="fixed"
            >
              <Combobox.Popup
                className="control-popup"
                data-instant={keyboard || reduced || undefined}
              >
                <Combobox.Empty className="control-empty">No destinations found.</Combobox.Empty>
                <Combobox.List>
                  {(city: string) => (
                    <Combobox.Item className="control-option" key={city} value={city}>
                      {city}
                      <Combobox.ItemIndicator>
                        <Check size={16} />
                      </Combobox.ItemIndicator>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
        <Hint>{value ? `Next stop: ${value}.` : 'Type to find your next stop.'}</Hint>
      </div>
    </DemoStack>
  );
}

function ControlCheckbox({
  label,
  checked,
  mixed = false,
  disabled = false,
  onChange,
}: {
  label: string;
  checked: boolean;
  mixed?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (input.current) input.current.indeterminate = mixed;
  }, [mixed]);
  return (
    <label className="control-check-row" data-disabled={disabled || undefined}>
      <span className="control-check-box">
        <input
          ref={input}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="control-check-surface">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d={mixed ? 'M5 12h14' : 'm5 12 4 4 10-10'}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={checked || mixed ? 0 : 1}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      <span>{label}</span>
    </label>
  );
}
export function MotionCheckbox() {
  const [chosen, setChosen] = useState(['Project updates']);
  const { reduced } = usePlayback();
  const options = ['Project updates', 'Comments & mentions', 'Weekly summary'];
  return (
    <DemoStack>
      <fieldset className="control-choice-group" data-instant={reduced || undefined}>
        <legend>Notifications</legend>
        <ControlCheckbox
          label="All notifications"
          checked={chosen.length === options.length}
          mixed={chosen.length > 0 && chosen.length < options.length}
          onChange={(on) => setChosen(on ? options : [])}
        />
        <div className="control-choice-divider" />
        {options.map((name) => (
          <ControlCheckbox
            key={name}
            label={name}
            checked={chosen.includes(name)}
            onChange={(on) =>
              setChosen((current) =>
                on ? [...current, name] : current.filter((item) => item !== name),
              )
            }
          />
        ))}
        <ControlCheckbox label="Security alerts (required)" checked disabled onChange={() => {}} />
      </fieldset>
      <Hint>{chosen.length} optional notifications enabled</Hint>
    </DemoStack>
  );
}
export function MotionRadioGroup() {
  const [value, setValue] = useState('Pro');
  const [keyboard, setKeyboard] = useState(false);
  const id = useId();
  const { reduced } = usePlayback();
  return (
    <DemoStack>
      <fieldset
        className="control-choice-group"
        onKeyDown={() => setKeyboard(true)}
        onPointerDown={() => setKeyboard(false)}
      >
        <legend>Choose your plan</legend>
        {['Starter', 'Pro', 'Team', 'Legacy'].map((name, index) => (
          <label
            className="control-radio-row"
            key={name}
            data-disabled={name === 'Legacy' || undefined}
          >
            <input
              type="radio"
              name={id}
              value={name}
              checked={value === name}
              disabled={name === 'Legacy'}
              onChange={() => setValue(name)}
            />
            <span className="control-radio-ring">
              {value === name && (
                <motion.span
                  className="control-radio-dot"
                  layoutId={`${id}-dot`}
                  transition={
                    reduced || keyboard
                      ? { duration: 0 }
                      : { type: 'spring', duration: 0.25, bounce: 0 }
                  }
                />
              )}
            </span>
            <span>{name}</span>
            <small>{['Free', '$12 / month', '$29 / month', 'Unavailable'][index]}</small>
          </label>
        ))}
      </fieldset>
      <Hint>{value} plan selected</Hint>
    </DemoStack>
  );
}
export function MotionMultiSelect() {
  const { open, setOpen, touchProps } = useTouchPopup();
  const [value, setValue] = useState(['Design', 'Engineering']);
  const [keyboard, setKeyboard] = useState(false);
  const { reduced } = usePlayback();
  const id = useId();
  const teams = ['Design', 'Engineering', 'Product', 'Research', 'Marketing', 'Operations'];
  return (
    <DemoStack>
      <div
        className="control-fields"
        onKeyDownCapture={() => setKeyboard(true)}
        onPointerDownCapture={() => setKeyboard(false)}
      >
        <label htmlFor={id}>Invite teams</label>
        <Combobox.Root
          open={open}
          onOpenChange={setOpen}
          multiple
          items={teams}
          value={value}
          onValueChange={setValue}
        >
          <Combobox.InputGroup className="control-multi-field">
            <Combobox.Chips className="control-chips">
              <Combobox.Value>
                {(selected: string[]) =>
                  selected.map((team) => (
                    <Combobox.Chip className="control-chip" key={team}>
                      <span>{team}</span>
                      <Combobox.ChipRemove aria-label={`Remove ${team}`}>
                        <X size={12} />
                      </Combobox.ChipRemove>
                    </Combobox.Chip>
                  ))
                }
              </Combobox.Value>
              <Combobox.Input id={id} placeholder="Add a team…" />
            </Combobox.Chips>
            <Combobox.Trigger {...touchProps} aria-label="Show teams">
              <ChevronDown size={16} />
            </Combobox.Trigger>
          </Combobox.InputGroup>
          <Combobox.Portal>
            <Combobox.Positioner
              className="control-positioner"
              positionMethod="fixed"
              sideOffset={8}
            >
              <Combobox.Popup
                className="control-popup"
                data-instant={keyboard || reduced || undefined}
              >
                <Combobox.Empty className="control-empty">No matching teams.</Combobox.Empty>
                <Combobox.List>
                  {(team: string) => (
                    <Combobox.Item key={team} className="control-option" value={team}>
                      {team}
                      <Combobox.ItemIndicator>
                        <Check size={16} />
                      </Combobox.ItemIndicator>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
        <Hint>{value.length ? `${value.length} teams invited` : 'Choose one or more teams.'}</Hint>
      </div>
    </DemoStack>
  );
}

function cometArc(from: number, to: number) {
  const point = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return [100 + Math.cos(radians) * 80, 100 + Math.sin(radians) * 80];
  };
  const start = point(from),
    end = point(to);
  return `M ${start[0]} ${start[1]} A 80 80 0 ${to - from > 180 ? 1 : 0} 1 ${end[0]} ${end[1]}`;
}
export function CometDial() {
  const reading = useMotionValue(62);
  const ring = useRef<SVGSVGElement>(null);
  const lit = useRef<SVGPathElement>(null);
  const head = useRef<SVGCircleElement>(null);
  const tails = useRef<(SVGPathElement | null)[]>([]);
  const figure = useRef<HTMLSpanElement>(null);
  const wake = useRef(() => {});
  const paintNow = useRef(() => {});
  const grip = useRef<{
    id: number;
    start: number;
    last: number;
    target: number | null;
    samples: { time: number; value: number }[];
  } | null>(null);
  const { reduced } = usePlayback();
  const clamp = (next: number) => Math.max(0, Math.min(100, next));
  useEffect(() => {
    let frame = 0;
    let lastTime = performance.now();
    let previous = reading.get();
    let velocity = 0;
    let painting = false;
    const paint = (now: number, instant = false) => {
      painting = true;
      const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      const target = grip.current?.target;
      // Keep pointer coordinates continuous; round only the visible number.
      // The reference's 60 ms follower smooths sparse mouse/touch samples.
      if (target != null) {
        if (reduced || instant) reading.jump(target);
        else reading.set(reading.get() + (target - reading.get()) * (1 - Math.exp(-dt / 0.06)));
      }
      const value = clamp(reading.get());
      const rawVelocity = dt > 0 ? (value - previous) / dt : 0;
      previous = value;
      velocity =
        reduced || instant ? 0 : velocity + (rawVelocity - velocity) * (1 - Math.exp(-dt / 0.05));
      const strength = Math.min(1, Math.abs(velocity) / 250);
      const direction = Math.sign(velocity) || 1;
      const angle = 110 + value * 3.2;
      const radians = (angle * Math.PI) / 180;
      lit.current?.setAttribute('d', value > 0.001 ? cometArc(110, angle) : '');
      head.current?.setAttribute('cx', String(100 + Math.cos(radians) * 80));
      head.current?.setAttribute('cy', String(100 + Math.sin(radians) * 80));
      tails.current.forEach((tail, index) => {
        if (!tail) return;
        const segment = (130 * strength) / 12;
        const from = Math.max(
          110,
          Math.min(430, direction > 0 ? angle - (index + 1) * segment : angle + index * segment),
        );
        const to = Math.max(
          110,
          Math.min(430, direction > 0 ? angle - index * segment : angle + (index + 1) * segment),
        );
        if (strength < 0.001 || to - from < 0.001) {
          tail.style.opacity = '0';
          return;
        }
        tail.setAttribute('d', cometArc(from, to));
        tail.setAttribute('stroke-width', String(4 + (12 - index) * strength));
        tail.style.opacity = String((1 - index / 12) * strength * 0.7);
      });
      const shown = String(Math.round(value));
      if (figure.current && figure.current.textContent !== shown)
        figure.current.textContent = shown;
      ring.current?.setAttribute('aria-valuenow', shown);
      ring.current?.setAttribute('aria-valuetext', `${shown} percent`);
      painting = false;
    };
    const tick = (now: number) => {
      paint(now);
      frame =
        grip.current || reading.isAnimating() || Math.abs(velocity) > 0.01
          ? requestAnimationFrame(tick)
          : 0;
    };
    wake.current = () => {
      if (frame || painting) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };
    paintNow.current = () => paint(performance.now(), true);
    const unsubscribe = reading.on('change', () => wake.current());
    paintNow.current();
    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
      reading.stop();
      wake.current = () => {};
      paintNow.current = () => {};
    };
  }, [reading, reduced]);
  const settle = (next: number, instant = false) => {
    reading.stop();
    if (reduced || instant) {
      reading.jump(clamp(next));
      paintNow.current();
    } else animate(reading, clamp(next), spring);
    wake.current();
  };
  const angleValue = (element: SVGSVGElement, x: number, y: number) => {
    const rect = element.getBoundingClientRect();
    const dx = (x - rect.left) / rect.width - 0.5,
      dy = (y - rect.top) / rect.height - 0.5;
    if (Math.hypot(dx, dy) < 0.23) return null;
    let angle = ((Math.atan2(dy, dx) * 180) / Math.PI - 110 + 720) % 360;
    if (angle > 320)
      angle = grip.current ? (grip.current.last > 50 ? 320 : 0) : angle < 340 ? 320 : 0;
    return (angle / 320) * 100;
  };
  const angle = 110 + 62 * 3.2;
  const radians = (angle * Math.PI) / 180;
  const stop = (element: SVGSVGElement, pointerId: number, cancelled: boolean) => {
    const current = grip.current;
    if (!current || current.id !== pointerId) return;
    grip.current = null;
    const first = current.samples[0];
    const last = current.samples[current.samples.length - 1];
    const velocity =
      performance.now() - last.time > 90
        ? 0
        : Math.max(
            -250,
            Math.min(
              250,
              ((last.value - first.value) / Math.max(1, last.time - first.time)) * 1000,
            ),
          );
    settle(
      cancelled ? current.start : Math.round(current.last + (reduced ? 0 : velocity * 0.08)),
      cancelled,
    );
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
  };
  return (
    <DemoStack>
      <div className="comet-control">
        <svg
          ref={ring}
          viewBox="0 0 200 200"
          className="comet-control-ring"
          role="slider"
          tabIndex={0}
          aria-label="Intensity"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={62}
          aria-valuetext="62 percent"
          onPointerDown={(event) => {
            if (event.button !== 0 || grip.current) return;
            const next = angleValue(event.currentTarget, event.clientX, event.clientY);
            if (next === null) return;
            event.preventDefault();
            grip.current = {
              id: event.pointerId,
              start: reading.get(),
              last: next,
              target: null,
              samples: [{ time: performance.now(), value: next }],
            };
            event.currentTarget.focus({ preventScroll: true });
            event.currentTarget.setPointerCapture(event.pointerId);
            settle(next);
          }}
          onPointerMove={(event) => {
            const current = grip.current;
            if (!current || current.id !== event.pointerId) return;
            const next = angleValue(event.currentTarget, event.clientX, event.clientY);
            if (next === null) return;
            const now = performance.now();
            current.samples.push({ time: now, value: next });
            while (current.samples.length > 2 && current.samples[0].time < now - 80)
              current.samples.shift();
            current.last = next;
            current.target = next;
            reading.stop();
            wake.current();
          }}
          onPointerUp={(event) => stop(event.currentTarget, event.pointerId, false)}
          onPointerCancel={(event) => stop(event.currentTarget, event.pointerId, true)}
          onLostPointerCapture={(event) => stop(event.currentTarget, event.pointerId, true)}
          onKeyDown={(event) => {
            const increment = event.shiftKey ? 10 : 1;
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? 100
                  : ['ArrowRight', 'ArrowUp', 'PageUp'].includes(event.key)
                    ? Math.round(reading.get()) + (event.key === 'PageUp' ? 10 : increment)
                    : ['ArrowLeft', 'ArrowDown', 'PageDown'].includes(event.key)
                      ? Math.round(reading.get()) - (event.key === 'PageDown' ? 10 : increment)
                      : null;
            if (next !== null) {
              event.preventDefault();
              grip.current = null;
              settle(next, true);
            }
          }}
        >
          <path d={cometArc(110, 430)} className="comet-track" />
          <path ref={lit} d={cometArc(110, angle)} className="comet-lit" />
          {Array.from({ length: 12 }, (_, index) => (
            <path
              key={index}
              ref={(element) => {
                tails.current[index] = element;
              }}
              className="comet-tail"
              style={{ opacity: 0 }}
            />
          ))}
          <circle
            ref={head}
            cx={100 + Math.cos(radians) * 80}
            cy={100 + Math.sin(radians) * 80}
            r="4"
            className="comet-head"
          />
        </svg>
        <div className="comet-reading" aria-hidden="true">
          <strong>
            <span ref={figure}>62</span>
            <small>%</small>
          </strong>
          <span>Intensity</span>
        </div>
      </div>
      <Hint>Drag the arc · flick to coast · arrow keys to fine-tune</Hint>
    </DemoStack>
  );
}
