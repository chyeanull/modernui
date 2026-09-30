# Modern UI — An interaction playbook

A working React app containing **64 original interaction studies in eight chapters**, with a design-system sidebar, global command search, and a research notebook covering 15 sources used in the app.

## Run

```sh
npm ci
npm run dev
```

Open **http://localhost:5173**. Node 22.12+ or Node 24 is recommended for the installed Vite version.

```sh
npm run build       # TypeScript check and production build
npm run preview     # Serve the production output
npm test            # Playwright browser tests
npm run format      # Format the source
```

If Chromium is not installed for Playwright, run `npx playwright install chromium` once.

## Explore

- **Navigation:** magnetic dock, sliding tabs, command menu, bloom menu, expanding navigation, breadcrumbs, reading navigation, expanding search.
- **Microinteractions:** morphing action, hold-to-confirm, toast stack, like burst, clipboard feedback, progress ring, live activity, notification pile.
- **Cards and overlays:** morphing modal, bottom sheet, card stack, perspective card, spotlight card, two-sided card, expanding card, context menu.
- **Text and numbers:** rolling values, staggered type, blur reveal, text scramble, rotating words, typewriter, marquee, gradient typography.
- **Inputs and controls:** inline validation, password feedback, verification code, tags, slider, color selection, rating, fluid switch.
- **Visual effects:** original WebGL mesh, thinking orb, interactive canvas particles, aurora, grain, border beam, click ripples, glass material.
- **Data and gesture:** chart scrubber, animated bars, donut chart, sorting, filtering, swipe deck, drag reordering, comparison slider.
- **AI and workflows:** prompt composer, streaming answer, activity disclosure, tool pipeline, approval, local file selection, adaptive stepper, scroll expansion.

Every detail page includes a working demo, a standalone component export, instructions, design rationale, implementation considerations, and an inspiration link. Use **Cmd/Ctrl+K** or **/** to search. Collections, theme, and the explicit reduced-motion preference persist in local storage.

The **Source** view has three steps: install its listed dependencies, copy the complete `.tsx` file, and render the exported component in an existing React + TypeScript project. Styles, theme variables, required helpers, reduced-motion handling, portal styling, and toast setup are included in that file. No separate stylesheet, shared file, or app provider is required. The generated install command contains only the packages used by that component, pinned to this app’s tested versions. These remain interactive sample implementations; simulated exports, uploads, and AI flows do not gain a backend when copied.

Exports are generated from the live implementations by `scripts/pattern-sources.mjs`, with scoped styles and namespaced animations. Vite regenerates them when their inputs change and loads each source file on demand. Run `npm run test:sources` to compile all 64 exports with strict unused-import checks, then render them in a separate React app without the playbook’s styles and test representative interactions.

## Research approach

The research snapshot is September 30, 2026. The sources used in the app live at `/#/research` and in `src/data/research.ts`. The notebook includes sources cited by working examples and Base UI, which provides the app’s overlay primitives. Unused leads, inaccessible pages, duplicate redirects, and general inspiration references are omitted. Each retained note explains the source’s connection to the implementation.

The research led to three recurring themes:

1. **Continuity:** tabs, expanding cards, modal views, and data layouts retain a recognizable object while state changes.
2. **Observable work:** progress, streaming, activity disclosure, and approval controls show what an asynchronous system is doing and keep cancellation or explicit choice available.
3. **Purposeful expression:** shader, material, text, and gesture studies add personality in appropriate contexts; their notes distinguish expressive use from frequent utility interactions.

Primary references include [beUI](https://beui.dev/components/motion/morphing-modal), [interior.dev](https://www.interior.dev/docs/inline-validation), [Beautiful UI](https://www.beautifului.dev/), [React Bits](https://reactbits.dev/animations/scroll-expand), [Libraries.dev](https://libraries.dev/), [Motion](https://motion.dev/docs/react-layout-animations), and [Base UI](https://base-ui.com/react/components/dialog). The demos are original interpretations, not replicas or copied source bundles.

## Implementation

React + TypeScript + Vite, with Motion for layout/gesture transitions, Base UI for dialogs/tabs/menus/selects, cmdk for command search, Sonner for notifications, and NumberFlow for rolling digits. Icons come from Lucide. DM Sans and Manrope are self-hosted through Fontsource. Artwork is original CSS, SVG, canvas, or WebGL; no remote image service is required.

Hash routes allow the production `dist/` directory to be served from a static host without per-pattern server rewrites. The sidebar covers every example. Gallery previews mount near the viewport instead of running all 64 effects at once; canvas/WebGL loops stop offscreen and in hidden tabs. WebGL resolution is capped and a CSS fallback is available.

- `src/data/patterns.ts`: catalog, source attribution, rationale, and interaction notes.
- `src/data/research.ts`: sources used by the examples and UI components.
- `src/demos/*.tsx`: eight groups of self-contained example functions.
- `src/demos/registry.ts`: component lookup using stable export names.
- `scripts/pattern-sources.mjs`: standalone source generation and Vite integration.
- `src/demos/shared.tsx`: timer cleanup, playback preferences, clipboard, and persistence helpers.
- `src/demos/demos.css`: all example styles.
- `src/App.tsx`: catalog, detail pages, foundations, research, and search.
- `tests/playbook.spec.ts`: route, source, viewport, keyboard, persistence, and interaction checks.

Catalogs use a grid layout with a custom sort menu. The global command search opens from the header, **Cmd/Ctrl+K**, or **/**.

## Scope and validation

This is a frontend pattern library and playground. AI answers, task execution, exports, notifications, and approvals are demonstrative local state. File selection reads only browser-provided metadata and sends nothing to a server. The music example is a visualizer, not an audio player. Password feedback is a simple educational heuristic.

The browser suite exercises all 64 detail routes and their source views, checks every demo at a 360px viewport, and tests the main end-to-end interactions. Additional checks cover reduced motion and accessibility semantics. Physical-device gesture testing and a full assistive-technology audit remain useful before extracting patterns into a production product.

App typography uses a relative scale: 16px body copy and primary navigation, 14px controls and secondary navigation, and a 12px floor for metadata at the default browser setting. These are the playbook's readability choices. Playground and source typography remain independently sized. Typography checks cover 320px reflow, 200% text enlargement, expanded navigation/search, and increased line, letter, word, and paragraph spacing, following the scenarios in [WCAG Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), and [Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html).
