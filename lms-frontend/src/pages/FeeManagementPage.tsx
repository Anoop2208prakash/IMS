import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../services/userService';
import styles from './FeeManagementPage.module.scss';

interface User {
  id: string;
  name: string;
  email: string;
}

const FeeManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Fee Management</h2>
      </div>

      <p>Select a user to view or manage their fees.</p>

      <table className={styles.usersTable}>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Link to={`/fees/user/${user.id}`}>
                  <button>View Fees</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeeManagementPage;