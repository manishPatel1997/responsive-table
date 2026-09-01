import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ResponsiveTableBody } from '../ResponsiveTableBody';
import { ColumnDefinition } from '../ResponsiveAutoTable.types';

interface TestUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const visibleColumns: ColumnDefinition<TestUser>[] = [
  { key: 'name', header: 'Name', accessor: (r) => r.name },
  { key: 'email', header: 'Email', accessor: (r) => r.email },
];

const hiddenColumns: ColumnDefinition<TestUser>[] = [
  { key: 'role', header: 'Role', accessor: (r) => r.role },
  {
    key: 'status',
    header: 'Status',
    accessor: (r) => <span data-testid="status-badge">{r.status}</span>,
  },
];

const data: TestUser[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'Staff Engineer', status: 'Active' },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'Architect', status: 'Pending' },
];

describe('ResponsiveTableBody — Child Details Row', () => {
  it('does NOT render expand controls when no columns are hidden', () => {
    const { container } = render(
      <table>
        <ResponsiveTableBody
          columns={visibleColumns}
          hiddenColumns={[]}
          data={data}
          getRowKey={(r) => r.id}
        />
      </table>
    );

    const controls = container.querySelectorAll('button[aria-label*="row details"]');
    expect(controls.length).toBe(0);
  });

  it('renders expand controls in the first column when columns are hidden', () => {
    const { container } = render(
      <table>
        <ResponsiveTableBody
          columns={visibleColumns}
          hiddenColumns={hiddenColumns}
          data={data}
          getRowKey={(r) => r.id}
        />
      </table>
    );

    const controls = container.querySelectorAll('button[aria-label*="row details"]');
    expect(controls.length).toBe(2);
    expect(controls[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('expands and collapses child details row on click', () => {
    const { container, getByText, queryByText } = render(
      <table>
        <ResponsiveTableBody
          columns={visibleColumns}
          hiddenColumns={hiddenColumns}
          data={data}
          getRowKey={(r) => r.id}
        />
      </table>
    );

    const expandBtn = container.querySelector('button[aria-label="Expand row details"]') as HTMLButtonElement;
    expect(expandBtn).not.toBeNull();

    // Before click: child details not visible
    expect(queryByText('Staff Engineer')).toBeNull();

    // Click expand button
    fireEvent.click(expandBtn);

    // After click: child row is visible with React rendered badge and text
    expect(expandBtn.getAttribute('aria-expanded')).toBe('true');
    expect(getByText('Staff Engineer')).not.toBeNull();
    expect(getByText('Active')).not.toBeNull();
    expect(container.querySelector('[data-testid="status-badge"]')).not.toBeNull();

    // Click collapse button
    fireEvent.click(expandBtn);

    // After second click: child row collapsed
    expect(expandBtn.getAttribute('aria-expanded')).toBe('false');
    expect(queryByText('Staff Engineer')).toBeNull();
  });
});
