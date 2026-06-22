import * as React from "react";
import type { IconName } from "../media/Icon";

/** Square icon-only control (row actions, app bar, toolbars). `label` is required for a11y. */
export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  icon: IconName;
  /** Accessible label (also the tooltip). */
  label: string;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "accent" | "danger";
  active?: boolean;
}

export function IconButton(props: IconButtonProps): JSX.Element;
