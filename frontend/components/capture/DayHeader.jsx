import React from "react";

/**
 * DayHeader — recedes via size + letter-spacing (not hue). Relative
 * labels (Today / Yesterday) then dates. The body, not the header,
 * is the loudest element on the timeline.
 */
export function DayHeader({ label, count, style, ...rest }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "10px",
        padding: "var(--space-6) 0 var(--space-2)",
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-meta)",
          fontWeight: "var(--weight-semibold)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-header)",
          color: "var(--color-day-header)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          height: "1px",
          background: "var(--color-border)",
          opacity: 0.6,
        }}
      />
      {count != null && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-micro)",
            color: "var(--color-text-muted)",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
