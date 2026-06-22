import * as React from "react";

/**
 * Square multi-select control with an optional label + description.
 * Supports an indeterminate state for "select all" parents.
 */
export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

export function Checkbox(props: CheckboxProps): JSX.Element;
