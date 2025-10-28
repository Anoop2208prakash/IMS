import React from 'react';
import styles from '../../assets/scss/components/common/SkeletonLoader.module.scss';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
}

const SkeletonLoader = ({ width, height, className = '' }: SkeletonLoaderProps) => {
  const style = {
    width: width || '100%',
    height: height || '20px',
  };

  return (
    <div 
      className={`${styles.skeleton} ${className}`} 
      style={style}
    />
  );
};

export default SkeletonLoader;