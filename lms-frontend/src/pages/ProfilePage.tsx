import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, updateMyPassword, uploadProfileImage } from '../services/userService';
import Modal from '../components/common/Modal';
import axios from 'axios';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile({ name: data.name, email: data.email });
      } catch (err) {
        setError('Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updatedUser = await updateUserProfile({ name: profile.name });
      setProfile({ ...profile, name: updatedUser.name });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Failed to update profile.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordError('');
    try {
      await updateMyPassword({ 
        oldPassword: passwordData.oldPassword, 
        newPassword: passwordData.newPassword 
      });
      setIsPasswordModalOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select an image first.');
      return;
    }
    const formData = new FormData();
    formData.append('profileImage', selectedFile);
    try {
      await uploadProfileImage(formData);
      alert('Image uploaded successfully! It will appear on your ID card.');
    } catch (error) {
      alert('Failed to upload image.');
    }
  };

  if (loading && !profile.name) return <div>Loading profile...</div>;

  return (
    <div>
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password">
        <form onSubmit={handlePasswordSubmit}>
          <input type="password" name="oldPassword" placeholder="Old Password" value={passwordData.oldPassword} onChange={handlePasswordChange} required />
          <input type="password" name="newPassword" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm New Password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
          {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
          <button type="submit">Change Password</button>
        </form>
      </Modal>

      <h2>My Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="email">Email (cannot be changed)</label>
          <input type="email" id="email" value={profile.email} readOnly />
        </div>
        
        {success && <p style={{ color: 'green' }}>{success}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
      
      <button onClick={() => setIsPasswordModalOpen(true)} style={{ marginTop: '1rem' }}>
        Change Password
      </button>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Upload Profile Image</h2>
      <form onSubmit={handleImageUpload}>
        <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg" />
        <button type="submit" disabled={!selectedFile}>Upload Image</button>
      </form>
    </div>
  );
};

export default ProfilePage; 