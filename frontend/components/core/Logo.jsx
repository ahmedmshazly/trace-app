import React from "react";

/**
 * The Trace lockup: the "anchored-moment" mark (a vertical
 * timeline line with a dot = a moment anchored in time) + the
 * lowercase "trace" wordmark in the serif. Single source of truth
 * so the final mark is a one-place swap.
 */
export function Logo({
  size = 28,
  showMark = true,
  showWordmark = true,
  tone = "default", // "default" | "mono" | "reverse"
  style,
  ...rest
}) {
  const markColor =
    tone === "reverse"
      ? "var(--color-text-on-accent, #e9ebee)"
      : "var(--color-text-primary)";
  const dotColor =
    tone === "mono" || tone === "reverse"
      ? markColor
      : "var(--color-accent-primary)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${Math.round(size * 0.32)}px`,
        color: markColor,
        ...style,
      }}
      {...rest}
    >
      {showMark && (
        <svg
          viewBox="0 0 120 120"
          width={size}
          height={size}
          fill="none"
          aria-hidden="true"
          style={{ display: "block", flex: "0 0 auto" }}
        >
          <line
            x1="60" y1="22" x2="60" y2="100"
            stroke={markColor} strokeWidth="10" strokeLinecap="round"
          />
          <circle cx="60" cy="46" r="17" fill={dotColor} />
        </svg>
      )}
      {showWordmark && (
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: "var(--weight-bold)",
            fontSize: `${Math.round(size * 1.05)}px`,
            lineHeight: 1,
            letterSpacing: "var(--tracking-tight)",
          }}
        >
          trace
        </span>
      )}
    </span>
  );
}
