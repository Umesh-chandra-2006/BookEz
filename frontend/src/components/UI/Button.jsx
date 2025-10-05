import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, ...props }) => {
  const { theme } = useTheme();
  
  let baseClasses = 'px-4 py-2 rounded-md font-semibold text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ';
  
  if (variant === 'primary') {
    baseClasses += 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
  } else if (variant === 'secondary') {
    baseClasses += 'bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50';
  } else if (variant === 'success') {
    baseClasses += 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50';
  } else if (variant === 'danger') {
    baseClasses += 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50';
  } else if (variant === 'outline') {
    baseClasses = `px-4 py-2 rounded-md font-semibold border-2 border-blue-600 text-blue-600 ${theme.bg.primary} hover:bg-blue-600 hover:text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed `;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
