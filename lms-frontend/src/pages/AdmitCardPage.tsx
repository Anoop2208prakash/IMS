import React, { useState, useEffect } from 'react';
import { getMyRegistrations } from '../services/examService';
import { useAuth } from '../context/AuthContext';
import styles from './AdmitCardPage.module.scss';

interface Registration {
  id: string;
  exam: {
    title: string;
    date: string;
    course: {
      courseCode: string;
      title: string;
    };
  };
}

const AdmitCardPage = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const data = await getMyRegistrations();
        setRegistrations(data);
      } catch (error) {
        console.error("Failed to fetch registrations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  if (loading) return <div>Generating your admit card...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.admitCard}>
        <div className={styles.header}>
          <h2>Admit Card - Mid Term Examinations</h2>
          <h3>Institute of Technology</h3>
        </div>
        <div className={styles.studentInfo}>
          <p><strong>Student Name:</strong> {user?.name}</p>
          <p><strong>Student ID:</strong> {user?.userId.substring(0, 8).toUpperCase()}</p>
        </div>
        <table className={styles.examsTable}>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Exam</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(reg => (
              <tr key={reg.id}>
                <td>{reg.exam.course.courseCode}</td>
                <td>{reg.exam.course.title}</td>
                <td>{reg.exam.title}</td>
                <td>{new Date(reg.exam.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.footer}>
          <p><strong>Instructions:</strong> Please bring a valid photo ID. No electronic devices are allowed in the exam hall.</p>
          <p className={styles.signature}>Registrar's Signature</p>
        </div>
      </div>
      <button className={styles.printButton} onClick={() => window.print()}>
        Print Admit Card
      </button>
    </div>
  );
};

export default AdmitCardPage;