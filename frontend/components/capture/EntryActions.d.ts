import * as React from "react";

/** Row action cluster: edit · adjust time · delete. Reveals on hover/focus (desktop). */
export interface EntryActionsProps {
  onEdit?: () => void;
  onAdjustTime?: () => void;
  onDelete?: () => void;
  /** Controls fade-in (set true on row hover/focus). Default true. */
  visible?: boolean;
  style?: React.CSSProperties;
}

export function EntryActions(props: EntryActionsProps): JSX.Element;
