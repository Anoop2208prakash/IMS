import { useTheme } from '../../context/ThemeContext';
import { BsMoonStarsFill, BsSunFill } from 'react-icons/bs';
import styles from './ThemeToggleButton.module.scss';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className={styles.themeToggle} onClick={toggleTheme} title="Toggle theme">
      {theme === 'light' ? <BsMoonStarsFill /> : <BsSunFill />}
    </button>
  );
};

export default ThemeToggleButton;