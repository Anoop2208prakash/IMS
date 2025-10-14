import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../AdminPages.module.scss';
import Spinner from '../../../components/common/Spinner';
import EmptyState from '../../../components/common/EmptyState';
import AddInventoryItemForm from './AddInventoryItemForm';
import EditInventoryItemModal from './EditInventoryItemModal';

interface ItemData {
  id: string; name: string; category: 'UNIFORM' | 'STATIONARY' | 'OTHER';
  price: number; quantityInStock: number;
}

const ManageInventoryPage = () => {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemData | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      setItems(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch inventory items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleItemAdded = () => { setShowAddForm(false); fetchItems(); toast.success('Item added successfully!'); };
  const handleItemUpdated = () => { setEditingItem(null); fetchItems(); toast.success('Item updated successfully!'); };
  const handleDelete = async (itemId: string) => { /* ... delete logic is unchanged ... */ };

  // The top-level 'if (loading)' check is removed from here.

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Inventory</h2>
        <button onClick={() => setShowAddForm(true)}>Add New Item</button>
      </div>

      {showAddForm && <AddInventoryItemForm onItemAdded={handleItemAdded} onCancel={() => setShowAddForm(false)} />}
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Item Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            // --- Loading State ---
            <tr>
              <td colSpan={5} className={styles.spinnerCell}>
                <Spinner />
              </td>
            </tr>
          ) : items.length === 0 ? (
            // --- Empty State ---
            <tr>
              <td colSpan={5}>
                <EmptyState message="No inventory items found. Click 'Add New Item' to begin." />
              </td>
            </tr>
          ) : (
            // --- Data State ---
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.quantityInStock}</td>
                <td>
                  <button onClick={() => setEditingItem(item)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {editingItem && <EditInventoryItemModal item={editingItem} onClose={() => setEditingItem(null)} onItemUpdated={handleItemUpdated} />}
    </div>
  );
};

export default ManageInventoryPage;