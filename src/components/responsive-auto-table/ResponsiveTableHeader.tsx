// ============================================================
// ResponsiveAutoTable — Table Header Component
// ============================================================

import React from 'react';
import { ColumnDefinition } from './ResponsiveAutoTable.types';
import styles from './ResponsiveAutoTable.module.css';

export interface ResponsiveTableHeaderProps<T> {
  columns: ColumnDefinition<T>[];
  className?: string;
}

function renderHeaderContent<T>(col: ColumnDefinition<T>): React.ReactNode {
  if (typeof col.header === 'function') {
    return col.header({ column: col });
  }
  return col.header;
}

export function ResponsiveTableHeader<T>({
  columns,
  className,
}: ResponsiveTableHeaderProps<T>) {
  return (
    <thead className={`${styles.thead} ${className ?? ''}`}>
      <tr className={styles.tr}>
        {columns.map((col) => (
          <th
            key={col.key}
            scope="col"
            className={`${styles.th} ${col.headerClassName ?? ''}`}
            data-col-key={col.key}
          >
            {renderHeaderContent(col)}
          </th>
        ))}
      </tr>
    </thead>
  );
}
