import React from "react";

/**
 * An inline #tag chip parsed from an entry body. Never
 * color alone: the `#` glyph + pill shape carry the meaning too.
 * Optionally shows a count (used in the tag index / ⌘K jump list).
 */
export function TagPill({
  label,
  count,
  active = false,
  as = "span",
  onClick,
  style,
  ...rest
}) {
  const Tag = onClick ? "button" : as;
  const clean = String(label).replace(/^#/, "");
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: count != null ? "2px 8px 2px 7px" : "2px 9px",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-meta)",
        fontWeight: "var(--weight-medium)",
        lineHeight: "var(--leading-meta)",
        color: "var(--color-accent-secondary)",
        background: active ? "var(--color-accent-soft)" : "var(--color-tag-pill-bg)",
        border: "var(--border-width) solid transparent",
        borderRadius: "var(--radius-pill)",
        cursor: onClick ? "pointer" : "default",
        verticalAlign: "baseline",
        ...style,
      }}
      {...rest}
    >
      <span style={{ opacity: 0.7 }}>#</span>
      <span>{clean}</span>
      {count != null && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-micro)",
            color: "var(--color-text-muted)",
            marginLeft: "1px",
          }}
        >
          {count}
        </span>
      )}
    </Tag>
  );
}
