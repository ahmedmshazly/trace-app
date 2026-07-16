import type * as ReactNS from 'react';
import type * as ReactDOMNS from 'react-dom';
import type { Root } from 'react-dom/client';
import type { ReactNode } from 'react';

/** Minimal surface of the Trace design-system global bundle. */
export interface TraceDesignSystem {
  Logo: (props: Record<string, unknown>) => ReactNode;
  Button: (props: Record<string, unknown>) => ReactNode;
  IconButton: (props: Record<string, unknown>) => ReactNode;
  Kbd: (props: Record<string, unknown>) => ReactNode;
  Icon: (props: Record<string, unknown>) => ReactNode;
  CaptureBar: (props: Record<string, unknown>) => ReactNode;
  TimelineEntry: (props: Record<string, unknown>) => ReactNode;
  DayHeader: (props: Record<string, unknown>) => ReactNode;
  TagPill: (props: Record<string, unknown>) => ReactNode;
  Banner: (props: Record<string, unknown>) => ReactNode;
  StatusNote: (props: Record<string, unknown>) => ReactNode;
  SegmentedToggle: (props: Record<string, unknown>) => ReactNode;
  Switch: (props: Record<string, unknown>) => ReactNode;
  Select: (props: Record<string, unknown>) => ReactNode;
  TextField: (props: Record<string, unknown>) => ReactNode;
  Toast: (props: Record<string, unknown>) => ReactNode;
  ToastViewport: (props: Record<string, unknown>) => ReactNode;
  Dialog: (props: Record<string, unknown>) => ReactNode;
  [key: string]: unknown;
}

interface ReactDOMGlobal extends Omit<typeof ReactDOMNS, 'default'> {
  createRoot: (container: Element | DocumentFragment) => Root;
}

declare global {
  // Classic global React provided by vendored UMD scripts (see src/main.tsx).
  var React: typeof ReactNS;
  var ReactDOM: ReactDOMGlobal;

  interface Window {
    React: typeof ReactNS;
    ReactDOM: ReactDOMGlobal;
    TRACE_UI: TraceDesignSystem;
  }
}

export {};
