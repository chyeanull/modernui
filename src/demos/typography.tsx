import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { ArrowRight, Minus, Pause, Play, Plus, Shuffle } from 'lucide-react';
import { DemoStack, Hint, Replay, usePlayback, useTicker } from './shared';

export function RollingNumbers() {
  const [value, setValue] = useState(1284);
  const { reduced } = usePlayback();
  return (
    <DemoStack>
      <div className="rolling-number">
        <NumberFlow
          value={value}
          animated={!reduced}
          locales="en-US"
          transformTiming={{ duration: 450, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
        />
      </div>
      <div className="number-controls">
        <button aria-label="Subtract 100" onClick={() => setValue((v) => Math.max(0, v - 100))}>
          <Minus size={17} />
        </button>
        <button onClick={() => setValue(Math.floor(Math.random() * 9000) + 1000)}>
          <Shuffle size={14} />
          Shuffle
        </button>
        <button aria-label="Add 100" onClick={() => setValue((v) => v + 100)}>
          <Plus size={17} />
        </button>
      </div>
    </DemoStack>
  );
}
export function SplitText() {
  const [key, setKey] = useState(0);
  const { reduced } = usePlayback();
  const words = ['Make', 'every', 'little', 'detail', 'count.'];
  return (
    <DemoStack>
      <h3 className="display-type split-type" aria-label={words.join(' ')} key={key}>
        {words.map((word, i) => (
          <span className="word-mask" key={word} aria-hidden="true">
            <motion.span
              initial={{ opacity: 0, transform: reduced ? 'none' : 'translateY(100%)' }}
              animate={{ opacity: 1, transform: 'translateY(0%)' }}
              transition={{
                duration: 0.5,
                delay: reduced ? 0 : i * 0.06,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              {word}&nbsp;
            </motion.span>
          </span>
        ))}
      </h3>
      <Replay onClick={() => setKey(key + 1)} />
    </DemoStack>
  );
}
export function BlurReveal() {
  const [key, setKey] = useState(0);
  const { reduced } = usePlayback();
  return (
    <DemoStack>
      <h3
        className="display-type blur-type"
        aria-label="Clarity comes with a little patience."
        key={key}
      >
        {['Clarity comes', 'with a little', 'patience.'].map((line, i) => (
          <motion.span
            key={line}
            aria-hidden="true"
            initial={{ opacity: 0, filter: reduced ? 'blur(0px)' : 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.15 }}
          >
            {line}
          </motion.span>
        ))}
      </h3>
      <Replay onClick={() => setKey(key + 1)} />
    </DemoStack>
  );
}
export function ScrambleText() {
  const target = 'STAY CURIOUS.';
  const [frame, setFrame] = useState(0);
  const { reduced } = usePlayback();
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  useTicker(() => setFrame((f) => f + 1), frame < target.length + 8 && !reduced ? 50 : null);
  const text = reduced
    ? target
    : target
        .split('')
        .map((c, i) =>
          c === ' ' || frame > i + 3 ? c : letters[(frame * 7 + i * 11) % letters.length],
        )
        .join('');
  return (
    <DemoStack>
      <h3 className="scramble-type" aria-label={target}>
        <span aria-hidden="true">{text}</span>
      </h3>
      <Replay onClick={() => setFrame(0)} />
    </DemoStack>
  );
}
export function WordLoop() {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(true);
  const { reduced } = usePlayback();
  const words = ['thoughtful.', 'useful.', 'memorable.'];
  useTicker(() => setIndex((i) => (i + 1) % 3), running && !reduced ? 2400 : null);
  return (
    <DemoStack>
      <h3 className="display-type loop-type">
        Make it
        <br />
        <span className="word-loop">
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ opacity: 0, transform: reduced ? 'none' : 'translateY(16px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              exit={{ opacity: 0, transform: reduced ? 'none' : 'translateY(-16px)' }}
              transition={{ duration: 0.22 }}
            >
              {words[index]}
            </motion.span>
          </AnimatePresence>
        </span>
      </h3>
      <div className="row">
        <button className="demo-text-button" onClick={() => setRunning(!running)}>
          {running ? <Pause size={13} /> : <Play size={13} />} {running ? 'Pause' : 'Play'}
        </button>
        <button className="demo-text-button" onClick={() => setIndex((index + 1) % 3)}>
          Next word <ArrowRight size={13} />
        </button>
      </div>
    </DemoStack>
  );
}
export function Typewriter() {
  const sentence = 'The next great idea begins with a little curiosity.';
  const [count, setCount] = useState(0);
  const [playing, setPlaying] = useState(true);
  const { reduced } = usePlayback();
  useTicker(
    () => setCount((c) => Math.min(sentence.length, c + 1)),
    playing && count < sentence.length && !reduced ? 65 : null,
  );
  const shown = reduced ? sentence : sentence.slice(0, count);
  return (
    <DemoStack>
      <div className="typewriter-box">
        <p aria-hidden="true">
          {shown}
          <span className="text-caret" />
        </p>
        <span className="sr-only" role="status">
          {count === sentence.length || reduced ? sentence : 'Writing a sample sentence.'}
        </span>
      </div>
      <div className="row">
        <button
          className="demo-text-button"
          onClick={() => {
            if (count === sentence.length) {
              setCount(0);
              setPlaying(true);
            } else setPlaying(!playing);
          }}
        >
          {count === sentence.length ? 'Replay' : playing ? 'Pause' : 'Continue'}
        </button>
        <button className="demo-text-button" onClick={() => setCount(sentence.length)}>
          Show full text <ArrowRight size={13} />
        </button>
      </div>
    </DemoStack>
  );
}
export function InfiniteMarquee() {
  const [paused, setPaused] = useState(false);
  const names = ['FORME', 'ordinary®', 'Studio North', '↗ ongoing', 'fieldwork'];
  return (
    <DemoStack className="marquee-demo">
      <div className="marquee-viewport">
        <div
          className="marquee-track"
          style={{ animationPlayState: paused ? 'paused' : undefined }}
        >
          {[0, 1].map((copy) => (
            <div className="marquee-group" key={copy} aria-hidden={copy === 1}>
              {names.map((n, i) => (
                <span
                  key={n}
                  style={{
                    fontFamily: i % 2 ? 'Georgia, serif' : undefined,
                    fontStyle: i % 2 ? 'italic' : undefined,
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button className="demo-text-button" onClick={() => setPaused(!paused)}>
        {paused ? <Play size={13} /> : <Pause size={13} />} {paused ? 'Resume' : 'Pause'}
      </button>
    </DemoStack>
  );
}
export function GradientType() {
  const [palette, setPalette] = useState('Sunset');
  return (
    <DemoStack>
      <h3 className={`display-type gradient-type gradient-${palette.toLowerCase()}`}>
        A brighter
        <br />
        point of view.
      </h3>
      <div className="small-segments">
        {['Sunset', 'Ocean', 'Forest'].map((p) => (
          <button
            key={p}
            aria-pressed={palette === p}
            className={palette === p ? 'active' : ''}
            onClick={() => setPalette(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </DemoStack>
  );
}
