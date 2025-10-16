import styles from './DataTable.module.scss';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  // Make the renderActions prop optional by adding a '?'
  renderActions?: (row: T) => React.ReactNode;
}

const DataTable = <T extends { id: string }>({ columns, data, renderActions }: DataTableProps<T>) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.header}>{col.header}</th>
          ))}
          {/* Only render the 'Actions' header if the function is provided */}
          {renderActions && <th>Actions</th>}
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
              {/* Only render the actions cell if the function is provided */}
              {renderActions && <td>{renderActions(row)}</td>}
            </tr>
          ))
        ) : (
          <tr>
            {/* Adjust colspan to account for the optional actions column */}
            <td colSpan={renderActions ? columns.length + 1 : columns.length} className={styles.noDataCell}>
              No data found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default DataTable;