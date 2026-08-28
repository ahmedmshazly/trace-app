import React from "react";

/**
 * Auth & settings input. Visible focus is mandatory
 * (keyboard-first). Supports label, hint, error, and multiline.
 */
export function TextField({
  label,
  hint,
  error,
  multiline = false,
  id,
  style,
  containerStyle,
  ...rest
}) {
  const fieldId = id || (label ? `tf-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const Tag = multiline ? "textarea" : "input";

  const fieldStyle = {
    width: "100%",
    padding: multiline ? "12px 14px" : "10px 14px",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-body)",
    lineHeight: "var(--leading-normal)",
    color: "var(--color-text-primary)",
    background: "var(--color-surface)",
    border: `var(--border-width) solid ${error ? "var(--color-state-error)" : "var(--color-border)"}`,
    borderRadius: "var(--radius-md)",
    outline: "none",
    resize: multiline ? "vertical" : undefined,
    minHeight: multiline ? "88px" : undefined,
    transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
    ...style,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...containerStyle }}>
      {label && (
        <label
          htmlFor={fieldId}
          style={{
            fontSize: "var(--text-meta)",
            fontWeight: "var(--weight-medium)",
            color: "var(--color-text-secondary)",
            letterSpacing: "var(--tracking-wide)",
          }}
        >
          {label}
        </label>
      )}
      <Tag
        id={fieldId}
        className="trace-field"
        aria-invalid={error ? "true" : undefined}
        style={fieldStyle}
        {...rest}
      />
      {(hint || error) && (
        <span
          style={{
            fontSize: "var(--text-micro)",
            color: error ? "var(--color-state-error)" : "var(--color-text-muted)",
          }}
        >
          {error || hint}
        </span>
      )}
      <style>{`
        .trace-field::placeholder { color: var(--color-text-muted); }
        .trace-field:focus { border-color: var(--color-accent-primary); box-shadow: var(--shadow-focus); }
      `}</style>
    </div>
  );
}
