import * as React from "react";

/**
 * Labelled text input with mandatory visible focus. `multiline` → textarea.
 */
export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  /** Error message; also flips the field to the error treatment. */
  error?: string;
  multiline?: boolean;
  containerStyle?: React.CSSProperties;
}

export function TextField(props: TextFieldProps): JSX.Element;
