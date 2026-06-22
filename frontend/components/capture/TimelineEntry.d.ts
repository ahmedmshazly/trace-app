import * as React from "react";

/**
 * One timeline row (reused for search results). Body is loudest; timestamp recedes;
 * inline #tags are emphasized; row actions reveal on hover/focus.
 */
export interface TimelineEntryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Receding timestamp, e.g. "2:41 PM". */
  time: string;
  /** Entry body; #tags inside are auto-emphasized. */
  body: string;
  /** "default" · "new" (optimistic "just now") · "dim" (siblings dimmed during edit). */
  state?: "default" | "new" | "dim";
  /** Show the created-time lock glyph. */
  locked?: boolean;
  onEdit?: () => void;
  onAdjustTime?: () => void;
  onDelete?: () => void;
}

export function TimelineEntry(props: TimelineEntryProps): JSX.Element;
