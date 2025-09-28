import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import styles from './UserManagementPage.module.scss';
import type { Role } from '../types';


interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const UserManagementPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const ROLES: Role[] = ['USER', 'ADMIN', 'SUPER_ADMIN', 'ADMIN_LIBRARY', 'ADMIN_UNIFORMS', 'ADMIN_STATIONERY', 'ADMIN_ADMISSION'];

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModal = (userToEdit: User | null = null) => {
    setEditingUser(userToEdit || { name: '', email: '', password: '', role: 'USER' });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit: any = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
      };

      if (!editingUser.id || editingUser.password) {
        dataToSubmit.password = editingUser.password;
      }

      if (editingUser.id) {
        await updateUser(editingUser.id, dataToSubmit);
      } else {
        await createUser(dataToSubmit);
      }
      
      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      alert('Operation failed. Please check the details and try again.');
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This is irreversible.')) {
      try {
        await deleteUser(userId);
        fetchUsers();
      } catch (error) {
        alert('Failed to delete user. They may have related records (loans, fees) that must be handled first.');
      }
    }
  };

  if (loading) return <div>Loading users...</div>;

  const canCreateUsers = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_ADMISSION';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className={styles.container}>
      {editingUser && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser.id ? 'Edit User' : 'Create User'}>
          <form onSubmit={handleFormSubmit}>
            <input name="name" value={editingUser.name} onChange={handleFormChange} placeholder="Name" required />
            <input name="email" type="email" value={editingUser.email} onChange={handleFormChange} placeholder="Email" required />
            
            <input 
              name="password"
              type="password"
              onChange={handleFormChange}
              placeholder={editingUser.id ? "New Password (optional)" : "Password"}
              required={!editingUser.id}
            />
            
            <select name="role" value={editingUser.role} onChange={handleFormChange} disabled={!isSuperAdmin}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit">{editingUser.id ? 'Update User' : 'Create User'}</button>
          </form>
        </Modal>
      )}

      <div className={styles.header}>
        <h2>User Management</h2>
        {canCreateUsers && (
          <button onClick={() => handleOpenModal()}>Create New User</button>
        )}
      </div>

      <table className={styles.usersTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            {isSuperAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              {isSuperAdmin && (
                <td>
                  <button onClick={() => handleOpenModal(u)}>Edit</button>
                  <button onClick={() => handleDelete(u.id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementPage;