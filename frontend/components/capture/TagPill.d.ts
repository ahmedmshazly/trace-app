import * as React from "react";

/** Inline #tag chip: `#` glyph + pill shape (never color alone). `count` shows frequency. */
export interface TagPillProps extends React.HTMLAttributes<HTMLElement> {
  /** Tag text, with or without a leading `#`. */
  label: string;
  count?: number;
  active?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export function TagPill(props: TagPillProps): JSX.Element;
