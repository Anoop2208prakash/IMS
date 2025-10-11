import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../EditTeacherModal.module.scss'; // Reuse styles

interface Course { id: string; title: string; }

interface FeeStructureData {
    id: string;
    name: string;
    amount: number;
    courseId: string;
}

interface EditFeeStructureModalProps {
    structure: FeeStructureData;
    onClose: () => void;
    onFeeStructureUpdated: () => void;
}

const EditFeeStructureModal = ({ structure, onClose, onFeeStructureUpdated }: EditFeeStructureModalProps) => {
    const [formData, setFormData] = useState({ name: '', amount: 0, courseId: '' });
    const [courses, setCourses] = useState<Course[]>([]);
    const [error, setError] = useState('');

    // Fetch all courses for the dropdown menu
    useEffect(() => {
        axios.get('http://localhost:5000/api/courses')
            .then(res => setCourses(res.data))
            .catch(() => setError('Could not load courses.'));
    }, []);

    // Pre-fill the form with the structure's data when the modal opens
    useEffect(() => {
        if (structure) {
            setFormData({
                name: structure.name,
                amount: structure.amount,
                courseId: structure.courseId,
            });
        }
    }, [structure]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await axios.put(`http://localhost:5000/api/fees/structures/${structure.id}`, formData);
            onFeeStructureUpdated();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update fee structure.');
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h2>Edit Fee Structure</h2>
                <form onSubmit={handleSubmit}>
                    <label>Fee Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    <label>Amount</label>
                    <input type="number" name="amount" value={formData.amount} min="0" step="0.01" onChange={handleChange} required />
                    <label>Associated Course</label>
                    <select name="courseId" value={formData.courseId} onChange={handleChange} required>
                        <option value="" disabled>-- Select a Course --</option>
                        {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                    </select>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.buttonGroup}>
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditFeeStructureModal;