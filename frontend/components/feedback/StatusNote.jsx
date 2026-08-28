import React from "react";
import { Icon } from "../media/Icon.jsx";

/**
 * A tiny inline status line (icon + label) for commit
 * confirmation, connectivity, and helper hints. tone: neutral |
 * success | warning | error | info | accent.
 */
const NOTE = {
  neutral: { color: "var(--color-text-secondary)", icon: null },
  accent:  { color: "var(--color-accent-primary)", icon: null },
  success: { color: "var(--color-state-success)",  icon: "check" },
  warning: { color: "var(--color-state-warning)",  icon: "warn" },
  error:   { color: "var(--color-state-error)",    icon: "error" },
  info:    { color: "var(--color-state-info)",     icon: "warn" },
};

export function StatusNote({ tone = "neutral", icon, mono = true, children, style, ...rest }) {
  const t = NOTE[tone] || NOTE.neutral;
  const showIcon = icon || t.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
        fontSize: "var(--text-micro)",
        letterSpacing: "var(--tracking-wide)",
        color: t.color,
        ...style,
      }}
      {...rest}
    >
      {showIcon && <Icon name={showIcon} size={13} />}
      {children}
    </span>
  );
}
