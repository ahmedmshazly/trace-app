import React from "react";
import { ICONS } from "../../assets/icons/icons.js";

/**
 * Trace's own 24px line-icon set.
 * 2px stroke, round caps/joins, stroke inherits `currentColor`;
 * a few icons carry a rationed teal accent dot.
 */
export function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  label,
  style,
  className,
  ...rest
}) {
  const def = ICONS[name];
  if (!def) {
    if (typeof console !== "undefined") console.warn("Icon: unknown name", name);
    return null;
  }
  return (
    <svg
      viewBox={def.viewBox}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={className}
      style={{ display: "block", flex: "0 0 auto", ...style }}
      dangerouslySetInnerHTML={{ __html: def.body }}
      {...rest}
    />
  );
}
