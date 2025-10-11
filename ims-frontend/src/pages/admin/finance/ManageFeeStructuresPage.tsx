import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../AdminPages.module.scss';
import AddFeeStructureForm from './AddFeeStructureForm';
import EditFeeStructureModal from './EditFeeStructureModal';

interface FeeStructureData {
    id: string;
    name: string;
    amount: number;
    courseId: string; // Needed for the Edit Modal
    course: { title: string; };
}

const ManageFeeStructuresPage = () => {
    const [structures, setStructures] = useState<FeeStructureData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingStructure, setEditingStructure] = useState<FeeStructureData | null>(null);

    const fetchStructures = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/fees/structures');
            setStructures(response.data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch fee structures.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStructures();
    }, []);

    const handleStructureAdded = () => {
        setShowAddForm(false);
        fetchStructures();
    };

    const handleStructureUpdated = () => {
        setEditingStructure(null);
        fetchStructures();
    };

    const handleDelete = async (structureId: string) => {
        if (!window.confirm('Are you sure you want to delete this fee structure?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/fees/structures/${structureId}`);
            setStructures(current => current.filter(s => s.id !== structureId));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete fee structure.');
        }
    };

    if (loading) return <p>Loading fee structures...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Manage Fee Structures</h2>
                <button onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'Cancel' : 'Add New Structure'}
                </button>
            </div>

            {showAddForm && <AddFeeStructureForm onFeeStructureAdded={handleStructureAdded} onCancel={() => setShowAddForm(false)} />}
            {error && <p className={styles.error}>{error}</p>}

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Fee Name</th>
                        <th>Associated Course</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {structures.map((structure) => (
                        <tr key={structure.id}>
                            <td>{structure.name}</td>
                            <td>{structure.course.title}</td>
                            <td>${structure.amount.toFixed(2)}</td>
                            <td>
                                <button onClick={() => setEditingStructure(structure)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
                                <button onClick={() => handleDelete(structure.id)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingStructure && (
                <EditFeeStructureModal
                    structure={editingStructure}
                    onClose={() => setEditingStructure(null)}
                    onFeeStructureUpdated={handleStructureUpdated}
                />
            )}
        </div>
    );
};

export default ManageFeeStructuresPage;