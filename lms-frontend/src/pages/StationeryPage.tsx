import React, { useState, useEffect } from 'react';
import { getInventoryItems } from '../services/inventoryService';
import styles from './StorePage.module.scss'; // Reuse styles

interface Item { id: string; name: string; type: string; price: number; stock: number; }

const StationeryPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStationery = async () => {
      try {
        const data = await getInventoryItems('STATIONERY');
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch stationery", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStationery();
  }, []);

  if (loading) return <div>Loading stationery items...</div>;

  return (
    <div className={styles.container}>
      <h2>Stationery</h2>
      <table className={styles.itemsTable}>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Price</th>
            <th>In Stock</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>{item.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StationeryPage;