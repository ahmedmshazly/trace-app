import type * as ReactNS from 'react';
import type * as ReactDOMNS from 'react-dom';
import type { Root } from 'react-dom/client';
import type { ReactNode } from 'react';

/** Minimal surface of the Trace design-system global bundle. */
// Components are intentionally `any` — the precompiled DS bundle is untyped;
// screens still type their own state and API DTOs (audit FR-005).
export type DsComponent = (props: any) => ReactNode;

export interface TraceDesignSystem {
  Logo: DsComponent;
  Button: DsComponent;
  IconButton: DsComponent;
  Kbd: DsComponent;
  Icon: DsComponent;
  CaptureBar: DsComponent;
  TimelineEntry: DsComponent;
  DayHeader: DsComponent;
  TagPill: DsComponent;
  Banner: DsComponent;
  StatusNote: DsComponent;
  SegmentedToggle: DsComponent;
  Switch: DsComponent;
  Select: DsComponent;
  TextField: DsComponent;
  Toast: DsComponent;
  ToastViewport: DsComponent;
  Dialog: DsComponent;
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
