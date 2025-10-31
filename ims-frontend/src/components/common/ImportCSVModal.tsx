import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/components/common/ImportCSVModal.module.scss';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';

interface ImportCSVModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
  importUrl: string; // The API endpoint to send the file to
}

const ImportCSVModal = ({ onClose, onImportSuccess, importUrl }: ImportCSVModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file); // 'file' must match the multer middleware

    try {
      const response = await axios.post(importUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success(response.data.message || 'Import successful!');
      onImportSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An error occurred during import.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Import from CSV</h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <p>Select a CSV file to import. The file must have columns named "Semester Name" and "Program".</p>
          
          <div className={styles.uploadBox}>
            <input 
              type="file" 
              id="csv-upload"
              className={styles.fileInput}
              onChange={handleFileChange}
              accept=".csv"
            />
            <label htmlFor="csv-upload" className={styles.fileLabel}>
              <BsFileEarmarkArrowUp size={40} />
              <span>{file ? file.name : 'Click to select a .csv file'}</span>
            </label>
          </div>
          
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton} disabled={loading}>
            Cancel
          </button>
          <button onClick={handleUpload} className={styles.applyButton} disabled={!file || loading}>
            {loading ? 'Importing...' : 'Upload and Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportCSVModal;