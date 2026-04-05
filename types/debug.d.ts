declare module 'debug' {
  type Debugger = ((formatter: unknown, ...args: unknown[]) => void) & {
    enabled: boolean;
    extend(namespace: string, delimiter?: string): Debugger;
  };

  interface DebugModule {
    (namespace: string): Debugger;
    disable(): string;
    enable(namespaces: string): void;
    enabled(namespace: string): boolean;
    log: (...args: unknown[]) => void;
  }

  const debug: DebugModule;
  export = debug;
}
