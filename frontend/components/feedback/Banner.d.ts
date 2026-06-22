import * as React from "react";
import type { IconName } from "../media/Icon";

/**
 * Inline non-modal notice with an optional action pair (e.g. draft restore Keep/Discard).
 * Pairs an icon with the message — never color alone.
 */
export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "info" | "success" | "warning" | "error";
  title?: React.ReactNode;
  /** Right-aligned action buttons (e.g. Keep / Discard). */
  actions?: React.ReactNode;
  /** Override the tone's default icon. */
  icon?: IconName;
}

export function Banner(props: BannerProps): JSX.Element;
