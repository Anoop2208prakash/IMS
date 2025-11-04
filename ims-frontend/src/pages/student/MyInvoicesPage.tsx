import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../assets/scss/pages/student/MyInvoicesPage.module.scss';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination'; // 1. Import Pagination
import { FaFileInvoiceDollar } from 'react-icons/fa';

interface Invoice {
    id: string;
    amount: number;
    dueDate: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'; // Added CANCELLED
    feeStructure: { name: string; };
}

const MyInvoicesPage = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    // 2. Add state for Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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

    // 3. Add pagination handlers
    const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number.parseInt(event.target.value, 10));
      setPage(0);
    };

    const currentItems = invoices.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

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
        // 4. Map over currentItems
        return currentItems.map(invoice => (
            <tr key={invoice.id}>
                <td>{invoice.feeStructure.name}</td>
                <td>₹{invoice.amount.toFixed(2)}</td>
                <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                <td><span className={`${styles.status} ${styles[invoice.status.toLowerCase()]}`}>{invoice.status}</span></td>
                <td className={styles.actions}>
                    {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
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

            {/* 5. Add Pagination component */}
            <Pagination
              count={invoices.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
        </div>
    );
};

export default MyInvoicesPage;