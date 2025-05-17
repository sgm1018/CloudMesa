import React, { createContext, useContext, useState } from 'react';
import { Item, ViewMode } from '../types';

type View = 'files' | 'passwords' | 'settings';

type AppContextType = {
  currentView: View;
  setCurrentView: (view: View) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentFileFolder: string | null;
  currentPasswordFolder: string | null;
  setCurrentFolder: (folderId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  isAddingNewItem: boolean;
  setIsAddingNewItem: (adding: boolean) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<View>('files');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentFileFolder, setCurrentFileFolder] = useState<string | null>(null);
  const [currentPasswordFolder, setCurrentPasswordFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const setCurrentFolder = (folderId: string | null) => {
    if (currentView === 'files') {
      setCurrentFileFolder(folderId);
    } else {
      setCurrentPasswordFolder(folderId);
    }
  };

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
        searchQuery,
        setSearchQuery,
        selectedItems,
        setSelectedItems,
        isAddingNewItem,
        setIsAddingNewItem,
        isSidebarCollapsed,
        toggleSidebar,
        isSearching,
        setIsSearching,
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