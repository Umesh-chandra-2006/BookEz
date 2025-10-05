import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationItem = ({ notification, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
  };

  const Icon = icons[notification.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, onRemove]);

  return (
    <div className={`flex items-start p-4 border rounded-lg shadow-lg ${colors[notification.type]} animate-in slide-in-from-right duration-300`}>
      <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        {notification.title && (
          <h4 className="font-semibold mb-1">{notification.title}</h4>
        )}
        <p className="text-sm">{notification.message}</p>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, title = null, duration = 4000) => {
    addNotification({ type: 'success', message, title, duration });
  }, [addNotification]);

  const showError = useCallback((message, title = 'Error', duration = 6000) => {
    addNotification({ type: 'error', message, title, duration });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning', duration = 5000) => {
    addNotification({ type: 'warning', message, title, duration });
  }, [addNotification]);

  const showInfo = useCallback((message, title = null, duration = 4000) => {
    addNotification({ type: 'info', message, title, duration });
  }, [addNotification]);

  return (
    <NotificationContext.Provider 
      value={{ 
        showSuccess, 
        showError, 
        showWarning, 
        showInfo,
        addNotification,
        removeNotification 
      }}
    >
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onRemove={removeNotification}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
