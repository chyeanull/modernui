import type { Plugin } from 'vite';
export type StandaloneSource = {
  name: string;
  filename: string;
  install: string;
  packages: string[];
  usage: string;
  source: string;
};
export const sourceInputs: string[];
export function generatePatternSources(rootDir?: string): Promise<Record<string, StandaloneSource>>;
export function patternSourcesPlugin(): Plugin;
