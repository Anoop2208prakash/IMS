import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/teacher/MarkAttendancePage.module.scss';
import Spinner from '../../components/common/Spinner';

// 1. Updated interface to 'Subject'
interface Subject { 
  id: string; 
  title: string;
  semester: {
    program: {
      title: string;
    };
  };
}
interface Student { 
  id: string; 
  name: string; 
  sID: string; // Use sID
}
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

const MarkAttendancePage = () => {
  const [mySubjects, setMySubjects] = useState<Subject[]>([]); // 2. State is now Subject[]
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false); // For loading students

  // 1. Fetch the teacher's assigned SUBJECTS on load
  useEffect(() => {
    axios.get('http://localhost:5000/api/teachers/my-subjects')
      .then(res => setMySubjects(res.data))
      .catch(err => toast.error('Failed to load assigned subjects.'));
  }, []);

  // 2. Fetch students when a SUBJECT is selected
  useEffect(() => {
    if (selectedSubjectId) {
      setLoading(true);
      setStudents([]); // Clear previous students
      axios.get(`http://localhost:5000/api/subjects/${selectedSubjectId}/students`)
        .then(res => {
          setStudents(res.data);
          // Default all students to PRESENT
          const initialAttendance = res.data.reduce((acc: Record<string, AttendanceStatus>, student: Student) => {
            acc[student.id] = 'PRESENT';
            return acc;
          }, {});
          setAttendance(initialAttendance);
        })
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

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));

    const promise = axios.post('http://localhost:5000/api/attendance', {
      subjectId: selectedSubjectId, // Send subjectId
      date,
      records,
    });

    toast.promise(promise, {
      loading: 'Submitting attendance...',
      success: 'Attendance submitted successfully!',
      error: (err) => err.response?.data?.message || 'Failed to submit.'
    });
  };

  return (
    <div className={styles.container}>
      <h2>Mark Attendance</h2>
      <div className={styles.controls}>
        <select onChange={e => setSelectedSubjectId(e.target.value)} value={selectedSubjectId}>
          <option value="">-- Select a Subject --</option>
          {/* 3. Map over subjects and show program title */}
          {mySubjects.map(sub => (
            <option key={sub.id} value={sub.id}>
              {sub.semester.program.title} - {sub.title}
            </option>
          ))}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {loading && <Spinner />}
      
      {!loading && students.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className={styles.studentList}>
            {students.map(student => (
              <div key={student.id} className={styles.studentRow}>
                {/* 4. Display sID instead of rollNumber */}
                <span>{student.name} ({student.sID})</span>
                <div className={styles.statusButtons}>
                  {['PRESENT', 'ABSENT', 'LATE'].map(status => (
                    <button
                      type="button"
                      key={status}
                      className={attendance[student.id] === status ? styles.active : ''}
                      onClick={() => handleStatusChange(student.id, status as AttendanceStatus)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className={styles.submitButton}>Submit Attendance</button>
        </form>
      )}
    </div>
  );
};

export default MarkAttendancePage;