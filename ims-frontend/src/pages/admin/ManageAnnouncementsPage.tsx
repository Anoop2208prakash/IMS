import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './ManageAnnouncementsPage.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { BsMegaphone } from 'react-icons/bs';

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
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/announcements');
      setAnnouncements(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch announcements.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewAnnouncement(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error('Title and content are required.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/announcements', newAnnouncement);
      toast.success('Announcement posted successfully!');
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to post announcement.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/announcements/${id}`);
      setAnnouncements(current => current.filter(ann => ann.id !== id));
      toast.success('Announcement deleted.');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete announcement.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  // --- New Render Function ---
  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (announcements.length === 0) {
      return <EmptyState message="No announcements posted yet." icon={<BsMegaphone size={40} />} />;
    }
    return announcements.map(ann => (
      <div key={ann.id} className={styles.announcementCard}>
        <h3>{ann.title}</h3>
        <p>{ann.content}</p>
        <div className={styles.meta}>
          <span>Posted by {ann.author.name} on {new Date(ann.createdAt).toLocaleDateString()}</span>
          <button onClick={() => handleDelete(ann.id)}>Delete</button>
        </div>
      </div>
    ));
  };

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
        {renderContent()} {/* <-- Call the new render function */}
      </div>
    </div>
  );
};

export default ManageAnnouncementsPage;