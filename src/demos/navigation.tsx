import { useId, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Dialog } from '@base-ui/react/dialog';
import { Command } from 'cmdk';
import {
  ArrowUpRight,
  Asterisk,
  Bookmark,
  BookOpen,
  Compass,
  Layers,
  MousePointer2,
  Orbit,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Command as CommandIcon,
  File,
  Folder,
  Home,
  Image,
  Mail,
  Music,
  Plus,
  Search,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { DemoStack, Hint, spring, usePlayback } from './shared';
import { SidebarNav } from '../components/SidebarNav';

export function SlidingSidebar() {
  const [active, setActive] = useState('Sliding tabs');
  const [expanded, setExpanded] = useState(['Navigation']);
  const id = useId();
  const groups = [
    {
      name: 'Navigation',
      icon: Compass,
      items: ['Magnetic dock', 'Sliding tabs', 'Sliding sidebar'],
    },
    { name: 'Microinteractions', icon: MousePointer2, items: ['Like burst', 'Progress ring'] },
    { name: 'Cards & overlays', icon: Layers, items: ['Morphing modal', 'Expanding card'] },
    { name: 'Visual effects', icon: Orbit, items: ['Shader mesh', 'Border beam'] },
  ];
  const link = (name: string) => ({
    href: `#${id}-${name.toLowerCase().replace(/\W+/g, '-')}`,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setActive(name);
    },
    'aria-current': active === name ? ('page' as const) : undefined,
  });
  return (
    <DemoStack>
      <div className="sidebar-study">
        <div className="sidebar-study-brand">
          <span>
            <Asterisk size={23} />
          </span>
          <strong>
            modern<span>ui</span>.
          </strong>
        </div>
        <SidebarNav label="Example sidebar">
          <a
            {...link('Your collection')}
            className={`nav-item ${active === 'Your collection' ? 'active' : ''}`}
          >
            <Bookmark size={16} />
            <span>Your collection</span>
            <span className="nav-count">3</span>
          </a>
          <div className="nav-label">THE PATTERNS</div>
          {groups.map(({ name, icon: Icon, items }, index) => {
            const open = expanded.includes(name);
            const selected = active === name || (!open && items.includes(active));
            return (
              <div className="nav-category" key={name}>
                <div className={`nav-category-row ${selected ? 'active' : ''}`}>
                  <a {...link(name)}>
                    <Icon size={16} />
                    <span>{name}</span>
                  </a>
                  <button
                    aria-label={`${open ? 'Collapse' : 'Expand'} ${name}`}
                    aria-expanded={open}
                    aria-controls={`${id}-group-${index}`}
                    onClick={() =>
                      setExpanded((current) =>
                        open ? current.filter((item) => item !== name) : [...current, name],
                      )
                    }
                  >
                    <ChevronRight
                      size={13}
                      style={{ transform: open ? 'rotate(90deg)' : undefined }}
                    />
                  </button>
                </div>
                <div id={`${id}-group-${index}`} hidden={!open}>
                  {open && (
                    <div className="nav-children">
                      {items.map((name) => (
                        <a key={name} {...link(name)} className={active === name ? 'active' : ''}>
                          {name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className="nav-label notebook-label">THE NOTEBOOK</div>
          <a
            {...link('Design foundations')}
            className={`nav-item ${active === 'Design foundations' ? 'active' : ''}`}
          >
            <Settings size={16} />
            <span>Design foundations</span>
          </a>
          <a
            {...link('Research & sources')}
            className={`nav-item ${active === 'Research & sources' ? 'active' : ''}`}
          >
            <BookOpen size={16} />
            <span>Research & sources</span>
            <ArrowUpRight size={13} />
          </a>
        </SidebarNav>
        <div className="sidebar-study-status" role="status">
          {active}
        </div>
      </div>
      <Hint>Hover to explore · click to select</Hint>
    </DemoStack>
  );
}

export function MagneticDock() {
  const [active, setActive] = useState('Home');
  const [hover, setHover] = useState(-10);
  const { reduced } = usePlayback();
  const items = [
    ['Home', Home],
    ['Files', Folder],
    ['Music', Music],
    ['Photos', Image],
    ['Settings', Settings],
  ] as const;
  return (
    <DemoStack>
      <div className="dock" onPointerLeave={() => setHover(-10)}>
        {items.map(([name, Icon], i) => (
          <button
            key={name}
            className={`dock-item dock-${i}`}
            aria-label={name}
            aria-pressed={active === name}
            onClick={() => setActive(name)}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') setHover(i);
            }}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(-10)}
          >
            <motion.span
              animate={{
                transform: reduced
                  ? 'none'
                  : `translateY(${Math.abs(i - hover) < 2 ? -8 : 0}px) scale(${i === hover ? 1.3 : Math.abs(i - hover) === 1 ? 1.12 : 1})`,
              }}
              transition={spring}
            >
              <Icon size={24} />
            </motion.span>
            <span className="dock-tooltip">{name}</span>
            <i className={active === name ? 'selected' : ''} />
          </button>
        ))}
      </div>
      <Hint>{active} selected · hover to explore</Hint>
    </DemoStack>
  );
}
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState('Your next action, one search away.');
  const items = [
    ['Create a project', Plus],
    ['Find a document', File],
    ['Open calendar', Calendar],
    ['Notification settings', Bell],
  ] as const;
  return (
    <DemoStack>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className="demo-button">
          <CommandIcon size={16} /> Open command menu <kbd>↵</kbd>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Popup className="command-popup">
            <Dialog.Title className="sr-only">Workspace commands</Dialog.Title>
            <Dialog.Description className="sr-only">
              Search and select a sample command.
            </Dialog.Description>
            <Command>
              <div className="command-input">
                <Search size={19} />
                <Command.Input placeholder="What would you like to do?" autoFocus />
                <Dialog.Close aria-label="Close command menu">
                  <kbd>esc</kbd>
                </Dialog.Close>
              </div>
              <Command.List>
                <Command.Empty>No commands found.</Command.Empty>
                <Command.Group heading="SUGGESTED ACTIONS">
                  {items.map(([label, Icon]) => (
                    <Command.Item
                      key={label}
                      onSelect={() => {
                        setResult(`${label} selected`);
                        setOpen(false);
                      }}
                    >
                      <Icon size={17} />
                      {label}
                      <ArrowUpRight size={14} />
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
              <div className="command-footer">
                ↑ ↓ to navigate <span>↵ to select</span>
              </div>
            </Command>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Hint>
        <span role="status">{result}</span>
      </Hint>
    </DemoStack>
  );
}
export function RadialMenu() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('Something worth making.');
  const actions = [
    ['Document', File],
    ['Image', Image],
    ['Event', Calendar],
    ['Idea', Sparkles],
  ] as const;
  return (
    <DemoStack>
      <div className="bloom">
        <AnimatePresence>
          {open &&
            actions.map(([label, Icon], i) => {
              const angle = ((-160 + i * 47) * Math.PI) / 180;
              return (
                <motion.button
                  key={label}
                  className="bloom-option"
                  initial={{ opacity: 0, transform: 'translate(0px, 0px) scale(.95)' }}
                  animate={{
                    opacity: 1,
                    transform: `translate(${Math.cos(angle) * 95}px, ${Math.sin(angle) * 95}px) scale(1)`,
                  }}
                  exit={{ opacity: 0, transform: 'translate(0px, 0px) scale(.95)' }}
                  transition={spring}
                  aria-label={`Create ${label}`}
                  onClick={() => {
                    setSelected(`${label} created`);
                    setOpen(false);
                  }}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </motion.button>
              );
            })}
        </AnimatePresence>
        <button
          className="bloom-trigger"
          aria-expanded={open}
          aria-label={open ? 'Close creation menu' : 'Open creation menu'}
          onClick={() => setOpen(!open)}
        >
          <Plus size={27} style={{ transform: open ? 'rotate(45deg)' : 'none' }} />
        </button>
      </div>
      <Hint>
        <span role="status">{selected}</span>
      </Hint>
    </DemoStack>
  );
}
export function ExpandableNav() {
  const [active, setActive] = useState('Home');
  const uid = useId();
  return (
    <DemoStack>
      <div className="expand-nav" aria-label="Sample destinations">
        {(
          [
            ['Home', Home],
            ['Search', Search],
            ['Saved', Folder],
            ['Updates', Bell],
          ] as const
        ).map(([label, Icon]) => (
          <motion.button
            layout
            key={label}
            transition={spring}
            className={active === label ? 'active' : ''}
            aria-label={label}
            aria-pressed={active === label}
            onClick={() => setActive(label)}
          >
            <Icon size={18} />
            {active === label && <motion.span layoutId={uid}>{label}</motion.span>}
          </motion.button>
        ))}
      </div>
      <Hint>{active} · a little room for what matters</Hint>
    </DemoStack>
  );
}
export function Breadcrumbs() {
  const [depth, setDepth] = useState(1);
  const items = ['Workspace', 'Projects', 'Studio', 'Brand system'];
  return (
    <DemoStack>
      <div className="breadcrumb-card">
        <nav aria-label="Sample breadcrumbs">
          <ol className="breadcrumbs">
            {items.slice(0, depth).map((item, i) => (
              <li key={item}>
                {i > 0 && <ChevronRight size={13} />}
                <button
                  aria-current={i === depth - 1 ? 'page' : undefined}
                  onClick={() => setDepth(i + 1)}
                >
                  {i === 0 ? <Home size={15} /> : item}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="folder-area">
          {depth < 4 ? (
            <button onClick={() => setDepth(depth + 1)} className="folder-button">
              <Folder size={36} />
              <span>{items[depth]}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <div className="row">
              <File size={30} />
              <span>
                Identity guidelines.pdf
                <br />
                <small>Everything starts with a good foundation.</small>
              </span>
            </div>
          )}
        </div>
      </div>
      <Hint>Open a folder. Follow the trail back.</Hint>
    </DemoStack>
  );
}
export function ScrollSpy() {
  const [active, setActive] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const { reduced } = usePlayback();
  const sections = ['The idea', 'The craft', 'The details'];
  return (
    <div className="scrollspy-demo">
      <nav aria-label="Article contents">
        {sections.map((title, i) => (
          <button
            className={active === i ? 'active' : ''}
            key={title}
            onClick={() =>
              container.current?.scrollTo({
                top: i * 220,
                behavior: reduced ? 'instant' : 'smooth',
              })
            }
          >
            {title}
          </button>
        ))}
      </nav>
      <div
        className="scrollspy-content"
        ref={container}
        tabIndex={0}
        aria-label="Scrollable article"
        onScroll={(e) => setActive(Math.min(2, Math.round(e.currentTarget.scrollTop / 220)))}
      >
        {sections.map((title, i) => (
          <section key={title}>
            <small>0{i + 1}</small>
            <h3>{title}</h3>
            <p>
              {
                [
                  'Good interfaces begin with a useful idea. What should this moment help someone accomplish?',
                  'Craft lives in the relationship between things: the space, the hierarchy, the response.',
                  'A hundred small decisions add up to an experience that feels inevitable.',
                ][i]
              }
            </p>
            <span>Keep scrolling ↓</span>
          </section>
        ))}
      </div>
    </div>
  );
}
export function ExpandingSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const field = useRef<HTMLInputElement>(null);
  const options = ['Design principles', 'Motion tokens', 'Component library', 'Project notes'];
  const filtered = options.filter((x) => x.toLowerCase().includes(query.toLowerCase()));
  return (
    <DemoStack>
      <motion.div
        layout
        transition={spring}
        className={`expanding-search ${open ? 'is-open' : ''}`}
      >
        {open ? (
          <>
            <div className="row">
              <Search size={18} />
              <input
                ref={field}
                autoFocus
                aria-label="Search destinations"
                placeholder="Find your way…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setOpen(false);
                }}
              />
              <button aria-label="Close search" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="search-destinations">
              {filtered.map((x) => (
                <button
                  key={x}
                  onClick={() => {
                    setSelected(x);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <File size={15} />
                  {x}
                  <ArrowUpRight size={14} />
                </button>
              ))}
              {!filtered.length && <p>No destinations found.</p>}
            </div>
          </>
        ) : (
          <button className="search-invite" onClick={() => setOpen(true)}>
            <Search size={18} /> Find something <kbd>/</kbd>
          </button>
        )}
      </motion.div>
      <Hint>
        <span role="status">{selected || 'A little less interface. Until you need it.'}</span>
      </Hint>
    </DemoStack>
  );
}
