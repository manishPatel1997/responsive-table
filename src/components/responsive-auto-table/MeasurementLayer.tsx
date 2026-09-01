// ============================================================
// ResponsiveAutoTable — MeasurementLayer Component
// Hidden off-screen layout-participating table container for DOM measurement
// ============================================================

import React, { forwardRef } from 'react';
import { ColumnDefinition } from './ResponsiveAutoTable.types';
import { MeasurementPhase, WorstCaseIndices } from '../../lib/responsive-engine/types';
import styles from './ResponsiveAutoTable.module.css';

export interface MeasurementLayerProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  sampledIndices: number[];
  measurementPhase: MeasurementPhase;
  worstCaseIndices: WorstCaseIndices;
}

function renderHeaderContent<T>(col: ColumnDefinition<T>): React.ReactNode {
  if (typeof col.header === 'function') {
    return col.header({ column: col });
  }
  return col.header;
}

function MeasurementLayerComponent<T>(
  props: MeasurementLayerProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const { columns, data, sampledIndices, measurementPhase, worstCaseIndices } =
    props;

  if (measurementPhase === 'idle' || columns.length === 0) {
    return (
      <div
        ref={ref}
        className={styles.measurementLayer}
        aria-hidden="true"
        data-measurement-phase="idle"
      />
    );
  }

  if (measurementPhase === 'candidates') {
    return (
      <div
        ref={ref}
        className={styles.measurementLayer}
        aria-hidden="true"
        data-measurement-phase="candidates"
      >
        {columns.map((col) => {
          return (
            <React.Fragment key={col.key}>
              {/* Header measurement table */}
              <table className={styles.candidateTable}>
                <thead>
                  <tr className={styles.thead}>
                    <th
                      className={`${styles.th} ${styles.measurementCell}`}
                      data-col-key={col.key}
                      data-is-header="true"
                    >
                      {renderHeaderContent(col)}
                    </th>
                  </tr>
                </thead>
              </table>

              {/* Sampled candidate cell tables */}
              {sampledIndices.map((rowIdx) => {
                const row = data[rowIdx];
                if (!row) return null;
                return (
                  <table
                    key={`${col.key}-${rowIdx}`}
                    className={styles.candidateTable}
                  >
                    <tbody>
                      <tr className={styles.tr}>
                        <td
                          className={`${styles.td} ${styles.measurementCell}`}
                          data-col-key={col.key}
                          data-row-idx={rowIdx}
                        >
                          {col.accessor(row, rowIdx)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Phase 2: 'worst-case' multi-column table
  return (
    <div
      ref={ref}
      className={styles.measurementLayer}
      aria-hidden="true"
      data-measurement-phase="worst-case"
    >
      <table className={styles.measurementTable}>
        <thead>
          <tr className={styles.thead}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${styles.th} ${styles.measurementCell}`}
                data-col-key={col.key}
                scope="col"
              >
                {renderHeaderContent(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className={styles.tr}>
            {columns.map((col) => {
              const rowIdx = worstCaseIndices[col.key] ?? 0;
              const row = data[rowIdx] ?? data[0];
              return (
                <td
                  key={col.key}
                  className={`${styles.td} ${styles.measurementCell}`}
                  data-col-key={col.key}
                >
                  {row ? col.accessor(row, rowIdx) : null}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export const MeasurementLayer = forwardRef(MeasurementLayerComponent) as <T>(
  props: MeasurementLayerProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;
