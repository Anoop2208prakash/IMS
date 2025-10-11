import React, { useState } from 'react';
import axios from 'axios';
import styles from '../AddTeacherForm.module.scss'; // Reuse styles

interface AddItemFormProps {
  onItemAdded: () => void;
  onCancel: () => void;
}

const AddInventoryItemForm = ({ onItemAdded, onCancel }: AddItemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'UNIFORM', // Default to UNIFORM
    price: '',
    quantityInStock: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/inventory', formData);
      onItemAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item.');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Inventory Item</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Item Name" onChange={handleChange} required />
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="UNIFORM">Uniform</option>
          <option value="STATIONARY">Stationary</option>
          <option value="OTHER">Other</option>
        </select>
        <input type="number" name="price" placeholder="Price" min="0" step="0.01" onChange={handleChange} required />
        <input type="number" name="quantityInStock" min="0" placeholder="Quantity in Stock" onChange={handleChange} required />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonGroup}>
          <button type="submit">Add Item</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddInventoryItemForm;