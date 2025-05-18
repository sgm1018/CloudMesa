import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileIcon,
  KeyIcon,
  LockIcon,
  MenuIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  LogOutIcon,
} from 'lucide-react';

import logoImagen from '../../assets/images/logos/logo.png';

const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, isSidebarCollapsed, toggleSidebar, setCurrentFolder } = useAppContext();
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const handleViewChange = (view: 'files' | 'passwords') => {
    setCurrentView(view);
    setCurrentFolder(''); // Reset to root when changing views
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`h-screen bg-sidebar border-r border-gray-200 dark:border-gray-800 transition-all duration-300 
      ${isSidebarCollapsed ? 'w-16' : 'w-60'} fixed left-0 top-0 z-10`}
    >
      <div className="flex items-center justify-between p-4  gap-2 border-b border-gray-200 dark:border-gray-800">
        {!isSidebarCollapsed && (
          <div className="flex items-center">
            <img src={logoImagen} alt="CloudMesa Logo" className={`w-auto ${isSidebarCollapsed && 'hidden'}`} /> 
          </div>
        )}
        {isSidebarCollapsed && <LockIcon className="h-6 w-6 text-primary-600 mx-auto" />}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="py-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleViewChange('files')}
              className={`flex items-center ${
                isSidebarCollapsed ? 'justify-center' : 'justify-between'
              } w-full px-4 py-2 ${
                currentView === 'files'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <FileIcon className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="ml-3">Files</span>}
              </div>
              {!isSidebarCollapsed && currentView === 'files' && (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => handleViewChange('passwords')}
              className={`flex items-center ${
                isSidebarCollapsed ? 'justify-center' : 'justify-between'
              } w-full px-4 py-2 ${
                currentView === 'passwords'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <KeyIcon className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="ml-3">Passwords</span>}
              </div>
              {!isSidebarCollapsed && currentView === 'passwords' && (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
          </li>
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-800">
        <ul className="py-2">
          <li>
            <button
              onClick={toggleTheme}
              className={`flex items-center ${
                isSidebarCollapsed ? 'justify-center' : ''
              } w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800`}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-500" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-500" />
              )}
              {!isSidebarCollapsed && (
                <span className="ml-3">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className={`flex items-center ${
                isSidebarCollapsed ? 'justify-center' : ''
              } w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-error-600`}
            >
              <LogOutIcon className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;