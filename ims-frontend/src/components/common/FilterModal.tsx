import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/components/common/FilterModal.module.scss'; // Use the correct path

// A generic option for the dropdown
interface FilterOption {
  value: string;
  label: string;
}

interface FilterModalProps {
  onClose: () => void;
  onApply: (filters: { programId: string; semesterId: string }) => void;
  initialFilters: { programId: string; semesterId: string };
  filterType: 'program' | 'programAndSemester';
  
  // These are now required
  programLabel: string; // The label for the first dropdown
  programOptions: FilterOption[]; 
  
  // These are optional
  semesterOptions?: FilterOption[];
}

const FilterModal = ({ 
  onClose, 
  onApply, 
  initialFilters, 
  filterType,
  programLabel, // The label for the first dropdown
  programOptions = [], 
  semesterOptions = [] 
}: FilterModalProps) => {

  const [selectedProgramId, setSelectedProgramId] = useState(initialFilters.programId);
  const [selectedSemesterId, setSelectedSemesterId] = useState(initialFilters.semesterId);

  // This effect will run if the filterType is 'programAndSemester'
  // to pre-load the semesters if a program is already selected
  useEffect(() => {
    if (filterType === 'programAndSemester' && selectedProgramId !== 'all') {
      // This assumes the semesterOptions are passed in correctly
      // If not, an async fetch would be needed here
    }
  }, [filterType, selectedProgramId]);


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

  const renderFilters = () => {
    return (
      <>
        {/* FIX: Use the 'programLabel' prop for the label */}
        <label>{programLabel}</label>
        <select 
          value={selectedProgramId} 
          onChange={(e) => {
            setSelectedProgramId(e.target.value);
            if (filterType === 'programAndSemester') {
              setSelectedSemesterId('all');
            }
          }}
        >
          {/* FIX: Use the 'programOptions' prop */}
          {programOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        
        {filterType === 'programAndSemester' && (
          <>
            <label>Semester</label>
            <select 
              value={selectedSemesterId} 
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              disabled={selectedProgramId === 'all'}
            >
              {semesterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </>
        )}
      </>
    );
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