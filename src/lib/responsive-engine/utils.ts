// ============================================================
// ResponsiveAutoTable — Engine Utilities
// Pure utility functions. No DOM access.
// ============================================================

import { ENGINE_DEFAULTS } from './types';

/**
 * Clamps a number between a minimum and maximum value.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Parses a CSS width value into a numeric pixel value.
 * Handles numbers (e.g. 150) and pixel strings (e.g. "150px").
 * Returns null if the value is undefined, invalid, or a percentage/calc expression.
 */
export function parseWidthValue(width: string | number | undefined): number | null {
  if (width === undefined || width === null) {
    return null;
  }
  if (typeof width === 'number') {
    return Number.isFinite(width) && width >= 0 ? width : null;
  }
  if (typeof width === 'string') {
    const trimmed = width.trim();
    if (/^\d+(\.\d+)?px$/.test(trimmed)) {
      const num = parseFloat(trimmed);
      return Number.isFinite(num) && num >= 0 ? num : null;
    }
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      const num = parseFloat(trimmed);
      return Number.isFinite(num) && num >= 0 ? num : null;
    }
  }
  return null;
}

/**
 * Selects representative row indices from a dataset for measurement.
 * Selection algorithm:
 * - If totalRows <= sampleSize, returns all indices [0, 1, ..., totalRows - 1].
 * - If totalRows > sampleSize, selects:
 *   - First 10 rows (0..9)
 *   - Last 10 rows (totalRows-10..totalRows-1)
 *   - Remaining budget evenly spaced across the middle rows
 */
export function sampleRowIndices(
  totalRows: number,
  sampleSize: number = ENGINE_DEFAULTS.DEFAULT_SAMPLE_SIZE
): number[] {
  if (totalRows <= 0) return [];
  if (totalRows <= sampleSize) {
    return Array.from({ length: totalRows }, (_, i) => i);
  }

  const indices = new Set<number>();

  // First 10
  const firstCount = Math.min(10, totalRows);
  for (let i = 0; i < firstCount; i++) {
    indices.add(i);
  }

  // Last 10
  const lastCount = Math.min(10, totalRows);
  for (let i = totalRows - lastCount; i < totalRows; i++) {
    indices.add(i);
  }

  // Evenly distribute the remainder in the middle
  const remainingBudget = sampleSize - indices.size;
  if (remainingBudget > 0 && totalRows > 20) {
    const middleStart = 10;
    const middleEnd = totalRows - 11;
    const middleSpan = middleEnd - middleStart;

    if (middleSpan > 0) {
      const step = middleSpan / (remainingBudget + 1);
      for (let i = 1; i <= remainingBudget; i++) {
        indices.add(Math.round(middleStart + i * step));
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/**
 * Creates a structural fingerprint for columns configuration to detect changes.
 */
export function generateColumnsFingerprint(
  columns: Array<{
    key: string;
    width?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    nowrap?: boolean;
    responsivePriority?: number;
    alwaysVisible?: boolean;
  }>
): string {
  return JSON.stringify(
    columns.map((c) => ({
      key: c.key,
      width: c.width,
      minWidth: c.minWidth,
      maxWidth: c.maxWidth,
      nowrap: c.nowrap,
      priority: c.responsivePriority,
      alwaysVisible: c.alwaysVisible,
    }))
  );
}
