import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { 
  Grid,
  List,
  ChevronDown,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../search/SearchBar';

const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    currentView,
    setCurrentView,
  } = useAppContext();
  
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSettingsClick = () => {
    setCurrentView('settings');
    setShowUserDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Successfully logged out');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white dark:bg-background-primary sticky top-0 z-10 shadow-sm">
      {/* Search Bar */}
      {currentView !== 'settings' && (
        <SearchBar className="mx-auto w-full max-w-2xl" />
      )}
      
      {/* Right Side Controls */}
      <div className="flex items-center space-x-4">
        {currentView !== 'settings' && (
          <div className="border-r border-gray-200 dark:border-gray-700 pr-4 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${
                viewMode === 'list'
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
              {user?.user.avatar ? (
                <img src={user.user.avatar} alt={`${user.user.name} ${user.user.surname}`} className="w-full h-full object-cover" />
              ) : (
                <span className="font-medium text-primary-700 dark:text-primary-300">
                  {user?.user.name.charAt(0)}
                  {user?.user.surname.charAt(0)}
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="font-medium">{user?.user.name} {user?.user.surname}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user?.user.email}
                </div>
              </div>
              <button
                onClick={handleSettingsClick}
                className="w-full flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 mt-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;