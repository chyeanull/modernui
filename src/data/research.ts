export type ResearchSource = {
  name: string;
  url: string;
  type: 'Pattern library' | 'Product' | 'Guidance';
  status: 'Reviewed';
  note: string;
};
// One homepage per site. Pattern-specific references remain on the pattern pages.
const rows: [string, string, ResearchSource['type'], string][] = [
  [
    'MUI',
    'https://mui.com/',
    'Pattern library',
    'Basic three-segment pie charts and chart entry animation.',
  ],
  [
    'React Graph Gallery',
    'https://www.react-graph-gallery.com/',
    'Guidance',
    'Line charts with smooth transitions between datasets and fixed axes.',
  ],
  [
    'beUI',
    'https://beui.dev/',
    'Pattern library',
    'Motion controls, morphing panels, and agent task lists.',
  ],
  [
    'React Bits',
    'https://reactbits.dev/',
    'Pattern library',
    'Animated grain, stepper, comet dial, lattice loader, and scroll expansion.',
  ],
  ['Kimi', 'https://www.kimi.com/', 'Product', 'Prompt composition and project context.'],
  [
    '21st.dev',
    'https://21st.dev/',
    'Pattern library',
    'Shader discovery and procedural color fields.',
  ],
  [
    'Beautiful UI',
    'https://www.beautifului.dev/',
    'Pattern library',
    'AI workflows, records tables, and status filters.',
  ],
  [
    'Executor',
    'https://executor.sh/',
    'Product',
    'Task pipelines and interactive integration comparisons.',
  ],
  [
    'interior.dev',
    'https://www.interior.dev/',
    'Pattern library',
    'Inline validation, hold actions, and interaction primitives.',
  ],
  [
    'BoardUI',
    'https://www.boardui.com/',
    'Pattern library',
    'Interactive charts and dashboard patterns.',
  ],
  ['ui.camera', 'https://ui.camera/', 'Product', 'Spatial controls and visual comparisons.'],
  ['loading.dev', 'https://loading.dev/', 'Pattern library', 'Loader families and waiting states.'],
  [
    'Libraries.dev',
    'https://libraries.dev/',
    'Pattern library',
    'Thinking orbs, animated borders, and material effects.',
  ],
  [
    'Motion',
    'https://motion.dev/',
    'Guidance',
    'Layout animation, gestures, and reduced-motion behavior.',
  ],
  [
    'NumberFlow',
    'https://number-flow.barvian.me/',
    'Pattern library',
    'Locale-aware rolling numbers.',
  ],
  [
    'Sonner',
    'https://sonner.emilkowal.ski/',
    'Pattern library',
    'Notification stacks, dismissal, and undo feedback.',
  ],
  [
    'Base UI',
    'https://base-ui.com/',
    'Guidance',
    'Accessible controls, focus management, and overlays.',
  ],
];
export const sources: ResearchSource[] = rows.map(([name, url, type, note]) => ({
  name,
  url,
  type,
  status: 'Reviewed',
  note,
}));
export const researchDate = 'October 1, 2026';
