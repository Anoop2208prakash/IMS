import React from 'react';
import styles from '../../assets/scss/components/common/DeleteModal.module.scss';
import { BsExclamationTriangleFill } from 'react-icons/bs';

interface DeleteModalProps {
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const DeleteModal = ({ title, message, onClose, onConfirm, loading = false }: DeleteModalProps) => {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.iconWrapper}>
          <BsExclamationTriangleFill />
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className={styles.buttonGroup}>
          <button onClick={onClose} disabled={loading} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className={styles.confirmButton}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;