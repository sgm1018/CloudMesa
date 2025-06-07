import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Item } from '../../types';
import { searchItems } from '../../data/mockData';
import {
  Search,
  X,
  Grid,
  List,
  Upload,
  Plus,
  ChevronDown,
  Settings,
  FileIcon,
  KeyIcon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    isSearching,
    setIsSearching,
    currentView,
    setCurrentView,
    setCurrentFolder,
  } = useAppContext();
  
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const performSearch = async () => {
    if (searchQuery.length > 0) {
      const results = await searchItems(searchQuery);
      setSearchResults(results);
      setSelectedResultIndex(-1);
    } else {
      setSearchResults([]);
    }
  };
  useEffect(() => {
    performSearch();
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearching(false);
      }
      
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
  }, [setIsSearching]);

  const handleSearchFocus = () => {
    setIsSearching(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSelectedResultIndex(-1);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearching || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedResultIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedResultIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedResultIndex >= 0) {
          handleResultClick(searchResults[selectedResultIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        clearSearch();
        break;
    }
  };

  const handleResultClick = (item: Item) => {
    // Switch view based on item type
    if (item.type === 'password' || item.type === 'group') {
      setCurrentView('passwords');
    } else {
      setCurrentView('files');
    }

    // Navigate to the parent folder if it exists
    if (item.parentId) {
      setCurrentFolder(item.parentId);
    } else {
      setCurrentFolder('');
    }

    clearSearch();
  };

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
      <div
        ref={searchContainerRef}
        className="relative mx-auto w-full max-w-2xl"
      >
        {currentView !== 'settings' && (
          <div
            className={`flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 transition-all ${
              isSearching ? 'ring-2 ring-primary-400' : ''
            }`}
            onClick={handleSearchFocus}
          >
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search files and passwords..."
              className="ml-2 bg-transparent border-none outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button onClick={clearSearch} className="p-1">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        )}

        {isSearching && searchResults.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto animate-fade-in">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1">
                SEARCH RESULTS
              </div>
              {searchResults.map((item, index) => (
                <div
                  key={item._id}
                  className={`flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer ${
                    index === selectedResultIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                  onClick={() => handleResultClick(item)}
                >
                  {item.type === 'file' && (
                    <FileIcon className="h-5 w-5 text-primary-500" />
                  )}
                  {item.type === 'folder' && (
                    <FileIcon className="h-5 w-5 text-yellow-500" />
                  )}
                  {item.type === 'password' && (
                    <KeyIcon className="h-5 w-5 text-success-500" />
                  )}
                  {item.type === 'group' && (
                    <KeyIcon className="h-5 w-5 text-secondary-500" />
                  )}
                  <div className="ml-3">
                    <div className="text-sm font-medium">{item.name}</div>
                    {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.path && item.path.length > 0
                        ? item.path.join(' > ')
                        : 'Root'}
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-2 text-xs text-center text-gray-500 dark:text-gray-400">
              Press ESC to close or ↑↓ to navigate
            </div>
          </div>
        )}
      </div>

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