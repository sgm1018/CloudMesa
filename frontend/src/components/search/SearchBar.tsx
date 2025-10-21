import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Item, ItemType } from '../../types';
import { 
  Search,
  X,
  Grid3X3,
  Navigation,
  FileIcon,
  KeyIcon,
  FolderIcon,
  ChevronDown,
  Zap,
  Filter,
  Check
} from 'lucide-react';
import { itemService } from '../../services/ItemService';

export type SearchMode = 'normal' | 'direct';
export type ItemTypeFilter = 'all' | 'files' | 'folders' | 'passwords' | 'groups';

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className = '' }) => {
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    setIsSearching,
    currentView,
    setCurrentView,
    navigateToFolder,
    navigateToGroup,
    searchMode,
    setSearchMode,
    isDirectSearchActive,
    setIsDirectSearchActive,
    originalFolder,
    setOriginalFolder,
    currentFileFolder,
    currentPasswordFolder
  } = useAppContext();
  
  const { showToast } = useToast();
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemTypeFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const modeSelectorRef = useRef<HTMLDivElement>(null);
  const typeFilterRef = useRef<HTMLDivElement>(null);

  // Get item types based on filter
  const getItemTypesForSearch = useCallback((): string[] => {
    switch (itemTypeFilter) {
      case 'files':
        return [ItemType.FILE];
      case 'folders':
        return [ItemType.FOLDER];
      case 'passwords':
        return [ItemType.PASSWORD];
      case 'groups':
        return [ItemType.GROUP];
      case 'all':
      default:
        // Return all types regardless of current view
        return [ItemType.FILE, ItemType.FOLDER, ItemType.PASSWORD, ItemType.GROUP];
    }
  }, [itemTypeFilter]);

  // Debounced search function
  const performSearch = useCallback(
    async (query: string) => {
      if (query.length === 0) {
        setSearchResults([]);
        // If in direct mode and clearing search, return to original folder
        if (searchMode === 'direct' && isDirectSearchActive) {
          setIsDirectSearchActive(false);
          if (currentView === 'files') {
            navigateToFolder(originalFolder);
          } else if (currentView === 'passwords') {
            navigateToGroup(originalFolder);
          }
        }
        return;
      }

      if (query.length < 2) return;

      setIsLoading(true);
      try {
        // Use the item type filter to determine what to search
        const itemTypes = getItemTypesForSearch();

        const results = await itemService.findSearchItems(query, searchMode, itemTypes);
        
        if (searchMode === 'direct') {
          // For direct mode, store original folder and activate direct search
          if (!isDirectSearchActive) {
            const currentFolder = currentView === 'files' ? currentFileFolder : currentPasswordFolder;
            setOriginalFolder(currentFolder);
            setIsDirectSearchActive(true);
          }
        }
        
        setSearchResults(results);
        setSelectedResultIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        showToast('Search failed. Please try again.', 'error');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchMode, isDirectSearchActive, currentView, currentFileFolder, currentPasswordFolder, originalFolder, navigateToFolder, navigateToGroup, setOriginalFolder, setIsDirectSearchActive, showToast, getItemTypesForSearch]
  );

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearching(false);
      }
      
      if (
        modeSelectorRef.current &&
        !modeSelectorRef.current.contains(event.target as Node)
      ) {
        setShowModeSelector(false);
      }

      if (
        typeFilterRef.current &&
        !typeFilterRef.current.contains(event.target as Node)
      ) {
        setShowTypeFilter(false);
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
    setSearchResults([]);
    
    // If in direct mode, return to original folder
    if (searchMode === 'direct' && isDirectSearchActive) {
      setIsDirectSearchActive(false);
      if (currentView === 'files') {
        navigateToFolder(originalFolder);
      } else if (currentView === 'passwords') {
        navigateToGroup(originalFolder);
      }
    }
    
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchMode === 'direct' || !isSearching || searchResults.length === 0) {
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSearch();
      }
      return;
    }

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
    if (item.type === ItemType.PASSWORD || item.type === ItemType.GROUP) {
      setCurrentView('passwords');
    } else {
      setCurrentView('files');
    }

    // Navigate to the parent folder if it exists
    if (item.parentId) {
      if (item.type === ItemType.PASSWORD || item.type === ItemType.GROUP) {
        navigateToGroup(item.parentId);
      } else {
        navigateToFolder(item.parentId);
      }
    } else {
      if (item.type === ItemType.PASSWORD || item.type === ItemType.GROUP) {
        navigateToGroup(null);
      } else {
        navigateToFolder(null);
      }
    }

    clearSearch();
  };

  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    setShowModeSelector(false);
    
    // If switching from direct to normal while active, clear and return
    if (mode === 'normal' && isDirectSearchActive) {
      clearSearch();
    }
    
    // Re-trigger search with new mode if there's a query
    if (searchQuery.length >= 2) {
      performSearch(searchQuery);
    }
  };

  const handleTypeFilterChange = (filter: ItemTypeFilter) => {
    setItemTypeFilter(filter);
    setShowTypeFilter(false);
    
    // Re-trigger search with new filter if there's a query
    if (searchQuery.length >= 2) {
      performSearch(searchQuery);
    }
  };

  const getFilterLabel = (filter: ItemTypeFilter): string => {
    switch (filter) {
      case 'files': return 'Files';
      case 'folders': return 'Folders';
      case 'passwords': return 'Passwords';
      case 'groups': return 'Groups';
      case 'all': 
      default: return 'All Types';
    }
  };

  const getFilterIcon = (filter: ItemTypeFilter) => {
    switch (filter) {
      case 'files': return <FileIcon className="h-4 w-4" />;
      case 'folders': return <FolderIcon className="h-4 w-4" />;
      case 'passwords': return <KeyIcon className="h-4 w-4" />;
      case 'groups': return <KeyIcon className="h-4 w-4" />;
      case 'all':
      default: return <Filter className="h-4 w-4" />;
    }
  };

  const getItemIcon = (item: Item, size = 'h-4 w-4') => {
    switch (item.type) {
      case ItemType.FILE:
        return <FileIcon className={`${size} text-primary-500`} />;
      case ItemType.FOLDER:
        return <FolderIcon className={`${size} text-yellow-500`} />;
      case ItemType.PASSWORD:
        return <KeyIcon className={`${size} text-success-500`} />;
      case ItemType.GROUP:
        return <KeyIcon className={`${size} text-secondary-500`} />;
      default:
        return <FileIcon className={`${size} text-gray-500`} />;
    }
  };

  const SearchModeIcon = ({ mode }: { mode: SearchMode }) => {
    return mode === 'normal' ? (
      <Navigation className="h-4 w-4" />
    ) : (
      <Zap className="h-4 w-4" />
    );
  };

  return (
    <div ref={searchContainerRef} className={`relative ${className}`}>
      <div
        className={`flex w-full items-center bg-gray-100 dark:bg-gray-800 rounded-lg ${
          isSearching ? 'ring-2 ring-primary-400 shadow-lg' : 'shadow-sm'
        }`}
      >
        {/* Search Mode Selector */}
        <div className="relative" ref={modeSelectorRef}>
          <button
            onClick={() => setShowModeSelector(!showModeSelector)}
            className={`flex items-center px-3 py-2 rounded-l-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${
              searchMode === 'direct' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''
            }`}
            title={searchMode === 'normal' ? 'Normal Search Mode' : 'Direct Search Mode'}
          >
            <SearchModeIcon mode={searchMode} />
            <ChevronDown className="h-3 w-3 ml-1 opacity-60" />
          </button>

          {showModeSelector && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[200px]">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                SEARCH MODES
              </div>
              
              <button
                onClick={() => handleModeChange('normal')}
                className={`w-full flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  searchMode === 'normal' ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''
                }`}
              >
                <Navigation className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Normal Search</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Navigate to results location
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleModeChange('direct')}
                className={`w-full flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  searchMode === 'direct' ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''
                }`}
              >
                <Zap className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Direct Search</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Show results in current view
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Type Filter Selector */}
        <div className="relative border-l border-gray-300 dark:border-gray-600" ref={typeFilterRef}>
          <button
            onClick={() => setShowTypeFilter(!showTypeFilter)}
            className={`flex items-center px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              itemTypeFilter !== 'all' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''
            }`}
            title={`Filter by: ${getFilterLabel(itemTypeFilter)}`}
          >
            {getFilterIcon(itemTypeFilter)}
            {itemTypeFilter !== 'all' && (
              <span className="ml-1 text-xs font-medium">{getFilterLabel(itemTypeFilter)}</span>
            )}
            <ChevronDown className="h-3 w-3 ml-1 opacity-60" />
          </button>

          {showTypeFilter && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[180px]">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                FILTER BY TYPE
              </div>
              
              <button
                onClick={() => handleTypeFilterChange('all')}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  itemTypeFilter === 'all' ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''
                }`}
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>All Types</span>
                </div>
                {itemTypeFilter === 'all' && <Check className="h-4 w-4" />}
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              
              <button
                onClick={() => handleTypeFilterChange('files')}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  itemTypeFilter === 'files' ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''
                }`}
              >
                <div className="flex items-center">
                  <FileIcon className="h-4 w-4 mr-2 text-primary-500" />
                  <span>Files</span>
                </div>
                {itemTypeFilter === 'files' && <Check className="h-4 w-4" />}
              </button>
              
              <button
                onClick={() => handleTypeFilterChange('folders')}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  itemTypeFilter === 'folders' ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''
                }`}
              >
                <div className="flex items-center">
                  <FolderIcon className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>Folders</span>
                </div>
                {itemTypeFilter === 'folders' && <Check className="h-4 w-4" />}
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              
              <button
                onClick={() => handleTypeFilterChange('passwords')}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  itemTypeFilter === 'passwords' ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''
                }`}
              >
                <div className="flex items-center">
                  <KeyIcon className="h-4 w-4 mr-2 text-success-500" />
                  <span>Passwords</span>
                </div>
                {itemTypeFilter === 'passwords' && <Check className="h-4 w-4" />}
              </button>
              
              <button
                onClick={() => handleTypeFilterChange('groups')}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  itemTypeFilter === 'groups' ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''
                }`}
              >
                <div className="flex items-center">
                  <KeyIcon className="h-4 w-4 mr-2 text-secondary-500" />
                  <span>Groups</span>
                </div>
                {itemTypeFilter === 'groups' && <Check className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="flex-1 flex items-center">
          <Search className="h-5 w-5 text-gray-500 dark:text-gray-400 ml-3" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={`Search ${currentView}...`}
            className="ml-2 bg-transparent border-none outline-none w-full py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            onKeyDown={handleKeyDown}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="mx-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            </div>
          )}
          
          {/* Clear button */}
          {searchQuery && (
            <button 
              onClick={clearSearch} 
              className="p-1 mr-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Clear search"
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Direct search indicator */}
        {searchMode === 'direct' && isDirectSearchActive && (
          <div 
            className="px-3 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-r-lg border-l border-gray-200 dark:border-gray-600"
            title="Direct search active"
          >
            <Zap className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Normal mode search results dropdown */}
      {searchMode === 'normal' && isSearching && searchResults.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto animate-slide-down">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1">
              SEARCH RESULTS ({searchResults.length})
            </div>
            {searchResults.map((item, index) => (
              <div
                key={item._id}
                className={`flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-colors ${
                  index === selectedResultIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
                onClick={() => handleResultClick(item)}
              >
                {getItemIcon(item, 'h-5 w-5')}
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium truncate">{item.itemName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {item.type} • {item.type === ItemType.PASSWORD || item.type === ItemType.GROUP ? 'Passwords' : 'Files'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 text-xs text-center text-gray-500 dark:text-gray-400">
            Press ESC to close • ↑↓ to navigate • Enter to select
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;