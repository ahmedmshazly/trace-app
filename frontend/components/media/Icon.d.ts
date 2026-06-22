import * as React from "react";

export type IconName =
  | "archive" | "calendar" | "capture" | "check" | "clock" | "close"
  | "edit" | "error" | "export" | "logout" | "restore" | "search"
  | "settings" | "tag" | "tagindex" | "warn";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Icon id from the Trace set. */
  name: IconName;
  /** Square px size. Default 20. */
  size?: number;
  /** Stroke width. Default 2. */
  strokeWidth?: number;
  /** Accessible label; when set the icon is exposed to AT, otherwise hidden. */
  label?: string;
}

export function Icon(props: IconProps): JSX.Element | null;
