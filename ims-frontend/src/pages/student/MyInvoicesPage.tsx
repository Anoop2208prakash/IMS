import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import styles from './MyInvoicesPage.module.scss';

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
            const response = await axios.get('http://localhost:5000/api/fees/invoices/my-invoices');
            setInvoices(response.data);
        } catch (err) {
            console.error("Failed to fetch invoices", err);
        }
    };

    useEffect(() => {
        fetchInvoices().finally(() => setLoading(false));
    }, []);

    const handlePayment = async (invoiceId: string) => {
        if (!window.confirm('This will simulate a payment for the selected invoice. Proceed?')) return;
        try {
            await axios.post('http://localhost:5000/api/fees/payments', {
                invoiceId,
                method: 'Mock Payment',
            });
            fetchInvoices(); // Refresh the list to show the 'PAID' status
        } catch (err: any) {
            alert(err.response?.data?.message || 'Payment failed.');
        }
    };

    const totalDue = useMemo(() => {
        return invoices
            .filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
            .reduce((sum, inv) => sum + inv.amount, 0);
    }, [invoices]);

    if (loading) return <p>Loading your invoices...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>My Invoices</h2>
                <div className={styles.totalDueCard}>
                    <span>Total Outstanding</span>
                    <strong>${totalDue.toFixed(2)}</strong>
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
                    {invoices.map(invoice => (
                        <tr key={invoice.id}>
                            <td>{invoice.feeStructure.name}</td>
                            <td>${invoice.amount.toFixed(2)}</td>
                            <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                            <td><span className={`${styles.status} ${styles[invoice.status.toLowerCase()]}`}>{invoice.status}</span></td>
                            <td className={styles.actions}>
                                {invoice.status !== 'PAID' && (
                                    <button onClick={() => handlePayment(invoice.id)}>
                                        Pay Now
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MyInvoicesPage;