import * as React from "react";
import type { IconName } from "../media/Icon";

/**
 * Action button. Teal `primary` is rationed — one commit/CTA per surface.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  /** Leading icon name. */
  icon?: IconName;
  /** Trailing icon name. */
  iconRight?: IconName;
  fullWidth?: boolean;
}

export function Button(props: ButtonProps): JSX.Element;
