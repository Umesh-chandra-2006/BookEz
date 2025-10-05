import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  let baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ';
  
  switch (variant) {
    case 'primary':
      baseClasses += 'bg-blue-100 text-blue-800';
      break;
    case 'success':
      baseClasses += 'bg-green-100 text-green-800';
      break;
    case 'warning':
      baseClasses += 'bg-yellow-100 text-yellow-800';
      break;
    case 'danger':
      baseClasses += 'bg-red-100 text-red-800';
      break;
    case 'secondary':
      baseClasses += 'bg-gray-100 text-gray-800';
      break;
    case 'dark':
      baseClasses += 'bg-gray-800 text-gray-100';
      break;
    default:
      baseClasses += 'bg-gray-600 text-gray-100';
  }

  return (
    <span className={`${baseClasses} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
