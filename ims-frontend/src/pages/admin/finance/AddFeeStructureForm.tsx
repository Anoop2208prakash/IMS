import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../assets/scss/pages/admin/AddTeacherForm.module.scss'; // You can reuse these styles

interface Course {
    id: string;
    title: string;
}

interface AddFeeStructureFormProps {
    onFeeStructureAdded: () => void;
    onCancel: () => void;
}

const AddFeeStructureForm = ({ onFeeStructureAdded, onCancel }: AddFeeStructureFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        courseId: '',
    });
    const [courses, setCourses] = useState<Course[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch courses to populate the dropdown
        axios.get('http://localhost:5000/api/courses')
            .then(res => {
                setCourses(res.data);
                // Set a default course selection if courses exist
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, courseId: res.data[0].id }));
                }
            })
            .catch(() => setError('Could not load courses.'));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        // This is where setFormData is used
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('http://localhost:5000/api/fees/structures', formData);
            // This is where onFeeStructureAdded is called
            onFeeStructureAdded();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add fee structure.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <h3>Add New Fee Structure</h3>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Fee Name (e.g., Tuition Fee)" value={formData.name} onChange={handleChange} required />
                <input type="number" name="amount" placeholder="Amount" value={formData.amount} min="0" step="0.01" onChange={handleChange} required />
                <select name="courseId" value={formData.courseId} onChange={handleChange} required>
                    <option value="" disabled>-- Select a Course --</option>
                    {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.buttonGroup}>
                    <button type="submit">Add Structure</button>
                    <button type="button" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AddFeeStructureForm;