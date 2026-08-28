import React from "react";
import { Icon } from "../media/Icon.jsx";

/**
 * A transient, self-dismissing notice that slides up from the
 * bottom. Quiet confirmations ("Entry committed"), never modal. Pairs
 * an icon with the message, never color alone. Use <ToastViewport> to
 * stack several; a single Toast also renders fine on its own.
 * tone: success | info | warning | error
 */
const TONES = {
  success: { icon: "check", color: "var(--color-state-success)" },
  info: { icon: "clock", color: "var(--color-state-info)" },
  warning: { icon: "warn", color: "var(--color-state-warning)" },
  error: { icon: "error", color: "var(--color-state-error)" },
};

export function Toast({ tone = "info", title, action, onDismiss, children, style, ...rest }) {
  const t = TONES[tone] || TONES.info;
  return (
    <div
      role="status"
      className="trace-toast"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        width: "min(360px, 92vw)",
        padding: "13px 14px",
        background: "var(--color-elevated)",
        border: "var(--border-width) solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        ...style,
      }}
      {...rest}
    >
      <span style={{ flex: "0 0 auto", color: t.color, marginTop: "1px" }}>
        <Icon name={t.icon} size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-primary)",
              lineHeight: "var(--leading-snug)",
            }}
          >
            {title}
          </div>
        )}
        {children && (
          <div
            style={{
              fontSize: "var(--text-meta)",
              color: "var(--color-text-muted)",
              marginTop: title ? "2px" : 0,
              lineHeight: "var(--leading-normal)",
            }}
          >
            {children}
          </div>
        )}
      </div>
      {action && <div style={{ flex: "0 0 auto" }}>{action}</div>}
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="trace-toast-x"
          style={{
            flex: "0 0 auto",
            display: "inline-flex",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            padding: "2px",
            marginRight: "-2px",
          }}
        >
          <Icon name="close" size={15} />
        </button>
      )}
      <style>{`
        @keyframes trace-toast-in {
          from { transform: translateY(10px); }
          to { transform: translateY(0); }
        }
        /* Transform-only entrance: opacity stays 1 so a frozen frame-0 capture still shows the toast. */
        @media (prefers-reduced-motion: no-preference) {
          .trace-toast { animation: trace-toast-in var(--duration-base) var(--ease-out) both; }
        }
        .trace-toast-x:hover { color: var(--color-text-primary); }
      `}</style>
    </div>
  );
}

/**
 * ToastViewport is the fixed bottom-center stack for several Toasts.
 */
export function ToastViewport({ position = "bottom", children, style }) {
  const vertical = position === "top" ? { top: "24px" } : { bottom: "24px" };
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "var(--z-toast)",
        display: "flex",
        flexDirection: position === "top" ? "column" : "column-reverse",
        gap: "10px",
        alignItems: "center",
        pointerEvents: "none",
        ...vertical,
        ...style,
      }}
    >
      <div style={{ display: "contents", pointerEvents: "auto" }}>{children}</div>
    </div>
  );
}
