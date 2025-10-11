import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../AdminPages.module.scss';
import AddInventoryItemForm from './AddInventoryItemForm';
import EditInventoryItemModal from './EditInventoryItemModal';

interface ItemData {
  id: string;
  name: string;
  category: 'STATIONARY' | 'OTHER';
  price: number;
  quantityInStock: number;
}

const ManageInventoryPage = () => {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemData | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      setItems(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inventory items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleItemAdded = () => {
    setShowAddForm(false);
    fetchItems();
  };

  const handleItemUpdated = () => {
    setEditingItem(null);
    fetchItems();
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${itemId}`);
      setItems(currentItems => currentItems.filter(item => item.id !== itemId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  if (loading && items.length === 0) return <p>Loading inventory...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Inventory</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {showAddForm && <AddInventoryItemForm onItemAdded={handleItemAdded} onCancel={() => setShowAddForm(false)} />}
      {error && <p className={styles.error}>{error}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
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
          ))}
        </tbody>
      </table>
      
      {editingItem && <EditInventoryItemModal item={editingItem} onClose={() => setEditingItem(null)} onItemUpdated={handleItemUpdated} />}
    </div>
  );
};

export default ManageInventoryPage;