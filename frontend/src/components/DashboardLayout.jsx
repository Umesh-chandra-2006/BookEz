import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('U');
  const { user } = useAuth();
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (user && user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length >= 2) {
        setUserInitials(`${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`);
      } else if (nameParts.length === 1) {
        setUserInitials(nameParts[0].charAt(0));
      }
    }
  }, [user]);

  return (
    <div className={`${theme.bg.primary} ${theme.text.primary} min-h-screen overflow-x-hidden`}>
      {/* Header - Fixed to top, shifted for sidebar */}
      <header
        className={`
          fixed top-0 left-0 w-full h-16 z-20 ${theme.bg.secondary} p-4 shadow-md
          flex items-center justify-between
          ${isSidebarOpen ? 'ml-64' : 'ml-[70px]'} /* Header content shifts for sidebar */
          transition-all duration-300 ease-in-out
        `}
      >
        <div className="flex items-center">
          <span className="text-2xl font-bold text-blue-400">📚</span>
          <span className={`text-2xl font-bold ${theme.text.primary} ml-2`}>BOOK REVIEW</span>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Link
            to="/profile"
            className={`w-8 h-8 rounded-full ${theme.bg.tertiary} flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition-colors uppercase`}
            aria-label="Go to profile page"
          >
            {userInitials}
          </Link>
        </div>
      </header>

      {/* Sidebar - Fixed to left, positioned below header */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area - Positioned below header and next to sidebar, with its own scroll */}
      <main
        className={`
          p-6 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'ml-64' : 'ml-[70px]'} /* Margin for sidebar space */
          mt-16 /* Margin for header space (h-16 = 4rem) */
          min-h-[calc(100vh-4rem)] /* Ensures main content area fills screen, preventing whitespace */
          overflow-y-auto /* Main content scrolls independently */
        `}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
