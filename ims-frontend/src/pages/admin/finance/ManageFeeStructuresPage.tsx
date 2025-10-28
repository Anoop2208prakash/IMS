import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../../components/common/Spinner';
import EmptyState from '../../../components/common/EmptyState';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import AddFeeStructureForm from './AddFeeStructureForm';
import EditFeeStructureModal from './EditFeeStructureModal';

interface FeeStructureData {
    id: string;
    name: string;
    amount: number;
    programId: string; // Changed from courseId
    program: { title: string; }; // Changed from course
}

const ManageFeeStructuresPage = () => {
    const [structures, setStructures] = useState<FeeStructureData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingStructure, setEditingStructure] = useState<FeeStructureData | null>(null);

    const fetchStructures = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/fees/structures');
            setStructures(response.data);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                toast.error(err.response.data.message || 'Failed to fetch fee structures.');
            } else {
                toast.error('An unexpected error occurred.');
            }
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
        toast.success('Fee structure added successfully!');
    };

    const handleStructureUpdated = () => {
        setEditingStructure(null);
        fetchStructures();
        toast.success('Fee structure updated successfully!');
    };

    const handleDelete = async (structureId: string) => {
        if (!window.confirm('Are you sure you want to delete this fee structure?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/fees/structures/${structureId}`);
            setStructures(current => current.filter(s => s.id !== structureId));
            toast.success('Fee structure deleted successfully!');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                toast.error(err.response.data.message || 'Failed to delete fee structure.');
            } else {
                toast.error('An unexpected error occurred while deleting.');
            }
        }
    };

    const renderTableBody = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan={4} className={styles.spinnerCell}>
                        <Spinner />
                    </td>
                </tr>
            );
        }
        if (structures.length === 0) {
            return (
                <tr>
                    <td colSpan={4}>
                        <EmptyState 
                            message="No fee structures found. Click 'Add New Structure' to begin." 
                            icon={<FaFileInvoiceDollar size={40} />} 
                        />
                    </td>
                </tr>
            );
        }
        return structures.map((structure) => (
            <tr key={structure.id}>
                <td>{structure.name}</td>
                <td>{structure.program.title}</td>
                <td>₹{structure.amount.toFixed(2)}</td>
                <td>
                    <button onClick={() => setEditingStructure(structure)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
                    <button onClick={() => handleDelete(structure.id)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
                </td>
            </tr>
        ));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Manage Fee Structures</h2>
                <button onClick={() => setShowAddForm(true)}>
                    {showAddForm ? 'Cancel' : 'Add New Structure'}
                </button>
            </div>

            {showAddForm && <AddFeeStructureForm onFeeStructureAdded={handleStructureAdded} onCancel={() => setShowAddForm(false)} />}
            
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Fee Name</th>
                        <th>Associated Program</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {renderTableBody()}
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