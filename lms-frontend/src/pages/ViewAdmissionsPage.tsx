import React, { useState, useEffect } from 'react';
import { getApplications } from '../services/admissionService';
import styles from './ViewAdmissionsPage.module.scss'; // Ensure you have this CSS file

interface Application {
  id: string;
  fullName: string;
  email: string;
  status: string;
  course: { title: string };
}

const ViewAdmissionsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .catch(err => console.error("Failed to fetch applications", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading applications...</div>;

  return (
    <div className={styles.container}>
      <h2>Submitted Applications</h2>
      <table className={styles.admissionsTable}>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Course</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id}>
              <td>{app.fullName}</td>
              <td>{app.email}</td>
              <td>{app.course.title}</td>
              <td>{app.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewAdmissionsPage;