import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../../assets/scss/pages/admin/AdminPages.module.scss';
import Spinner from '../../../components/common/Spinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import DeleteModal from '../../../components/common/DeleteModal';
import Searchbar from '../../../components/common/Searchbar';
import HeaderMenu from '../../../components/common/HeaderMenu';
import ImportCSVModal from '../../../components/common/ImportCSVModal';
import FilterModal from '../../../components/common/FilterModal'; // 1. Import reusable modal
import { BsCartX, BsFilter } from 'react-icons/bs';
import AddInventoryItemForm from './AddInventoryItemForm';
import EditInventoryItemModal from './EditInventoryItemModal';

type ItemCategory = 'UNIFORM' | 'STATIONARY' | 'OTHER';
interface ItemData {
  id: string; name: string; category: ItemCategory;
  price: number; quantityInStock: number;
}
// 2. Define the type for the filter options
interface FilterOption {
  value: string;
  label: string;
}

const ManageInventoryPage = () => {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [editingItem, setEditingItem] = useState<ItemData | null>(null);
  const [deletingItem, setDeletingItem] = useState<ItemData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  }, [selectedCategory]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]); // Fixed useEffect dependency

  const handleItemAdded = () => { setShowAddForm(false); fetchItems(); toast.success('Item added successfully!'); };
  const handleItemUpdated = () => { setEditingItem(null); fetchItems(); toast.success('Item updated successfully!'); };
  const handleImportSuccess = () => { fetchItems(); };
  
  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${deletingItem.id}`);
      setItems(currentItems => currentItems.filter(item => item.id !== deletingItem.id));
      toast.success('Item deleted successfully!');
      setDeletingItem(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete item.');
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

  const handleExportCSV = async () => {
    toast.loading('Preparing download...');
    try {
      const response = await axios.get('http://localhost:5000/api/export/inventory', {
        params: { category: selectedCategory, searchTerm },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'inventory_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss();
      toast.success('Data exported successfully!');
    } catch (err: any) {
      toast.dismiss();
      const errorText = await (err.response?.data as Blob).text();
      try {
        const errorJson = JSON.parse(errorText);
        toast.error(errorJson.message || 'Failed to export items.');
      } catch (e) {
        toast.error('Failed to export items.');
      }
    }
  };

  const menuActions = [
    {
      label: 'Add New Item',
      onClick: () => setShowAddForm(true),
    },
    { label: 'Export CSV', onClick: handleExportCSV },
    { label: 'Import CSV', onClick: () => setShowImportModal(true) }
  ];

  // 3. This handler now correctly matches the FilterModal's onApply prop
  const handleApplyFilter = (filters: { programId: string; semesterId: string }) => {
    // We use the 'programId' field from the modal to store our 'category'
    setSelectedCategory(filters.programId);
  };

  // 4. Define the *category* options to pass to the modal
  const categoryOptions: FilterOption[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'STATIONARY', label: 'Stationary' },
    { value: 'UNIFORM', label: 'Uniform' },
    { value: 'OTHER', label: 'Other' }
  ];

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
          <button className={styles.iconButton} onClick={() => setShowFilterModal(true)}>
            <BsFilter />
          </button>
          <HeaderMenu actions={menuActions} />
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
      
      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
          importUrl="http://localhost:5000/api/import/inventory"
        />
      )}

      {/* 5. Pass the correct props to the reusable FilterModal */}
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilter}
          initialFilters={{ programId: selectedCategory, semesterId: 'all' }}
          filterType="category"
          programOptions={categoryOptions} // Pass categories as programOptions
          semesterOptions={[]} // Pass an empty array
        />
      )}

      {editingItem && <EditInventoryItemModal item={editingItem} onClose={() => setEditingItem(null)} onItemUpdated={handleItemUpdated} />}
      
      {deletingItem && (
        <DeleteModal
          title="Delete Item"
          message={`Are you sure you want to delete "${deletingItem.name}"?`}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default ManageInventoryPage;