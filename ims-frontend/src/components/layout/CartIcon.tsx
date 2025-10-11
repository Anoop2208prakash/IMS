import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './CartIcon.module.scss';

const CartIcon = () => {
  const { cartCount } = useCart();

  return (
    <NavLink to="/cart" className={styles.cartIcon}>
      🛒
      {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
    </NavLink>
  );
};

export default CartIcon;