import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './ManageAnnouncementsPage.module.scss';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { name: string; };
}

const ManageAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      toast.error('Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewAnnouncement(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error('Title and content are required.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/announcements', newAnnouncement);
      toast.success('Announcement posted successfully!');
      setNewAnnouncement({ title: '', content: '' }); // Clear form
      fetchAnnouncements(); // Refresh the list
    } catch (error) {
      toast.error('Failed to post announcement.');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/announcements/${id}`);
      toast.success('Announcement deleted.');
      fetchAnnouncements(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete announcement.');
    }
  };

  if (loading) return <p>Loading announcements...</p>;

  return (
    <div className={styles.container}>
      {/* --- Create Announcement Form --- */}
      <div className={styles.formContainer}>
        <h2>Post a New Announcement</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Announcement Title"
            value={newAnnouncement.title}
            onChange={handleChange}
          />
          <textarea
            name="content"
            placeholder="What's the update?"
            rows={5}
            value={newAnnouncement.content}
            onChange={handleChange}
          />
          <button type="submit">Post Announcement</button>
        </form>
      </div>

      {/* --- Existing Announcements List --- */}
      <div className={styles.listContainer}>
        <h2>Recent Announcements</h2>
        {announcements.map(ann => (
          <div key={ann.id} className={styles.announcementCard}>
            <h3>{ann.title}</h3>
            <p>{ann.content}</p>
            <div className={styles.meta}>
              <span>Posted by {ann.author.name} on {new Date(ann.createdAt).toLocaleDateString()}</span>
              <button onClick={() => handleDelete(ann.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageAnnouncementsPage;