// ============================================================
// ResponsiveAutoTable — DOM Measurement Functions
// Handles reading layout dimensions via getBoundingClientRect()
// ============================================================

import { ColumnMeasurement, ENGINE_DEFAULTS, WorstCaseIndices } from './types';
import { clamp, parseWidthValue } from './utils';

/**
 * Minimal column configuration needed for measurement processing.
 */
export interface ColumnMeasureConfig {
  key: string;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  nowrap?: boolean;
  responsivePriority?: number;
  alwaysVisible?: boolean;
}

/**
 * Phase 1: Measures all isolated candidate cells rendered in the measurement layer.
 * For each column, determines which sampled row index produced the widest cell.
 *
 * @param container The measurement layer container element (HTMLDivElement)
 * @param columns Array of column configurations
 * @returns WorstCaseIndices mapping columnKey -> sampledRowIndex
 */
export function measureCandidateCells(
  container: HTMLElement,
  columns: ColumnMeasureConfig[]
): WorstCaseIndices {
  const worstCaseIndices: WorstCaseIndices = {};

  // Initialize with row index 0 (or fallback 0) for each column
  for (const col of columns) {
    worstCaseIndices[col.key] = 0;
  }

  if (!container) return worstCaseIndices;

  // Query all candidate cells in the container
  const candidateCells = container.querySelectorAll<HTMLElement>(
    '[data-measurement-phase="candidates"] td[data-col-key]'
  );

  const maxWidths: Record<string, number> = {};

  candidateCells.forEach((cell) => {
    const colKey = cell.getAttribute('data-col-key');
    const rowIdxStr = cell.getAttribute('data-row-idx');

    if (!colKey || rowIdxStr === null) return;

    const rowIdx = parseInt(rowIdxStr, 10);
    if (isNaN(rowIdx)) return;

    const rect = cell.getBoundingClientRect();
    const width = rect.width;

    if (maxWidths[colKey] === undefined || width > maxWidths[colKey]) {
      maxWidths[colKey] = width;
      worstCaseIndices[colKey] = rowIdx;
    }
  });

  return worstCaseIndices;
}

/**
 * Phase 2: Measures the single worst-case row table in the measurement layer
 * to obtain authoritative column widths including table border/padding effects.
 *
 * @param container The measurement layer container element
 * @param columns Array of column configurations in original order
 * @returns Array of ColumnMeasurement objects
 */
export function measureWorstCaseRow(
  container: HTMLElement,
  columns: ColumnMeasureConfig[]
): ColumnMeasurement[] {
  const measurements: ColumnMeasurement[] = [];

  if (!container) {
    return columns.map((col, index) => createDefaultMeasurement(col, index, 0));
  }

  const worstCaseTable = container.querySelector<HTMLElement>(
    '[data-measurement-phase="worst-case"] table'
  );

  columns.forEach((col, index) => {
    let intrinsicWidth = 0;

    if (worstCaseTable) {
      const th = worstCaseTable.querySelector<HTMLElement>(
        `th[data-col-key="${col.key}"]`
      );
      const td = worstCaseTable.querySelector<HTMLElement>(
        `td[data-col-key="${col.key}"]`
      );

      const thWidth = th ? th.getBoundingClientRect().width : 0;
      const tdWidth = td ? td.getBoundingClientRect().width : 0;

      intrinsicWidth = Math.max(thWidth, tdWidth);
    }

    measurements.push(createDefaultMeasurement(col, index, intrinsicWidth));
  });

  return measurements;
}

/**
 * Helper to build a ColumnMeasurement from configuration and measured intrinsic width.
 */
function createDefaultMeasurement(
  col: ColumnMeasureConfig,
  columnIndex: number,
  intrinsicWidth: number
): ColumnMeasurement {
  const minWidth =
    parseWidthValue(col.minWidth) ?? ENGINE_DEFAULTS.DEFAULT_MIN_WIDTH;
  const maxWidth =
    parseWidthValue(col.maxWidth) ?? ENGINE_DEFAULTS.DEFAULT_MAX_WIDTH;
  const preferredWidth = parseWidthValue(col.width);

  let nominalWidth: number;
  if (preferredWidth !== null) {
    nominalWidth = clamp(preferredWidth, minWidth, maxWidth);
  } else {
    nominalWidth = clamp(intrinsicWidth || minWidth, minWidth, maxWidth);
  }

  // nowrap is true by default unless explicitly false
  const nowrap = col.nowrap !== false;
  const compressibleWidth = nowrap ? 0 : Math.max(0, nominalWidth - minWidth);
  const priority = col.responsivePriority ?? ENGINE_DEFAULTS.DEFAULT_PRIORITY;
  const alwaysVisible = Boolean(col.alwaysVisible);

  return {
    key: col.key,
    intrinsicWidth,
    nominalWidth,
    compressibleWidth,
    minWidth,
    maxWidth,
    preferredWidth,
    priority,
    alwaysVisible,
    nowrap,
    columnIndex,
  };
}
