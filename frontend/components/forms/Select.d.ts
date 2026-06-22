import * as React from "react";

type Option = string | { value: string; label: React.ReactNode };

/**
 * Native-backed dropdown styled to match TextField — keeps full keyboard
 * a11y + type-ahead while wearing Trace's surface, border and focus halo.
 */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange" | "style"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  options?: Option[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
}

export function Select(props: SelectProps): JSX.Element;
