// ============================================================
// ResponsiveAutoTable — DebugPanel Component
// Responsive in-page diagnostic inspector with native details/summary
// ============================================================

import React from 'react';
import { ColumnMeasurement } from '../../lib/responsive-engine/types';
import styles from './ResponsiveAutoTable.module.css';

export interface DebugPanelProps {
  measurements: ColumnMeasurement[];
  visibleKeys: string[];
  containerWidth: number;
  totalVisibleWidth: number;
  needsHorizontalScroll: boolean;
}

export function DebugPanel({
  measurements,
  visibleKeys,
  containerWidth,
  totalVisibleWidth,
  needsHorizontalScroll,
}: DebugPanelProps) {
  const visibleSet = new Set(visibleKeys);

  return (
    <details className={styles.debugPanel} open>
      <summary className={styles.debugSummary}>
        <span className={styles.debugSummaryHeader}>
          <span className={styles.debugArrow} aria-hidden="true">
            ▶
          </span>
          <span className={styles.debugSummaryTitle}>
            ResponsiveAutoTable Debug — Container: {Math.round(containerWidth)}px
          </span>
        </span>
      </summary>

      <div className={styles.debugContent}>
        <div className={styles.debugHeader}>
          <span>
            Container width: <strong>{Math.round(containerWidth)}px</strong>
          </span>
          <span>
            {' '}
            | Visible: <strong>{visibleKeys.length} / {measurements.length}</strong>
          </span>
        </div>

        {/* Responsive Diagnostic Cards Grid */}
        <div className={styles.debugGrid}>
          {measurements.map((m) => {
            const isVisible = visibleSet.has(m.key);

            return (
              <div
                key={m.key}
                className={`${styles.debugCard} ${
                  isVisible ? styles.debugCardVisible : styles.debugCardHidden
                }`}
              >
                <div className={styles.debugCardHeader}>
                  <span className={styles.debugCardTitle}>{m.key}</span>
                  <span
                    className={`${styles.debugBadge} ${
                      isVisible
                        ? styles.debugStatusVisible
                        : styles.debugStatusHidden
                    }`}
                  >
                    {isVisible ? '● visible' : '○ hidden'}
                  </span>
                </div>

                <div className={styles.debugMetrics}>
                  <div className={styles.debugMetric}>
                    <span className={styles.debugLabel}>Intrinsic:</span>
                    <span>
                      {m.intrinsicWidth
                        ? `${Math.round(m.intrinsicWidth)}px`
                        : '—'}
                    </span>
                  </div>
                  <div className={styles.debugMetric}>
                    <span className={styles.debugLabel}>Nominal:</span>
                    <span>{Math.round(m.nominalWidth)}px</span>
                  </div>
                  <div className={styles.debugMetric}>
                    <span className={styles.debugLabel}>Min / Max:</span>
                    <span>
                      {m.minWidth}px /{' '}
                      {Number.isFinite(m.maxWidth) ? `${m.maxWidth}px` : '—'}
                    </span>
                  </div>
                  <div className={styles.debugMetric}>
                    <span className={styles.debugLabel}>Priority:</span>
                    <span>{m.priority}</span>
                  </div>
                  <div className={styles.debugMetric}>
                    <span className={styles.debugLabel}>Wrap / Always:</span>
                    <span>
                      {m.nowrap ? 'nowrap' : 'wrap'} /{' '}
                      {m.alwaysVisible ? 'yes' : 'no'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.debugFooter}>
          <div>
            Total visible required width:{' '}
            <strong>{Math.round(totalVisibleWidth)}px</strong>
          </div>
          <div>
            Horizontal scroll required:{' '}
            <strong
              style={{ color: needsHorizontalScroll ? '#f87171' : '#4ade80' }}
            >
              {needsHorizontalScroll ? 'TRUE' : 'FALSE'}
            </strong>
          </div>
        </div>
      </div>
    </details>
  );
}
