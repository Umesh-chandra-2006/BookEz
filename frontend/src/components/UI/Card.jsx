import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Card = ({ children, className = '', hover = false, onClick }) => {
  const { theme } = useTheme();
  
  const baseClasses = `${theme.card.bg} ${theme.card.border} border rounded-lg shadow-md transition-all duration-200`;
  const hoverClasses = hover ? `${theme.card.hover} hover:border-gray-600 hover:transform hover:scale-[1.02] cursor-pointer` : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
