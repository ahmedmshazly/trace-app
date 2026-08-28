import React from "react";
import { Icon } from "../media/Icon.jsx";

/**
 * The action primitive. The teal accent is rationed:
 * use `primary` only for the one commit/CTA on a surface.
 * variants: primary | secondary | ghost | danger
 * sizes: sm | md | lg
 */
export function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  fullWidth = false,
  disabled = false,
  children,
  style,
  ...rest
}) {
  const pad = {
    sm: "6px 12px",
    md: "9px 16px",
    lg: "12px 22px",
  }[size];
  const fontSize = {
    sm: "var(--text-meta)",
    md: "var(--text-sm)",
    lg: "var(--text-body)",
  }[size];

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: fullWidth ? "100%" : undefined,
    padding: pad,
    fontFamily: "var(--font-body)",
    fontSize,
    fontWeight: "var(--weight-medium)",
    lineHeight: 1.1,
    letterSpacing: "var(--tracking-wide)",
    borderRadius: "var(--radius-md)",
    border: "var(--border-width) solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition:
      "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)",
    WebkitAppearance: "none",
    appearance: "none",
  };

  const variants = {
    primary: {
      background: "var(--color-accent-primary)",
      color: "var(--color-text-on-accent)",
      borderColor: "var(--color-accent-primary)",
    },
    secondary: {
      background: "var(--color-surface)",
      color: "var(--color-text-primary)",
      borderColor: "var(--color-border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-text-secondary)",
      borderColor: "transparent",
    },
    danger: {
      background: "transparent",
      color: "var(--color-state-error)",
      borderColor: "var(--color-state-error)",
    },
  };

  const iconSize = size === "lg" ? 18 : 16;

  return (
    <button
      type="button"
      disabled={disabled}
      data-variant={variant}
      className="trace-btn"
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
      <style>{`
        .trace-btn[data-variant="primary"]:not(:disabled):hover { filter: brightness(1.06); }
        .trace-btn[data-variant="secondary"]:not(:disabled):hover { border-color: var(--color-accent-primary); background: var(--color-hover-wash); }
        .trace-btn[data-variant="ghost"]:not(:disabled):hover { background: var(--color-hover-wash); color: var(--color-text-primary); }
        .trace-btn[data-variant="danger"]:not(:disabled):hover { background: var(--color-state-error); color: var(--color-text-on-accent); }
        .trace-btn:not(:disabled):active { transform: translateY(0.5px); }
      `}</style>
    </button>
  );
}
