import React, { ChangeEvent } from 'react';
import styles from '../../assets/scss/components/common/Pagination.module.scss';

interface PaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

const Pagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: PaginationProps) => {
  const from = count === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min(count, (page + 1) * rowsPerPage);

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.rowsPerPage}>
        <span>Rows per page:</span>
        <select value={rowsPerPage} onChange={onRowsPerPageChange}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className={styles.rangeDisplay}>
        {from}-{to} of {count}
      </div>

      <div className={styles.navigation}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          {'<'}
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={to >= count}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default Pagination;