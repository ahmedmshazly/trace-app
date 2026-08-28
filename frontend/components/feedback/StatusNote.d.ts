import * as React from "react";
import type { IconName } from "../media/Icon";

/** Tiny inline status line (icon + label) for commit confirmation, connectivity, hints. */
export interface StatusNoteProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "accent" | "success" | "warning" | "error" | "info";
  /** Override the tone's default icon. */
  icon?: IconName;
  /** Use the monospace voice (default true). */
  mono?: boolean;
}

export function StatusNote(props: StatusNoteProps): JSX.Element;
