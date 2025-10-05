import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to dark theme or check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update document class for global styling
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    
    // Update body background color for theme consistency
    document.body.style.backgroundColor = isDark ? '#111827' : '#f9fafb';
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = {
    // Background colors
    bg: {
      primary: isDark ? 'bg-gray-900' : 'bg-gray-50',
      secondary: isDark ? 'bg-gray-800' : 'bg-white',
      tertiary: isDark ? 'bg-gray-700' : 'bg-gray-100',
      accent: isDark ? 'bg-blue-600' : 'bg-blue-100',
    },
    // Text colors
    text: {
      primary: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-gray-300' : 'text-gray-600',
      tertiary: isDark ? 'text-gray-400' : 'text-gray-500',
      accent: 'text-blue-400',
    },
    // Border colors
    border: {
      primary: isDark ? 'border-gray-700' : 'border-gray-200',
      secondary: isDark ? 'border-gray-600' : 'border-gray-300',
    },
    // Accent colors (consistent across themes)
    accent: {
      primary: 'text-blue-400',
      primaryBg: 'bg-blue-600 hover:bg-blue-700',
      secondary: isDark ? 'text-yellow-400' : 'text-yellow-500',
    },
    // Input styles
    input: {
      bg: isDark ? 'bg-gray-700' : 'bg-white',
      border: isDark ? 'border-gray-600' : 'border-gray-300',
      text: isDark ? 'text-white' : 'text-gray-900',
      placeholder: isDark ? 'placeholder-gray-400' : 'placeholder-gray-500',
    },
    // Card styles
    card: {
      bg: isDark ? 'bg-gray-800' : 'bg-white',
      border: isDark ? 'border-gray-700' : 'border-gray-200',
      hover: isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50',
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
