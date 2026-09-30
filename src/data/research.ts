export type ResearchSource = {
  name: string;
  url: string;
  type: 'Pattern library' | 'Product' | 'Guidance';
  status: 'Reviewed';
  note: string;
};
const rows: [string, string, ResearchSource['type'], ResearchSource['status'], string][] = [
  [
    'Kimi Slides',
    'https://www.kimi.com/slides',
    'Product',
    'Reviewed',
    'A focused prompt entry with project context. Informed the composer study; full generation requires an account.',
  ],
  [
    '21st.dev shaders',
    'https://21st.dev/community/components/s/shader',
    'Pattern library',
    'Reviewed',
    'Shader discovery among a broad component taxonomy. Motivated an original small WebGL color-field study.',
  ],
  [
    'Beautiful UI',
    'https://www.beautifului.dev/',
    'Pattern library',
    'Reviewed',
    'AI-specific patterns include streamed responses, task activity, tool chips, approval requests, and contextual controls.',
  ],
  [
    'beUI morphing modal',
    'https://beui.dev/components/motion/morphing-modal',
    'Pattern library',
    'Reviewed',
    'A panel changes size between inner views. Informed the original multi-view modal with Base UI focus management.',
  ],
  [
    'Executor',
    'https://executor.sh/',
    'Product',
    'Reviewed',
    'A numbered narrative and interactive integration comparison make system behavior concrete. Informed the explicit task pipeline.',
  ],
  [
    'interior.dev',
    'https://www.interior.dev/docs/inline-validation',
    'Pattern library',
    'Reviewed',
    'Stable inline validation, cancellation-aware hold actions, and practical interaction primitives informed several studies.',
  ],
  [
    'BoardUI',
    'https://www.boardui.com/',
    'Pattern library',
    'Reviewed',
    'A dashboard system with interactive data examples. Informed the approach of coupling visual charts with explicit values.',
  ],
  [
    'ui.camera',
    'https://ui.camera/',
    'Product',
    'Reviewed',
    'An in-browser product-visual studio with rotation and presentation controls. Informed spatial and comparison experiments.',
  ],
  [
    'loading.dev',
    'https://loading.dev/',
    'Pattern library',
    'Reviewed',
    'Named loader families distinguish different kinds of indefinite waiting. The playbook separates that from measured progress.',
  ],
  [
    'React Bits / Scroll Expand',
    'https://reactbits.dev/animations/scroll-expand',
    'Pattern library',
    'Reviewed',
    'Browser inspection verified a rounded media frame that expands inside a scrollable preview. Informed the original landscape expansion study.',
  ],
  [
    'Libraries.dev',
    'https://libraries.dev/',
    'Pattern library',
    'Reviewed',
    'Verified destination for Thinking orbs, with border, material, and generation effects. Informed original visual studies.',
  ],
  [
    'Motion documentation',
    'https://motion.dev/docs/react-layout-animations',
    'Guidance',
    'Reviewed',
    'Primary documentation for shared layout, transform-based layout changes, gestures, and reduced-motion behavior.',
  ],
  [
    'NumberFlow',
    'https://number-flow.barvian.me/',
    'Pattern library',
    'Reviewed',
    'Primary documentation for locale-aware rolling values and built-in motion preference handling. Used directly in the number demo.',
  ],
  [
    'Sonner',
    'https://sonner.emilkowal.ski/',
    'Pattern library',
    'Reviewed',
    'The toast implementation used for accessible, dismissible notification stacks and undo feedback.',
  ],
  [
    'Base UI',
    'https://base-ui.com/react/components/dialog',
    'Guidance',
    'Reviewed',
    'Primary documentation for focus-managed dialog primitives, portal behavior, and dismissal. Used for real overlays.',
  ],
];
export const sources: ResearchSource[] = rows.map(([name, url, type, status, note]) => ({
  name,
  url,
  type,
  status,
  note,
}));
export const researchDate = 'September 30, 2026';
