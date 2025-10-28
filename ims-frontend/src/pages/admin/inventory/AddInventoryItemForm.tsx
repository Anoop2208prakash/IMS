import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../../assets/scss/pages//admin/AddForm.module.scss'; // <-- Make sure this path is correct

interface AddItemFormProps {
  onItemAdded: () => void;
  onCancel: () => void;
}

const AddInventoryItemForm = ({ onItemAdded, onCancel }: AddItemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'STATIONARY' as 'STATIONARY' | 'UNIFORM' | 'OTHER',
    price: '',
    quantityInStock: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/inventory', formData);
      onItemAdded();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to add item.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Inventory Item</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text" name="name" placeholder="Item Name"
          value={formData.name} onChange={handleChange} required
        />
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="STATIONARY">Stationary</option>
          <option value="UNIFORM">Uniform</option>
          <option value="OTHER">Other</option>
        </select>
        <input
          type="number" name="price" placeholder="Price (₹)" min="0" step="0.01"
          value={formData.price} onChange={handleChange} required
        />
        <input
          type="number" name="quantityInStock" placeholder="Quantity in Stock" min="0"
          value={formData.quantityInStock} onChange={handleChange} required
        />
        <div className={styles.buttonGroup}>
          <button type="submit">Add Item</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddInventoryItemForm;