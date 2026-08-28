import React from "react";

/**
 * A 2-3 option segmented control. Used for the
 * Appearance Light/Dark switch and export format/scope choices.
 * "Dark is first-class, not an afterthought."
 */
export function SegmentedToggle({
  options = [],
  value,
  onChange,
  size = "md",
  style,
  ...rest
}) {
  const pad = size === "sm" ? "5px 12px" : "8px 16px";
  const fontSize = size === "sm" ? "var(--text-meta)" : "var(--text-sm)";

  return (
    <div
      role="tablist"
      style={{
        display: "inline-flex",
        padding: "3px",
        gap: "2px",
        background: "var(--color-base)",
        border: "var(--border-width) solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        ...style,
      }}
      {...rest}
    >
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const lbl = typeof opt === "string" ? opt : opt.label;
        const selected = val === value;
        return (
          <button
            key={val}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange && onChange(val)}
            style={{
              padding: pad,
              fontFamily: "var(--font-body)",
              fontSize,
              fontWeight: "var(--weight-medium)",
              letterSpacing: "var(--tracking-wide)",
              color: selected ? "var(--color-text-primary)" : "var(--color-text-muted)",
              background: selected ? "var(--color-surface)" : "transparent",
              border: `var(--border-width) solid ${selected ? "var(--color-border)" : "transparent"}`,
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard)",
            }}
          >
            {lbl}
          </button>
        );
      })}
    </div>
  );
}
