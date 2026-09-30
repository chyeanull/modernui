import { forwardRef, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, usePresenceData } from 'motion/react';
import { Dialog } from '@base-ui/react/dialog';
import { ContextMenu } from '@base-ui/react/context-menu';
import { Menu } from '@base-ui/react/menu';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  Ellipsis,
  Fingerprint,
  Folder,
  Globe,
  Layers,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { DemoStack, Hint, spring, usePlayback } from './shared';

const MorphingModalView = forwardRef<HTMLDivElement, { children: ReactNode }>(
  function MorphingModalView({ children }, ref) {
    const present = useIsPresent();
    const instant = usePresenceData() as boolean;
    return (
      <motion.div
        ref={ref}
        className="morph-dialog-view"
        inert={!present}
        aria-hidden={!present || undefined}
        initial={
          instant ? false : { opacity: 0, transform: 'translateY(8px)', filter: 'blur(4px)' }
        }
        animate={{ opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' }}
        exit={{
          opacity: 0,
          transform: instant ? 'none' : 'translateY(-8px)',
          filter: instant ? 'none' : 'blur(4px)',
          transition: { duration: instant ? 0 : 0.16 },
        }}
        transition={{ duration: instant ? 0 : 0.24, ease: [0.23, 1, 0.32, 1] }}
      >
        {children}
      </motion.div>
    );
  },
);

export function MorphingModal() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('main');
  const [keyboard, setKeyboard] = useState(false);
  const { reduced } = usePlayback();
  const instant = keyboard || reduced;
  const closeRef = useRef<HTMLButtonElement>(null);
  return (
    <DemoStack>
      <div className="modal-mini" aria-hidden="true">
        <span className="mini-handle" />
        <div className="row">
          <span className="mini-icon">
            <Layers size={19} />
          </span>
          <span>
            Make room for ideas.<small>A surface that moves with you.</small>
          </span>
        </div>
      </div>
      <Dialog.Root
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (v) setView('main');
        }}
      >
        <Dialog.Trigger
          className="demo-button"
          onPointerDown={() => setKeyboard(false)}
          onKeyDown={() => setKeyboard(true)}
        >
          <Layers size={16} /> Open a little possibility
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Viewport
            className="morph-dialog-viewport"
            data-instant={instant || undefined}
            onPointerDownCapture={() => setKeyboard(false)}
            onKeyDownCapture={() => setKeyboard(true)}
          >
            <Dialog.Popup
              className="dialog-popup morph-dialog"
              aria-label={view === 'main' ? 'Your creative space' : view}
              render={
                <motion.div
                  layout={!instant}
                  style={{ borderRadius: 23 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 420, damping: 40, mass: 0.5 },
                  }}
                />
              }
            >
              <motion.div layout={instant ? false : 'position'} className="morph-dialog-frame">
                <Dialog.Close ref={closeRef} className="dialog-close" aria-label="Close panel">
                  <X size={18} />
                </Dialog.Close>
                <div className="morph-dialog-content">
                  <AnimatePresence mode="popLayout" initial={false} custom={instant}>
                    <MorphingModalView key={view}>
                      {view === 'main' ? (
                        <>
                          <span className="dialog-symbol">
                            <Layers size={25} />
                          </span>
                          <Dialog.Title>Your creative space</Dialog.Title>
                          <Dialog.Description>
                            A few things that make this space yours.
                          </Dialog.Description>
                          <div className="dialog-options">
                            {(
                              [
                                ['Personalize', 'A place with your name on it', Sparkles],
                                ['Privacy', 'Your ideas, in good hands', ShieldCheck],
                                ['Members', 'Better, together', Globe],
                              ] as const
                            ).map(([title, desc, Icon]) => (
                              <button
                                key={title}
                                onClick={() => {
                                  setView(title);
                                  closeRef.current?.focus();
                                }}
                              >
                                <Icon size={19} />
                                <span>
                                  {title}
                                  <small>{desc}</small>
                                </span>
                                <ChevronRight size={17} />
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <button
                            className="demo-text-button"
                            onClick={() => {
                              setView('main');
                              closeRef.current?.focus();
                            }}
                          >
                            <ArrowLeft size={15} /> Go back
                          </button>
                          <Dialog.Title>{view}</Dialog.Title>
                          <Dialog.Description>
                            {view === 'Personalize'
                              ? 'Set the tone for your next great idea.'
                              : view === 'Privacy'
                                ? 'A little peace of mind for your creative work.'
                                : 'Good work is better with good people.'}
                          </Dialog.Description>
                          {view === 'Personalize' ? (
                            <div className="modal-colors">
                              {['#e96a46', '#90a697', '#899dcc', '#caae75'].map((color) => (
                                <button
                                  aria-label={`Choose ${color}`}
                                  style={{ background: color }}
                                  key={color}
                                  onClick={(e) => {
                                    e.currentTarget.parentElement
                                      ?.querySelectorAll('button')
                                      .forEach((x) => (x.textContent = ''));
                                    e.currentTarget.textContent = '✓';
                                  }}
                                />
                              ))}
                            </div>
                          ) : view === 'Privacy' ? (
                            <div className="privacy-row">
                              <Lock size={18} />
                              <span>Only invited members can view your work.</span>
                              <Check size={18} />
                            </div>
                          ) : (
                            <div className="member-list">
                              {[
                                'You · Owner',
                                'Maya Chen · Designer',
                                'Alex Rivera · Developer',
                              ].map((x) => (
                                <div key={x}>
                                  <span className="notification-avatar">{x[0]}</span>
                                  {x}
                                </div>
                              ))}
                            </div>
                          )}
                          <Dialog.Close className="demo-button primary full">
                            All done <Check size={15} />
                          </Dialog.Close>
                        </>
                      )}
                    </MorphingModalView>
                  </AnimatePresence>
                </div>
              </motion.div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </DemoStack>
  );
}
export function BottomSheet() {
  const [format, setFormat] = useState('PNG');
  const [result, setResult] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <DemoStack>
      <div className="sheet-icon">
        <Download size={30} />
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className="demo-button">
          Export your work <ArrowUpRight size={16} />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Popup className="bottom-sheet">
            <span className="sheet-handle" />
            <Dialog.Close className="dialog-close" aria-label="Close export sheet">
              <X size={18} />
            </Dialog.Close>
            <Dialog.Title>A good idea, ready to go.</Dialog.Title>
            <Dialog.Description>Choose a format for this sample export.</Dialog.Description>
            <div className="format-options">
              {['PNG', 'SVG', 'PDF'].map((x) => (
                <button
                  key={x}
                  className={format === x ? 'active' : ''}
                  aria-pressed={format === x}
                  onClick={() => setFormat(x)}
                >
                  <FileFormat label={x} />
                  {x}
                  {format === x && <Check size={15} />}
                </button>
              ))}
            </div>
            <button
              className="demo-button primary full"
              onClick={() => {
                setResult(`${format} selected. Sample export complete.`);
                setOpen(false);
              }}
            >
              Export as {format}
              <Download size={16} />
            </button>
            <small className="demo-hint">Interaction study · no document is generated</small>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Hint>
        <span role="status">{result || 'The next step, grounded in place.'}</span>
      </Hint>
    </DemoStack>
  );
  function FileFormat({ label }: { label: string }) {
    return <span className="file-format">{label.slice(0, 1)}</span>;
  }
}
export function CardStack() {
  const [index, setIndex] = useState(0);
  const items = [
    ['01', 'Make room', 'for good ideas.'],
    ['02', 'Stay curious.', 'Go a little further.'],
    ['03', 'Small details.', 'Big difference.'],
  ];
  return (
    <DemoStack>
      <div className="physical-stack">
        {items.map((_, i) => {
          const item = items[(index + i) % items.length];
          return (
            <motion.div
              key={item[0]}
              className={`stack-card stack-tone-${Number(item[0])}`}
              animate={{
                transform: `translateY(${i * 10}px) rotate(${i * 4}deg) scale(${1 - i * 0.055})`,
                opacity: 1 - i * 0.15,
              }}
              transition={spring}
              style={{ zIndex: 3 - i }}
            >
              <h3>
                {item[1]}
                <br />
                {item[2]}
              </h3>
              <ArrowUpRight size={25} />
            </motion.div>
          );
        })}
      </div>
      <div className="row">
        <button
          className="demo-icon-button"
          aria-label="Previous card"
          onClick={() => setIndex((index + 2) % 3)}
        >
          <ArrowLeft size={16} />
        </button>
        <small>{index + 1} / 3</small>
        <button
          className="demo-icon-button"
          aria-label="Next card"
          onClick={() => setIndex((index + 1) % 3)}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </DemoStack>
  );
}
export function TiltCard() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { reduced } = usePlayback();
  return (
    <DemoStack>
      <div
        className="tilt-scene"
        onPointerMove={(e) => {
          if (reduced || e.pointerType !== 'mouse') return;
          const r = e.currentTarget.getBoundingClientRect();
          setTilt({
            x: (e.clientX - r.left - r.width / 2) / 25,
            y: -(e.clientY - r.top - r.height / 2) / 20,
          });
        }}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <motion.div
          className="membership-card"
          animate={{ transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
          transition={spring}
        >
          <div className="row">
            <span>FORME</span>
            <Sparkles size={20} />
          </div>
          <div className="card-orbits" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="row card-bottom">
            <span>
              Curiosity has its privileges.<small>MEMBER NO. 0084</small>
            </span>
            <ArrowUpRight size={20} />
          </div>
        </motion.div>
      </div>
      <Hint>A different perspective, wherever you look.</Hint>
    </DemoStack>
  );
}
export function SpotlightCard() {
  const card = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState(false);
  return (
    <DemoStack>
      <button
        ref={card}
        className="spotlight-card"
        onClick={() => setSelected(!selected)}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--px', `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty('--py', `${e.clientY - r.top}px`);
        }}
      >
        <span className="spotlight-glow" />
        <span className="spotlight-content">
          <Sparkles size={27} />
          <h3>{selected ? 'You found it.' : 'Follow your curiosity.'}</h3>
          <p>
            {selected
              ? 'The next good idea starts with a little exploration.'
              : 'There’s always something worth a closer look.'}
          </p>
          <span className="row">
            {selected ? 'Keep exploring' : 'Take a look'} <ArrowUpRight size={15} />
          </span>
        </span>
      </button>
    </DemoStack>
  );
}
export function FlipCard() {
  const [flipped, setFlipped] = useState(false);
  const { reduced } = usePlayback();
  return (
    <DemoStack>
      <button
        className="flip-scene"
        aria-label={flipped ? 'Show front of card' : 'Reveal the other side'}
        aria-pressed={flipped}
        onClick={() => setFlipped(!flipped)}
      >
        <motion.span
          className="flip-inner"
          animate={{ transform: reduced ? 'none' : `rotateY(${flipped ? 180 : 0}deg)` }}
          transition={{ duration: reduced ? 0 : 0.5, ease: [0.77, 0, 0.175, 1] }}
        >
          {reduced ? (
            <span className="flip-front">
              <h3>
                {flipped ? 'Details make the difference.' : 'There’s another side to every idea.'}
              </h3>
              <ArrowUpRight size={23} />
            </span>
          ) : (
            <>
              <span className="flip-front" aria-hidden={flipped}>
                <h3>
                  There’s another side
                  <br />
                  to every idea.
                </h3>
                <ArrowUpRight size={23} />
              </span>
              <span className="flip-back" aria-hidden={!flipped}>
                <Star size={25} />
                <h3>
                  Details make
                  <br />
                  the difference.
                </h3>
              </span>
            </>
          )}
        </motion.span>
      </button>
      <Hint>Tap to see the other side.</Hint>
    </DemoStack>
  );
}
export function ExpandingCard() {
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const { reduced } = usePlayback();
  const id = useId();
  return (
    <DemoStack>
      <div
        className="expanding-note"
        data-open={open || undefined}
        data-instant={keyboard || reduced || undefined}
      >
        <div className="note-art">
          <span />
          <i />
          <b />
        </div>
        <div className="note-body">
          <h3>A little space to think.</h3>
          <div id={id} className="note-reveal" inert={!open} aria-hidden={!open}>
            <div className="note-reveal-inner">
              <p>
                The best ideas often arrive in the quiet moments. A walk without a destination. A
                page without a brief. An interface that gives you room to breathe.
              </p>
            </div>
          </div>
          <button
            aria-expanded={open}
            aria-controls={id}
            aria-label={open ? 'Close the note' : 'Read the field note'}
            className="demo-text-button"
            onClick={(event) => {
              setKeyboard(event.detail === 0);
              setOpen((value) => !value);
            }}
          >
            <span className="note-toggle-label" aria-hidden="true">
              <span className="note-label-read">Read the field note</span>
              <span className="note-label-close">Close the note</span>
            </span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </DemoStack>
  );
}
export function ContextMenuDemo() {
  const [result, setResult] = useState('A place for your next idea.');
  const menu = (
    <>
      {[
        ['Duplicate', Copy],
        ['Move to folder', Folder],
        ['Add to favorites', Star],
      ].map(([label, Icon]) => {
        const ItemIcon = Icon as typeof Copy;
        return (
          <Menu.Item
            className="context-item"
            key={String(label)}
            onClick={() => setResult(`${label} selected`)}
          >
            <ItemIcon size={16} />
            {String(label)}
          </Menu.Item>
        );
      })}
    </>
  );
  return (
    <DemoStack>
      <ContextMenu.Root>
        <ContextMenu.Trigger className="context-canvas">
          <Layers size={32} />
          <h3>Your canvas</h3>
          <p>{result}</p>
          <span>Right-click anywhere here</span>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner>
            <ContextMenu.Popup className="context-popup">{menu}</ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <Menu.Root>
        <Menu.Trigger className="demo-button">
          <Ellipsis size={17} /> Canvas actions
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={8}>
            <Menu.Popup className="context-popup">{menu}</Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </DemoStack>
  );
}
