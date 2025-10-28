import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/teacher/EnterMarksPage.module.scss';
import Spinner from '../../components/common/Spinner';

// --- Interfaces ---
interface Subject { 
  id: string; 
  title: string;
  programTitle: string; // This comes from our updated backend
}
interface Exam { id: string; name: string; totalMarks: number; }
interface Student { id: string; name: string; student: { rollNumber: string; } }

const EnterMarksPage = () => {
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // 1. Fetch teacher's subjects and all exams on load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [subjectsRes, examsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/teachers/my-subjects'),
          axios.get('http://localhost:5000/api/exams')
        ]);
        setMySubjects(subjectsRes.data);
        setExams(examsRes.data);
      } catch (error) {
        toast.error('Failed to load initial data.');
        console.error(error);
      }
    };
    fetchInitialData();
  }, []);

  // 2. Fetch students when a SUBJECT is selected
  useEffect(() => {
    if (selectedSubjectId) {
      setLoading(true);
      setStudents([]);
      setMarks({});
      axios.get(`http://localhost:5000/api/subjects/${selectedSubjectId}/students`)
        .then(res => setStudents(res.data))
        .catch(err => {
          if (axios.isAxiosError(err) && err.response) {
            toast.error(err.response.data.message || 'Failed to load students.');
          } else {
            toast.error('An unexpected error occurred.');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [selectedSubjectId]);

  const handleMarkChange = (studentId: string, value: string) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedExamId || students.length === 0) {
      toast.error('Please select a subject and an exam.');
      return;
    }

    const results = students.map(student => ({
      studentId: student.id,
      marksObtained: parseFloat(marks[student.id]) || 0,
    }));

    const promise = axios.post('http://localhost:5000/api/exam-results', {
      subjectId: selectedSubjectId, // 3. Send subjectId
      examId: selectedExamId,
      results,
    });
    
    toast.promise(promise, {
      loading: 'Submitting marks...',
      success: 'Marks submitted successfully!',
      error: (err) => err.response?.data?.message || 'Failed to submit marks.',
    });
  };

  const selectedExam = exams.find(e => e.id === selectedExamId);

  return (
    <div className={styles.container}>
      <h2>Enter Marks</h2>
      <div className={styles.controls}>
        <select onChange={e => setSelectedSubjectId(e.target.value)} value={selectedSubjectId}>
          <option value="">-- Select a Subject --</option>
          {mySubjects.map(sub => (
            <option key={sub.id} value={sub.id}>{sub.programTitle} - {sub.title}</option>
          ))}
        </select>
        <select onChange={e => setSelectedExamId(e.target.value)} value={selectedExamId}>
          <option value="">-- Select an Exam --</option>
          {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
        </select>
      </div>

      {loading && <Spinner />}

      {!loading && students.length > 0 && selectedExamId && (
        <form onSubmit={handleSubmit}>
          <table className={styles.marksTable}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Marks Obtained (out of {selectedExam?.totalMarks || 100})</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.student.rollNumber}</td>
                  <td>
                    <input
                      type="number"
                      className={styles.marksInput}
                      min="0"
                      max={selectedExam?.totalMarks || 100}
                      value={marks[student.id] || ''}
                      onChange={e => handleMarkChange(student.id, e.target.value)}
                      required
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="submit" className={styles.submitButton}>Submit Marks</button>
        </form>
      )}
    </div>
  );
};

export default EnterMarksPage;