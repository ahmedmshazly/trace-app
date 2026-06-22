import React from "react";
import { Icon } from "../media/Icon.jsx";

/**
 * Banner — an inline, non-modal notice with an optional action pair.
 * Used for draft restore (warning) and other in-context messages.
 * Never color alone: each tone pairs an icon with its message.
 * tone: info | success | warning | error
 */
const TONE = {
  info:    { color: "var(--color-state-info)",    icon: "warn" },
  success: { color: "var(--color-state-success)", icon: "check" },
  warning: { color: "var(--color-state-warning)", icon: "warn" },
  error:   { color: "var(--color-state-error)",   icon: "error" },
};

export function Banner({
  tone = "warning",
  title,
  children,
  actions,
  icon,
  style,
  ...rest
}) {
  const t = TONE[tone] || TONE.info;
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "12px 14px",
        background: "var(--color-surface)",
        border: `var(--border-width) solid ${t.color}`,
        borderRadius: "var(--radius-md)",
        ...style,
      }}
      {...rest}
    >
      <span style={{ color: t.color, paddingTop: "1px" }}>
        <Icon name={icon || t.icon} size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-primary)",
              marginBottom: children ? "2px" : 0,
            }}
          >
            {title}
          </div>
        )}
        {children && (
          <div style={{ fontSize: "var(--text-meta)", color: "var(--color-text-secondary)" }}>
            {children}
          </div>
        )}
      </div>
      {actions && (
        <div style={{ display: "inline-flex", gap: "6px", flex: "0 0 auto" }}>{actions}</div>
      )}
    </div>
  );
}
