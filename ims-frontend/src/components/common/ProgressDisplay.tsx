import React from 'react';
import styles from './ProgressDisplay.module.scss';

interface ProgressDisplayProps {
  // Progress should be a number between 0 and 100
  progress: number;
}

const ProgressDisplay = ({ progress = 0 }: ProgressDisplayProps) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBarFiller}
        style={{ width: `${clampedProgress}%` }}
      >
        <span className={styles.progressText}>
          {clampedProgress.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export default ProgressDisplay;