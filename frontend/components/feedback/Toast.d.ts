import * as React from "react";

/**
 * Transient, self-dismissing notice that slides up from the bottom.
 * Pairs an icon with the message, never color alone.
 */
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "success" | "info" | "warning" | "error";
  title?: React.ReactNode;
  /** Right-aligned inline action (e.g. an Undo button). */
  action?: React.ReactNode;
  /** Render a dismiss × when provided. */
  onDismiss?: () => void;
}

export function Toast(props: ToastProps): JSX.Element;

export interface ToastViewportProps {
  position?: "top" | "bottom";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function ToastViewport(props: ToastViewportProps): JSX.Element;
