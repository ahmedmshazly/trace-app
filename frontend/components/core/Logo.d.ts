import * as React from "react";

/**
 * Trace lockup: anchored-moment mark + lowercase serif wordmark.
 */
export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Mark px size; wordmark scales from it. Default 28. */
  size?: number;
  /** Render the anchored-moment mark. Default true. */
  showMark?: boolean;
  /** Render the "trace" wordmark. Default true. */
  showWordmark?: boolean;
  /** "default" (teal dot) · "mono" (single color) · "reverse" (on accent/dark). */
  tone?: "default" | "mono" | "reverse";
}

export function Logo(props: LogoProps): JSX.Element;
