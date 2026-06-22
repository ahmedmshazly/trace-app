import React from "react";
import { IconButton } from "../core/IconButton.jsx";
import { Icon } from "../media/Icon.jsx";

/**
 * Dialog — a focused modal sheet lifted off a dimmed scrim. Used for
 * confirmations and the danger-zone "type to confirm" flows. Quiet by
 * default; `tone="danger"` arms the destructive treatment. Esc and a
 * scrim click both dismiss (unless dismissible={false}).
 */
export function Dialog({
  open = false,
  title,
  description,
  tone = "neutral", // neutral | danger
  icon,
  actions,
  dismissible = true,
  onClose,
  children,
  width = 440,
  style,
  ...rest
}) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && dismissible && onClose) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  const tint =
    tone === "danger" ? "var(--color-state-error)" : "var(--color-accent-primary)";
  const headIcon = icon || (tone === "danger" ? "warn" : null);

  return (
    <div
      onMouseDown={() => dismissible && onClose && onClose()}
      className="trace-dialog-scrim"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--z-overlay)",
        background: "var(--color-scrim)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className="trace-dialog-sheet"
        style={{
          width: `min(${width}px, 100%)`,
          background: "var(--color-elevated)",
          border: "var(--border-width) solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          ...style,
        }}
        {...rest}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "22px 22px 0" }}>
          {headIcon && (
            <span
              style={{
                flex: "0 0 auto",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: tone === "danger" ? "rgba(235,138,156,0.14)" : "var(--color-accent-soft)",
                color: tint,
              }}
            >
              <Icon name={headIcon} size={20} />
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: "var(--weight-bold)",
                  fontSize: "var(--text-title)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                style={{
                  fontSize: "var(--text-meta)",
                  lineHeight: "var(--leading-normal)",
                  color: "var(--color-text-muted)",
                  margin: "6px 0 0",
                }}
              >
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <span style={{ flex: "0 0 auto", marginRight: "-6px", marginTop: "-4px" }}>
              <IconButton icon="close" label="Close" onClick={onClose} />
            </span>
          )}
        </div>

        {children && (
          <div style={{ padding: "16px 22px 0", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
            {children}
          </div>
        )}

        {actions && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              padding: "22px",
            }}
          >
            {actions}
          </div>
        )}
      </div>
      <style>{`
        @keyframes trace-dialog-rise {
          from { transform: translateY(8px) scale(0.985); }
          to { transform: translateY(0) scale(1); }
        }
        /* Transform-only entrance: opacity stays 1 so a frozen frame-0 capture
           (DS thumbnail, html-to-image) still shows the sheet. Motion-gated. */
        @media (prefers-reduced-motion: no-preference) {
          .trace-dialog-sheet { animation: trace-dialog-rise var(--duration-base) var(--ease-out) both; }
        }
      `}</style>
    </div>
  );
}
