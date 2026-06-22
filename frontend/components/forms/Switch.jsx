import React from "react";

/**
 * Switch — an instant on/off toggle for settings (e.g. "Anchor to GPS",
 * notifications). Use for state that applies immediately; use a
 * SegmentedToggle when there are named modes. The teal accent fills the
 * track only when on — rationed, meaning "active right now".
 */
export function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  size = "md", // sm | md
  id,
  style,
  ...rest
}) {
  const dims = size === "sm" ? { w: 34, h: 20, knob: 14 } : { w: 42, h: 24, knob: 18 };
  const offset = dims.w - dims.knob - 6;
  const fieldId = id || (label ? `sw-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  const control = (
    <button
      type="button"
      role="switch"
      id={fieldId}
      aria-checked={checked}
      aria-label={!label ? rest["aria-label"] : undefined}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      className="trace-switch"
      style={{
        position: "relative",
        flex: "0 0 auto",
        width: dims.w,
        height: dims.h,
        padding: 0,
        borderRadius: "var(--radius-pill)",
        border: "var(--border-width) solid",
        borderColor: checked ? "var(--color-accent-primary)" : "var(--color-border)",
        background: checked ? "var(--color-accent-primary)" : "var(--color-base)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition:
          "background var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard)",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: checked ? offset : 3,
          width: dims.knob,
          height: dims.knob,
          borderRadius: "var(--radius-pill)",
          background: checked ? "var(--color-text-on-accent)" : "var(--color-text-secondary)",
          transform: "translateY(-50%)",
          transition: "left var(--duration-base) var(--ease-out), background var(--duration-base) var(--ease-standard)",
          boxShadow: "var(--shadow-sm)",
        }}
      />
      <style>{`
        .trace-switch:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
      `}</style>
    </button>
  );

  if (!label && !description) return React.cloneElement(control, { style: { ...control.props.style, ...style } });

  return (
    <label
      htmlFor={fieldId}
      style={{
        display: "flex",
        alignItems: description ? "flex-start" : "center",
        gap: "12px",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {control}
      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-medium)",
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
