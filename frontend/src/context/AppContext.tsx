import React, { createContext, useContext, useState, useCallback } from 'react';
import { Item, ViewMode } from '../types';
import { itemService } from '../services/ItemService';
import { PaginationParams } from '../services/BaseService';
type View = 'files' | 'passwords' | 'boards' | 'settings';
type SearchMode = 'normal' | 'direct';

type AppContextType = {
  currentView: View;
  setCurrentView: (view: View) => void;
  setCurrentViewWithBreadcrumbs: (view: View) => Promise<void>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentFileFolder: string | null;
  currentPasswordFolder: string | null;
  setCurrentFolder: (folderId: string | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  isDirectSearchActive: boolean;
  setIsDirectSearchActive: (active: boolean) => void;
  originalFolder: string | null;
  setOriginalFolder: (folderId: string | null) => void;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  isAddingNewItem: boolean;
  setIsAddingNewItem: (adding: boolean) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  getItemsByParentId: (paginationParams : PaginationParams) => Promise<Item[]>;
  countItems: (type: string[], parentId: string) => Promise<number>;
  breadcrumbPath: Item[];
  setBreadcrumbPath: (path: Item[]) => void;
  loadBreadcrumbPath: (itemId: string | null) => Promise<void>;
  navigateToFolder: (folderId: string | null) => Promise<void>;
  navigateToGroup: (folderId: string | null) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<View>('files');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFileFolder, setCurrentFileFolder] = useState<string | null>(null);
  const [currentPasswordFolder, setCurrentPasswordFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('normal');
  const [isDirectSearchActive, setIsDirectSearchActive] = useState(false);
  const [originalFolder, setOriginalFolder] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState<Item[]>([]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const loadBreadcrumbPath = useCallback(async (itemId: string | null) => {
    if (!itemId || itemId === '') {
      setBreadcrumbPath([]);
      return;
    }
    
    try {
      const path = await itemService.getBreadcrumbPath(itemId);
      setBreadcrumbPath(path);
    } catch (error) {
      console.error('Error loading breadcrumb path:', error);
      setBreadcrumbPath([]);
    }
  }, []);

  const navigateToFolder = useCallback(async (folderId: string | null) => {
    setCurrentFolder(folderId);
    setCurrentPage(1);
    await loadBreadcrumbPath(folderId);
  }, [loadBreadcrumbPath]);

  const navigateToGroup = useCallback(async (groupId: string | null) => {
    setCurrentPasswordFolder(groupId);
    setCurrentPage(1);
    await loadBreadcrumbPath(groupId);
  }, [loadBreadcrumbPath]);

  // Update breadcrumbs when current view changes
  const setCurrentViewWithBreadcrumbs = useCallback(async (view: View) => {
    setCurrentView(view);
    const currentFolder = view === 'files' ? currentFileFolder : currentPasswordFolder;
    await loadBreadcrumbPath(currentFolder);
  }, [currentFileFolder, currentPasswordFolder, loadBreadcrumbPath]);

  const setCurrentFolder = (folderId: string | null) => {
    if (currentView === 'files') {
      setCurrentFileFolder(folderId);
    } else {
      setCurrentPasswordFolder(folderId);
    }
  };


  const countItems = useCallback(async (type: string[], parentId: string) => {
    return await itemService.countItems(type, parentId);
  }, []);

  const getItemsByParentId = useCallback(async (paginationParams: PaginationParams) => {
      const items = await itemService.findItemwByUserByParentIdPagination(paginationParams);
      return items;
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        viewMode,
        setViewMode,
        currentFileFolder,
        currentPasswordFolder,
        setCurrentFolder,
        currentPage,
        setCurrentPage,
        getItemsByParentId,
        searchQuery,
        setSearchQuery,
        searchMode,
        setSearchMode,
        isDirectSearchActive,
        setIsDirectSearchActive,
        originalFolder,
        setOriginalFolder,
        selectedItems,
        setSelectedItems,
        isAddingNewItem,
        setIsAddingNewItem,
        isSidebarCollapsed,
        toggleSidebar,
        isSearching,
        setIsSearching,
        countItems,
        breadcrumbPath,
        setBreadcrumbPath,
        loadBreadcrumbPath,
        navigateToFolder,
        setCurrentViewWithBreadcrumbs,
        navigateToGroup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};