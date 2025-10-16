import { ReactNode } from 'react';
import styles from './EmptyState.module.scss';
import { BsFileEarmarkText } from 'react-icons/bs'; // 1. Import a default icon

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
}

const EmptyState = ({ message, icon = <BsFileEarmarkText size={40} /> }: EmptyStateProps) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>{icon}</div>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;