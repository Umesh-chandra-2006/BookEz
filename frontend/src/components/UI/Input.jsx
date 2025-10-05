import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error,
  className = '',
  ...props 
}) => {
  const { theme } = useTheme();
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-3 py-2 ${theme.input.bg} border rounded-md ${theme.input.text} ${theme.input.placeholder}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition duration-200
          ${error ? 'border-red-500' : theme.input.border}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
