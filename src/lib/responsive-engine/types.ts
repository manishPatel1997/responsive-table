// ============================================================
// ResponsiveAutoTable — Engine Types
// Pure type definitions. No runtime code. No DOM access.
// ============================================================

/**
 * Result of measuring a single column's intrinsic width requirements
 * from the DOM. Produced by measure.ts, consumed by calculateVisibility.
 */
export type ColumnMeasurement = {
  /** Column key from the ColumnDefinition */
  key: string;

  /** Width the rendered content naturally requires (white-space: nowrap), in px.
   *  Measured from DOM via getBoundingClientRect(). */
  intrinsicWidth: number;

  /** The width used in the initial visibility budget, in px.
   *  = clamp(minWidth, intrinsicWidth, maxWidth), or preferredWidth if set. */
  nominalWidth: number;

  /** How much this column can shrink without hiding (nominal - minWidth).
   *  Always 0 for nowrap columns. Positive for wrapping columns. */
  compressibleWidth: number;

  /** Resolved minimum width in px. */
  minWidth: number;

  /** Resolved maximum width in px. Infinity if unset. */
  maxWidth: number;

  /** Explicit preferred width if set (px), null otherwise. */
  preferredWidth: number | null;

  /** Resolved responsivePriority. Lower = more important. Default: 10000. */
  priority: number;

  /** If true, this column is never hidden by the responsive engine. */
  alwaysVisible: boolean;

  /** Whether white-space: nowrap is enforced on this column's cells. */
  nowrap: boolean;

  /** Original column position (0-based) for tie-breaking. */
  columnIndex: number;
};

/**
 * Output of the visibility algorithm.
 * Deterministic: same inputs always produce the same output.
 */
export type VisibilityResult = {
  /** Column keys that should be visible, in original definition order. */
  visibleKeys: string[];

  /** Column keys that should be hidden, in original definition order. */
  hiddenKeys: string[];

  /** True when always-visible columns alone exceed available width. */
  needsHorizontalScroll: boolean;

  /** Sum of allocated widths for visible columns (after compression). */
  totalVisibleWidth: number;
};

/**
 * Cached measurement data. Reused across resize events.
 * Invalidated when columns/data change.
 */
export type MeasurementCache = {
  measurements: ColumnMeasurement[];
  dataFingerprint: string;
  columnsFingerprint: string;
};

/** The current phase the MeasurementLayer should render. */
export type MeasurementPhase = 'candidates' | 'worst-case' | 'idle';

/**
 * Per-column mapping of which sampled row produced the widest content.
 * Key: column key. Value: index into the sampledIndices array.
 */
export type WorstCaseIndices = Record<string, number>;

/** Default constants used across the engine. */
export const ENGINE_DEFAULTS = {
  /** Default responsivePriority when unset. Matches DataTables. */
  DEFAULT_PRIORITY: 10000,

  /** Default minimum column width in px. */
  DEFAULT_MIN_WIDTH: 50,

  /** Default maximum column width (unbounded). */
  DEFAULT_MAX_WIDTH: Infinity,

  /** Default sample size for measurement sampling. */
  DEFAULT_SAMPLE_SIZE: 50,

  /** Buffer added to total width to account for subpixel rounding. */
  SUBPIXEL_BUFFER: 1,
} as const;
