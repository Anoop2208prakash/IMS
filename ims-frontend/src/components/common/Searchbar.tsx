import { ChangeEvent } from 'react';
import styles from './Searchbar.module.scss';
import { BsSearch } from 'react-icons/bs';

interface SearchbarProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const Searchbar = ({ value, onChange, placeholder = "Search..." }: SearchbarProps) => {
  return (
    <div className={styles.searchWrapper}>
      <div className={styles.icon}>
        <BsSearch />
      </div>
      <input
        type="text"
        className={styles.searchInput}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Searchbar;