import * as React from "react";

/** Keyboard glyph chip. `muted` renders as faint inline text (field affordances). */
export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  muted?: boolean;
}

export function Kbd(props: KbdProps): JSX.Element;
