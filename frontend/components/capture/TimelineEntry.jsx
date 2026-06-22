import React from "react";
import { EntryActions } from "./EntryActions.jsx";

/**
 * TimelineEntry — one row of the record (also reused for search
 * results). The body is the loudest element; the timestamp recedes.
 * Inline #tags are emphasized in the secondary accent. Actions
 * reveal on hover/focus. `state`: default | new (just committed) | dim.
 */
function renderBody(body) {
  const parts = String(body).split(/(#[A-Za-z0-9_-]+)/g);
  return parts.map((p, i) =>
    /^#[A-Za-z0-9_-]+$/.test(p) ? (
      <span
        key={i}
        style={{ color: "var(--color-accent-secondary)", fontWeight: "var(--weight-medium)" }}
      >
        {p}
      </span>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    )
  );
}

export function TimelineEntry({
  time,
  body,
  state = "default",
  locked = false,
  onEdit,
  onAdjustTime,
  onDelete,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const isNew = state === "new";
  const dim = state === "dim";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        background: hover ? "var(--color-hover-wash)" : "transparent",
        opacity: dim ? 0.4 : 1,
        transition: "background var(--duration-fast) var(--ease-standard), opacity var(--duration-base) var(--ease-standard)",
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          flex: "0 0 auto",
          width: "62px",
          paddingTop: "2px",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-meta)",
          lineHeight: "var(--leading-meta)",
          color: isNew ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        {isNew ? "just now" : time}
        {locked && <span title="created time is locked" style={{ marginLeft: 4, opacity: 0.6 }}>🔒</span>}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-entry-size)",
          lineHeight: "var(--text-entry-leading)",
          color: "var(--color-text-primary)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {renderBody(body)}
      </div>

      <div style={{ flex: "0 0 auto" }}>
        <EntryActions
          visible={hover}
          onEdit={onEdit}
          onAdjustTime={onAdjustTime}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
