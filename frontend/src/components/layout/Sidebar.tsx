import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileIcon,
  KeyIcon,
  LockIcon,
  SunIcon,
  MoonIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';

import logoImagen from '../../assets/images/logos/logo.png';
import logoSoloImagen from '../../assets/images/logos/logo-solo.png';

const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, isSidebarCollapsed, toggleSidebar, setCurrentFolder } = useAppContext();
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const handleViewChange = (view: 'files' | 'passwords') => {
    setCurrentView(view);
    setCurrentFolder('');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col overflow-hidden
      ${isSidebarCollapsed ? 'w-16' : 'w-64'} fixed left-0 top-0 z-20`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center">
          {!isSidebarCollapsed ? (
        <img src={logoImagen} alt="CloudMesa Logo" className="h-8 w-auto" />
          ) : (
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center  rounded transition-colors duration-200"
          title="Expand Sidebar"
        >
          <img src={logoSoloImagen} alt="Expand sidebar" className="h-8 w-auto" />

        </button>
          )}
        </div>
        {!isSidebarCollapsed && (
          <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors duration-200"
          >
        <ChevronLeftIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <div className="space-y-1">
          {!isSidebarCollapsed && (
            <div className="px-3 py-2 mb-4">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Navigation
              </h3>
            </div>
          )}
          
          <button
            onClick={() => handleViewChange('files')}
            className={`group flex items-center w-full px-3 py-2.5 rounded-lg transition-colors duration-200 ${
              currentView === 'files'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <FileIcon className={`h-5 w-5 ${
              currentView === 'files' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`} />
            {!isSidebarCollapsed && (
              <div className="ml-3">
                <span className="font-medium text-sm">Files</span>
              </div>
            )}
          </button>

          <button
            onClick={() => handleViewChange('passwords')}
            className={`group flex items-center w-full px-3 py-2.5 rounded-lg transition-colors duration-200 ${
              currentView === 'passwords'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <KeyIcon className={`h-5 w-5 ${
              currentView === 'passwords' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`} />
            {!isSidebarCollapsed && (
              <div className="ml-3">
                <span className="font-medium text-sm">Passwords</span>
              </div>
            )}
          </button>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-gray-900">
        <div className="space-y-1">
          <button
            onClick={toggleTheme}
            className="group flex items-center w-full px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-amber-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
            {!isSidebarCollapsed && (
              <span className="ml-3 text-sm font-medium text-nowrap">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            title="Logout"
          >
            <LogOutIcon className="h-5 w-5" />
            {!isSidebarCollapsed && (
              <span className="ml-3 text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
