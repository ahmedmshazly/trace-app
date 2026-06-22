import React from "react";

/**
 * Kbd — a keyboard glyph/hint chip. Trace surfaces shortcuts as
 * first-class copy (⏎ commit · ⌘K search). Use inline in hints.
 * muted: render as faint inline text (no chip) for affordance rows.
 */
export function Kbd({ children, muted = false, style, ...rest }) {
  if (muted) {
    return (
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-micro)",
          color: "var(--color-text-muted)",
          letterSpacing: "var(--tracking-wide)",
          ...style,
        }}
        {...rest}
      >
        {children}
      </span>
    );
  }
  return (
    <kbd
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        minWidth: "18px",
        height: "20px",
        padding: "0 6px",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-micro)",
        fontWeight: "var(--weight-medium)",
        color: "var(--color-text-secondary)",
        background: "var(--color-elevated)",
        border: "var(--border-width) solid var(--color-border)",
        borderRadius: "var(--radius-xs)",
        boxShadow: "0 1px 0 var(--color-border)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </kbd>
  );
}
