import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/student/MyInvoicesPage.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { FaFileInvoiceDollar } from 'react-icons/fa';

interface Invoice {
    id: string;
    amount: number;
    dueDate: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    feeStructure: { name: string; };
}

const MyInvoicesPage = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/fees/invoices/my-invoices');
            setInvoices(response.data);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                toast.error(err.response.data.message || 'Failed to fetch invoices.');
            } else {
                toast.error('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handlePayment = async (invoiceId: string) => {
        if (!window.confirm('This will simulate a payment for the selected invoice. Proceed?')) return;
        try {
            await axios.post('http://localhost:5000/api/fees/payments', {
                invoiceId,
                method: 'Mock Payment',
            });
            toast.success('Payment successful!');
            fetchInvoices(); // Refresh the list
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                toast.error(err.response.data.message || 'Payment failed.');
            } else {
                toast.error('An unexpected error occurred during payment.');
            }
        }
    };

    const totalDue = useMemo(() => {
        return invoices
            .filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
            .reduce((sum, inv) => sum + inv.amount, 0);
    }, [invoices]);

    // Function to render the table body based on state
    const renderTableBody = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan={5} className={styles.spinnerCell}>
                        <Spinner />
                    </td>
                </tr>
            );
        }
        if (invoices.length === 0) {
            return (
                <tr>
                    <td colSpan={5}>
                        <EmptyState message="You have no invoices." icon={<FaFileInvoiceDollar size={40} />} />
                    </td>
                </tr>
            );
        }
        return invoices.map(invoice => (
            <tr key={invoice.id}>
                <td>{invoice.feeStructure.name}</td>
                {/* Changed dollar to rupee symbol here */}
                <td>₹{invoice.amount.toFixed(2)}</td>
                <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                <td><span className={`${styles.status} ${styles[invoice.status.toLowerCase()]}`}>{invoice.status}</span></td>
                <td className={styles.actions}>
                    {invoice.status !== 'PAID' && (
                        <button className={styles.payButton} onClick={() => handlePayment(invoice.id)}>
                            Pay Now
                        </button>
                    )}
                </td>
            </tr>
        ));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>My Invoices</h2>
                <div className={styles.totalDueCard}>
                    <span>Total Outstanding</span>
                    {/* Changed dollar to rupee symbol here */}
                    <strong>₹{totalDue.toFixed(2)}</strong>
                </div>
            </div>
            <table className={styles.invoicesTable}>
                <thead>
                    <tr>
                        <th>Fee Type</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {renderTableBody()}
                </tbody>
            </table>
        </div>
    );
};

export default MyInvoicesPage;