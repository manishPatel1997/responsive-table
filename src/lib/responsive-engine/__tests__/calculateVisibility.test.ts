import { describe, it, expect } from 'vitest';
import { calculateVisibleColumns } from '../calculateVisibility';
import { ColumnMeasurement } from '../types';

function mockCol(
  key: string,
  nominalWidth: number,
  priority: number = 10000,
  options: Partial<ColumnMeasurement> = {}
): ColumnMeasurement {
  const minWidth = options.minWidth ?? 50;
  const maxWidth = options.maxWidth ?? Infinity;
  const nowrap = options.nowrap ?? true;
  const compressibleWidth = nowrap ? 0 : Math.max(0, nominalWidth - minWidth);

  return {
    key,
    intrinsicWidth: nominalWidth,
    nominalWidth,
    compressibleWidth,
    minWidth,
    maxWidth,
    preferredWidth: null,
    priority,
    alwaysVisible: false,
    nowrap,
    columnIndex: 0,
    ...options,
  };
}

describe('calculateVisibleColumns — DataTables Responsive Model', () => {
  it('1. All columns fit in wide container', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('c1', 200, 1, { columnIndex: 0 }),
      mockCol('c2', 200, 2, { columnIndex: 1 }),
      mockCol('c3', 200, 3, { columnIndex: 2 }),
      mockCol('c4', 200, 4, { columnIndex: 3 }),
      mockCol('c5', 200, 5, { columnIndex: 4 }),
      mockCol('c6', 200, 6, { columnIndex: 5 }),
    ];

    const res = calculateVisibleColumns(cols, 1400);
    expect(res.visibleKeys).toEqual(['c1', 'c2', 'c3', 'c4', 'c5', 'c6']);
    expect(res.hiddenKeys).toEqual([]);
    expect(res.needsHorizontalScroll).toBe(false);
  });

  it('2. Low-priority columns hidden first', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('c1', 200, 1, { columnIndex: 0 }),
      mockCol('c2', 200, 2, { columnIndex: 1 }),
      mockCol('c3', 200, 3, { columnIndex: 2 }),
      mockCol('c4', 200, 4, { columnIndex: 3 }),
      mockCol('c5', 200, 5, { columnIndex: 4 }),
      mockCol('c6', 200, 6, { columnIndex: 5 }),
    ];

    // 800px fits approx 3 cols (3 * 200 + 1 = 601 <= 800)
    const res = calculateVisibleColumns(cols, 800);
    expect(res.visibleKeys).toEqual(['c1', 'c2', 'c3']);
    expect(res.hiddenKeys).toEqual(['c4', 'c5', 'c6']);
    expect(res.needsHorizontalScroll).toBe(false);
  });

  it('3. Equal priority -> right-to-left hiding', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('left', 200, 2, { columnIndex: 0 }),
      mockCol('middle', 200, 2, { columnIndex: 1 }),
      mockCol('right', 200, 2, { columnIndex: 2 }),
    ];

    // 450px container: 2 cols fit (2*200 + 1 = 401 <= 450). 'right' should be hidden first.
    const res = calculateVisibleColumns(cols, 450);
    expect(res.visibleKeys).toEqual(['left', 'middle']);
    expect(res.hiddenKeys).toEqual(['right']);
  });

  it('4. alwaysVisible columns are preserved while space allows', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('req1', 100, 1, { columnIndex: 0, alwaysVisible: true }),
      mockCol('opt1', 200, 2, { columnIndex: 1 }),
      mockCol('opt2', 200, 3, { columnIndex: 2 }),
      mockCol('req2', 100, 1, { columnIndex: 3, alwaysVisible: true }),
    ];

    const res = calculateVisibleColumns(cols, 250);
    expect(res.visibleKeys).toContain('req1');
    expect(res.visibleKeys).toContain('req2');
    expect(res.hiddenKeys).toEqual(['opt1', 'opt2']);
  });

  it('5. Columns progressively removed to fit container without scrollbar', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('req1', 200, 1, { columnIndex: 0, alwaysVisible: true }),
      mockCol('req2', 200, 1, { columnIndex: 1, alwaysVisible: true }),
    ];

    // 300px container: req2 is removed to fit req1 inside 300px
    const res = calculateVisibleColumns(cols, 300);
    expect(res.visibleKeys).toEqual(['req1']);
    expect(res.hiddenKeys).toEqual(['req2']);
    expect(res.needsHorizontalScroll).toBe(false);
  });

  it('6. Container expands -> previously hidden columns become visible', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('c1', 200, 1, { columnIndex: 0 }),
      mockCol('c2', 200, 2, { columnIndex: 1 }),
      mockCol('c3', 200, 3, { columnIndex: 2 }),
    ];

    const narrowRes = calculateVisibleColumns(cols, 450);
    expect(narrowRes.visibleKeys).toEqual(['c1', 'c2']);

    const wideRes = calculateVisibleColumns(cols, 700);
    expect(wideRes.visibleKeys).toEqual(['c1', 'c2', 'c3']);
  });

  it('7. Container shrinks -> additional columns hidden', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('c1', 200, 1, { columnIndex: 0 }),
      mockCol('c2', 200, 2, { columnIndex: 1 }),
      mockCol('c3', 200, 3, { columnIndex: 2 }),
    ];

    const initialRes = calculateVisibleColumns(cols, 700);
    expect(initialRes.visibleKeys).toHaveLength(3);

    const shrunkRes = calculateVisibleColumns(cols, 250);
    expect(shrunkRes.visibleKeys).toEqual(['c1']);
    expect(shrunkRes.hiddenKeys).toEqual(['c2', 'c3']);
  });

  it('11. Wrapping column compresses before hiding any column', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('id', 200, 1, { columnIndex: 0, nowrap: true }),
      mockCol('desc', 300, 3, {
        columnIndex: 1,
        nowrap: false,
        minWidth: 100,
        compressibleWidth: 200,
      }),
      mockCol('status', 200, 2, { columnIndex: 2, nowrap: true }),
    ];

    const res = calculateVisibleColumns(cols, 600);
    expect(res.visibleKeys).toEqual(['id', 'desc', 'status']);
    expect(res.hiddenKeys).toEqual([]);
    expect(res.needsHorizontalScroll).toBe(false);
  });

  it('11b. Wrapping compression insufficient -> hiding starts', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('id', 200, 1, { columnIndex: 0, nowrap: true }),
      mockCol('desc', 300, 3, {
        columnIndex: 1,
        nowrap: false,
        minWidth: 100,
        compressibleWidth: 200,
      }),
      mockCol('status', 200, 2, { columnIndex: 2, nowrap: true }),
    ];

    const res = calculateVisibleColumns(cols, 400);
    expect(res.visibleKeys).toEqual(['id']);
    expect(res.hiddenKeys).toEqual(['desc', 'status']);
  });

  it('12. Empty measurements array', () => {
    const res = calculateVisibleColumns([], 800);
    expect(res.visibleKeys).toEqual([]);
    expect(res.hiddenKeys).toEqual([]);
    expect(res.needsHorizontalScroll).toBe(false);
  });

  it('13. Progressively hides equal priority columns down to fit container', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('c1', 100, 1, { columnIndex: 0, alwaysVisible: true }),
      mockCol('c2', 100, 1, { columnIndex: 1, alwaysVisible: true }),
      mockCol('c3', 100, 1, { columnIndex: 2, alwaysVisible: true }),
    ];

    // 200px fits c1 (100) + c2 (100) = 200. c3 (rightmost) is hidden
    const res = calculateVisibleColumns(cols, 205);
    expect(res.visibleKeys).toEqual(['c1', 'c2']);
    expect(res.hiddenKeys).toEqual(['c3']);
    expect(res.needsHorizontalScroll).toBe(false);
  });

  it('14. Zero available width preserves primary column', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('req', 100, 1, { columnIndex: 0, alwaysVisible: true }),
      mockCol('opt', 100, 2, { columnIndex: 1, alwaysVisible: false }),
    ];

    const res = calculateVisibleColumns(cols, 0);
    expect(res.visibleKeys).toEqual(['req']);
    expect(res.hiddenKeys).toEqual(['opt']);
    expect(res.needsHorizontalScroll).toBe(false);
  });

  it('15. Priority invariant: Lower priority number ALWAYS preserved over higher priority number', () => {
    const cols: ColumnMeasurement[] = [
      mockCol('importantWide', 400, 1, { columnIndex: 0, alwaysVisible: true }),
      mockCol('trivialNarrow', 50, 5, { columnIndex: 1 }),
    ];

    const res = calculateVisibleColumns(cols, 300);
    expect(res.hiddenKeys).toContain('trivialNarrow');
    expect(res.visibleKeys).toEqual(['importantWide']);
    expect(res.needsHorizontalScroll).toBe(false);
  });
});
