
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-lg shadow-xl p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;