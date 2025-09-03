import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Item, ItemType } from '../../types';
import PasswordGrid from './PasswordGrid';
import PasswordList from './PasswordList';
import Breadcrumb from '../files/Breadcrumb';
import NewPasswordModal from './NewPasswordModal';
import PasswordDetailsModal from './PasswordDetailsModal';
import { FolderPlus, KeyIcon, Plus, Loader2, Filter, ChevronLeft, ChevronRight, Folder, Key, Lock } from 'lucide-react';
import { PaginationParams } from '../../services/BaseService';
import { useToast } from '../../context/ToastContext';
import FileNewFolder from '../files/FileNewFolder';
import { itemService } from '../../services/ItemService';
import RightClickElementModal from '../shared/RightClickElementModal';

const PasswordsView: React.FC = () => {
  const { currentPasswordFolder: currentFolder, viewMode, searchQuery, getItemsByParentId, countItems, selectedItems, setSelectedItems, navigateToFolder } = useAppContext();
  const { showToast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Item | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'passwords' | 'groups'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items4Page, setItems4Page] = useState(20);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [currentItem, setCurrentItem] = React.useState<Item | null>(null);
  const [previousFolder, setPreviousFolder] = React.useState<string | null>(null);

  const handlePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchItems = async () => {
    setIsLoading(true);

    const contItems: number = await countItems([ItemType.PASSWORD, ItemType.GROUP], currentFolder || '');
    setTotalPages(Math.ceil(contItems / items4Page));
    
    const params: PaginationParams = {
      parentId: currentFolder || '',
      itemTypes: [ItemType.PASSWORD, ItemType.GROUP],
      page: currentPage,
      limit: items4Page,
    };

    let fetchedItems = await getItemsByParentId(params);

    // Apply sorting
    fetchedItems.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.itemName!.localeCompare(b.itemName!);
          break;
        case 'date':
          if (!a.updatedAt || !b.updatedAt) return 0;
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setItems(fetchedItems);
    setIsLoading(false);
  };

  useEffect(() => {
    if (previousFolder != currentFolder) {
      setCurrentPage(1);
      setPreviousFolder(currentFolder);
    }
    fetchItems();
  }, [currentFolder, sortBy, sortOrder, filterType, currentPage]);


  const getItemIcon = (item: Item, isList: boolean) => {
    if (item.type === ItemType.GROUP) return <Folder className="h-5 w-5 text-primary-500" />;
    const iconSizeClass = isList ? 'h-5 w-5' : 'h-10 w-10';
    const icon = item.encryptedMetadata.icon;
    switch(icon) {
      case 'mail':
        return <Key className={`${iconSizeClass} text-red-500`} />;
      case 'shopping-cart':
        return <Key className={`${iconSizeClass} text-orange-500"`} />;
      case 'building':
        return <Key className={`${iconSizeClass} text-blue-500"`} />;
      case 'trello':
        return <Key className={`${iconSizeClass} text-indigo-500"`} />;
      default:
        return <Lock className={`${iconSizeClass} text-gray-500"`} />;
    }
  };
  // Shared handlers for both grid and list views
  const handleShare = (item: Item | Item[]) => {
    console.log('Share:', Array.isArray(item) ? item.map(i => i.itemName) : item.itemName);
    showToast('Share functionality not implemented yet', 'error');
  };

  const handleCopyUsername = (item: Item | Item[]) => {
    const itemsArray = Array.isArray(item) ? item : [item];
    const usernames = itemsArray
      .filter(i => i.encryptedMetadata.username)
      .map(i => i.encryptedMetadata.username)
      .join('\n');

    if (usernames) {
      navigator.clipboard.writeText(usernames);
      showToast(`${itemsArray.length} usernames copied to clipboard!`, 'success');
    }
  };

  const handleCopyPassword = (item: Item | Item[]) => {
    const itemsArray = Array.isArray(item) ? item : [item];
    const passwords = itemsArray
      .filter(i => i.encryptedMetadata.password)
      .map(i => i.encryptedMetadata.password)
      .join('\n');

    if (passwords) {
      navigator.clipboard.writeText(passwords);
      showToast(`${itemsArray.length} passwords copied to clipboard!`, 'success');
    }
  };

  const handleVisitWebsite = (item: Item | Item[]) => {
    const itemsArray = Array.isArray(item) ? item : [item];
    itemsArray.forEach(i => {
      if (i.encryptedMetadata.url) {
        window.open(i.encryptedMetadata.url, '_blank');
      }
    });
    showToast(`Opened ${itemsArray.length} websites!`, 'success');
  };

  const handleEdit = (item: Item | Item[]) => {
    const singleItem = Array.isArray(item) ? item[0] : item;
    if (singleItem.type === ItemType.PASSWORD) {
      setSelectedPassword(singleItem);
    }
  };

  const handleDelete = (item: Item | Item[]) => {
    const itemsArray = Array.isArray(item) ? item : [item];
    console.log('Delete:', itemsArray.map(i => i.itemName));
    showToast('Delete functionality not implemented yet', 'error');
  };

  // Group management functions
  const handleNewGroup = () => {
    setIsNewGroup(true);
  };

  const createNewGroup = async (groupName: string) => {
    setIsNewGroup(false);
    try {
      const item = await itemService.createItemStorage(ItemType.GROUP, groupName, currentFolder || '');
      await itemService.uploadStorage(item);
      showToast('Group created successfully!', 'success');
      await fetchItems();
    } catch (error) {
      console.error('Error creating group:', error);
      showToast('Failed to create group. Please try again.', 'error');
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    const visiblePages = getVisiblePages();

    return (
      <div className="flex items-center justify-center space-x-1 mt-6">
        <button
          onClick={() => handlePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                ...
              </span>
            ) : (
              <button
                onClick={() => handlePage(page as number)}
                className={`px-3 py-2 text-sm font-medium rounded border ${
                  currentPage === page
                    ? 'z-10 text-primary-600 bg-primary-50 border-primary-500 dark:bg-blue-900 dark:text-white dark:border-primary-600'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => handlePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const handleSavePassword = (data: {
    name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
  }) => {
    // Create a new password item
    // Implementation remains the same
  };

  const handleUpdatePassword = (data: {
    name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
  }) => {
    if (!selectedPassword) return;

    const updatedPassword: Item = {
      ...selectedPassword,
      encryptedMetadata: {
        ...selectedPassword.encryptedMetadata,
        name: data.name,
        username: data.username,
        password: data.password,
        url: data.url,
        notes: data.notes,
      },
      updatedAt: new Date(),
    };

    setItems(prevItems =>
      prevItems.map(item =>
        item._id === selectedPassword._id ? updatedPassword : item
      )
    );
  };

  const handlePasswordSelect = (password: Item) => {
    if (password.type === ItemType.PASSWORD) {
      setSelectedPassword(password);
    }
  };

  // Handle item clicks - centralized logic
  const handleItemClick = (item: Item, event: React.MouseEvent) => {
    // Handle right click to show context menu
    if (event.button === 2) {
      rightClickOnElement(event, item._id);
      return;
    }
    
    // Handle Ctrl+Click for multi-selection
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      event.stopPropagation();
      
      if (selectedItems.includes(item._id)) {
        setSelectedItems(selectedItems.filter(id => id !== item._id));
      } else {
        setSelectedItems([...selectedItems, item._id]);
      }
      return;
    }
    
    // Handle normal left click
    if (item.type === ItemType.GROUP) {
      navigateToFolder(item._id);
    } else {
      handlePasswordSelect(item);
    }
  };

  // Add right-click handler function
  const rightClickOnElement = (event: React.MouseEvent, itemId: string) => {
    event.preventDefault();
    event.stopPropagation();

    const item = items.find(i => i._id === itemId);
    if (!item) return;

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    // Calculate available space
    const spaceBelow = window.innerHeight - (rect.bottom + scrollTop);
    const menuHeight = 200; // Approximate height of menu
    
    // Position menu above or below based on available space
    const top = spaceBelow < menuHeight ? rect.top + scrollTop - menuHeight : rect.bottom + scrollTop;
    const left = rect.right - 180; // Menu width is approximately 180px

    setMenuPosition({
      top: top,
      left: left
    });
    
    setCurrentItem(item);
    setOpenMenuId(itemId);
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
    setMenuPosition(null);
    setCurrentItem(null);
  };

  if (isLoading) {
    return (
      <div className="py-10">
        <div className="flex items-center justify-center flex-col">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin mb-2" />
          <p className="text-gray-500 dark:text-gray-400">Loading passwords...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Breadcrumb 
            allItems={items}
            onDelete={handleDelete}
            onCopyUsername={handleCopyUsername}
            onCopyPassword={handleCopyPassword}
            onVisitWebsite={handleVisitWebsite}
          />
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center space-x-1"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filters</span>
              </button>
              
              {showFilters && (
                <div className="absolute z-10 top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Sort by</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                        className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <option value="name">Name</option>
                        <option value="date">Date modified</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Order</label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as 'all' | 'passwords' | 'groups')}
                        className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <option value="all">All items</option>
                        <option value="passwords">Passwords only</option>
                        <option value="groups">Groups only</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewPasswordModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>New Password</span>
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleNewGroup}
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Group</span>
          </button>
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="py-10">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-4">
              <KeyIcon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {currentFolder
                ? 'This group is empty'
                : 'You don\'t have any password groups yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {currentFolder
                ? 'Add passwords to this group to keep them organized'
                : 'Create password groups to organize your credentials'}
            </p>
            <div className="flex gap-2 justify-center">
              <button 
                className="btn btn-primary"
                onClick={() => setShowNewPasswordModal(true)}
              >
                <Plus className="h-4 w-4" />
                <span>New Password</span>
              </button>
              <button className="btn btn-secondary" onClick={handleNewGroup}>
                <FolderPlus className="h-4 w-4" />
                <span>New Group</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          {viewMode === 'grid' ? (
            <PasswordGrid
              items={items}
              onPasswordSelect={handlePasswordSelect}
              onShare={handleShare}
              onCopyUsername={handleCopyUsername}
              onCopyPassword={handleCopyPassword}
              onVisitWebsite={handleVisitWebsite}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onGetIcon={getItemIcon}
              onItemClick={handleItemClick}
              onRightClick={rightClickOnElement}
            />
          ) : (
            <PasswordList
              items={items}
              onPasswordSelect={handlePasswordSelect}
              onShare={handleShare}
              onCopyUsername={handleCopyUsername}
              onCopyPassword={handleCopyPassword}
              onVisitWebsite={handleVisitWebsite}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onGetIcon={getItemIcon}
              onItemClick={handleItemClick}
              onRightClick={rightClickOnElement}
            />
          )}
          
          {renderPagination()}
        </div>
      )}

      <NewPasswordModal
        isOpen={showNewPasswordModal}
        onClose={() => setShowNewPasswordModal(false)}
        onSave={handleSavePassword}
      />

      {selectedPassword && (
        <PasswordDetailsModal
          isOpen={!!selectedPassword}
          onClose={() => setSelectedPassword(null)}
          password={selectedPassword}
          onSave={handleUpdatePassword}
        />
      )}

      {/* FileNewFolder Modal for Groups */}
      <FileNewFolder
        isOpen={isNewGroup}
        itemType={ItemType.GROUP}
        onClose={() => setIsNewGroup(false)}
        onCreate={createNewGroup}
      />

      {/* Right Click Context Menu */}
      {openMenuId && menuPosition && (
        <RightClickElementModal
          isOpen={openMenuId !== null}
          position={menuPosition}
          item={currentItem}
          onClose={handleCloseMenu}
          contextType={currentItem?.type === 'group' ? 'folder' : 'password'}
          allItems={items}
          onShare={handleShare}
          onDownload={() => {}} // Passwords don't have download
          onRename={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default PasswordsView;