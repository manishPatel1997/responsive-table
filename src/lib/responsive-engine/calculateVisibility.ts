// ============================================================
// ResponsiveAutoTable — Responsive Visibility Algorithm
// Pure calculation function. No DOM access. Deterministic.
// DataTables Responsive Model: Progressively hides columns by priority
// to fit available width without horizontal scrollbars.
// ============================================================

import { ColumnMeasurement, ENGINE_DEFAULTS, VisibilityResult } from './types';

/**
 * Calculates which columns should be visible given their measured
 * dimensions and the available container width.
 *
 * DataTables Responsive Algorithm:
 * 1. Start with all columns visible at their nominal widths.
 * 2. If total width exceeds container, compress wrapping columns toward minWidth
 *    in lowest-priority-first order (highest priority number first, right-to-left).
 * 3. If still exceeding, progressively remove columns in lowest-priority-first order
 *    (highest priority number first, tie-break right-to-left) until visible columns fit.
 * 4. Non-alwaysVisible columns are removed first, followed by alwaysVisible columns
 *    if space is still constrained, preserving at least the primary column (index 0).
 * 5. All hidden columns are accessible via the per-row child/details view.
 * 6. Zero horizontal scrollbar is generated.
 */
export function calculateVisibleColumns(
  measurements: ColumnMeasurement[],
  availableWidth: number
): VisibilityResult {
  // Edge case: empty columns
  if (!measurements || measurements.length === 0) {
    return {
      visibleKeys: [],
      hiddenKeys: [],
      needsHorizontalScroll: false,
      totalVisibleWidth: 0,
    };
  }

  // Edge case: zero or negative available width (e.g. hidden container)
  if (availableWidth <= 0) {
    // Keep only the primary first column visible
    const firstCol = measurements[0];
    return {
      visibleKeys: [firstCol.key],
      hiddenKeys: measurements.slice(1).map((m) => m.key),
      needsHorizontalScroll: false,
      totalVisibleWidth: firstCol.nominalWidth,
    };
  }

  // Initialize allocated width map
  const allocatedWidths = new Map<string, number>();
  let totalRequiredWidth = 0;

  for (const col of measurements) {
    allocatedWidths.set(col.key, col.nominalWidth);
    totalRequiredWidth += col.nominalWidth;
  }

  // Include subpixel rounding buffer
  totalRequiredWidth += ENGINE_DEFAULTS.SUBPIXEL_BUFFER;

  const visibleSet = new Set<string>(measurements.map((m) => m.key));
  const hiddenSet = new Set<string>();

  // If all columns fit at nominal width, return immediately
  if (totalRequiredWidth <= availableWidth) {
    return {
      visibleKeys: measurements.map((m) => m.key),
      hiddenKeys: [],
      needsHorizontalScroll: false,
      totalVisibleWidth: totalRequiredWidth - ENGINE_DEFAULTS.SUBPIXEL_BUFFER,
    };
  }

  // Phase 1: Compress wrapping columns before hiding any column
  // Sort wrapping columns: lowest priority first (highest number), tie-break right-to-left
  const wrappingCols = measurements
    .filter((col) => !col.nowrap && col.compressibleWidth > 0)
    .sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.columnIndex - a.columnIndex;
    });

  for (const col of wrappingCols) {
    const excess = totalRequiredWidth - availableWidth;
    if (excess <= 0) break;

    const currentAllocated = allocatedWidths.get(col.key) ?? col.nominalWidth;
    const currentCompressible = currentAllocated - col.minWidth;

    if (currentCompressible > 0) {
      const compressAmount = Math.min(excess, currentCompressible);
      allocatedWidths.set(col.key, currentAllocated - compressAmount);
      totalRequiredWidth -= compressAmount;
    }
  }

  // If compression was sufficient, return all visible
  if (totalRequiredWidth <= availableWidth) {
    let finalWidth = 0;
    for (const col of measurements) {
      finalWidth += allocatedWidths.get(col.key) ?? col.nominalWidth;
    }
    return {
      visibleKeys: measurements.map((m) => m.key),
      hiddenKeys: [],
      needsHorizontalScroll: false,
      totalVisibleWidth: finalWidth,
    };
  }

  // Phase 2: Progressively remove columns by priority (lowest priority = highest number first)
  // First pass: remove hideable columns (alwaysVisible = false)
  const hideableCols = measurements
    .filter((col) => !col.alwaysVisible)
    .sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.columnIndex - a.columnIndex;
    });

  for (const col of hideableCols) {
    const colWidth = allocatedWidths.get(col.key) ?? col.nominalWidth;
    totalRequiredWidth -= colWidth;
    visibleSet.delete(col.key);
    hiddenSet.add(col.key);

    if (totalRequiredWidth <= availableWidth) {
      break;
    }
  }

  // Phase 3: If still exceeding available width, continue removing remaining columns
  // (except column index 0 which holds the row expand control) in priority order
  if (totalRequiredWidth > availableWidth) {
    const remainingRemovalCandidates = measurements
      .filter((col) => visibleSet.has(col.key) && col.columnIndex !== 0)
      .sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return b.columnIndex - a.columnIndex;
      });

    for (const col of remainingRemovalCandidates) {
      const colWidth = allocatedWidths.get(col.key) ?? col.nominalWidth;
      totalRequiredWidth -= colWidth;
      visibleSet.delete(col.key);
      hiddenSet.add(col.key);

      if (totalRequiredWidth <= availableWidth) {
        break;
      }
    }
  }

  // Preserve original column order in outputs
  const visibleKeys = measurements
    .filter((m) => visibleSet.has(m.key))
    .map((m) => m.key);
  const hiddenKeys = measurements
    .filter((m) => hiddenSet.has(m.key))
    .map((m) => m.key);

  let finalTotalWidth = 0;
  for (const key of visibleKeys) {
    finalTotalWidth += allocatedWidths.get(key) ?? 0;
  }

  return {
    visibleKeys,
    hiddenKeys,
    needsHorizontalScroll: false,
    totalVisibleWidth: finalTotalWidth,
  };
}
