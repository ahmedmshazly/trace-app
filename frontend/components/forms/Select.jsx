import React from "react";

/**
 * A native-backed dropdown styled to match TextField. Keeps the
 * keyboard-first contract (native <select> = full a11y + type-ahead) while
 * wearing Trace's surface, border and focus halo. Supports label, hint,
 * error and a placeholder. Pass options as strings or { value, label }.
 */
export function Select({
  label,
  hint,
  error,
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
  style,
  containerStyle,
  ...rest
}) {
  const fieldId = id || (label ? `sel-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

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
      <div style={{ position: "relative", display: "flex" }}>
        <select
          id={fieldId}
          className="trace-select"
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? "true" : undefined}
          style={{
            width: "100%",
            appearance: "none",
            WebkitAppearance: "none",
            padding: "10px 38px 10px 14px",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body)",
            lineHeight: "var(--leading-normal)",
            color: value === "" || value == null ? "var(--color-text-muted)" : "var(--color-text-primary)",
            background: "var(--color-surface)",
            border: `var(--border-width) solid ${error ? "var(--color-state-error)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-md)",
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
            ...style,
          }}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lbl = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "14px",
            top: "calc(50% - 3px)",
            width: "8px",
            height: "8px",
            borderRight: "var(--border-width-strong) solid var(--color-text-muted)",
            borderBottom: "var(--border-width-strong) solid var(--color-text-muted)",
            transform: "rotate(45deg)",
            pointerEvents: "none",
          }}
        />
      </div>
      {(hint || error) && (
        <span style={{ fontSize: "var(--text-micro)", color: error ? "var(--color-state-error)" : "var(--color-text-muted)" }}>
          {error || hint}
        </span>
      )}
      <style>{`
        .trace-select:focus { border-color: var(--color-accent-primary); box-shadow: var(--shadow-focus); }
        .trace-select option { color: var(--color-text-primary); background: var(--color-elevated); }
      `}</style>
    </div>
  );
}
