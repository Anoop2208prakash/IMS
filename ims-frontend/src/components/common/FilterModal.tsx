import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/components/common/FilterModal.module.scss';

// A generic option for the dropdown
interface FilterOption {
  value: string;
  label: string;
}

interface FilterModalProps {
  onClose: () => void;
  onApply: (filters: { programId: string; semesterId: string }) => void;
  initialFilters: { programId: string; semesterId: string };
  filterType: 'program' | 'programAndSemester' | 'category';
  
  // These are optional because they are not needed for 'category'
  programOptions?: FilterOption[]; 
  semesterOptions?: FilterOption[];
}

const FilterModal = ({ 
  onClose, 
  onApply, 
  initialFilters, 
  filterType, 
  programOptions = [], // Default to empty array
  semesterOptions = [] // Default to empty array
}: FilterModalProps) => {

  // State
  const [selectedProgramId, setSelectedProgramId] = useState(initialFilters.programId);
  const [selectedSemesterId, setSelectedSemesterId] = useState(initialFilters.semesterId);

  // 1. Define the static category options
  const categoryOptions: FilterOption[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'STATIONARY', label: 'Stationary' },
    { value: 'UNIFORM', label: 'Uniform' },
    { value: 'OTHER', label: 'Other' }
  ];

  const handleApply = () => {
    onApply({ programId: selectedProgramId, semesterId: selectedSemesterId });
    onClose();
  };

  const handleReset = () => {
    setSelectedProgramId('all');
    setSelectedSemesterId('all');
    onApply({ programId: 'all', semesterId: 'all' });
    onClose();
  };

  // 2. This render function now correctly handles all 3 types
  const renderFilters = () => {
    switch (filterType) {
      case 'category':
        return (
          <>
            <label>Category</label>
            <select 
              value={selectedProgramId} // We reuse programId to store the category
              onChange={(e) => setSelectedProgramId(e.target.value)}
            >
              {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </>
        );
      
      case 'program':
        return (
          <>
            <label>Program</label>
            <select 
              value={selectedProgramId} 
              onChange={(e) => setSelectedProgramId(e.target.value)}
            >
              {programOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </>
        );

      case 'programAndSemester':
        return (
          <>
            <label>Program</label>
            <select 
              value={selectedProgramId} 
              onChange={(e) => {
                setSelectedProgramId(e.target.value);
                setSelectedSemesterId('all'); // Reset semester when program changes
              }}
            >
              {programOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            
            <label>Semester</label>
            <select 
              value={selectedSemesterId} 
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              disabled={selectedProgramId === 'all'}
            >
              {semesterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </>
        );
      
      default:
        // This is the error you were seeing
        return <p style={{ color: 'red' }}>Error: Filter type is not configured correctly.</p>;
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Filter</h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          {renderFilters()}
        </div>
        <div className={styles.modalFooter}>
          <button onClick={handleReset} className={styles.resetButton}>Reset</button>
          <div>
            <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button onClick={handleApply} className={styles.applyButton}>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;