import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MeasurementLayer } from '../MeasurementLayer';
import { ColumnDefinition } from '../ResponsiveAutoTable.types';

interface TestRow {
  id: string;
  name: string;
  role: string;
}

const mockColumns: ColumnDefinition<TestRow>[] = [
  { key: 'name', header: 'Name', accessor: (r) => r.name },
  { key: 'role', header: 'Role', accessor: (r) => r.role },
];

const mockData: TestRow[] = [
  { id: '1', name: 'Alice', role: 'Engineer' },
  { id: '2', name: 'Bob', role: 'Architect' },
];

describe('MeasurementLayer', () => {
  it('renders isolated candidate tables in Phase 1 (candidates)', () => {
    const { container } = render(
      <MeasurementLayer
        columns={mockColumns}
        data={mockData}
        sampledIndices={[0, 1]}
        measurementPhase="candidates"
        worstCaseIndices={{ name: 0, role: 0 }}
      />
    );

    const layer = container.querySelector('[data-measurement-phase="candidates"]');
    expect(layer).not.toBeNull();
    expect(layer?.getAttribute('aria-hidden')).toBe('true');

    // Each column has 1 header table + 2 candidate tables = 3 tables per column * 2 columns = 6 tables
    const candidateTables = container.querySelectorAll('table');
    expect(candidateTables.length).toBe(6);

    const cells = container.querySelectorAll('td[data-col-key]');
    expect(cells.length).toBe(4); // 2 rows * 2 columns
  });

  it('renders a single multi-column table in Phase 2 (worst-case)', () => {
    const { container } = render(
      <MeasurementLayer
        columns={mockColumns}
        data={mockData}
        sampledIndices={[0, 1]}
        measurementPhase="worst-case"
        worstCaseIndices={{ name: 1, role: 0 }}
      />
    );

    const layer = container.querySelector('[data-measurement-phase="worst-case"]');
    expect(layer).not.toBeNull();

    const tables = container.querySelectorAll('table');
    expect(tables.length).toBe(1);

    const ths = container.querySelectorAll('th[data-col-key]');
    expect(ths.length).toBe(2);

    const tds = container.querySelectorAll('td[data-col-key]');
    expect(tds.length).toBe(2);
  });

  it('renders empty container in Phase idle', () => {
    const { container } = render(
      <MeasurementLayer
        columns={mockColumns}
        data={mockData}
        sampledIndices={[0, 1]}
        measurementPhase="idle"
        worstCaseIndices={{}}
      />
    );

    const layer = container.querySelector('[data-measurement-phase="idle"]');
    expect(layer).not.toBeNull();
    expect(container.querySelectorAll('table').length).toBe(0);
  });
});
