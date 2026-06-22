import * as React from "react";

/**
 * The sticky capture input — focused on load, grows multi-line, no toolbar.
 * Enter commits (non-empty); Shift+Enter newlines.
 */
export interface CaptureBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Field status, e.g. "anchored · Today 4:18 PM". */
  status?: string;
  /** Show the amber "draft saved" status instead of the anchored status. */
  draftSaved?: boolean;
  autoFocus?: boolean;
  /** Called with the value on Enter (when non-empty). */
  onCommit?: (value: string) => void;
}

export function CaptureBar(props: CaptureBarProps): JSX.Element;
