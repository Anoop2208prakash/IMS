import { useState, useEffect, ChangeEvent, useCallback } from 'react'; // 1. Import useCallback
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../AdminPages.module.scss';
import Spinner from '../../../components/common/Spinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import DeleteModal from '../../../components/common/DeleteModal';
import Searchbar from '../../../components/common/Searchbar';
import { BsCartX } from 'react-icons/bs';
import AddInventoryItemForm from './AddInventoryItemForm';
import EditInventoryItemModal from './EditInventoryItemModal';

type ItemCategory = 'UNIFORM' | 'STATIONARY' | 'OTHER';
interface ItemData {
  id: string; name: string; category: ItemCategory;
  price: number; quantityInStock: number;
}

const ManageInventoryPage = () => {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [editingItem, setEditingItem] = useState<ItemData | null>(null);
  const [deletingItem, setDeletingItem] = useState<ItemData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 2. Wrap fetchItems in useCallback
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { category: selectedCategory };
      const response = await axios.get('http://localhost:5000/api/inventory', { params });
      setItems(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to fetch inventory items.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
      setPage(0);
    }
  }, [selectedCategory]); // 3. Add its dependency

  // 4. Re-fetch items when the stable fetchItems function changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]); // <-- This now includes fetchItems

  const handleItemAdded = () => { setShowAddForm(false); fetchItems(); toast.success('Item added successfully!'); };
  const handleItemUpdated = () => { setEditingItem(null); fetchItems(); toast.success('Item updated successfully!'); };
  
  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${deletingItem.id}`);
      setItems(currentItems => currentItems.filter(item => item.id !== deletingItem.id));
      toast.success('Item deleted successfully!');
      setDeletingItem(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to delete item.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={5} className={styles.spinnerCell}><Spinner /></td></tr>;
    }
    if (filteredItems.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <EmptyState 
              message={searchTerm ? "No items match your search." : "No items found."} 
              icon={<BsCartX size={40} />} 
            />
          </td>
        </tr>
      );
    }
    return currentItems.map((item) => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>{item.category}</td>
        <td>₹{item.price.toFixed(2)}</td>
        <td>{item.quantityInStock}</td>
        <td>
          <button onClick={() => setEditingItem(item)} className={`${styles.button} ${styles.editButton}`}>Edit</button>
          <button onClick={() => setDeletingItem(item)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Inventory</h2>
        <div className={styles.headerActions}>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)} 
            className={styles.filterDropdown}
          >
            <option value="all">All Categories</option>
            <option value="STATIONARY">Stationary</option>
            <option value="UNIFORM">Uniform</option>
            <option value="OTHER">Other</option>
          </select>
          <button onClick={() => setShowAddForm(prev => !prev)}>
            {showAddForm ? 'Cancel' : 'Add New Item'}
          </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <Searchbar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by item name..."
        />
      </div>

      {showAddForm && <AddInventoryItemForm onItemAdded={handleItemAdded} onCancel={() => setShowAddForm(false)} />}
      
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
          {renderTableBody()}
        </tbody>
      </table>
      
      <Pagination
        count={filteredItems.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      
      {editingItem && <EditInventoryItemModal item={editingItem} onClose={() => setEditingItem(null)} onItemUpdated={handleItemUpdated} />}
      
      {deletingItem && (
        <DeleteModal
          title="Delete Item"
          message={`Are you sure you want to delete "${deletingItem.name}"? This will permanently remove it from the inventory.`}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default ManageInventoryPage;