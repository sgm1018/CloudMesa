import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Item, ItemType } from '../../types';
import PasswordGrid from './PasswordGrid';
import PasswordList from './PasswordList';
import Breadcrumb from '../files/Breadcrumb';
import NewPasswordModal from './NewPasswordModal';
import PasswordDetailsModal from './PasswordDetailsModal';
import { FolderPlus, KeyIcon, Plus, Loader2, ChevronLeft, ChevronRight, Folder, Key, Mail, ShoppingCart, Building, Trello, Globe, Shield, CreditCard, Wifi, Server, Smartphone, Gamepad2, Music, Image, FileText, Heart, Briefcase, Home, Car, Plane, MapPin, Gift, Users } from 'lucide-react';
import { PaginationParams } from '../../services/BaseService';
import { useToast } from '../../context/ToastContext';
import FileNewFolder from '../files/FileNewFolder';
import { itemService } from '../../services/ItemService';
import RightClickElementModal from '../shared/RightClickElementModal';
import { useEncryption } from '../../context/EncryptionContext';
import AdvancedFilters, { FilterConfig } from '../shared/AdvancedFilters';
import ShareModal from '../shared/ShareModal';

const PasswordsView: React.FC = () => {
  const { privateKey } = useEncryption();
  const { 
    currentPasswordFolder, 
    navigateToGroup, 
    viewMode, 
    searchQuery, 
    searchMode,
    isDirectSearchActive,
    getItemsByParentId, 
    countItems, 
    selectedItems, 
    setSelectedItems, 
    navigateToFolder 
  } = useAppContext();
  const { showToast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Item | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
    itemType: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items4Page, setItems4Page] = useState(20);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [currentItem, setCurrentItem] = React.useState<Item | null>(null);
  const [previousFolder, setPreviousFolder] = React.useState<string | null>(null);
  const [showShareModal, setShowShareModal] = React.useState<boolean>(false);
  const [shareItems, setShareItems] = React.useState<Item[]>([]);

  // Password icons map similar to fileIconsMap but for password types
  const passwordIconsMap : Record<string, React.ReactElement> = {
    // Email accounts
    'default': <Key className="insertSizehere text-gray-500" />
  };

  // Function to get password icon similar to getIconExtension in FilesView
  const getPasswordIcon = (iconType: string, sizeClass: string) => {
    const element = passwordIconsMap[iconType] || passwordIconsMap['default'];
    const newClassName = element.props.className.replace('insertSizehere', sizeClass);
    const cloneElement = React.cloneElement(element, { className: newClassName });
    return cloneElement;
  };

  const handlePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchItems = async () => {
    if (privateKey == null || privateKey == ''){
      showToast('Private key is not available', 'error');
      return;
    }
    setIsLoading(true);

    let fetchedItems: Item[] = [];
    
    // If direct search is active, get search results instead of folder contents
    if (searchMode === 'direct' && isDirectSearchActive && searchQuery.length >= 2) {
      try {
        fetchedItems = await itemService.findSearchItems(
          searchQuery, 
          'direct', 
          [ItemType.PASSWORD, ItemType.GROUP]
        );
        // For search results, we don't need pagination
        setTotalPages(1);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setItems([]);
        setIsLoading(false);
        return;
      }
    } else {
      // Normal folder browsing
      const contItems: number = await countItems([ItemType.PASSWORD, ItemType.GROUP], currentPasswordFolder || '');
      setTotalPages(Math.ceil(contItems / items4Page));
      
      const params: PaginationParams = {
        parentId: currentPasswordFolder || '',
        itemTypes: [ItemType.PASSWORD, ItemType.GROUP],
        page: currentPage,
        limit: items4Page,
      };

      fetchedItems = await getItemsByParentId(params);
    }

    let listOfDecryptedMetadataPasswords : Item[] = [];
    for (const item of fetchedItems) {
      const decryptedItem = await itemService.getDecryptMetadata(item, privateKey);
      if (decryptedItem == null) continue;
      listOfDecryptedMetadataPasswords.push(decryptedItem);
    }
    if (listOfDecryptedMetadataPasswords == null) return;
    
    setItems(listOfDecryptedMetadataPasswords);
    setIsLoading(false);
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...items];

    // Apply search filter
    if (filterConfig.searchTerm) {
      const searchLower = filterConfig.searchTerm.toLowerCase();
      result = result.filter(item => 
        item.itemName?.toLowerCase().includes(searchLower) ||
        item.encryptedMetadata?.name?.toLowerCase().includes(searchLower) ||
        item.encryptedMetadata?.username?.toLowerCase().includes(searchLower) ||
        item.encryptedMetadata?.url?.toLowerCase().includes(searchLower) ||
        item.encryptedMetadata?.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Apply item type filter
    if (filterConfig.itemType !== 'all') {
      if (filterConfig.itemType === 'passwords') {
        result = result.filter(item => item.type === ItemType.PASSWORD);
      } else if (filterConfig.itemType === 'groups') {
        result = result.filter(item => item.type === ItemType.GROUP);
      }
    }

    // Apply date range filter
    if (filterConfig.dateFrom) {
      result = result.filter(item => {
        const itemDate = new Date(item.updatedAt || item.createdAt);
        return itemDate >= filterConfig.dateFrom!;
      });
    }
    if (filterConfig.dateTo) {
      result = result.filter(item => {
        const itemDate = new Date(item.updatedAt || item.createdAt);
        return itemDate <= filterConfig.dateTo!;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filterConfig.sortBy) {
        case 'name':
          comparison = a.itemName!.localeCompare(b.itemName!);
          break;
        case 'date':
          if (!a.updatedAt || !b.updatedAt) return 0;
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
      }
      
      return filterConfig.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredItems(result);
  }, [items, filterConfig]);

  useEffect(() => {
    if (previousFolder != currentPasswordFolder) {
      setCurrentPage(1);
      setPreviousFolder(currentPasswordFolder);
    }
    fetchItems();
  }, [currentPasswordFolder, currentPage, privateKey, searchQuery, searchMode, isDirectSearchActive]);


  const getItemIcon = (item: Item, isList: boolean) => {
    const sizeClass = isList ? 'h-5 w-5' : 'h-5 w-5 md:h-7 md:w-7 lg:h-10 lg:w-10';
    
    if (item.type === ItemType.GROUP) {
      return <Folder className={`${sizeClass} text-yellow-500`} />;
    }
    
    // For passwords, use the icon from metadata or default to 'other'
    const iconType = item.encryptedMetadata?.icon || 'other';
    return getPasswordIcon(iconType, sizeClass);
  };
  // Shared handlers for both grid and list views
  const handleShare = (item: Item | Item[]) => {
    const itemsArray = Array.isArray(item) ? item : [item];
    console.log('Share:', itemsArray.map(i => i.itemName));
    setShareItems(itemsArray);
    setShowShareModal(true);
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
      const item = await itemService.createItemStorage(ItemType.GROUP, groupName, currentPasswordFolder || '');
      await itemService.uploadWithoutFile(item);
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

  const handleSavePassword = async (data: {
    name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
  }) => {
    const item : Item =await itemService.createItemPassword({name: data.name, username: data.username, password: data.password, url: data.url, notes: data.notes, parentId: currentPasswordFolder || ''});
    await itemService.uploadWithoutFile(item);
    await fetchItems();
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
      navigateToGroup(item._id);
    } else {
      handlePasswordSelect(item);
    }
  };

  // Add right-click handler function
  const rightClickOnElement = (event: React.MouseEvent, itemId: string) => {
    event.preventDefault();
    event.stopPropagation();

    const item = filteredItems.find(i => i._id === itemId);
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
            allItems={filteredItems}
            onDelete={handleDelete}
            onCopyUsername={handleCopyUsername}
            onCopyPassword={handleCopyPassword}
            onVisitWebsite={handleVisitWebsite}
          />
          
          <AdvancedFilters
            items={items}
            onFilterChange={setFilterConfig}
            viewType="passwords"
          />
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
              {currentPasswordFolder
                ? 'This group is empty'
                : 'You don\'t have any password groups yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {currentPasswordFolder
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
              items={filteredItems}
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
              items={filteredItems}
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
          allItems={filteredItems}
          onShare={handleShare}
          onDownload={() => {}} // Passwords don't have download
          onRename={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        items={shareItems}
        onShare={(users) => {
          // TODO: call API to apply sharing settings. For now, just log and show toast.
          console.log('Sharing items', shareItems.map(i => i.itemName), 'with users', users);
          showToast('Sharing settings updated', 'success');
          setShowShareModal(false);
        }}
      />
    </div>
  );
};

export default PasswordsView;