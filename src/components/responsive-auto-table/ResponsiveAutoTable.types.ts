// ============================================================
// ResponsiveAutoTable — Public Component Types
// ============================================================

import React from 'react';

/**
 * Definition of a single column for ResponsiveAutoTable.
 */
export interface ColumnDefinition<T> {
  /** Unique key identifying the column. */
  key: string;

  /** Header content or render function. */
  header:
    | React.ReactNode
    | ((props: { column: ColumnDefinition<T> }) => React.ReactNode);

  /** Function returning cell content for a row. */
  accessor: (row: T, index: number) => React.ReactNode;

  /** Explicit preferred width (e.g. 150 or "150px"). */
  width?: string | number;

  /** Minimum width (e.g. 50 or "50px"). Default: 50px. */
  minWidth?: string | number;

  /** Maximum width (e.g. 300 or "300px"). Default: Infinity. */
  maxWidth?: string | number;

  /**
   * Whether text wrapping is prevented on cell contents.
   * Default: true (nowrap).
   * When false, cell text is allowed to wrap, and the column can compress
   * towards minWidth before any columns are hidden.
   */
  nowrap?: boolean;

  /**
   * Responsive hiding priority.
   * Lower number = higher importance (survives longer).
   * Default: 10000.
   */
  responsivePriority?: number;

  /**
   * If true, this column is never hidden regardless of available container width.
   * If available width is insufficient, horizontal scroll is activated.
   */
  alwaysVisible?: boolean;

  /** Optional CSS class for body cells in this column. */
  className?: string;

  /** Optional CSS class for header cell in this column. */
  headerClassName?: string;
}

/**
 * Props for the ResponsiveAutoTable component.
 */
export interface ResponsiveAutoTableProps<T> {
  /** Column definitions. */
  columns: ColumnDefinition<T>[];

  /** Data array. */
  data: T[];

  /** Unique key extractor for row rendering. Defaults to (row, index) => index. */
  getRowKey?: (row: T, index: number) => string | number;

  /** Whether responsive column calculation is enabled. Default: true. */
  responsive?: boolean;

  /**
   * Horizontal scrolling behavior.
   * - 'auto': Enable horizontal scrolling only when alwaysVisible columns exceed container.
   * - 'always': Always enable horizontal scrolling wrapper.
   * - 'never': Never enable horizontal scrolling.
   * Default: 'auto'.
   */
  horizontalScroll?: 'auto' | 'always' | 'never';

  /** Number of rows to sample for intrinsic width measurement. Default: 50. */
  sampleSize?: number;

  /** Enables interactive debug panel below the table showing column measurements. */
  debugResponsive?: boolean;

  /** Optional className for the root container element. */
  className?: string;

  /** Optional className for the table element. */
  tableClassName?: string;

  /** Optional custom empty state message when data is empty. */
  emptyMessage?: React.ReactNode;

  /** Whether the table is in a loading state. */
  loading?: boolean;

  /** Optional custom loading message/spinner. */
  loadingMessage?: React.ReactNode;

  /** Accessible caption for the table. */
  caption?: string;

  /** Accessible label for the table. */
  ariaLabel?: string;
}

/**
 * Imperative handle exposed via React ref for ResponsiveAutoTable.
 */
export interface ResponsiveAutoTableHandle {
  /**
   * Invalidates cached measurements, re-measures the DOM, and recalculates visibility.
   */
  recalculate: () => void;

  /**
   * Returns current visible column keys in order.
   */
  getVisibleColumns: () => string[];
}
