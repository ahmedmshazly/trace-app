
(() => {

const __ui_ns = (window.TRACE_UI = window.TRACE_UI || {});

const __ui_scope = {};

(__ui_ns.__errors = __ui_ns.__errors || []);

// assets/icons/icons.js
try { (() => {
// Trace icon registry — generated from the brand SVG set (24px line, 2px round).
// Colors normalized to theme tokens: stroke=currentColor, accent dot=var(--color-accent-primary).
const ICONS = {
  "archive": {
    "viewBox": "0 0 24 24",
    "body": "<rect x=\"3.6\" y=\"4.6\" width=\"16.8\" height=\"4.2\" rx=\"1.4\"></rect><path d=\"M5 8.8 V18.6 A1.4 1.4 0 0 0 6.4 20 H17.6 A1.4 1.4 0 0 0 19 18.6 V8.8\"></path><line x1=\"9.8\" y1=\"13\" x2=\"14.2\" y2=\"13\"></line>"
  },
  "calendar": {
    "viewBox": "0 0 24 24",
    "body": "<rect x=\"3.8\" y=\"5\" width=\"16.4\" height=\"15.2\" rx=\"2.4\"></rect><line x1=\"3.8\" y1=\"9.4\" x2=\"20.2\" y2=\"9.4\"></line><line x1=\"8\" y1=\"3\" x2=\"8\" y2=\"6.4\"></line><line x1=\"16\" y1=\"3\" x2=\"16\" y2=\"6.4\"></line><circle cx=\"12\" cy=\"14.6\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"></circle>"
  },
  "capture": {
    "viewBox": "0 0 24 24",
    "body": "<line x1=\"6\" y1=\"3.6\" x2=\"6\" y2=\"20.4\"></line><circle cx=\"6\" cy=\"8\" r=\"2.6\" fill=\"var(--color-accent-primary)\" stroke=\"none\"></circle><line x1=\"12.5\" y1=\"9\" x2=\"20\" y2=\"9\"></line><line x1=\"12.5\" y1=\"14\" x2=\"18\" y2=\"14\"></line>"
  },
  "check": {
    "viewBox": "0 0 24 24",
    "body": "<polyline points=\"5 12.6 9.8 17.4 19 6.6\"></polyline>"
  },
  "clock": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"8.2\"></circle><polyline points=\"12 7.4 12 12 15.6 14\"></polyline>"
  },
  "close": {
    "viewBox": "0 0 24 24",
    "body": "<line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line>"
  },
  "edit": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M4 20 L4.2 16 L15 5.2 L18.8 9 L8 19.8 Z\"></path><line x1=\"13\" y1=\"7.2\" x2=\"16.8\" y2=\"11\"></line>"
  },
  "error": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"8.3\"></circle><line x1=\"9.2\" y1=\"9.2\" x2=\"14.8\" y2=\"14.8\"></line><line x1=\"14.8\" y1=\"9.2\" x2=\"9.2\" y2=\"14.8\"></line>"
  },
  "export": {
    "viewBox": "0 0 24 24",
    "body": "<line x1=\"12\" y1=\"3.4\" x2=\"12\" y2=\"15.6\"></line><polyline points=\"7 11 12 16.2 17 11\"></polyline><polyline points=\"4.2 17 4.2 20.4 19.8 20.4 19.8 17\"></polyline>"
  },
  "logout": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M9.4 3.6 H6 A2 2 0 0 0 4 5.6 V18.4 A2 2 0 0 0 6 20.4 H9.4\"></path><polyline points=\"15 8 19.4 12 15 16\"></polyline><line x1=\"9.6\" y1=\"12\" x2=\"19\" y2=\"12\"></line>"
  },
  "restore": {
    "viewBox": "0 0 24 24",
    "body": "<rect x=\"3.6\" y=\"4.6\" width=\"16.8\" height=\"4.2\" rx=\"1.4\"></rect><path d=\"M5 8.8 V18.6 A1.4 1.4 0 0 0 6.4 20 H17.6 A1.4 1.4 0 0 0 19 18.6 V8.8\"></path><polyline points=\"9.2 14 12 11.2 14.8 14\"></polyline><line x1=\"12\" y1=\"11.2\" x2=\"12\" y2=\"17.6\"></line>"
  },
  "search": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"10.5\" cy=\"10.5\" r=\"6.3\"></circle><line x1=\"15.3\" y1=\"15.3\" x2=\"20.4\" y2=\"20.4\"></line>"
  },
  "settings": {
    "viewBox": "0 0 24 24",
    "body": "<line x1=\"3.6\" y1=\"7\" x2=\"20.4\" y2=\"7\"></line><line x1=\"3.6\" y1=\"12\" x2=\"20.4\" y2=\"12\"></line><line x1=\"3.6\" y1=\"17\" x2=\"20.4\" y2=\"17\"></line><circle cx=\"9\" cy=\"7\" r=\"2.3\" fill=\"var(--icon-knob, var(--color-surface))\"></circle><circle cx=\"15\" cy=\"12\" r=\"2.3\" fill=\"var(--icon-knob, var(--color-surface))\"></circle><circle cx=\"7\" cy=\"17\" r=\"2.3\" fill=\"var(--icon-knob, var(--color-surface))\"></circle>"
  },
  "tag": {
    "viewBox": "0 0 24 24",
    "body": "<line x1=\"9.6\" y1=\"4\" x2=\"7.6\" y2=\"20\"></line><line x1=\"16.4\" y1=\"4\" x2=\"14.4\" y2=\"20\"></line><line x1=\"4.4\" y1=\"9.5\" x2=\"20\" y2=\"9.5\"></line><line x1=\"4\" y1=\"14.5\" x2=\"19.6\" y2=\"14.5\"></line>"
  },
  "tagindex": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M4.2 6 L13.4 6 L20 12 L13.4 18 L4.2 18 Z\"></path><circle cx=\"8.4\" cy=\"12\" r=\"1.7\"></circle>"
  },
  "warn": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M12 4 L21 19.6 A0.6 0.6 0 0 1 20.4 20.5 H3.6 A0.6 0.6 0 0 1 3 19.6 Z\"></path><line x1=\"12\" y1=\"10\" x2=\"12\" y2=\"14.4\"></line><circle cx=\"12\" cy=\"17.4\" r=\"1\" fill=\"#9a6a00\" stroke=\"none\"></circle>"
  }
};
const ICON_NAMES = ["archive", "calendar", "capture", "check", "clock", "close", "edit", "error", "export", "logout", "restore", "search", "settings", "tag", "tagindex", "warn"];
Object.assign(__ui_scope, { ICONS, ICON_NAMES });
})(); } catch (e) { __ui_ns.__errors.push({ path: "assets/icons/icons.js", error: String((e && e.message) || e) }); }

// components/capture/DayHeader.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * DayHeader — recedes via size + letter-spacing (not hue). Relative
 * labels (Today / Yesterday) then dates. The body, not the header,
 * is the loudest element on the timeline.
 */
function DayHeader({
  label,
  count,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "10px",
      padding: "var(--space-6) 0 var(--space-2)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-meta)",
      fontWeight: "var(--weight-semibold)",
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-header)",
      color: "var(--color-day-header)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: "1px",
      background: "var(--color-border)",
      opacity: 0.6
    }
  }), count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-micro)",
      color: "var(--color-text-muted)"
    }
  }, count));
}
Object.assign(__ui_scope, { DayHeader });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/capture/DayHeader.jsx", error: String((e && e.message) || e) }); }

// components/capture/TagPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TagPill — an inline #tag chip parsed from an entry body. Never
 * color alone: the `#` glyph + pill shape carry the meaning too.
 * Optionally shows a count (used in the tag index / ⌘K jump list).
 */
function TagPill({
  label,
  count,
  active = false,
  as = "span",
  onClick,
  style,
  ...rest
}) {
  const Tag = onClick ? "button" : as;
  const clean = String(label).replace(/^#/, "");
  return /*#__PURE__*/React.createElement(Tag, _extends({
    type: onClick ? "button" : undefined,
    onClick: onClick,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: count != null ? "2px 8px 2px 7px" : "2px 9px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-meta)",
      fontWeight: "var(--weight-medium)",
      lineHeight: "var(--leading-meta)",
      color: "var(--color-accent-secondary)",
      background: active ? "var(--color-accent-soft)" : "var(--color-tag-pill-bg)",
      border: "var(--border-width) solid transparent",
      borderRadius: "var(--radius-pill)",
      cursor: onClick ? "pointer" : "default",
      verticalAlign: "baseline",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.7
    }
  }, "#"), /*#__PURE__*/React.createElement("span", null, clean), count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-micro)",
      color: "var(--color-text-muted)",
      marginLeft: "1px"
    }
  }, count));
}
Object.assign(__ui_scope, { TagPill });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/capture/TagPill.jsx", error: String((e && e.message) || e) }); }

// components/core/Kbd.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Kbd — a keyboard glyph/hint chip. Trace surfaces shortcuts as
 * first-class copy (⏎ commit · ⌘K search). Use inline in hints.
 * muted: render as faint inline text (no chip) for affordance rows.
 */
function Kbd({
  children,
  muted = false,
  style,
  ...rest
}) {
  if (muted) {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-micro)",
        color: "var(--color-text-muted)",
        letterSpacing: "var(--tracking-wide)",
        ...style
      }
    }, rest), children);
  }
  return /*#__PURE__*/React.createElement("kbd", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "3px",
      minWidth: "18px",
      height: "20px",
      padding: "0 6px",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-micro)",
      fontWeight: "var(--weight-medium)",
      color: "var(--color-text-secondary)",
      background: "var(--color-elevated)",
      border: "var(--border-width) solid var(--color-border)",
      borderRadius: "var(--radius-xs)",
      boxShadow: "0 1px 0 var(--color-border)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ui_scope, { Kbd });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/core/Kbd.jsx", error: String((e && e.message) || e) }); }

// components/capture/CaptureBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CaptureBar — the heartbeat. A sticky, focused-on-load input that
 * grows to fit multi-line text. No toolbar, no buttons: the keyboard
 * is the whole interface. Shows an anchored/draft status + affordances.
 */
function CaptureBar({
  value,
  onChange,
  placeholder = "What just happened?",
  status = "anchored · Today",
  draftSaved = false,
  autoFocus = true,
  onCommit,
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onCommit && String(value || "").trim()) onCommit(value);
    }
  }
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [value]);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--color-surface)",
      border: "var(--border-width) solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      padding: "12px 14px 10px",
      boxShadow: "var(--shadow-sm)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("textarea", {
    ref: ref,
    className: "trace-capture",
    value: value,
    onChange: e => onChange && onChange(e.target.value),
    onKeyDown: handleKeyDown,
    placeholder: placeholder,
    autoFocus: autoFocus,
    rows: 1,
    "aria-label": "Capture a moment",
    style: {
      display: "block",
      width: "100%",
      border: "none",
      outline: "none",
      resize: "none",
      background: "transparent",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-lg)",
      lineHeight: "var(--leading-normal)",
      overflow: "hidden"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "8px",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-micro)",
      color: draftSaved ? "var(--color-state-warning)" : "var(--color-text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: draftSaved ? "var(--color-state-warning)" : "var(--color-accent-primary)"
    }
  }), draftSaved ? "draft saved" : status), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: "10px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(__ui_scope.Kbd, {
    muted: true
  }, "\u23CE commit"), /*#__PURE__*/React.createElement(__ui_scope.Kbd, {
    muted: true
  }, "\u21E7\u23CE newline"))), /*#__PURE__*/React.createElement("style", null, `.trace-capture::placeholder { color: var(--color-text-muted); }`));
}
Object.assign(__ui_scope, { CaptureBar });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/capture/CaptureBar.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Logo — the Trace lockup: the "anchored-moment" mark (a vertical
 * timeline line with a dot = a moment anchored in time) + the
 * lowercase "trace" wordmark in the serif. Single source of truth
 * so the final mark is a one-place swap.
 */
function Logo({
  size = 28,
  showMark = true,
  showWordmark = true,
  tone = "default",
  // "default" | "mono" | "reverse"
  style,
  ...rest
}) {
  const markColor = tone === "reverse" ? "var(--color-text-on-accent, #e9ebee)" : "var(--color-text-primary)";
  const dotColor = tone === "mono" || tone === "reverse" ? markColor : "var(--color-accent-primary)";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: `${Math.round(size * 0.32)}px`,
      color: markColor,
      ...style
    }
  }, rest), showMark && /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 120 120",
    width: size,
    height: size,
    fill: "none",
    "aria-hidden": "true",
    style: {
      display: "block",
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: "60",
    y1: "22",
    x2: "60",
    y2: "100",
    stroke: markColor,
    strokeWidth: "10",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "60",
    cy: "46",
    r: "17",
    fill: dotColor
  })), showWordmark && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-serif)",
      fontWeight: "var(--weight-bold)",
      fontSize: `${Math.round(size * 1.05)}px`,
      lineHeight: 1,
      letterSpacing: "var(--tracking-tight)"
    }
  }, "trace"));
}
Object.assign(__ui_scope, { Logo });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedToggle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SegmentedToggle — a 2-3 option segmented control. Used for the
 * Appearance Light/Dark switch and export format/scope choices.
 * "Dark is first-class, not an afterthought."
 */
function SegmentedToggle({
  options = [],
  value,
  onChange,
  size = "md",
  style,
  ...rest
}) {
  const pad = size === "sm" ? "5px 12px" : "8px 16px";
  const fontSize = size === "sm" ? "var(--text-meta)" : "var(--text-sm)";
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: "inline-flex",
      padding: "3px",
      gap: "2px",
      background: "var(--color-base)",
      border: "var(--border-width) solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      ...style
    }
  }, rest), options.map(opt => {
    const val = typeof opt === "string" ? opt : opt.value;
    const lbl = typeof opt === "string" ? opt : opt.label;
    const selected = val === value;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      type: "button",
      role: "tab",
      "aria-selected": selected,
      onClick: () => onChange && onChange(val),
      style: {
        padding: pad,
        fontFamily: "var(--font-body)",
        fontSize,
        fontWeight: "var(--weight-medium)",
        letterSpacing: "var(--tracking-wide)",
        color: selected ? "var(--color-text-primary)" : "var(--color-text-muted)",
        background: selected ? "var(--color-surface)" : "transparent",
        border: `var(--border-width) solid ${selected ? "var(--color-border)" : "transparent"}`,
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        transition: "color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard)"
      }
    }, lbl);
  }));
}
Object.assign(__ui_scope, { SegmentedToggle });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/forms/SegmentedToggle.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Select — a native-backed dropdown styled to match TextField. Keeps the
 * keyboard-first contract (native <select> = full a11y + type-ahead) while
 * wearing Trace's surface, border and focus halo. Supports label, hint,
 * error and a placeholder. Pass options as strings or { value, label }.
 */
function Select({
  label,
  hint,
  error,
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
  style,
  containerStyle,
  ...rest
}) {
  const fieldId = id || (label ? `sel-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontSize: "var(--text-meta)",
      fontWeight: "var(--weight-medium)",
      color: "var(--color-text-secondary)",
      letterSpacing: "var(--tracking-wide)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    className: "trace-select",
    value: value,
    onChange: onChange,
    disabled: disabled,
    "aria-invalid": error ? "true" : undefined,
    style: {
      width: "100%",
      appearance: "none",
      WebkitAppearance: "none",
      padding: "10px 38px 10px 14px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-body)",
      lineHeight: "var(--leading-normal)",
      color: value === "" || value == null ? "var(--color-text-muted)" : "var(--color-text-primary)",
      background: "var(--color-surface)",
      border: `var(--border-width) solid ${error ? "var(--color-state-error)" : "var(--color-border)"}`,
      borderRadius: "var(--radius-md)",
      outline: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
      ...style
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(opt => {
    const val = typeof opt === "string" ? opt : opt.value;
    const lbl = typeof opt === "string" ? opt : opt.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lbl);
  })), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: "14px",
      top: "calc(50% - 3px)",
      width: "8px",
      height: "8px",
      borderRight: "var(--border-width-strong) solid var(--color-text-muted)",
      borderBottom: "var(--border-width-strong) solid var(--color-text-muted)",
      transform: "rotate(45deg)",
      pointerEvents: "none"
    }
  })), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-micro)",
      color: error ? "var(--color-state-error)" : "var(--color-text-muted)"
    }
  }, error || hint), /*#__PURE__*/React.createElement("style", null, `
        .trace-select:focus { border-color: var(--color-accent-primary); box-shadow: var(--shadow-focus); }
        .trace-select option { color: var(--color-text-primary); background: var(--color-elevated); }
      `));
}
Object.assign(__ui_scope, { Select });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/**
 * Switch — an instant on/off toggle for settings (e.g. "Anchor to GPS",
 * notifications). Use for state that applies immediately; use a
 * SegmentedToggle when there are named modes. The teal accent fills the
 * track only when on — rationed, meaning "active right now".
 */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  size = "md",
  // sm | md
  id,
  style,
  ...rest
}) {
  const dims = size === "sm" ? {
    w: 34,
    h: 20,
    knob: 14
  } : {
    w: 42,
    h: 24,
    knob: 18
  };
  const offset = dims.w - dims.knob - 6;
  const fieldId = id || (label ? `sw-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const control = /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    id: fieldId,
    "aria-checked": checked,
    "aria-label": !label ? rest["aria-label"] : undefined,
    disabled: disabled,
    onClick: () => !disabled && onChange && onChange(!checked),
    className: "trace-switch",
    style: {
      position: "relative",
      flex: "0 0 auto",
      width: dims.w,
      height: dims.h,
      padding: 0,
      borderRadius: "var(--radius-pill)",
      border: "var(--border-width) solid",
      borderColor: checked ? "var(--color-accent-primary)" : "var(--color-border)",
      background: checked ? "var(--color-accent-primary)" : "var(--color-base)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "background var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "50%",
      left: checked ? offset : 3,
      width: dims.knob,
      height: dims.knob,
      borderRadius: "var(--radius-pill)",
      background: checked ? "var(--color-text-on-accent)" : "var(--color-text-secondary)",
      transform: "translateY(-50%)",
      transition: "left var(--duration-base) var(--ease-out), background var(--duration-base) var(--ease-standard)",
      boxShadow: "var(--shadow-sm)"
    }
  }), /*#__PURE__*/React.createElement("style", null, `
        .trace-switch:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
      `));
  if (!label && !description) return React.cloneElement(control, {
    style: {
      ...control.props.style,
      ...style
    }
  });
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "flex",
      alignItems: description ? "flex-start" : "center",
      gap: "12px",
      cursor: disabled ? "not-allowed" : "pointer",
      ...style
    }
  }, control, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "2px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      color: "var(--color-text-primary)",
      lineHeight: "var(--leading-snug)"
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-meta)",
      color: "var(--color-text-muted)",
      lineHeight: "var(--leading-normal)"
    }
  }, description)));
}
Object.assign(__ui_scope, { Switch });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TextField — auth & settings input. Visible focus is mandatory
 * (keyboard-first). Supports label, hint, error, and multiline.
 */
function TextField({
  label,
  hint,
  error,
  multiline = false,
  id,
  style,
  containerStyle,
  ...rest
}) {
  const fieldId = id || (label ? `tf-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const Tag = multiline ? "textarea" : "input";
  const fieldStyle = {
    width: "100%",
    padding: multiline ? "12px 14px" : "10px 14px",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-body)",
    lineHeight: "var(--leading-normal)",
    color: "var(--color-text-primary)",
    background: "var(--color-surface)",
    border: `var(--border-width) solid ${error ? "var(--color-state-error)" : "var(--color-border)"}`,
    borderRadius: "var(--radius-md)",
    outline: "none",
    resize: multiline ? "vertical" : undefined,
    minHeight: multiline ? "88px" : undefined,
    transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
    ...style
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontSize: "var(--text-meta)",
      fontWeight: "var(--weight-medium)",
      color: "var(--color-text-secondary)",
      letterSpacing: "var(--tracking-wide)"
    }
  }, label), /*#__PURE__*/React.createElement(Tag, _extends({
    id: fieldId,
    className: "trace-field",
    "aria-invalid": error ? "true" : undefined,
    style: fieldStyle
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-micro)",
      color: error ? "var(--color-state-error)" : "var(--color-text-muted)"
    }
  }, error || hint), /*#__PURE__*/React.createElement("style", null, `
        .trace-field::placeholder { color: var(--color-text-muted); }
        .trace-field:focus { border-color: var(--color-accent-primary); box-shadow: var(--shadow-focus); }
      `));
}
Object.assign(__ui_scope, { TextField });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/media/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Icon — Trace's own 24px line-icon set.
 * 2px stroke, round caps/joins, stroke inherits `currentColor`;
 * a few icons carry a rationed teal accent dot.
 */
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  label,
  style,
  className,
  ...rest
}) {
  const def = __ui_scope.ICONS[name];
  if (!def) {
    if (typeof console !== "undefined") console.warn("Icon: unknown name", name);
    return null;
  }
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: def.viewBox,
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    role: label ? "img" : undefined,
    "aria-label": label || undefined,
    "aria-hidden": label ? undefined : true,
    focusable: "false",
    className: className,
    style: {
      display: "block",
      flex: "0 0 auto",
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: def.body
    }
  }, rest));
}
Object.assign(__ui_scope, { Icon });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/media/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the action primitive. The teal accent is rationed:
 * use `primary` only for the one commit/CTA on a surface.
 * variants: primary | secondary | ghost | danger
 * sizes: sm | md | lg
 */
function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  fullWidth = false,
  disabled = false,
  children,
  style,
  ...rest
}) {
  const pad = {
    sm: "6px 12px",
    md: "9px 16px",
    lg: "12px 22px"
  }[size];
  const fontSize = {
    sm: "var(--text-meta)",
    md: "var(--text-sm)",
    lg: "var(--text-body)"
  }[size];
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: fullWidth ? "100%" : undefined,
    padding: pad,
    fontFamily: "var(--font-body)",
    fontSize,
    fontWeight: "var(--weight-medium)",
    lineHeight: 1.1,
    letterSpacing: "var(--tracking-wide)",
    borderRadius: "var(--radius-md)",
    border: "var(--border-width) solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)",
    WebkitAppearance: "none",
    appearance: "none"
  };
  const variants = {
    primary: {
      background: "var(--color-accent-primary)",
      color: "var(--color-text-on-accent)",
      borderColor: "var(--color-accent-primary)"
    },
    secondary: {
      background: "var(--color-surface)",
      color: "var(--color-text-primary)",
      borderColor: "var(--color-border)"
    },
    ghost: {
      background: "transparent",
      color: "var(--color-text-secondary)",
      borderColor: "transparent"
    },
    danger: {
      background: "transparent",
      color: "var(--color-state-error)",
      borderColor: "var(--color-state-error)"
    }
  };
  const iconSize = size === "lg" ? 18 : 16;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    "data-variant": variant,
    className: "trace-btn",
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement(__ui_scope.Icon, {
    name: icon,
    size: iconSize
  }), children && /*#__PURE__*/React.createElement("span", null, children), iconRight && /*#__PURE__*/React.createElement(__ui_scope.Icon, {
    name: iconRight,
    size: iconSize
  }), /*#__PURE__*/React.createElement("style", null, `
        .trace-btn[data-variant="primary"]:not(:disabled):hover { filter: brightness(1.06); }
        .trace-btn[data-variant="secondary"]:not(:disabled):hover { border-color: var(--color-accent-primary); background: var(--color-hover-wash); }
        .trace-btn[data-variant="ghost"]:not(:disabled):hover { background: var(--color-hover-wash); color: var(--color-text-primary); }
        .trace-btn[data-variant="danger"]:not(:disabled):hover { background: var(--color-state-error); color: var(--color-text-on-accent); }
        .trace-btn:not(:disabled):active { transform: translateY(0.5px); }
      `));
}
Object.assign(__ui_scope, { Button });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — square, label-only-by-aria control for row actions,
 * toolbars and the app bar. tone: default | accent | danger.
 */
function IconButton({
  icon,
  label,
  size = "md",
  tone = "default",
  active = false,
  disabled = false,
  style,
  ...rest
}) {
  const box = {
    sm: 28,
    md: 34,
    lg: 40
  }[size];
  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20
  }[size];
  const toneColor = {
    default: "var(--color-text-secondary)",
    accent: "var(--color-accent-primary)",
    danger: "var(--color-state-error)"
  }[tone];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    "data-tone": tone,
    className: "trace-iconbtn",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: box,
      height: box,
      padding: 0,
      color: toneColor,
      background: active ? "var(--color-hover-wash)" : "transparent",
      border: "var(--border-width) solid transparent",
      borderRadius: "var(--radius-sm)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ui_scope.Icon, {
    name: icon,
    size: iconSize
  }), /*#__PURE__*/React.createElement("style", null, `
        .trace-iconbtn:not(:disabled):hover { background: var(--color-hover-wash); }
        .trace-iconbtn[data-tone="default"]:not(:disabled):hover { color: var(--color-text-primary); }
        .trace-iconbtn[data-tone="danger"]:not(:disabled):hover { color: var(--color-state-error); }
      `));
}
Object.assign(__ui_scope, { IconButton });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/capture/EntryActions.jsx
try { (() => {
/**
 * EntryActions — the hover/focus action cluster on a timeline row:
 * ✎ edit · ◷ time · ⌫ delete. On mobile this becomes a bottom sheet.
 */
function EntryActions({
  onEdit,
  onAdjustTime,
  onDelete,
  visible = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "2px",
      opacity: visible ? 1 : 0,
      transition: "opacity var(--duration-fast) var(--ease-standard)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ui_scope.IconButton, {
    icon: "edit",
    label: "Edit entry",
    size: "sm",
    onClick: onEdit
  }), /*#__PURE__*/React.createElement(__ui_scope.IconButton, {
    icon: "clock",
    label: "Adjust time",
    size: "sm",
    onClick: onAdjustTime
  }), /*#__PURE__*/React.createElement(__ui_scope.IconButton, {
    icon: "archive",
    label: "Delete entry",
    size: "sm",
    tone: "danger",
    onClick: onDelete
  }));
}
Object.assign(__ui_scope, { EntryActions });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/capture/EntryActions.jsx", error: String((e && e.message) || e) }); }

// components/capture/TimelineEntry.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TimelineEntry — one row of the record (also reused for search
 * results). The body is the loudest element; the timestamp recedes.
 * Inline #tags are emphasized in the secondary accent. Actions
 * reveal on hover/focus. `state`: default | new (just committed) | dim.
 */
function renderBody(body) {
  const parts = String(body).split(/(#[A-Za-z0-9_-]+)/g);
  return parts.map((p, i) => /^#[A-Za-z0-9_-]+$/.test(p) ? /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      color: "var(--color-accent-secondary)",
      fontWeight: "var(--weight-medium)"
    }
  }, p) : /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, p));
}
function TimelineEntry({
  time,
  body,
  state = "default",
  locked = false,
  onEdit,
  onAdjustTime,
  onDelete,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const isNew = state === "new";
  const dim = state === "dim";
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "16px",
      padding: "12px 14px",
      borderRadius: "var(--radius-md)",
      background: hover ? "var(--color-hover-wash)" : "transparent",
      opacity: dim ? 0.4 : 1,
      transition: "background var(--duration-fast) var(--ease-standard), opacity var(--duration-base) var(--ease-standard)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      width: "62px",
      paddingTop: "2px",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-meta)",
      lineHeight: "var(--leading-meta)",
      color: isNew ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
      textAlign: "right",
      whiteSpace: "nowrap"
    }
  }, isNew ? "just now" : time, locked && /*#__PURE__*/React.createElement("span", {
    title: "created time is locked",
    style: {
      marginLeft: 4,
      opacity: 0.6
    }
  }, "\uD83D\uDD12")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-entry-size)",
      lineHeight: "var(--text-entry-leading)",
      color: "var(--color-text-primary)",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word"
    }
  }, renderBody(body)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement(__ui_scope.EntryActions, {
    visible: hover,
    onEdit: onEdit,
    onAdjustTime: onAdjustTime,
    onDelete: onDelete
  })));
}
Object.assign(__ui_scope, { TimelineEntry });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/capture/TimelineEntry.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Banner — an inline, non-modal notice with an optional action pair.
 * Used for draft restore (warning) and other in-context messages.
 * Never color alone: each tone pairs an icon with its message.
 * tone: info | success | warning | error
 */
const TONE = {
  info: {
    color: "var(--color-state-info)",
    icon: "warn"
  },
  success: {
    color: "var(--color-state-success)",
    icon: "check"
  },
  warning: {
    color: "var(--color-state-warning)",
    icon: "warn"
  },
  error: {
    color: "var(--color-state-error)",
    icon: "error"
  }
};
function Banner({
  tone = "warning",
  title,
  children,
  actions,
  icon,
  style,
  ...rest
}) {
  const t = TONE[tone] || TONE.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      padding: "12px 14px",
      background: "var(--color-surface)",
      border: `var(--border-width) solid ${t.color}`,
      borderRadius: "var(--radius-md)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.color,
      paddingTop: "1px"
    }
  }, /*#__PURE__*/React.createElement(__ui_scope.Icon, {
    name: icon || t.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      color: "var(--color-text-primary)",
      marginBottom: children ? "2px" : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-meta)",
      color: "var(--color-text-secondary)"
    }
  }, children)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      gap: "6px",
      flex: "0 0 auto"
    }
  }, actions));
}
Object.assign(__ui_scope, { Banner });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Dialog — a focused modal sheet lifted off a dimmed scrim. Used for
 * confirmations and the danger-zone "type to confirm" flows. Quiet by
 * default; `tone="danger"` arms the destructive treatment. Esc and a
 * scrim click both dismiss (unless dismissible={false}).
 */
function Dialog({
  open = false,
  title,
  description,
  tone = "neutral",
  // neutral | danger
  icon,
  actions,
  dismissible = true,
  onClose,
  children,
  width = 440,
  style,
  ...rest
}) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && dismissible && onClose) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissible, onClose]);
  if (!open) return null;
  const tint = tone === "danger" ? "var(--color-state-error)" : "var(--color-accent-primary)";
  const headIcon = icon || (tone === "danger" ? "warn" : null);
  return /*#__PURE__*/React.createElement("div", {
    onMouseDown: () => dismissible && onClose && onClose(),
    className: "trace-dialog-scrim",
    style: {
      position: "fixed",
      inset: 0,
      zIndex: "var(--z-overlay)",
      background: "var(--color-scrim)",
      backdropFilter: "blur(2px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    onMouseDown: e => e.stopPropagation(),
    className: "trace-dialog-sheet",
    style: {
      width: `min(${width}px, 100%)`,
      background: "var(--color-elevated)",
      border: "var(--border-width) solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      overflow: "hidden",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "14px",
      padding: "22px 22px 0"
    }
  }, headIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 auto",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      borderRadius: "var(--radius-md)",
      background: tone === "danger" ? "rgba(235,138,156,0.14)" : "var(--color-accent-soft)",
      color: tint
    }
  }, /*#__PURE__*/React.createElement(__ui_scope.Icon, {
    name: headIcon,
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-bold)",
      fontSize: "var(--text-title)",
      letterSpacing: "var(--tracking-tight)",
      color: "var(--color-text-primary)",
      margin: 0
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--text-meta)",
      lineHeight: "var(--leading-normal)",
      color: "var(--color-text-muted)",
      margin: "6px 0 0"
    }
  }, description)), dismissible && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 auto",
      marginRight: "-6px",
      marginTop: "-4px"
    }
  }, /*#__PURE__*/React.createElement(__ui_scope.IconButton, {
    icon: "close",
    label: "Close",
    onClick: onClose
  }))), children && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 22px 0",
      fontSize: "var(--text-sm)",
      color: "var(--color-text-secondary)"
    }
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      padding: "22px"
    }
  }, actions)), /*#__PURE__*/React.createElement("style", null, `
        @keyframes trace-dialog-rise {
          from { transform: translateY(8px) scale(0.985); }
          to { transform: translateY(0) scale(1); }
        }
        /* Transform-only entrance: opacity stays 1 so a frozen frame-0 capture
           (DS thumbnail, html-to-image) still shows the sheet. Motion-gated. */
        @media (prefers-reduced-motion: no-preference) {
          .trace-dialog-sheet { animation: trace-dialog-rise var(--duration-base) var(--ease-out) both; }
        }
      `));
}
Object.assign(__ui_scope, { Dialog });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusNote.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatusNote — a tiny inline status line (icon + label) for commit
 * confirmation, connectivity, and helper hints. tone: neutral |
 * success | warning | error | info | accent.
 */
const NOTE = {
  neutral: {
    color: "var(--color-text-secondary)",
    icon: null
  },
  accent: {
    color: "var(--color-accent-primary)",
    icon: null
  },
  success: {
    color: "var(--color-state-success)",
    icon: "check"
  },
  warning: {
    color: "var(--color-state-warning)",
    icon: "warn"
  },
  error: {
    color: "var(--color-state-error)",
    icon: "error"
  },
  info: {
    color: "var(--color-state-info)",
    icon: "warn"
  }
};
function StatusNote({
  tone = "neutral",
  icon,
  mono = true,
  children,
  style,
  ...rest
}) {
  const t = NOTE[tone] || NOTE.neutral;
  const showIcon = icon || t.icon;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
      fontSize: "var(--text-micro)",
      letterSpacing: "var(--tracking-wide)",
      color: t.color,
      ...style
    }
  }, rest), showIcon && /*#__PURE__*/React.createElement(__ui_scope.Icon, {
    name: showIcon,
    size: 13
  }), children);
}
Object.assign(__ui_scope, { StatusNote });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/feedback/StatusNote.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Toast — a transient, self-dismissing notice that slides up from the
 * bottom. Quiet confirmations ("Entry committed"), never modal. Pairs
 * an icon with the message — never color alone. Use <ToastViewport> to
 * stack several; a single Toast also renders fine on its own.
 * tone: success | info | warning | error
 */
const TONES = {
  success: {
    icon: "check",
    color: "var(--color-state-success)"
  },
  info: {
    icon: "clock",
    color: "var(--color-state-info)"
  },
  warning: {
    icon: "warn",
    color: "var(--color-state-warning)"
  },
  error: {
    icon: "error",
    color: "var(--color-state-error)"
  }
};
function Toast({
  tone = "info",
  title,
  action,
  onDismiss,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    className: "trace-toast",
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      width: "min(360px, 92vw)",
      padding: "13px 14px",
      background: "var(--color-elevated)",
      border: "var(--border-width) solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-lg)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 auto",
      color: t.color,
      marginTop: "1px"
    }
  }, /*#__PURE__*/React.createElement(__ui_scope.Icon, {
    name: t.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-medium)",
      color: "var(--color-text-primary)",
      lineHeight: "var(--leading-snug)"
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-meta)",
      color: "var(--color-text-muted)",
      marginTop: title ? "2px" : 0,
      lineHeight: "var(--leading-normal)"
    }
  }, children)), action && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto"
    }
  }, action), onDismiss && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Dismiss",
    onClick: onDismiss,
    className: "trace-toast-x",
    style: {
      flex: "0 0 auto",
      display: "inline-flex",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--color-text-muted)",
      padding: "2px",
      marginRight: "-2px"
    }
  }, /*#__PURE__*/React.createElement(__ui_scope.Icon, {
    name: "close",
    size: 15
  })), /*#__PURE__*/React.createElement("style", null, `
        @keyframes trace-toast-in {
          from { transform: translateY(10px); }
          to { transform: translateY(0); }
        }
        /* Transform-only entrance: opacity stays 1 so a frozen frame-0 capture still shows the toast. */
        @media (prefers-reduced-motion: no-preference) {
          .trace-toast { animation: trace-toast-in var(--duration-base) var(--ease-out) both; }
        }
        .trace-toast-x:hover { color: var(--color-text-primary); }
      `));
}

/**
 * ToastViewport — fixed bottom-center stack for several Toasts.
 */
function ToastViewport({
  position = "bottom",
  children,
  style
}) {
  const vertical = position === "top" ? {
    top: "24px"
  } : {
    bottom: "24px"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "var(--z-toast)",
      display: "flex",
      flexDirection: position === "top" ? "column" : "column-reverse",
      gap: "10px",
      alignItems: "center",
      pointerEvents: "none",
      ...vertical,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "contents",
      pointerEvents: "auto"
    }
  }, children));
}
Object.assign(__ui_scope, { Toast, ToastViewport });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/**
 * Checkbox — a square multi-select control (export scopes, filter toggles,
 * "remember me"). Pairs a clear box with an optional label + description.
 * Supports an `indeterminate` state for "select all" parents. The teal
 * fill appears only when checked — meaning "included".
 */
function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  description,
  id,
  style,
  ...rest
}) {
  const fieldId = id || (label ? `cb-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const on = checked || indeterminate;
  const box = /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "checkbox",
    id: fieldId,
    "aria-checked": indeterminate ? "mixed" : checked,
    "aria-label": !label ? rest["aria-label"] : undefined,
    disabled: disabled,
    onClick: () => !disabled && onChange && onChange(!checked),
    className: "trace-checkbox",
    style: {
      flex: "0 0 auto",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "20px",
      height: "20px",
      padding: 0,
      borderRadius: "var(--radius-xs)",
      border: "var(--border-width-strong) solid",
      borderColor: on ? "var(--color-accent-primary)" : "var(--color-border)",
      background: on ? "var(--color-accent-primary)" : "var(--color-surface)",
      color: "var(--color-text-on-accent)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)"
    }
  }, indeterminate ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: "10px",
      height: "var(--border-width-strong)",
      background: "var(--color-text-on-accent)",
      borderRadius: "1px"
    }
  }) : checked ? /*#__PURE__*/React.createElement(__ui_scope.Icon, {
    name: "check",
    size: 14,
    strokeWidth: 3
  }) : null, /*#__PURE__*/React.createElement("style", null, `
        .trace-checkbox:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .trace-checkbox:not(:disabled):hover { border-color: var(--color-accent-primary); }
      `));
  if (!label && !description) return React.cloneElement(box, {
    style: {
      ...box.props.style,
      ...style
    }
  });
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "flex",
      alignItems: description ? "flex-start" : "center",
      gap: "10px",
      cursor: disabled ? "not-allowed" : "pointer",
      ...style
    }
  }, box, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "2px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--color-text-primary)",
      lineHeight: "var(--leading-snug)"
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-meta)",
      color: "var(--color-text-muted)",
      lineHeight: "var(--leading-normal)"
    }
  }, description)));
}
Object.assign(__ui_scope, { Checkbox });
})(); } catch (e) { __ui_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }


__ui_ns.ICONS = __ui_scope.ICONS;

__ui_ns.ICON_NAMES = __ui_scope.ICON_NAMES;

__ui_ns.CaptureBar = __ui_scope.CaptureBar;

__ui_ns.DayHeader = __ui_scope.DayHeader;

__ui_ns.EntryActions = __ui_scope.EntryActions;

__ui_ns.TagPill = __ui_scope.TagPill;

__ui_ns.TimelineEntry = __ui_scope.TimelineEntry;

__ui_ns.Button = __ui_scope.Button;

__ui_ns.IconButton = __ui_scope.IconButton;

__ui_ns.Kbd = __ui_scope.Kbd;

__ui_ns.Logo = __ui_scope.Logo;

__ui_ns.Banner = __ui_scope.Banner;

__ui_ns.Dialog = __ui_scope.Dialog;

__ui_ns.StatusNote = __ui_scope.StatusNote;

__ui_ns.Toast = __ui_scope.Toast;

__ui_ns.ToastViewport = __ui_scope.ToastViewport;

__ui_ns.Checkbox = __ui_scope.Checkbox;

__ui_ns.SegmentedToggle = __ui_scope.SegmentedToggle;

__ui_ns.Select = __ui_scope.Select;

__ui_ns.Switch = __ui_scope.Switch;

__ui_ns.TextField = __ui_scope.TextField;

__ui_ns.Icon = __ui_scope.Icon;

})();
