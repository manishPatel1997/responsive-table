// ============================================================
// ResponsiveAutoTable — Table Body Component
// Supports DataTables-style inline child/details row expansion for hidden columns
// ============================================================

import React, { useState, useCallback } from 'react';
import { ColumnDefinition } from './ResponsiveAutoTable.types';
import styles from './ResponsiveAutoTable.module.css';

export interface ResponsiveTableBodyProps<T> {
  columns: ColumnDefinition<T>[];
  hiddenColumns?: ColumnDefinition<T>[];
  data: T[];
  getRowKey?: (row: T, index: number) => string | number;
  emptyMessage?: React.ReactNode;
  loading?: boolean;
  loadingMessage?: React.ReactNode;
  className?: string;
}

function renderHeaderContent<T>(col: ColumnDefinition<T>): React.ReactNode {
  if (typeof col.header === 'function') {
    return col.header({ column: col });
  }
  return col.header;
}

export function ResponsiveTableBody<T>({
  columns,
  hiddenColumns = [],
  data,
  getRowKey,
  emptyMessage = 'No data available',
  loading = false,
  loadingMessage = 'Loading data...',
  className,
}: ResponsiveTableBodyProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(
    () => new Set()
  );

  const toggleRow = useCallback((rowKey: string | number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) {
        next.delete(rowKey);
      } else {
        next.add(rowKey);
      }
      return next;
    });
  }, []);

  const colSpan = Math.max(1, columns.length);
  const hasHiddenColumns = hiddenColumns.length > 0;

  if (loading) {
    return (
      <tbody className={`${styles.tbody} ${className ?? ''}`}>
        <tr>
          <td colSpan={colSpan} className={styles.loadingState}>
            {loadingMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  if (!data || data.length === 0) {
    return (
      <tbody className={`${styles.tbody} ${className ?? ''}`}>
        <tr>
          <td colSpan={colSpan} className={styles.emptyState}>
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className={`${styles.tbody} ${className ?? ''}`}>
      {data.map((row, rowIndex) => {
        const rowKey = getRowKey ? getRowKey(row, rowIndex) : rowIndex;
        const isExpanded = hasHiddenColumns && expandedRows.has(rowKey);

        return (
          <React.Fragment key={rowKey}>
            {/* Primary Table Row */}
            <tr
              className={`${styles.tr} ${isExpanded ? styles.trExpanded : ''}`}
            >
              {columns.map((col, colIndex) => {
                const cellClass =
                  col.nowrap === false ? styles.tdWrap : styles.td;
                const isFirstCol = colIndex === 0;

                return (
                  <td
                    key={col.key}
                    className={`${cellClass} ${col.className ?? ''}`}
                    data-col-key={col.key}
                  >
                    {isFirstCol && hasHiddenColumns ? (
                      <div className={styles.dtrControlWrapper}>
                        <button
                          type="button"
                          className={`${styles.dtrControl} ${
                            isExpanded ? styles.dtrControlExpanded : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(rowKey);
                          }}
                          aria-expanded={isExpanded}
                          aria-label={
                            isExpanded
                              ? 'Collapse row details'
                              : 'Expand row details'
                          }
                        >
                          <span className={styles.dtrIcon} aria-hidden="true">
                            {isExpanded ? '−' : '+'}
                          </span>
                        </button>
                        <span className={styles.dtrFirstContent}>
                          {col.accessor(row, rowIndex)}
                        </span>
                      </div>
                    ) : (
                      col.accessor(row, rowIndex)
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Child / Details Row (rendered when row is expanded and columns are hidden) */}
            {isExpanded && (
              <tr className={styles.childRow}>
                <td colSpan={columns.length} className={styles.childCell}>
                  <ul className={styles.dtrDetails}>
                    {hiddenColumns.map((hCol) => (
                      <li key={hCol.key} className={styles.dtrItem}>
                        <span className={styles.dtrTitle}>
                          {renderHeaderContent(hCol)}:
                        </span>
                        <span className={styles.dtrData}>
                          {hCol.accessor(row, rowIndex)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      })}
    </tbody>
  );
}
