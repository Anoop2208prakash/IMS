import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../assets/scss/pages/admin/finance/GenerateInvoicesPage.module.scss';

interface FeeStructure {
  id: string;
  name: string;
}
interface Student {
  id: string;
  name: string;
  student: { rollNumber: string; };
}

const GenerateInvoicesPage = () => {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch both fee structures and all students when the page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [structuresRes, studentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/fees/structures'),
          axios.get('http://localhost:5000/api/students')
        ]);
        setStructures(structuresRes.data);
        setStudents(studentsRes.data);
      } catch (err) {
        setError('Failed to load initial data.');
      }
    };
    fetchData();
  }, []);

  // Handler for toggling a single student checkbox
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentIds(prevSelected =>
      prevSelected.includes(studentId)
        ? prevSelected.filter(id => id !== studentId) // Uncheck: remove ID
        : [...prevSelected, studentId] // Check: add ID
    );
  };

  // Handler for the "Select All" checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(students.map(s => s.id)); // Select all
    } else {
      setSelectedStudentIds([]); // Deselect all
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!selectedStructureId || selectedStudentIds.length === 0 || !dueDate) {
      setError('Please select a fee structure, at least one student, and a due date.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/fees/invoices/generate', {
        feeStructureId: selectedStructureId,
        studentIds: selectedStudentIds,
        dueDate,
      });
      setMessage(response.data.message);
      setSelectedStudentIds([]); // Clear selection on success
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate invoices.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Generate Invoices</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.controls}>
          <select value={selectedStructureId} onChange={e => setSelectedStructureId(e.target.value)} required>
            <option value="" disabled>-- Select Fee Structure --</option>
            {structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
        </div>

        <div className={styles.studentListContainer}>
          <h3>Select Students</h3>
          <div className={styles.studentList}>
            <div className={`${styles.studentItem} ${styles.selectAll}`}>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={students.length > 0 && selectedStudentIds.length === students.length}
              />
              <label>Select All</label>
            </div>
            {students.map(student => (
              <div key={student.id} className={styles.studentItem}>
                <input
                  type="checkbox"
                  id={student.id}
                  checked={selectedStudentIds.includes(student.id)}
                  onChange={() => handleStudentSelect(student.id)}
                />
                <label htmlFor={student.id}>{student.name} ({student.student?.rollNumber})</label>
              </div>
            ))}
          </div>
        </div>
        
        <button type="submit" className={styles.submitButton}>Generate Invoices</button>
        {message && <p className={styles.message} style={{color: 'green'}}>{message}</p>}
        {error && <p className={styles.message} style={{color: 'red'}}>{error}</p>}
      </form>
    </div>
  );
};

export default GenerateInvoicesPage;