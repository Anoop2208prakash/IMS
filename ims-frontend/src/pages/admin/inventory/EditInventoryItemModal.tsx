import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../EditTeacherModal.module.scss'; // Reuse styles

interface ItemData {
  id: string;
  name: string;
  category: 'STATIONARY' | 'OTHER';
  price: number;
  quantityInStock: number;
}

interface EditItemModalProps {
  item: ItemData;
  onClose: () => void;
  onItemUpdated: () => void;
}

const EditInventoryItemModal = ({ item, onClose, onItemUpdated }: EditItemModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'STATIONARY' as 'STATIONARY' | 'OTHER',
    price: 0,
    quantityInStock: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        price: item.price,
        quantityInStock: item.quantityInStock,
      });
    }
  }, [item]);

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
      await axios.put(`http://localhost:5000/api/inventory/${item.id}`, formData);
      onItemUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update item.');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Inventory Item</h2>
        <form onSubmit={handleSubmit}>
          <label>Item Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="STATIONARY">Stationary</option>
            <option value="OTHER">Other</option>
          </select>
          <label>Price</label>
          <input type="number" name="price" value={formData.price} min="0" step="0.01" onChange={handleChange} required />
          <label>Quantity in Stock</label>
          <input type="number" name="quantityInStock" value={formData.quantityInStock} min="0" onChange={handleChange} required />
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

export default EditInventoryItemModal;