import React from "react";
import { Icon } from "../media/Icon.jsx";

/**
 * A square multi-select control (export scopes, filter toggles,
 * "remember me"). Pairs a clear box with an optional label + description.
 * Supports an `indeterminate` state for "select all" parents. The teal
 * fill appears only when checked, meaning "included".
 */
export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  description,
  id,
  style,
  ...rest
}) {
  const fieldId = id || (label ? `cb-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const on = checked || indeterminate;

  const box = (
    <button
      type="button"
      role="checkbox"
      id={fieldId}
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={!label ? rest["aria-label"] : undefined}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      className="trace-checkbox"
      style={{
        flex: "0 0 auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "20px",
        height: "20px",
        padding: 0,
        borderRadius: "var(--radius-xs)",
        border: "var(--border-width-strong) solid",
        borderColor: on ? "var(--color-accent-primary)" : "var(--color-border)",
        background: on ? "var(--color-accent-primary)" : "var(--color-surface)",
        color: "var(--color-text-on-accent)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition:
          "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)",
      }}
    >
      {indeterminate ? (
        <span style={{ width: "10px", height: "var(--border-width-strong)", background: "var(--color-text-on-accent)", borderRadius: "1px" }} />
      ) : checked ? (
        <Icon name="check" size={14} strokeWidth={3} />
      ) : null}
      <style>{`
        .trace-checkbox:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .trace-checkbox:not(:disabled):hover { border-color: var(--color-accent-primary); }
      `}</style>
    </button>
  );

  if (!label && !description) return React.cloneElement(box, { style: { ...box.props.style, ...style } });

  return (
    <label
      htmlFor={fieldId}
      style={{
        display: "flex",
        alignItems: description ? "flex-start" : "center",
        gap: "10px",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {box}
      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-primary)",
            lineHeight: "var(--leading-snug)",
          }}
        >
          {label}
        </span>
        {description && (
          <span style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)", lineHeight: "var(--leading-normal)" }}>
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
