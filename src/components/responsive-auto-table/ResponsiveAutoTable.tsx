// ============================================================
// ResponsiveAutoTable — Main Component
// ============================================================

'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  ResponsiveAutoTableProps,
  ResponsiveAutoTableHandle,
} from './ResponsiveAutoTable.types';
import { useResponsiveTableLayout } from '../../hooks/useResponsiveTableLayout';
import { MeasurementLayer } from './MeasurementLayer';
import { ResponsiveTableHeader } from './ResponsiveTableHeader';
import { ResponsiveTableBody } from './ResponsiveTableBody';
import { DebugPanel } from './DebugPanel';
import styles from './ResponsiveAutoTable.module.css';

function ResponsiveAutoTableInner<T>(
  props: ResponsiveAutoTableProps<T>,
  ref: React.ForwardedRef<ResponsiveAutoTableHandle>
) {
  const {
    columns,
    data,
    getRowKey,
    responsive = true,
    horizontalScroll = 'auto',
    sampleSize = 50,
    debugResponsive = false,
    className,
    tableClassName,
    emptyMessage,
    loading = false,
    loadingMessage,
    caption,
    ariaLabel,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const {
    visibleColumns,
    hiddenColumns,
    visibleKeys,
    needsHorizontalScroll,
    containerWidth,
    totalVisibleWidth,
    isReady,
    recalculate,
    measurements,
    measurementPhase,
    sampledIndices,
    worstCaseIndices,
  } = useResponsiveTableLayout({
    containerRef,
    measurementRef,
    tableRef,
    columns,
    data,
    responsive,
    horizontalScroll,
    sampleSize,
  });

  useImperativeHandle(
    ref,
    () => ({
      recalculate,
      getVisibleColumns: () => visibleKeys,
    }),
    [recalculate, visibleKeys]
  );

  return (
    <div
      ref={containerRef}
      className={`${styles.root} ${className ?? ''}`}
      data-ready={isReady ? 'true' : 'false'}
    >
      {/* Hidden layout-participating measurement layer */}
      <MeasurementLayer
        ref={measurementRef}
        columns={columns}
        data={data}
        sampledIndices={sampledIndices}
        measurementPhase={measurementPhase}
        worstCaseIndices={worstCaseIndices}
      />

      {/* Visible table wrapper with localized horizontal scrolling */}
      <div
        className={styles.overflowWrapper}
        data-scrollable={needsHorizontalScroll ? 'true' : 'false'}
      >
        <table
          ref={tableRef}
          className={`${styles.table} ${tableClassName ?? ''}`}
          aria-label={ariaLabel}
        >
          {caption && <caption>{caption}</caption>}
          <ResponsiveTableHeader columns={visibleColumns} />
          <ResponsiveTableBody
            columns={visibleColumns}
            hiddenColumns={hiddenColumns}
            data={data}
            getRowKey={getRowKey}
            emptyMessage={emptyMessage}
            loading={loading}
            loadingMessage={loadingMessage}
          />
        </table>
      </div>

      {/* Engineering Diagnostic Overlay */}
      {debugResponsive && (
        <DebugPanel
          measurements={measurements}
          visibleKeys={visibleKeys}
          containerWidth={containerWidth}
          totalVisibleWidth={totalVisibleWidth}
          needsHorizontalScroll={needsHorizontalScroll}
        />
      )}
    </div>
  );
}

export const ResponsiveAutoTable = forwardRef(ResponsiveAutoTableInner) as <T>(
  props: ResponsiveAutoTableProps<T> & {
    ref?: React.ForwardedRef<ResponsiveAutoTableHandle>;
  }
) => React.ReactElement;
