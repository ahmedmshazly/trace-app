import React from "react";
import { Icon } from "../media/Icon.jsx";

/**
 * IconButton — square, label-only-by-aria control for row actions,
 * toolbars and the app bar. tone: default | accent | danger.
 */
export function IconButton({
  icon,
  label,
  size = "md",
  tone = "default",
  active = false,
  disabled = false,
  style,
  ...rest
}) {
  const box = { sm: 28, md: 34, lg: 40 }[size];
  const iconSize = { sm: 16, md: 18, lg: 20 }[size];

  const toneColor = {
    default: "var(--color-text-secondary)",
    accent: "var(--color-accent-primary)",
    danger: "var(--color-state-error)",
  }[tone];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      data-tone={tone}
      className="trace-iconbtn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: box,
        height: box,
        padding: 0,
        color: toneColor,
        background: active ? "var(--color-hover-wash)" : "transparent",
        border: "var(--border-width) solid transparent",
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition:
          "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)",
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={iconSize} />
      <style>{`
        .trace-iconbtn:not(:disabled):hover { background: var(--color-hover-wash); }
        .trace-iconbtn[data-tone="default"]:not(:disabled):hover { color: var(--color-text-primary); }
        .trace-iconbtn[data-tone="danger"]:not(:disabled):hover { color: var(--color-state-error); }
      `}</style>
    </button>
  );
}
