import * as React from "react";

/**
 * Instant on/off toggle for settings that apply immediately. Use a
 * SegmentedToggle instead when there are named modes.
 */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Optional label rendered beside the control. */
  label?: React.ReactNode;
  /** Optional secondary line under the label. */
  description?: React.ReactNode;
  size?: "sm" | "md";
  id?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

export function Switch(props: SwitchProps): JSX.Element;
