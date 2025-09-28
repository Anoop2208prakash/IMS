import React, { useState, useEffect, useCallback } from 'react';
import { getInventoryItems, addInventoryItem } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import styles from './StorePage.module.scss';

interface Item { id: string; name: string; type: string; price: number; stock: number; }

const ManageInventoryPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    type: 'STATIONERY' as 'STATIONERY' | 'UNIFORM',
    price: 0,
    stock: 0,
  });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInventoryItems();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addInventoryItem({
        ...newItem,
        price: Number(newItem.price),
        stock: Number(newItem.stock),
      });
      setIsModalOpen(false);
      fetchItems();
    } catch (error) {
      alert('Failed to add item.');
    }
  };

  if (loading) return <div>Loading items...</div>;

  return (
    <div className={styles.container}>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Item">
        <form onSubmit={handleFormSubmit} className={styles.itemForm}>
          <input name="name" onChange={handleInputChange} placeholder="Item Name" required />
          <select name="type" value={newItem.type} onChange={handleInputChange}>
            <option value="STATIONERY">Stationery</option>
            <option value="UNIFORM">Uniform</option>
          </select>
          <input name="price" type="number" onChange={handleInputChange} placeholder="Price" required />
          <input name="stock" type="number" onChange={handleInputChange} placeholder="Stock Quantity" required />
          <button type="submit">Add Item</button>
        </form>
      </Modal>

      <div className={styles.header}>
        <h2>Manage Inventory</h2>
        <button onClick={() => setIsModalOpen(true)}>Add New Item</button>
      </div>

      <table className={styles.itemsTable}>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Type</th>
            <th>Price</th>
            <th>In Stock</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>{item.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageInventoryPage;