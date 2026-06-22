import React from "react";
import { IconButton } from "../core/IconButton.jsx";

/**
 * EntryActions — the hover/focus action cluster on a timeline row:
 * ✎ edit · ◷ time · ⌫ delete. On mobile this becomes a bottom sheet.
 */
export function EntryActions({ onEdit, onAdjustTime, onDelete, visible = true, style }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        opacity: visible ? 1 : 0,
        transition: "opacity var(--duration-fast) var(--ease-standard)",
        ...style,
      }}
    >
      <IconButton icon="edit" label="Edit entry" size="sm" onClick={onEdit} />
      <IconButton icon="clock" label="Adjust time" size="sm" onClick={onAdjustTime} />
      <IconButton icon="archive" label="Delete entry" size="sm" tone="danger" onClick={onDelete} />
    </div>
  );
}
