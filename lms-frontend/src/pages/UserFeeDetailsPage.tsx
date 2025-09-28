import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getUserFees, createFee, recordPayment } from '../services/feeService';
import { getCourses } from '../services/courseService';
import Modal from '../components/common/Modal';
import styles from './FeeManagementPage.module.scss';

interface Fee {
  id: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  course: {
    title: string;
  };
}

interface Course {
  id: string;
  title: string;
}

const UserFeeDetailsPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [fees, setFees] = useState<Fee[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFee, setNewFee] = useState({ courseId: '', amount: 0, dueDate: '' });

  const fetchFees = useCallback(async () => {
    if (userId) {
      try {
        const data = await getUserFees(userId);
        setFees(data);
      } catch (error) {
        console.error("Failed to fetch user fees", error);
      }
    }
  }, [userId]);

  useEffect(() => {
    const loadData = async () => {
      if (userId) {
        try {
          setLoading(true);
          const [feeData, courseData] = await Promise.all([
            getUserFees(userId),
            getCourses(),
          ]);
          setFees(feeData);
          setCourses(courseData);
        } catch (error) {
          console.error("Failed to load data", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [userId, fetchFees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewFee(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newFee.courseId) return;
    try {
      await createFee({
        ...newFee,
        userId,
        amount: Number(newFee.amount)
      });
      setIsModalOpen(false);
      setNewFee({ courseId: '', amount: 0, dueDate: '' });
      fetchFees();
    } catch (error) {
      alert('Failed to assign fee.');
    }
  };

  const handleRecordPayment = async (fee: Fee) => {
    if (window.confirm(`Record a payment of $${fee.amount.toFixed(2)} for ${fee.course.title}?`)) {
      try {
        await recordPayment({ feeId: fee.id, amount: fee.amount });
        fetchFees();
      } catch (error) {
        alert('Failed to record payment.');
      }
    }
  };

  if (loading) return <div>Loading fee details...</div>;

  return (
    <div className={styles.container}>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign New Fee">
        <form onSubmit={handleFormSubmit}>
          <select name="courseId" value={newFee.courseId} onChange={handleInputChange} required>
            <option value="">Select a Course</option>
            {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <input name="amount" type="number" value={newFee.amount || ''} onChange={handleInputChange} placeholder="Amount" required />
          <input name="dueDate" type="date" value={newFee.dueDate} onChange={handleInputChange} required />
          <button type="submit">Assign Fee</button>
        </form>
      </Modal>

      <div className={styles.header}>
        <h2>Fee Details</h2>
        <button onClick={() => setIsModalOpen(true)}>Assign New Fee</button>
      </div>

      {fees.length > 0 ? (
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th>Course</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.map(fee => (
              <tr key={fee.id}>
                <td>{fee.course.title}</td>
                <td>${fee.amount.toFixed(2)}</td>
                <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                <td>
                  <span className={fee.isPaid ? styles.paid : styles.pending}>
                    {fee.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td>
                  {!fee.isPaid && (
                    <button onClick={() => handleRecordPayment(fee)}>
                      Record Payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No fees found for this user.</p>
      )}
    </div>
  );
};

export default UserFeeDetailsPage;