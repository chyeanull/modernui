import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { format } from 'prettier';

const traverse = traverseModule.default ?? traverseModule;
const parseCode = (code) => parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
const categories = [
  'navigation',
  'feedback',
  'surfaces',
  'typography',
  'inputs',
  'visual',
  'data',
  'workflow',
];
export const sourceInputs = [
  ...categories.map((name) => `src/demos/${name}.tsx`),
  'src/demos/shared.tsx',
  'src/demos/registry.ts',
  'src/demos/demos.css',
  'src/styles.css',
  'package.json',
];

function moduleParts(code) {
  const ast = parseCode(code);
  const imports = [];
  const declarations = new Map();
  for (const node of ast.program.body) {
    if (node.type === 'ImportDeclaration') {
      for (const specifier of node.specifiers) {
        imports.push({
          local: specifier.local.name,
          imported: specifier.type === 'ImportSpecifier' ? specifier.imported.name : null,
          kind: specifier.type,
          typeOnly: node.importKind === 'type' || specifier.importKind === 'type',
          from: node.source.value,
        });
      }
    } else {
      const declaration = node.type === 'ExportNamedDeclaration' ? node.declaration : node;
      if (!declaration) continue;
      const name = declaration.id?.name ?? declaration.declarations?.[0]?.id?.name;
      if (name) declarations.set(name, code.slice(declaration.start, declaration.end));
    }
  }
  return { imports, declarations };
}

function importText(specifiers) {
  const groups = new Map();
  for (const s of specifiers) {
    const key = `${s.from}:${!!s.typeOnly}:${s.kind === 'ImportNamespaceSpecifier'}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()]
    .map((group) => {
      const named = group
        .filter((s) => s.kind === 'ImportSpecifier')
        .map((s) => `${s.imported}${s.imported !== s.local ? ` as ${s.local}` : ''}`);
      const bindings = group
        .filter((s) => s.kind !== 'ImportSpecifier')
        .map((s) => (s.kind === 'ImportNamespaceSpecifier' ? `* as ${s.local}` : s.local));
      if (named.length) bindings.push(`{ ${named.join(', ')} }`);
      return `import ${group[0].typeOnly ? 'type ' : ''}${bindings.join(', ')} from '${group[0].from}';`;
    })
    .join('\n');
}

// Follow actual lexical bindings, including JSX and type references, rather than
// copying a category's imports or every helper into every example.
function dependenciesFor(entry, imports, declarations) {
  const code = `${importText(imports)}\n${[...declarations.values()].join('\n\n')}`;
  const ast = parseCode(code);
  const needed = new Set();
  traverse(ast, {
    Program(program) {
      function visit(name) {
        if (needed.has(name)) return;
        needed.add(name);
        const binding = program.scope.getBinding(name);
        if (
          !binding ||
          binding.path.isImportSpecifier() ||
          binding.path.isImportDefaultSpecifier() ||
          binding.path.isImportNamespaceSpecifier()
        )
          return;
        binding.path.traverse({
          'Identifier|JSXIdentifier'(path) {
            // JSX prop names (such as animate) and object keys are not imports.
            if (!path.isReferenced()) return;
            const dependency = path.node.name;
            if (dependency === name) return;
            const rootBinding = program.scope.getBinding(dependency);
            if (rootBinding && path.scope.getBinding(dependency) === rootBinding) visit(dependency);
          },
        });
      }
      visit(entry);
      program.stop();
    },
  });
  return {
    imports: imports.filter((s) => needed.has(s.local)),
    body: [...declarations]
      .filter(([name]) => needed.has(name))
      .map(([, text]) => text)
      .join('\n\n'),
  };
}

function componentCss(id, body, demoCss, appCss) {
  const scope = `.pattern-${id}`;
  const root = postcss.root();
  const tokens = appCss.nodes.find((node) => node.type === 'rule' && node.selector === ':root');
  const darkTokens = appCss.nodes.find(
    (node) => node.type === 'rule' && node.selector === "[data-theme='dark']",
  );
  const theme = postcss.rule({ selector: scope });
  for (const node of tokens.nodes) if (node.prop?.startsWith('--')) theme.append(node.clone());
  theme.append(
    postcss.parse(
      `font-family: 'DM Sans Variable', system-ui, sans-serif; font-size: 14px; line-height: normal; color: var(--text);`,
    ).nodes,
  );
  root.append(theme);
  if (darkTokens) {
    const dark = postcss.rule({ selector: `[data-theme='dark'] ${scope}` });
    for (const node of darkTokens.nodes) if (node.prop?.startsWith('--')) dark.append(node.clone());
    root.append(dark);
  }
  root.append(
    postcss.parse(`
    ${scope}[data-pattern-root] { width: 100%; min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr); justify-items: center; }
    ${scope}, ${scope} *, ${scope} *::before, ${scope} *::after { box-sizing: border-box; }
    ${scope} :where(button, input, select, textarea) { font: inherit; color: inherit; max-width: 100%; }
    ${scope} button { cursor: pointer; border: 0; background: none; }
    ${scope} button:disabled { cursor: not-allowed; opacity: .45; }
    ${scope} :where(button, a) { touch-action: manipulation; }
    ${scope} a { color: inherit; text-decoration: none; }
    ${scope} :where(input, textarea) { min-width: 0; }
    ${scope} :where(input, textarea)::placeholder { color: var(--faint); }
    ${scope} input[type='range'] { accent-color: var(--accent); }
    ${scope} :where(h1, h2, h3, p) { margin: 0; }
    ${scope} svg { flex-shrink: 0; }
    ${scope} small { font-size: 11px; }
    ${scope} :where(button, a, input, textarea, select, [tabindex]):focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
    ${scope} .sr-only { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important; }
  `).nodes,
  );

  const dynamicPrefixes = [...body.matchAll(/(?:className=\{`|\s)([\w-]+-)\$\{/g)].map((m) => m[1]);
  function scopeSelector(selector) {
    const themePrefix = selector.match(/^\[data-theme=['"]dark['"]\]\s*/)?.[0];
    return themePrefix
      ? `${themePrefix}${scope} ${selector.slice(themePrefix.length)}`
      : `${scope} ${selector}`;
  }
  function filter(node) {
    if (node.type === 'rule') {
      const selectors = [];
      selectorParser((parsed) => {
        parsed.each((selector) => {
          let anchor;
          selector.walkClasses((classNode) => {
            anchor ??= classNode.value;
          });
          if (
            (anchor &&
              (body.includes(anchor) ||
                dynamicPrefixes.some((prefix) => anchor.startsWith(prefix)))) ||
            (body.includes('Command.') && selector.toString().includes('[cmdk-'))
          ) {
            selectors.push(scopeSelector(selector.toString().trim()));
          }
        });
      }).processSync(node.selector);
      return selectors.length ? node.clone({ selector: selectors.join(',\n') }) : null;
    }
    if (node.type === 'atrule' && node.name !== 'keyframes' && node.nodes) {
      const copy = node.clone({ nodes: [] });
      for (const child of node.nodes) {
        const kept = filter(child);
        if (kept) copy.append(kept);
      }
      return copy.nodes.length ? copy : null;
    }
    return null;
  }
  for (const node of demoCss.nodes) {
    const kept = filter(node);
    if (kept) root.append(kept);
  }
  if (body.includes('.Portal')) {
    root.append(
      postcss.parse(`${scope}[data-base-ui-portal] { position: relative; z-index: 250; }`).nodes,
    );
  }
  // Namespace animations too: multiple copied patterns can coexist safely.
  demoCss.walkAtRules('keyframes', (animation) => {
    const name = animation.params;
    const reference = new RegExp(`\\b${name}\\b`, 'g');
    let used = false;
    root.walkDecls(/^animation(?:-name)?$/, (declaration) => {
      if (declaration.value.split(/[\s,]+/).includes(name)) {
        used = true;
        declaration.value = declaration.value.replace(reference, `${id}-${name}`);
      }
    });
    if (used) root.append(animation.clone({ params: `${id}-${name}` }));
  });
  root.append(
    postcss.parse(`@media (prefers-reduced-motion: reduce) {
    ${scope} *, ${scope} *::before, ${scope} *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; scroll-behavior: auto !important; }
  }`).nodes,
  );
  return root.toString();
}

export async function generatePatternSources(rootDir = process.cwd()) {
  const contents = Object.fromEntries(
    await Promise.all(
      sourceInputs.map(async (file) => [file, await readFile(resolve(rootDir, file), 'utf8')]),
    ),
  );
  const modules = Object.fromEntries(
    categories.map((name) => [name, moduleParts(contents[`src/demos/${name}.tsx`])]),
  );
  const shared = moduleParts(contents['src/demos/shared.tsx']);
  const demoCss = postcss.parse(contents['src/demos/demos.css']);
  const appCss = postcss.parse(contents['src/styles.css']);
  const versions = JSON.parse(contents['package.json']).dependencies;
  const registry = parseCode(contents['src/demos/registry.ts']);
  let entries;
  traverse(registry, {
    VariableDeclarator(path) {
      if (path.node.id.name === 'demos')
        entries = path.node.init.properties.map((p) => ({
          id: p.key.value ?? p.key.name,
          category: p.value.object.name.toLowerCase(),
          name: p.value.property.name,
        }));
    },
  });
  return Object.fromEntries(
    await Promise.all(
      entries.map(async ({ id, category, name }) => {
        const module = modules[category];
        const available = new Map();
        for (const specifier of [...module.imports, ...shared.imports]) {
          if (!specifier.from.startsWith('.')) available.set(specifier.local, specifier);
        }
        const declarations = new Map([...shared.declarations, ...module.declarations]);
        const selected = dependenciesFor(name, [...available.values()], declarations);
        const usesMotion = selected.imports.some((s) => s.from === 'motion/react');
        const usesToast = selected.imports.some((s) => s.local === 'toast' && s.from === 'sonner');
        const imports = [...selected.imports];
        if (usesMotion)
          imports.push({
            local: 'MotionConfig',
            imported: 'MotionConfig',
            kind: 'ImportSpecifier',
            from: 'motion/react',
          });
        if (usesToast)
          imports.push({
            local: 'Toaster',
            imported: 'Toaster',
            kind: 'ImportSpecifier',
            from: 'sonner',
          });
        if (selected.body.includes('React.'))
          imports.push({
            local: 'React',
            kind: 'ImportNamespaceSpecifier',
            typeOnly: true,
            from: 'react',
          });
        const packages = [
          ...new Set(
            imports.map((s) =>
              s.from.startsWith('@')
                ? s.from.split('/').slice(0, 2).join('/')
                : s.from.split('/')[0],
            ),
          ),
        ]
          .filter((p) => p !== 'react')
          .sort();
        const install = packages.length
          ? `npm install ${packages.map((p) => `${p}@${versions[p]}`).join(' ')}`
          : '';
        const css = componentCss(id, selected.body, demoCss, appCss);
        const content = selected.body
          .replace(`function ${name}(`, 'function PatternContent(')
          .replace(/<(Dialog|Menu|ContextMenu)\.Portal>/g, `<$1.Portal className="pattern-${id}">`);
        const cssLiteral = css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
        const code = `'use client';
      ${importText(imports)}

      // Save as ${name}.tsx in your React + TypeScript project.
      // ${install || 'No additional packages needed beyond React.'}
      // Usage: import { ${name} } from './${name}'; then render <${name} />.
      export function ${name}() {
        return (${usesMotion ? '<MotionConfig reducedMotion="user">' : '<>'}
          <style>{styles}</style>
          <div className="pattern-${id}" data-pattern-root="">
            <PatternContent />
            ${usesToast ? '<Toaster position="bottom-right" closeButton richColors />' : ''}
          </div>
        ${usesMotion ? '</MotionConfig>' : '</>'});
      }

      ${content}

      // Scoped styles and theme values: no separate CSS or helper files needed.
      const styles = \`${cssLiteral}\`;
    `;
        const source = await format(code, {
          parser: 'typescript',
          singleQuote: true,
          printWidth: 96,
        });
        return [
          id,
          {
            name,
            filename: `${name}.tsx`,
            install,
            packages,
            usage: `import { ${name} } from './${name}';\n\nexport default function App() {\n  return <${name} />;\n}`,
            source,
          },
        ];
      }),
    ),
  );
}

export function patternSourcesPlugin() {
  const virtualId = 'virtual:pattern-sources';
  const resolvedId = `\0${virtualId}`;
  const entryPrefix = 'virtual:pattern-source/';
  let rootDir;
  let pending;
  const getSources = () => (pending ??= generatePatternSources(rootDir));
  return {
    name: 'standalone-pattern-sources',
    configResolved(config) {
      rootDir = config.root;
    },
    resolveId(id) {
      if (id === virtualId) return resolvedId;
      if (id.startsWith(entryPrefix)) return `\0${id}`;
    },
    async load(id) {
      if (id !== resolvedId && !id.startsWith(`\0${entryPrefix}`)) return;
      for (const file of sourceInputs) this.addWatchFile(resolve(rootDir, file));
      const sources = await getSources();
      if (id !== resolvedId)
        return `export default ${JSON.stringify(sources[id.slice(entryPrefix.length + 1)].source)};`;
      const metadata = Object.fromEntries(
        Object.entries(sources).map(([key, { source, ...entry }]) => [key, entry]),
      );
      const loaders = Object.keys(sources)
        .map((key) => `${JSON.stringify(key)}: () => import(${JSON.stringify(entryPrefix + key)})`)
        .join(',');
      return `export const standaloneSources = ${JSON.stringify(metadata)}; export const sourceLoaders = {${loaders}};`;
    },
    handleHotUpdate({ file, server }) {
      if (!sourceInputs.some((input) => resolve(rootDir, input) === file)) return;
      pending = undefined;
      for (const module of server.moduleGraph.idToModuleMap.values()) {
        if (module.id === resolvedId || module.id?.startsWith(`\0${entryPrefix}`))
          server.moduleGraph.invalidateModule(module);
      }
      server.ws.send({ type: 'full-reload' });
    },
  };
}
