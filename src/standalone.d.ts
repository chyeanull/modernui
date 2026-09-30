declare module 'virtual:pattern-sources' {
  export const standaloneSources: Record<
    string,
    {
      name: string;
      filename: string;
      install: string;
      packages: string[];
      usage: string;
    }
  >;
  export const sourceLoaders: Record<string, () => Promise<{ default: string }>>;
}
