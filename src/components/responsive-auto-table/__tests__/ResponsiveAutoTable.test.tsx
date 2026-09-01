import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ResponsiveAutoTable } from '../ResponsiveAutoTable';
import { ColumnDefinition } from '../ResponsiveAutoTable.types';

interface TestUser {
  id: string;
  name: string;
  role: string;
}

const columns: ColumnDefinition<TestUser>[] = [
  { key: 'name', header: 'Name', accessor: (r) => r.name, responsivePriority: 1, alwaysVisible: true },
  { key: 'role', header: 'Role', accessor: (r) => r.role, responsivePriority: 2 },
];

const data: TestUser[] = [
  { id: '1', name: 'Alice', role: 'Engineer' },
  { id: '2', name: 'Bob', role: 'Designer' },
];

describe('ResponsiveAutoTable', () => {
  it('renders semantic table structure', () => {
    const { container } = render(
      <ResponsiveAutoTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
      />
    );

    const visibleTable = container.querySelector('div[data-scrollable] > table');
    expect(visibleTable).not.toBeNull();

    const ths = visibleTable?.querySelectorAll('th');
    expect(ths?.length).toBeGreaterThanOrEqual(2);

    const rows = visibleTable?.querySelectorAll('tbody tr');
    expect(rows?.length).toBe(2);
  });

  it('renders empty message when data is empty', () => {
    const { getByText } = render(
      <ResponsiveAutoTable
        columns={columns}
        data={[]}
        emptyMessage="Custom empty state"
      />
    );

    expect(getByText('Custom empty state')).not.toBeNull();
  });

  it('renders loading message when loading is true', () => {
    const { getByText } = render(
      <ResponsiveAutoTable
        columns={columns}
        data={[]}
        loading={true}
        loadingMessage="Custom loading state"
      />
    );

    expect(getByText('Custom loading state')).not.toBeNull();
  });
});
