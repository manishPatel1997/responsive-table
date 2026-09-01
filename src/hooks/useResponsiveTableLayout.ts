// ============================================================
// ResponsiveAutoTable — Responsive Table Layout Hook
// Connects ResizeObserver, DOM Measurement, and Pure Calculation Engine
// with active post-layout DOM overlap verification
// ============================================================

import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  useEffect,
  useMemo,
} from 'react';
import {
  ColumnMeasurement,
  MeasurementPhase,
  WorstCaseIndices,
  ENGINE_DEFAULTS,
} from '../lib/responsive-engine/types';
import {
  generateColumnsFingerprint,
  sampleRowIndices,
} from '../lib/responsive-engine/utils';
import { calculateVisibleColumns } from '../lib/responsive-engine/calculateVisibility';
import { resolveOverflow } from '../lib/responsive-engine/calculateOverflow';
import {
  measureCandidateCells,
  measureWorstCaseRow,
} from '../lib/responsive-engine/measure';
import { ColumnDefinition } from '../components/responsive-auto-table/ResponsiveAutoTable.types';

// Isomorphic layout effect for SSR safety
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface UseResponsiveTableLayoutOptions<T> {
  containerRef: React.RefObject<HTMLDivElement | null>;
  measurementRef: React.RefObject<HTMLDivElement | null>;
  tableRef?: React.RefObject<HTMLTableElement | null>;
  columns: ColumnDefinition<T>[];
  data: T[];
  responsive?: boolean;
  horizontalScroll?: 'auto' | 'always' | 'never';
  sampleSize?: number;
}

export interface UseResponsiveTableLayoutReturn<T> {
  visibleColumns: ColumnDefinition<T>[];
  hiddenColumns: ColumnDefinition<T>[];
  visibleKeys: string[];
  hiddenKeys: string[];
  needsHorizontalScroll: boolean;
  containerWidth: number;
  totalVisibleWidth: number;
  isReady: boolean;
  recalculate: () => void;
  measurements: ColumnMeasurement[];
  measurementPhase: MeasurementPhase;
  sampledIndices: number[];
  worstCaseIndices: WorstCaseIndices;
}

export function useResponsiveTableLayout<T>({
  containerRef,
  measurementRef,
  tableRef,
  columns,
  data,
  responsive = true,
  horizontalScroll = 'auto',
  sampleSize = ENGINE_DEFAULTS.DEFAULT_SAMPLE_SIZE,
}: UseResponsiveTableLayoutOptions<T>): UseResponsiveTableLayoutReturn<T> {
  // Measurement state
  const [measurementPhase, setMeasurementPhase] =
    useState<MeasurementPhase>('candidates');
  const [sampledIndices, setSampledIndices] = useState<number[]>(() =>
    sampleRowIndices(data.length, sampleSize)
  );
  const [worstCaseIndices, setWorstCaseIndices] = useState<WorstCaseIndices>(
    {}
  );
  const [measurements, setMeasurements] = useState<ColumnMeasurement[]>([]);

  // Layout calculation state
  const [visibleKeys, setVisibleKeys] = useState<string[]>(() =>
    columns.map((c) => c.key)
  );
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [needsHorizontalScroll, setNeedsHorizontalScroll] =
    useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [totalVisibleWidth, setTotalVisibleWidth] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Cache & reference trackers
  const lastDataRef = useRef<T[] | null>(null);
  const lastColumnsFingerprintRef = useRef<string>('');
  const animationFrameRef = useRef<number | null>(null);
  const containerWidthRef = useRef<number>(0);
  containerWidthRef.current = containerWidth;

  const currentColumnsFingerprint = useMemo(
    () => generateColumnsFingerprint(columns),
    [columns]
  );

  // Check if data or columns changed to initiate re-measurement
  useEffect(() => {
    const isDataChanged = data !== lastDataRef.current;
    const isColumnsChanged =
      currentColumnsFingerprint !== lastColumnsFingerprintRef.current;

    if (isDataChanged || isColumnsChanged) {
      lastDataRef.current = data;
      lastColumnsFingerprintRef.current = currentColumnsFingerprint;

      const newSampled = sampleRowIndices(data.length, sampleSize);
      setSampledIndices(newSampled);
      setMeasurementPhase('candidates');
    }
  }, [data, currentColumnsFingerprint, sampleSize]);

  // Imperative recalculate handle
  const recalculate = useCallback(() => {
    lastDataRef.current = null;
    lastColumnsFingerprintRef.current = '';
    const newSampled = sampleRowIndices(data.length, sampleSize);
    setSampledIndices(newSampled);
    setMeasurementPhase('candidates');
  }, [data, sampleSize]);

  // Two-Phase DOM Measurement Orchestration
  useIsomorphicLayoutEffect(() => {
    if (!responsive || columns.length === 0) {
      setVisibleKeys(columns.map((c) => c.key));
      setHiddenKeys([]);
      setIsReady(true);
      return;
    }

    const measurementEl = measurementRef.current;
    if (!measurementEl) return;

    if (measurementPhase === 'candidates') {
      // Phase 1: Read isolated candidate cells
      const candidates = measureCandidateCells(measurementEl, columns);
      setWorstCaseIndices(candidates);
      setMeasurementPhase('worst-case');
    } else if (measurementPhase === 'worst-case') {
      // Phase 2: Read single worst-case row table
      const measured = measureWorstCaseRow(measurementEl, columns);
      setMeasurements(measured);

      // Perform initial visibility calculation
      const currentWidth =
        containerRef.current?.getBoundingClientRect().width ||
        containerWidthRef.current;

      if (currentWidth > 0) {
        const vis = calculateVisibleColumns(measured, currentWidth);
        const ovf = resolveOverflow(vis, horizontalScroll);

        setVisibleKeys(vis.visibleKeys);
        setHiddenKeys(vis.hiddenKeys);
        setNeedsHorizontalScroll(ovf.enableHorizontalScroll);
        setTotalVisibleWidth(vis.totalVisibleWidth);
        setContainerWidth(currentWidth);
        setIsReady(true);
      }

      setMeasurementPhase('idle');
    }
  }, [
    measurementPhase,
    responsive,
    columns,
    horizontalScroll,
    measurementRef,
    containerRef,
  ]);

  // Helper to re-run pure calculations on container width change
  const applyLayout = useCallback(
    (width: number, activeMeasurements: ColumnMeasurement[]) => {
      if (!responsive) {
        setVisibleKeys(columns.map((c) => c.key));
        setHiddenKeys([]);
        setIsReady(true);
        return;
      }

      if (width <= 0 || activeMeasurements.length === 0) {
        return;
      }

      const vis = calculateVisibleColumns(activeMeasurements, width);
      const ovf = resolveOverflow(vis, horizontalScroll);

      setVisibleKeys(vis.visibleKeys);
      setHiddenKeys(vis.hiddenKeys);
      setNeedsHorizontalScroll(ovf.enableHorizontalScroll);
      setTotalVisibleWidth(vis.totalVisibleWidth);
      setIsReady(true);
    },
    [responsive, columns, horizontalScroll]
  );

  // ResizeObserver on the container element
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;

        // Ignore micro-fluctuations (< 0.5px) if already initialized
        if (
          isReady &&
          Math.abs(newWidth - containerWidthRef.current) < 0.5
        ) {
          continue;
        }

        // Cancel previous rAF
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        // Batch resize calculation in requestAnimationFrame
        animationFrameRef.current = requestAnimationFrame(() => {
          setContainerWidth(newWidth);
          containerWidthRef.current = newWidth;

          if (measurements.length > 0) {
            applyLayout(newWidth, measurements);
          } else if (newWidth > 0 && measurementPhase === 'idle') {
            // If container just became visible from zero width, trigger measurement
            setMeasurementPhase('candidates');
          }
        });
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [containerRef, measurements, measurementPhase, isReady, applyLayout]);

  // Active Post-Render DOM Overlap Verification (DataTables Responsive active check)
  // If the rendered table's actual scrollWidth > container clientWidth, immediately
  // push down the lowest-priority visible column until no overlap exists.
  useIsomorphicLayoutEffect(() => {
    if (!responsive || !isReady || visibleKeys.length <= 1) return;

    const tableEl = tableRef?.current;
    const containerEl = containerRef?.current;
    if (!tableEl || !containerEl) return;

    const tableScrollWidth = tableEl.scrollWidth;
    const containerClientWidth = containerEl.clientWidth;

    // If actual rendered table overflows container boundary (even by 1px)
    if (tableScrollWidth > containerClientWidth + 1) {
      // Find the lowest priority column currently visible (excluding primary index 0)
      const visibleCandidates = measurements
        .filter((m) => visibleKeys.includes(m.key) && m.columnIndex !== 0)
        .sort((a, b) => {
          if (b.priority !== a.priority) return b.priority - a.priority;
          return b.columnIndex - a.columnIndex;
        });

      if (visibleCandidates.length > 0) {
        const colToHide = visibleCandidates[0].key;
        setVisibleKeys((prev) => prev.filter((k) => k !== colToHide));
        setHiddenKeys((prev) => (prev.includes(colToHide) ? prev : [...prev, colToHide]));
      }
    }
  }, [
    responsive,
    isReady,
    visibleKeys,
    containerWidth,
    tableRef,
    containerRef,
    measurements,
  ]);

  // Map visible and hidden ColumnDefinition lists
  const columnMap = useMemo(() => {
    const map = new Map<string, ColumnDefinition<T>>();
    for (const col of columns) {
      map.set(col.key, col);
    }
    return map;
  }, [columns]);

  const visibleColumns = useMemo(
    () =>
      visibleKeys
        .map((key) => columnMap.get(key))
        .filter((col): col is ColumnDefinition<T> => col !== undefined),
    [visibleKeys, columnMap]
  );

  const hiddenColumns = useMemo(
    () =>
      hiddenKeys
        .map((key) => columnMap.get(key))
        .filter((col): col is ColumnDefinition<T> => col !== undefined),
    [hiddenKeys, columnMap]
  );

  return {
    visibleColumns,
    hiddenColumns,
    visibleKeys,
    hiddenKeys,
    needsHorizontalScroll,
    containerWidth,
    totalVisibleWidth,
    isReady,
    recalculate,
    measurements,
    measurementPhase,
    sampledIndices,
    worstCaseIndices,
  };
}
