import * as React from "react";

/** Day group header — recedes via size + uppercase letter-spacing, not hue. */
export interface DayHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "Today" · "Yesterday" · a date like "Mon · Jun 16". */
  label: string;
  /** Optional entry count for the day. */
  count?: number;
}

export function DayHeader(props: DayHeaderProps): JSX.Element;
