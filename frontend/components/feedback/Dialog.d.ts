import * as React from "react";
import type { IconName } from "../media/Icon";

/**
 * Focused modal sheet for confirmations and destructive "type to confirm" flows.
 * Esc + scrim click dismiss unless dismissible is false. tone="danger" arms the
 * destructive treatment.
 */
export interface DialogProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  tone?: "neutral" | "danger";
  /** Override the header icon (defaults to warn for danger). */
  icon?: IconName;
  /** Right-aligned footer buttons. */
  actions?: React.ReactNode;
  /** Show the close button + allow Esc / scrim dismiss. Default true. */
  dismissible?: boolean;
  onClose?: () => void;
  /** Max width in px. Default 440. */
  width?: number;
}

export function Dialog(props: DialogProps): JSX.Element | null;
