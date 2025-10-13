import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown, Search, Calendar, SortAsc, SortDesc, FolderIcon, FileIcon, Key, Users } from 'lucide-react';
import { Item, ItemType } from '../../types';

export interface FilterConfig {
  searchTerm: string;
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
  itemType: 'all' | 'files' | 'folders' | 'passwords' | 'groups';
  dateFrom?: Date;
  dateTo?: Date;
  sizeMin?: number;
  sizeMax?: number;
  extension?: string;
}

interface AdvancedFiltersProps {
  items: Item[];
  onFilterChange: (config: FilterConfig) => void;
  viewType: 'files' | 'passwords';
  className?: string;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ 
  items, 
  onFilterChange, 
  viewType,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterConfig>({
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
    itemType: 'all',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get unique extensions from items
  const availableExtensions = React.useMemo(() => {
    if (viewType !== 'files') return [];
    const extensions = new Set<string>();
    items.forEach(item => {
      if (item.type === ItemType.FILE && item.encryptedMetadata?.extension) {
        extensions.add(item.encryptedMetadata.extension);
      }
    });
    return Array.from(extensions).sort();
  }, [items, viewType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(activeFilters);
  }, [activeFilters, onFilterChange]);

  const handleFilterChange = (key: keyof FilterConfig, value: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      searchTerm: '',
      sortBy: 'name',
      sortOrder: 'asc',
      itemType: 'all',
    });
    setShowAdvanced(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.searchTerm) count++;
    if (activeFilters.itemType !== 'all') count++;
    if (activeFilters.dateFrom || activeFilters.dateTo) count++;
    if (activeFilters.sizeMin || activeFilters.sizeMax) count++;
    if (activeFilters.extension) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          transition-all duration-200
          ${isOpen 
            ? 'bg-primary-500 text-white shadow-elevation-2' 
            : 'bg-background-secondary text-text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }
        `}
      >
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className={`
            flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold
            ${isOpen ? 'bg-white text-primary-500' : 'bg-primary-500 text-white'}
          `}>
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-background-primary rounded-xl shadow-elevation-4 border border-DEFAULT z-50 animate-slide-down">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-DEFAULT">
              <h3 className="text-lg font-semibold text-text-primary">Filter Options</h3>
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <input
                  type="text"
                  value={activeFilters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder={viewType === 'files' ? 'Search files and folders...' : 'Search passwords...'}
                  className="w-full pl-10 pr-4 py-2 bg-background-secondary border border-DEFAULT rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary block">Sort By</label>
                <select
                  value={activeFilters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as FilterConfig['sortBy'])}
                  className="w-full px-3 py-2 bg-background-secondary border border-DEFAULT rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="name">Name</option>
                  <option value="date">Date Modified</option>
                  {viewType === 'files' && <option value="size">Size</option>}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary block">Order</label>
                <button
                  onClick={() => handleFilterChange('sortOrder', activeFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full px-3 py-2 bg-background-secondary border border-DEFAULT rounded-lg text-sm text-text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                >
                  {activeFilters.sortOrder === 'asc' ? (
                    <>
                      <SortAsc className="h-4 w-4" />
                      <span>Ascending</span>
                    </>
                  ) : (
                    <>
                      <SortDesc className="h-4 w-4" />
                      <span>Descending</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Item Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary block">Item Type</label>
              <div className="grid grid-cols-2 gap-2">
                {viewType === 'files' ? (
                  <>
                    <button
                      onClick={() => handleFilterChange('itemType', 'all')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeFilters.itemType === 'all'
                          ? 'bg-primary-500 text-white shadow-elevation-1'
                          : 'bg-background-secondary text-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      All Items
                    </button>
                    <button
                      onClick={() => handleFilterChange('itemType', 'files')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeFilters.itemType === 'files'
                          ? 'bg-primary-500 text-white shadow-elevation-1'
                          : 'bg-background-secondary text-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <FileIcon className="h-4 w-4" />
                      Files
                    </button>
                    <button
                      onClick={() => handleFilterChange('itemType', 'folders')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeFilters.itemType === 'folders'
                          ? 'bg-primary-500 text-white shadow-elevation-1'
                          : 'bg-background-secondary text-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <FolderIcon className="h-4 w-4" />
                      Folders
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleFilterChange('itemType', 'all')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeFilters.itemType === 'all'
                          ? 'bg-primary-500 text-white shadow-elevation-1'
                          : 'bg-background-secondary text-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      All Items
                    </button>
                    <button
                      onClick={() => handleFilterChange('itemType', 'passwords')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeFilters.itemType === 'passwords'
                          ? 'bg-primary-500 text-white shadow-elevation-1'
                          : 'bg-background-secondary text-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <Key className="h-4 w-4" />
                      Passwords
                    </button>
                    <button
                      onClick={() => handleFilterChange('itemType', 'groups')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeFilters.itemType === 'groups'
                          ? 'bg-primary-500 text-white shadow-elevation-1'
                          : 'bg-background-secondary text-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <FolderIcon className="h-4 w-4" />
                      Groups
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2 text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center justify-center gap-2"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-DEFAULT animate-slide-down">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-text-tertiary block mb-1">From</label>
                      <input
                        type="date"
                        value={activeFilters.dateFrom ? activeFilters.dateFrom.toISOString().split('T')[0] : ''}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
                        className="w-full px-2 py-1.5 bg-background-secondary border border-DEFAULT rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-tertiary block mb-1">To</label>
                      <input
                        type="date"
                        value={activeFilters.dateTo ? activeFilters.dateTo.toISOString().split('T')[0] : ''}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
                        className="w-full px-2 py-1.5 bg-background-secondary border border-DEFAULT rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Size Range (only for files) */}
                {viewType === 'files' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary block">File Size (MB)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-text-tertiary block mb-1">Min</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={activeFilters.sizeMin || ''}
                          onChange={(e) => handleFilterChange('sizeMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="0"
                          className="w-full px-2 py-1.5 bg-background-secondary border border-DEFAULT rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-tertiary block mb-1">Max</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={activeFilters.sizeMax || ''}
                          onChange={(e) => handleFilterChange('sizeMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="∞"
                          className="w-full px-2 py-1.5 bg-background-secondary border border-DEFAULT rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* File Extension Filter (only for files) */}
                {viewType === 'files' && availableExtensions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary block">File Extension</label>
                    <select
                      value={activeFilters.extension || ''}
                      onChange={(e) => handleFilterChange('extension', e.target.value || undefined)}
                      className="w-full px-3 py-2 bg-background-secondary border border-DEFAULT rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="">All Extensions</option>
                      {availableExtensions.map(ext => (
                        <option key={ext} value={ext}>.{ext}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
