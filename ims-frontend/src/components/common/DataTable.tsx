import React from 'react';
import styles from './DataTable.module.scss';

// Defines the shape for a column's configuration
export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  // A function to render the action buttons for each row
  renderActions: (row: T) => React.ReactNode;
}

const DataTable = <T extends { id: string }>({ columns, data, renderActions }: DataTableProps<T>) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.header}>{col.header}</th>
          ))}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.header}>
                  {typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
              <td>{renderActions(row)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + 1} className={styles.noDataCell}>
              No data found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default DataTable;