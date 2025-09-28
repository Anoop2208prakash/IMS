import React, { useState, useEffect } from 'react';
import { getInventoryItems } from '../services/inventoryService';
import styles from './StorePage.module.scss'; // Reuse styles

interface Item { id: string; name: string; type: string; price: number; stock: number; }

const UniformPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniforms = async () => {
      try {
        const data = await getInventoryItems('UNIFORM');
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch uniforms", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUniforms();
  }, []);

  if (loading) return <div>Loading uniform items...</div>;

  return (
    <div className={styles.container}>
      <h2>Uniforms</h2>
      <table className={styles.itemsTable}>
        {/* Same table structure as StationeryPage */}
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

export default UniformPage;