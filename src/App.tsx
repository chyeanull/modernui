import { Component, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { Dialog } from '@base-ui/react/dialog';
import { Select } from '@base-ui/react/select';
import { Command } from 'cmdk';
import { Toaster, toast } from 'sonner';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Code2,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  Layers,
  Menu,
  Moon,
  MousePointer2,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Search,
  Settings2,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Type,
  X,
  ChartNoAxesCombined,
} from 'lucide-react';
import { categories, patterns } from './data/patterns';
import type { Pattern } from './data/patterns';
import { sources, researchDate } from './data/research';
import { demos } from './demos/registry';
import { standaloneSources, sourceLoaders } from 'virtual:pattern-sources';
import { copyText, PlaybackContext, useLocalState } from './demos/shared';
import { SidebarNav } from './components/SidebarNav';

const categoryIcons = [
  Compass,
  MousePointer2,
  Layers,
  Type,
  SlidersHorizontal,
  Orbit,
  ChartNoAxesCombined,
  Sparkles,
];
const sortOptions = [
  { value: 'curated', label: 'Curated', description: 'Handpicked order', icon: Sparkles },
  { value: 'az', label: 'A–Z', description: 'Pattern name, alphabetically', icon: Type },
  { value: 'new', label: 'Fresh additions', description: 'Newest patterns first', icon: RotateCcw },
];
const featuredOrder = [
  'mesh-gradient',
  'morphing-modal',
  'magnetic-dock',
  'thinking-orb',
  'rolling-numbers',
  'tilt-card',
  'sliding-tabs',
  'chart-scrubber',
  'morphing-button',
];
function useRoute() {
  const [route, setRoute] = useState(() => location.hash.slice(2) || '');
  useEffect(() => {
    const update = () => {
      setRoute(location.hash.slice(2) || '');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return route;
}
function navigate(path: string) {
  location.hash = `/${path}`;
}
function Logo() {
  return (
    <a href="#/" className="brand" aria-label="Modern UI home">
      <span className="brand-mark">
        <Asterisk size={26} strokeWidth={2.4} />
      </span>
      <span>
        modern<span className="brand-light">ui</span>
        <span className="brand-dot">.</span>
      </span>
    </a>
  );
}
class PreviewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="preview-error">
        <CircleHelp />
        <p>This preview needs a refresh.</p>
        <button onClick={() => this.setState({ failed: false })}>Try again</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function LazyDemo({ pattern }: { pattern: Pattern }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '180px' });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  const Demo = demos[pattern.id];
  return (
    <div ref={ref} className={`card-preview preview-${pattern.id}`}>
      <span className="preview-interact">
        <MousePointer2 size={11} /> Try it
      </span>
      {near ? (
        <div className="thumbnail-stage">
          <PreviewBoundary>
            <Demo />
          </PreviewBoundary>
        </div>
      ) : (
        <div className="preview-placeholder">
          <Asterisk size={25} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const route = useRoute();
  const [theme, setTheme] = useLocalState<'light' | 'dark'>('modernui-theme', 'light');
  const [saved, setSaved] = useLocalState<string[]>('modernui-saved', []);
  const [reduced, setReduced] = useLocalState('modernui-reduced', false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('curated');
  const selected = patterns.find((p) => route === `pattern/${p.id}`);
  const category = route.startsWith('category/')
    ? categories.find((c) => c.id === route.split('/')[1])
    : undefined;
  const isSaved = route === 'saved';
  const isResearch = route === 'research';
  const isFoundations = route === 'foundations';
  const isNew = route === 'new';
  const knownRoute =
    !route || selected || category || isSaved || isResearch || isFoundations || isNew;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.reduced = String(reduced);
  }, [reduced]);
  useEffect(() => {
    setMobileOpen(false);
    setFilter('all');
    if (selected)
      setExpanded((e) => (e.includes(selected.category) ? e : [...e, selected.category]));
    document.title = selected
      ? `${selected.name} — Modern UI`
      : isResearch
        ? 'Research notebook — Modern UI'
        : 'Modern UI — An interaction playbook';
  }, [route, selected, isResearch]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) &&
        !(e.target as HTMLElement).isContentEditable
      ) {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);
  const toggleSave = (id: string) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const filtered = useMemo(
    () =>
      patterns
        .filter(
          (p) =>
            (!category || p.category === category.id) &&
            (!isSaved || saved.includes(p.id)) &&
            (!isNew || p.new) &&
            (filter === 'all' || (filter === 'featured' ? p.featured : p.category === filter)),
        )
        .sort((a, b) =>
          sort === 'az'
            ? a.name.localeCompare(b.name)
            : sort === 'new'
              ? Number(!!b.new) - Number(!!a.new)
              : (featuredOrder.indexOf(a.id) === -1 ? 99 : featuredOrder.indexOf(a.id)) -
                (featuredOrder.indexOf(b.id) === -1 ? 99 : featuredOrder.indexOf(b.id)),
        ),
    [category, isSaved, isNew, saved, filter, sort],
  );
  const sidebar = (
    <>
      <div className="sidebar-top">
        <Logo />
      </div>
      <SidebarNav>
        <div className="nav-section">
          <a
            href="#/saved"
            className={`nav-item ${isSaved ? 'active' : ''}`}
            aria-current={isSaved ? 'page' : undefined}
          >
            <Bookmark size={16} />
            <span>Your collection</span>
            {saved.length > 0 && <span className="nav-count">{saved.length}</span>}
          </a>
        </div>
        <div className="nav-label">
          <span>THE PATTERNS</span>
          <span>08 CHAPTERS</span>
        </div>
        {categories.map((cat, i) => {
          const Icon = categoryIcons[i];
          return (
            <div className="nav-category" key={cat.id}>
              <div
                className={`nav-category-row ${category?.id === cat.id || (selected?.category === cat.id && !expanded.includes(cat.id)) ? 'active' : ''}`}
              >
                <a
                  href={`#/category/${cat.id}`}
                  aria-current={category?.id === cat.id ? 'page' : undefined}
                >
                  <Icon size={16} />
                  <span>{cat.name}</span>
                </a>
                <button
                  aria-label={`${expanded.includes(cat.id) ? 'Collapse' : 'Expand'} ${cat.name}`}
                  aria-expanded={expanded.includes(cat.id)}
                  onClick={() =>
                    setExpanded((e) =>
                      e.includes(cat.id) ? e.filter((x) => x !== cat.id) : [...e, cat.id],
                    )
                  }
                >
                  <ChevronRight
                    size={13}
                    style={{ transform: expanded.includes(cat.id) ? 'rotate(90deg)' : undefined }}
                  />
                </button>
              </div>
              {expanded.includes(cat.id) && (
                <div className="nav-children">
                  {patterns
                    .filter((p) => p.category === cat.id)
                    .map((p) => (
                      <a
                        href={`#/pattern/${p.id}`}
                        key={p.id}
                        className={selected?.id === p.id ? 'active' : ''}
                        aria-current={selected?.id === p.id ? 'page' : undefined}
                      >
                        {p.name}
                        {p.new && <span />}
                      </a>
                    ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="nav-label notebook-label">THE NOTEBOOK</div>
        <a
          href="#/foundations"
          className={`nav-item ${isFoundations ? 'active' : ''}`}
          aria-current={isFoundations ? 'page' : undefined}
        >
          <Settings2 size={16} />
          <span>Design foundations</span>
        </a>
        <a
          href="#/research"
          className={`nav-item ${isResearch ? 'active' : ''}`}
          aria-current={isResearch ? 'page' : undefined}
        >
          <BookOpen size={16} />
          <span>Research & sources</span>
          <ArrowUpRight size={13} />
        </a>
      </SidebarNav>
      <div className="sidebar-bottom">
        <div className="sidebar-footer">
          <span>V.01</span>
          <button
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </div>
    </>
  );
  return (
    <MotionConfig
      reducedMotion={reduced ? 'always' : 'user'}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
    >
      <PlaybackContext.Provider value={{ paused: false, speed: 1, reduced }}>
        <a
          className="skip-link"
          href="#main-content"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('main-content')?.focus();
            document.getElementById('main-content')?.scrollIntoView();
          }}
        >
          Skip to content
        </a>
        <aside className="sidebar">{sidebar}</aside>
        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Portal>
            <Dialog.Backdrop className="dialog-backdrop mobile-backdrop" />
            <Dialog.Popup className="mobile-sidebar">
              <Dialog.Title className="sr-only">Playbook navigation</Dialog.Title>
              <Dialog.Description className="sr-only">
                Browse every pattern and research source.
              </Dialog.Description>
              <Dialog.Close aria-label="Close navigation" className="mobile-close">
                <X size={20} />
              </Dialog.Close>
              {sidebar}
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
        <div className="app-main">
          <header className="topbar">
            <div className="topbar-breadcrumb">
              <button
                className="mobile-toggle"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={19} />
              </button>
              <span className="desktop-only">Playbook</span>
              <ChevronRight size={12} />
              <span>
                {selected
                  ? categories.find((c) => c.id === selected.category)?.name
                  : category?.name ||
                    (isResearch
                      ? 'Research notebook'
                      : isFoundations
                        ? 'Foundations'
                        : isSaved
                          ? 'Your collection'
                          : isNew
                            ? 'Freshly added'
                            : 'All patterns')}
              </span>
              {selected && (
                <>
                  <ChevronRight size={12} />
                  <span className="topbar-pattern">{selected.name}</span>
                </>
              )}
            </div>
            <div className="topbar-actions">
              <span className="live-label">
                <span />
                64 working examples
              </span>
              <button
                aria-label="Search playbook"
                className="topbar-search"
                onClick={() => setCommandOpen(true)}
              >
                <Search size={17} />
              </button>
              <a href="#/research">
                Behind the collection <ArrowUpRight size={13} />
              </a>
            </div>
          </header>
          <main id="main-content" tabIndex={-1}>
            {!knownRoute ? (
              <div className="empty-state">
                <Asterisk size={40} />
                <h1>This page wandered off.</h1>
                <p>There are 64 other good places to start.</p>
                <a href="#/" className="primary-button">
                  Back to the playbook <ArrowRight size={16} />
                </a>
              </div>
            ) : selected ? (
              <PatternDetail
                key={selected.id}
                pattern={selected}
                saved={saved.includes(selected.id)}
                onSave={() => toggleSave(selected.id)}
                reduced={reduced}
                setReduced={setReduced}
              />
            ) : isResearch ? (
              <Research />
            ) : isFoundations ? (
              <Foundations reduced={reduced} setReduced={setReduced} />
            ) : (
              <div className="catalog-page">
                <div className="page-intro">
                  <div className="page-title-row">
                    <h1>
                      {category
                        ? category.name
                        : isSaved
                          ? 'Good ideas, kept close.'
                          : isNew
                            ? 'A few new possibilities.'
                            : 'Interfaces worth feeling.'}
                    </h1>
                  </div>
                  <p>
                    {category
                      ? category.description
                      : isSaved
                        ? 'Your own little collection of things worth coming back to.'
                        : isNew
                          ? 'The latest additions to a growing interaction playbook.'
                          : 'A considered collection of modern UI patterns. Explore the details. Play with the possibilities.'}
                  </p>
                </div>
                {!category && !isSaved && !isNew && (
                  <section className="feature-banner">
                    <div className="banner-copy">
                      <h2>
                        Less ordinary.
                        <br />
                        More <em>extraordinary.</em>
                      </h2>
                      <p>64 live experiments in what an interface can feel like.</p>
                      <a href="#/pattern/morphing-modal">
                        Find your next good idea <ArrowUpRight size={16} />
                      </a>
                    </div>
                    <div className="banner-art" aria-hidden="true">
                      <div className="art-orbit orbit-a" />
                      <div className="art-orbit orbit-b" />
                      <div className="art-orbit orbit-c" />
                      <div className="art-sphere" />
                      <div className="art-chip chip-one">
                        <span className="chip-check">
                          <Check size={13} />
                        </span>{' '}
                        A little more delightful.
                      </div>
                      <div className="art-chip chip-two">
                        <MousePointer2 size={14} />
                        Made to move.
                      </div>
                      <span className="art-cross">+</span>
                    </div>
                  </section>
                )}
                <div className="catalog-toolbar">
                  <div className="collection-tabs">
                    <button
                      className={filter === 'all' ? 'active' : ''}
                      onClick={() => setFilter('all')}
                    >
                      {category ? 'All examples' : isSaved ? 'Saved patterns' : 'All patterns'}
                      <span>{category ? 8 : isSaved ? saved.length : patterns.length}</span>
                    </button>
                    {!category && !isSaved && (
                      <button
                        className={filter === 'featured' ? 'active' : ''}
                        onClick={() => setFilter('featured')}
                      >
                        <Sparkles size={13} /> The highlights
                      </button>
                    )}
                  </div>
                </div>
                <div className="catalog-meta">
                  <span>
                    {filtered.length} patterns to explore <span className="meta-divider">/</span>{' '}
                    <span>Every example is live. Go ahead, interact.</span>
                  </span>
                  <Select.Root
                    items={sortOptions}
                    value={sort}
                    onValueChange={(value) => value && setSort(value)}
                  >
                    <Select.Trigger className="sort-trigger" aria-label="Sort patterns">
                      <SlidersHorizontal size={15} aria-hidden="true" />
                      <span className="sort-label">Sort by</span>
                      <Select.Value className="sort-value" />
                      <Select.Icon className="sort-chevron">
                        <ChevronDown size={14} />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Positioner
                        className="sort-positioner"
                        positionMethod="fixed"
                        align="end"
                        sideOffset={8}
                        alignItemWithTrigger={false}
                      >
                        <Select.Popup className="sort-popup">
                          <Select.List>
                            {sortOptions.map(({ value, label, description, icon: Icon }) => (
                              <Select.Item key={value} value={value} className="sort-option">
                                <span className="sort-option-icon">
                                  <Icon size={17} aria-hidden="true" />
                                </span>
                                <span className="sort-option-copy">
                                  <Select.ItemText>{label}</Select.ItemText>
                                  <span className="sort-description">{description}</span>
                                </span>
                                <Select.ItemIndicator className="sort-check">
                                  <Check size={16} />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.List>
                        </Select.Popup>
                      </Select.Positioner>
                    </Select.Portal>
                  </Select.Root>
                </div>
                {filtered.length ? (
                  <div className="pattern-grid">
                    {filtered.map((p) => (
                      <article className="pattern-card" key={p.id} data-pattern={p.id}>
                        <LazyDemo pattern={p} />
                        <div className="pattern-card-info">
                          <div className="pattern-card-top">
                            <a href={`#/pattern/${p.id}`}>
                              <h2>{p.name}</h2>
                              {p.new && <span className="new-label">NEW</span>}
                              <ArrowUpRight className="card-open-arrow" size={16} />
                            </a>
                            <button
                              className={`save-button ${saved.includes(p.id) ? 'saved' : ''}`}
                              aria-label={`${saved.includes(p.id) ? 'Unsave' : 'Save'} ${p.name}`}
                              aria-pressed={saved.includes(p.id)}
                              onClick={() => toggleSave(p.id)}
                            >
                              <Bookmark
                                size={16}
                                fill={saved.includes(p.id) ? 'currentColor' : 'none'}
                              />
                            </button>
                          </div>
                          <p>{p.description}</p>
                          <div className="card-category">
                            <span>{categories.find((c) => c.id === p.category)?.name}</span>
                            <span className="card-tech">{p.tags[0]}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Bookmark size={32} />
                    <h2>{isSaved ? 'A little room for inspiration.' : 'No patterns found.'}</h2>
                    <p>
                      {isSaved
                        ? 'Save any pattern with the bookmark icon. It’ll be right here.'
                        : 'Choose a different filter to explore the collection.'}
                    </p>
                    <button
                      className="primary-button"
                      onClick={() => {
                        setFilter('all');
                        if (isSaved) navigate('');
                      }}
                    >
                      Explore the collection <ArrowRight size={15} />
                    </button>
                  </div>
                )}
                <div className="catalog-bottom">
                  <Asterisk size={22} />
                  <p>
                    Good design is a collection of thoughtful decisions.
                    <br />
                    <span>Here are 64 places to start.</span>
                  </p>
                  <a href="#/research">
                    Meet the inspirations <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            )}
          </main>
          <footer className="site-footer">
            <span>
              modernui. <span>An interaction playbook.</span>
            </span>
            <span>Made with curiosity & a little obsession.</span>
          </footer>
        </div>
        <SearchDialog open={commandOpen} setOpen={setCommandOpen} />
        <Toaster theme={theme} position="bottom-right" closeButton richColors />
      </PlaybackContext.Provider>
    </MotionConfig>
  );
}

function SearchDialog({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Popup className="command-popup app-command">
          <Dialog.Title className="sr-only">Search all patterns</Dialog.Title>
          <Dialog.Description className="sr-only">
            Use the arrow keys and Enter to explore the playbook.
          </Dialog.Description>
          <Command>
            <div className="command-input">
              <Search size={19} />
              <Command.Input placeholder="What are you curious about?" autoFocus />
              <Dialog.Close aria-label="Close search">
                <kbd>esc</kbd>
              </Dialog.Close>
            </div>
            <Command.List>
              <Command.Empty>No patterns found. Try a different thought.</Command.Empty>
              {categories.map((c) => (
                <Command.Group heading={c.name} key={c.id}>
                  {patterns
                    .filter((p) => p.category === c.id)
                    .map((p) => (
                      <Command.Item
                        key={p.id}
                        value={`${p.name} ${p.tags.join(' ')} ${p.description}`}
                        onSelect={() => {
                          navigate(`pattern/${p.id}`);
                          setOpen(false);
                        }}
                      >
                        <span className="command-pattern-icon">
                          <Asterisk size={15} />
                        </span>
                        {p.name}
                        <ArrowUpRight size={14} />
                      </Command.Item>
                    ))}
                </Command.Group>
              ))}
            </Command.List>
            <div className="command-footer">
              ↑ ↓ to explore <span>↵ to open</span>
              <span>64 possibilities</span>
            </div>
          </Command>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PatternDetail({
  pattern,
  saved,
  onSave,
  reduced,
  setReduced,
}: {
  pattern: Pattern;
  saved: boolean;
  onSave: () => void;
  reduced: boolean;
  setReduced: (v: boolean) => void;
}) {
  const [tab, setTab] = useState('preview');
  const [loadedSource, setLoadedSource] = useState<{ id: string; code: string } | null>(null);
  const [sourceError, setSourceError] = useState(false);
  const [sourceAttempt, setSourceAttempt] = useState(0);
  const [replay, setReplay] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [width, setWidth] = useState('full');
  const Demo = demos[pattern.id];
  const idx = patterns.findIndex((p) => p.id === pattern.id);
  const cat = categories.find((c) => c.id === pattern.category)!;
  const bundle = standaloneSources[pattern.id];
  const source = loadedSource?.id === pattern.id ? loadedSource.code : '';
  useEffect(() => {
    if (tab !== 'code') return;
    let current = true;
    setSourceError(false);
    sourceLoaders[pattern.id]()
      .then(({ default: code }) => {
        if (current) setLoadedSource({ id: pattern.id, code });
      })
      .catch(() => {
        if (current) setSourceError(true);
      });
    return () => {
      current = false;
    };
  }, [pattern.id, tab, sourceAttempt]);
  const copy = async (value: string) => {
    if (await copyText(value)) toast.success('Copied. Make it your own.');
    else toast.error('Clipboard unavailable. Select the text to copy it.');
  };
  return (
    <div className="detail-page">
      <a className="back-link" href={`#/category/${pattern.category}`}>
        <ArrowLeft size={14} /> {cat.name}
      </a>
      <div className="detail-title">
        <div>
          <div className="eyebrow">
            PATTERN {String(idx + 1).padStart(2, '0')} <span className="eyebrow-line" />{' '}
            {cat.name.toUpperCase()}
          </div>
          <h1>
            {pattern.name}
            <span className="title-period">.</span>
          </h1>
          <p>{pattern.description}</p>
        </div>
        <button
          className={`secondary-button ${saved ? 'is-saved' : ''}`}
          onClick={onSave}
          aria-pressed={saved}
        >
          <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'In your collection' : 'Save pattern'}
        </button>
      </div>
      <div className="playground">
        <div className="playground-toolbar">
          <div className="playground-tabs" role="group" aria-label="Playground view">
            <button className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}>
              <Eye size={15} /> Playground
            </button>
            <button className={tab === 'code' ? 'active' : ''} onClick={() => setTab('code')}>
              <Code2 size={15} /> Source
            </button>
          </div>
          <div className="playground-actions">
            {tab === 'preview' ? (
              <>
                <button
                  className={width === 'compact' ? 'active' : ''}
                  aria-label="Toggle compact preview"
                  aria-pressed={width === 'compact'}
                  onClick={() => setWidth(width === 'full' ? 'compact' : 'full')}
                >
                  <span className="viewport-icon" />
                </button>
                <span />
                <button aria-label="Reset" onClick={() => setReplay((k) => k + 1)}>
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </>
            ) : (
              <button onClick={() => copy(source)} disabled={!source}>
                <Copy size={14} />
                Copy component
              </button>
            )}
          </div>
        </div>
        {tab === 'preview' ? (
          <>
            <div
              className={`demo-canvas canvas-${pattern.id} ${reduced ? 'force-reduced' : ''}`}
              style={{ '--play-state': paused ? 'paused' : 'running' } as React.CSSProperties}
            >
              <div className="canvas-grid" />
              <div className={`demo-viewport ${width === 'compact' ? 'compact' : ''}`}>
                <PlaybackContext.Provider value={{ paused, speed, reduced }}>
                  <PreviewBoundary key={replay}>
                    <Demo />
                  </PreviewBoundary>
                </PlaybackContext.Provider>
              </div>
              <span className="canvas-index">STUDY {String(idx + 1).padStart(2, '0')}</span>
              <span className="canvas-live">
                <span /> LIVE PREVIEW
              </span>
            </div>
            <div className="playground-bottom">
              <span>
                <MousePointer2 size={14} />
                {pattern.instruction}
              </span>
              <button
                aria-label={paused ? 'Resume ambient motion' : 'Pause ambient motion'}
                onClick={() => setPaused(!paused)}
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
                <span>{paused ? 'Resume' : 'Pause'} ambient motion</span>
              </button>
            </div>
          </>
        ) : (
          <div className="source-view">
            <div className="source-setup">
              <p>One file for your React + TypeScript app. Styles and helpers are included.</p>
              <div className="source-step">
                <h3>1. Install dependencies</h3>
                {bundle.install ? (
                  <div className="source-command">
                    <code>{bundle.install}</code>
                    <button aria-label="Copy install command" onClick={() => copy(bundle.install)}>
                      <Copy size={15} />
                    </button>
                  </div>
                ) : (
                  <p>No extra packages needed beyond React.</p>
                )}
              </div>
              <div className="source-step">
                <h3>2. Copy the component</h3>
                <p>
                  Use “Copy component” above and save it as <code>{bundle.filename}</code>.
                </p>
              </div>
              <div className="source-step">
                <h3>3. Use it in your page</h3>
                <div className="source-command">
                  <code>{bundle.usage}</code>
                  <button aria-label="Copy usage example" onClick={() => copy(bundle.usage)}>
                    <Copy size={15} />
                  </button>
                </div>
              </div>
            </div>
            <div className="source-file-header">
              <strong>{bundle.filename}</strong>
              <span>Component + styles</span>
            </div>
            {sourceError ? (
              <div className="source-setup" role="alert">
                <p>Couldn’t load this component.</p>
                <button onClick={() => setSourceAttempt((attempt) => attempt + 1)}>
                  Try again
                </button>
              </div>
            ) : source ? (
              <pre tabIndex={0} aria-label={`${bundle.name} component source`}>
                <code>{source}</code>
              </pre>
            ) : (
              <p className="source-setup" role="status">
                Loading component…
              </p>
            )}
          </div>
        )}
      </div>
      <div className="detail-under">
        <section className="pattern-notes">
          <h2>Purpose</h2>
          <p>{pattern.why}</p>
          <h3>Keep in mind</h3>
          <p>{pattern.caution}</p>
          <div className="source-credit">
            <a
              className="source-link"
              href={pattern.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen size={22} aria-hidden="true" />
              <span className="source-link-copy">
                <span className="source-link-label">Research inspiration</span>
                <strong>{pattern.sourceName}</strong>
              </span>
              <ExternalLink size={18} aria-hidden="true" />
            </a>
            <span className="original-study">Original implementation</span>
          </div>
        </section>
        <aside className="motion-settings">
          <h3>
            <SlidersHorizontal size={16} /> Make it feel right
          </h3>
          <div className="setting-row">
            <span>
              Timer speed<small>For timed demo sequences</small>
            </span>
            <select
              aria-label="Timer speed"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={1.5}>1.5×</option>
            </select>
          </div>
          <div className="setting-row">
            <span>
              Reduced motion<small>System preference also applies</small>
            </span>
            <button
              className={`mini-switch ${reduced ? 'on' : ''}`}
              role="switch"
              aria-checked={reduced}
              aria-label="Reduce motion"
              onClick={() => setReduced(!reduced)}
            >
              <span />
            </button>
          </div>
          <div className="tech-tags">
            {pattern.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
            <span>React</span>
            <span>TypeScript</span>
          </div>
        </aside>
      </div>
      <nav className="pattern-pagination" aria-label="Adjacent examples">
        <a href={`#/pattern/${patterns[(idx - 1 + patterns.length) % patterns.length].id}`}>
          <ArrowLeft size={17} />
          <span>
            <small>PREVIOUS PATTERN</small>
            {patterns[(idx - 1 + patterns.length) % patterns.length].name}
          </span>
        </a>
        <a href={`#/pattern/${patterns[(idx + 1) % patterns.length].id}`}>
          <span>
            <small>NEXT PATTERN</small>
            {patterns[(idx + 1) % patterns.length].name}
          </span>
          <ArrowRight size={17} />
        </a>
      </nav>
    </div>
  );
}

function Research() {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const shown = sources.filter(
    (s) =>
      (filter === 'All' || s.type === filter) &&
      `${s.name} ${s.note}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="research-page">
      <div className="page-intro">
        <h1>Research & sources</h1>
        <p>The sources behind the working examples and components in this collection.</p>
      </div>
      <div className="research-summary">
        <div>
          <strong>{sources.length}</strong>
          <span>sources used in the app</span>
        </div>
        <div>
          <strong>{categories.length}</strong>
          <span>pattern chapters</span>
        </div>
        <div>
          <strong>{patterns.length}</strong>
          <span>original working studies</span>
        </div>
        <div>
          <BookOpen size={23} />
          <span>
            Research snapshot
            <br />
            <b>{researchDate}</b>
          </span>
        </div>
      </div>
      <div className="research-intro">
        <h2>Study the idea. Build the understanding.</h2>
        <p>
          Every source below contributed to a working example or a component used in this app. Each
          note explains that connection. The examples are original interpretations of these
          patterns; their detail pages link to the relevant inspiration. “Reviewed” means the page
          or documentation exposed useful evidence, not that every interaction on the site was
          tested.
        </p>
        <p>
          Three themes shaped the collection: continuity between interface states, clear feedback
          during asynchronous work, and expressive effects used where they help the experience.
          Practical controls sit alongside experiments, each with its own purpose and limitations.
        </p>
      </div>
      <div className="research-toolbar">
        <div className="filter-pills">
          {['All', 'Pattern library', 'Product', 'Guidance'].map((t) => (
            <button className={filter === t ? 'active' : ''} onClick={() => setFilter(t)} key={t}>
              {t}
            </button>
          ))}
        </div>
        <label className="catalog-search">
          <Search size={14} />
          <input
            aria-label="Search research sources"
            placeholder="Find a source…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="research-list">
        {shown.map((source, i) => (
          <article key={source.url} className="research-row">
            <span className="research-number">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <div className="research-title">
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.name}
                  <ArrowUpRight size={14} />
                </a>
                <span
                  className={`research-status status-${source.status.toLowerCase().replace(' ', '-')}`}
                >
                  {source.status}
                </span>
              </div>
              <p>{source.note}</p>
              <small>
                {source.type} <span>·</span> {new URL(source.url).hostname.replace('www.', '')}
              </small>
            </div>
          </article>
        ))}
        {!shown.length && (
          <div className="empty-state">
            <Search />
            <h2>No matching sources.</h2>
            <button
              className="secondary-button"
              onClick={() => {
                setQuery('');
                setFilter('All');
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Foundations({
  reduced,
  setReduced,
}: {
  reduced: boolean;
  setReduced: (v: boolean) => void;
}) {
  return (
    <div className="foundations-page">
      <div className="page-intro">
        <h1>Design foundations</h1>
        <p>The decisions that hold the collection together.</p>
      </div>
      <div className="foundation-principles">
        {[
          [
            '01',
            'Give motion a job.',
            'Use it to explain a change, confirm an action, or preserve context. Reserve decorative motion for expressive moments.',
          ],
          [
            '02',
            'Keep the useful things still.',
            'Reading, searching, and frequent actions should feel immediate. The interface should follow attention, not compete for it.',
          ],
          [
            '03',
            'Make room for everyone.',
            'Keyboard controls, visible focus, meaningful labels, and reduced motion are part of the design from the beginning.',
          ],
        ].map(([n, title, body]) => (
          <section key={n}>
            <span>{n}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
      <section className="foundation-section">
        <h2>Color, with a purpose.</h2>
        <p>A warm, quiet frame. An expressive collection inside it.</p>
        <div className="foundation-colors">
          {[
            ['Paper', '#F8F8F6'],
            ['Surface', '#FFFFFF'],
            ['Ink', '#262824'],
            ['Muted', '#6D706A'],
            ['Terracotta', '#ED5B35'],
            ['Sage', '#718978'],
          ].map(([label, color]) => (
            <button
              key={label}
              onClick={async () => {
                if (await copyText(color)) toast.success(`${label} copied`);
                else toast.error('Clipboard unavailable.');
              }}
            >
              <span style={{ background: color }} />
              <strong>{label}</strong>
              <code>{color}</code>
            </button>
          ))}
        </div>
      </section>
      <section className="foundation-section">
        <h2>A considered rhythm.</h2>
        <div className="motion-token-grid">
          {[
            ['Press feedback', '160 ms', 'A response you feel immediately.'],
            ['Interface transition', '220 ms', 'Enough time to understand the change.'],
            ['Spring gesture', '500 ms / 0.2 bounce', 'Carries the feeling of a physical object.'],
          ].map(([title, value, desc]) => (
            <div key={title}>
              <small>{title}</small>
              <strong>{value}</strong>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <code className="easing-token">cubic-bezier(0.23, 1, 0.32, 1)</code>
      </section>
      <section className="foundation-section reduced-preference">
        <div>
          <h2>Your pace. Your preference.</h2>
          <p>
            The playbook respects your system’s reduced-motion setting. You can also enable it here.
          </p>
        </div>
        <button
          className={`mini-switch ${reduced ? 'on' : ''}`}
          role="switch"
          aria-checked={reduced}
          aria-label="Use reduced motion throughout playbook"
          onClick={() => setReduced(!reduced)}
        >
          <span />
        </button>
      </section>
      <a href="#/research" className="back-link">
        See the research behind these decisions <ArrowUpRight size={15} />
      </a>
    </div>
  );
}
