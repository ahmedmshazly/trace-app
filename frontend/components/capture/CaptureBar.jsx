import React from "react";
import { Kbd } from "../core/Kbd.jsx";

/**
 * CaptureBar — the heartbeat. A sticky, focused-on-load input that
 * grows to fit multi-line text. No toolbar, no buttons: the keyboard
 * is the whole interface. Shows an anchored/draft status + affordances.
 */
export function CaptureBar({
  value,
  onChange,
  placeholder = "What just happened?",
  status = "anchored · Today",
  draftSaved = false,
  autoFocus = true,
  onCommit,
  style,
  ...rest
}) {
  const ref = React.useRef(null);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onCommit && String(value || "").trim()) onCommit(value);
    }
  }

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [value]);

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "var(--border-width) solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "12px 14px 10px",
        boxShadow: "var(--shadow-sm)",
        ...style,
      }}
      {...rest}
    >
      <textarea
        ref={ref}
        className="trace-capture"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={1}
        aria-label="Capture a moment"
        style={{
          display: "block",
          width: "100%",
          border: "none",
          outline: "none",
          resize: "none",
          background: "transparent",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-lg)",
          lineHeight: "var(--leading-normal)",
          overflow: "hidden",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "8px",
          gap: "12px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-micro)",
            color: draftSaved ? "var(--color-state-warning)" : "var(--color-text-secondary)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: draftSaved ? "var(--color-state-warning)" : "var(--color-accent-primary)",
            }}
          />
          {draftSaved ? "draft saved" : status}
        </span>
        <span style={{ display: "inline-flex", gap: "10px", alignItems: "center" }}>
          <Kbd muted>⏎ commit</Kbd>
          <Kbd muted>⇧⏎ newline</Kbd>
        </span>
      </div>
      <style>{`.trace-capture::placeholder { color: var(--color-text-muted); }`}</style>
    </div>
  );
}
