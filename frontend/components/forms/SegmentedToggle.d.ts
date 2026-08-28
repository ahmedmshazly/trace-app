import * as React from "react";

export type SegmentedOption = string | { value: string; label: string };

/** 2-3 option segmented control (Appearance Light/Dark, export format/scope). */
export interface SegmentedToggleProps {
  options: SegmentedOption[];
  value: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

export function SegmentedToggle(props: SegmentedToggleProps): JSX.Element;
