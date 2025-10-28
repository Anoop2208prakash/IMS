import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../../assets/scss/pages/admin/EditModal.module.scss'; // Reuse generic modal styles

// 1. Ensure this interface matches the one in your page
interface ItemData {
  id: string;
  name: string;
  category: 'UNIFORM' | 'STATIONARY' | 'OTHER';
  price: number;
  quantityInStock: number;
}

// 2. Define the props to accept 'item'
interface EditItemModalProps {
  item: ItemData;
  onClose: () => void;
  onItemUpdated: () => void;
}

// 3. Destructure the 'item' prop
const EditInventoryItemModal = ({ item, onClose, onItemUpdated }: EditItemModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'STATIONARY' as 'STATIONARY' | 'UNIFORM' | 'OTHER',
    price: 0,
    quantityInStock: 0,
  });

  // 4. Use the 'item' prop to pre-fill the form
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/inventory/${item.id}`, formData);
      toast.success('Item updated successfully!');
      onItemUpdated();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to update item.');
      } else {
        toast.error('An unexpected error occurred.');
      }
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
            <option value="UNIFORM">Uniform</option>
            <option value="STATIONARY">Stationary</option>
            <option value="OTHER">Other</option>
          </select>
          <label>Price (₹)</label>
          <input type="number" name="price" value={formData.price} min="0" step="0.01" onChange={handleChange} required />
          <label>Quantity in Stock</label>
          <input type="number" name="quantityInStock" value={formData.quantityInStock} min="0" onChange={handleChange} required />
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