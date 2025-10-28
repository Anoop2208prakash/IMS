import { useState, ChangeEvent } from 'react';
import styles from '../../assets/scss/components/common/DataTable.module.scss';
import Spinner from './Spinner';
import EmptyState from './EmptyState';
import Pagination from './Pagination'; // 1. Import the Pagination component

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  renderActions?: (row: T) => React.ReactNode;
}

const DataTable = <T extends { id: string }>({ columns, data, loading, renderActions }: DataTableProps<T>) => {
  const [page, setPage] = useState(0); // 0-indexed page
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Pagination logic is now inside the DataTable
  const currentItems = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Go back to the first page
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={columns.length + (renderActions ? 1 : 0)} className={styles.spinnerCell}>
            <Spinner />
          </td>
        </tr>
      );
    }
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length + (renderActions ? 1 : 0)}>
            <EmptyState message="No data found." />
          </td>
        </tr>
      );
    }
    return currentItems.map((row) => (
      <tr key={row.id}>
        {columns.map((col) => (
          <td key={col.header}>
            {typeof col.accessor === 'function'
              ? col.accessor(row)
              : (row[col.accessor] as React.ReactNode)}
          </td>
        ))}
        {renderActions && <td>{renderActions(row)}</td>}
      </tr>
    ));
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
            {renderActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>
      
      {/* 2. Render the Pagination component at the bottom */}
      <Pagination
        count={data.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default DataTable;