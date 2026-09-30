import { useId, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Eye, EyeOff, Lock, Mail, Moon, Plus, Star, Sun, X } from 'lucide-react';
import { DemoStack, Hint, spring } from './shared';

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
