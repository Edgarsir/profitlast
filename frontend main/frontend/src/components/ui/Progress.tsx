import React from 'react';
import { clsx } from 'clsx';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  size = 'md',
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={clsx('w-full bg-gray-200 rounded-full', sizes[size], className)}>
      <div
        className="bg-primary-600 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%`, height: '100%' }}
      />
    </div>
  );
};