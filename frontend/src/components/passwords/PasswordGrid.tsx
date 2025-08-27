import React, { useState, useEffect } from 'react';
import { Item, ItemType } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Lock, Key, Folder, MoreVertical, Eye, EyeOff, Share } from 'lucide-react';
// import ShareModal from '../shared/ShareModal';
import RightClickElementModal from '../shared/RightClickElementModal';

interface PasswordGridProps {
  items: Item[];
  onPasswordSelect: (password: Item) => void;
  onShare: (item: Item | Item[]) => void;
  onCopyUsername: (item: Item | Item[]) => void;
  onCopyPassword: (item: Item | Item[]) => void;
  onVisitWebsite: (item: Item | Item[]) => void;
  onEdit: (item: Item | Item[]) => void;
  onDelete: (item: Item | Item[]) => void;
}

const PasswordGrid: React.FC<PasswordGridProps> = ({
  items,
  onPasswordSelect,
  onShare,
  onCopyUsername,
  onCopyPassword,
  onVisitWebsite,
  onEdit,
  onDelete
}) => {
  const { selectedItems, setSelectedItems, navigateToFolder } = useAppContext();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [currentItem, setCurrentItem] = React.useState<Item | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [selectedPasswordId, setSelectedPasswordId] = useState<string | null>(null);

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!hoveredItemId || !event.ctrlKey) return;
      
      const hoveredItem = items.find(item => item._id === hoveredItemId);
      if (!hoveredItem || hoveredItem.type !== 'password') return;

      if (event.key.toLowerCase() === 'u') {
        event.preventDefault();
        onCopyUsername(hoveredItem);
      } else if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        onCopyPassword(hoveredItem);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hoveredItemId, items]);

  const getItemIcon = (item: Item) => {
    if (item.type === ItemType.GROUP) return <Folder className="h-12 w-12 text-primary-500" />;
    
    const icon = item.encryptedMetadata.icon;
    switch(icon) {
      case 'mail':
        return <Key className="h-12 w-12 text-red-500" />;
      case 'shopping-cart':
        return <Key className="h-12 w-12 text-orange-500" />;
      case 'building':
        return <Key className="h-12 w-12 text-blue-500" />;
      case 'trello':
        return <Key className="h-12 w-12 text-indigo-500" />;
      default:
        return <Lock className="h-12 w-12 text-gray-500" />;
    }
  };

  const toggleSelect = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // New right-click handler function
  const rightClickOnElement = (event: React.MouseEvent, itemId: string) => {
    event.preventDefault();
    event.stopPropagation();
    
    const item = items.find(i => i._id === itemId);
    if (!item) return;
    
    setMenuPosition({
      top: event.clientY,
      left: event.clientX
    });
    
    setCurrentItem(item);
    setOpenMenuId(itemId);
  };

  // Updated handleItemClick to handle right clicks
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
      setSelectedPasswordId(prevId => prevId === item._id ? null : item._id);
    }
  };

  const handleDoubleClick = (item: Item) => {
    if (item.type === ItemType.PASSWORD) {
      onPasswordSelect(item);
    }
  };

  const togglePasswordVisibility = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleShare = (item: Item | Item[]) => {
    onShare(item);
  };

  const handleCopyUsername = (item: Item | Item[]) => {
    onCopyUsername(item);
  };

  const handleCopyPassword = (item: Item | Item[]) => {
    onCopyPassword(item);
  };

  const handleVisitWebsite = (item: Item | Item[]) => {
    onVisitWebsite(item);
  };

  const handleEdit = (item: Item | Item[]) => {
    onEdit(item);
  };

  const handleDelete = (item: Item | Item[]) => {
    onDelete(item);
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
    setMenuPosition(null);
    setCurrentItem(null);
  };

  const toggleMenu = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (openMenuId === id) {
      setOpenMenuId(null);
      setMenuPosition(null);
      return;
    }

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    // Calculate position based on available space
    const top = rect.bottom + scrollTop;
    const left = rect.right - 180; // Menu width is approximately 180px
    
    setMenuPosition({ top, left });
    setOpenMenuId(id);
  };

  React.useEffect(() => {
    // El componente RightClickElementModal maneja su propio cierre
    // Este useEffect ya no es necesario
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item._id}
            className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden cursor-pointer border border-transparent hover:border-primary-300 dark:hover:border-primary-700 transition-all ${
              selectedItems.includes(item._id) ? 'ring-2 ring-primary-500' : ''
            } ${
              selectedPasswordId === item._id
                ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500 dark:ring-blue-400'
                : ''
            }`}
            onClick={(event) => handleItemClick(item, event)}
            onContextMenu={(event) => rightClickOnElement(event, item._id)}
            onDoubleClick={() => handleDoubleClick(item)}
            onMouseEnter={() => setHoveredItemId(item._id)}
            onMouseLeave={() => setHoveredItemId(null)}
          >
            <div
              className="absolute top-2 left-2 z-0"
              onClick={(e) => toggleSelect(item._id, e)}
            >
              <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                {selectedItems.includes(item._id) && (
                  <div className="w-3 h-3 bg-primary-500 rounded-sm" />
                )}
              </div>
            </div>
            
            <div className="absolute top-2 right-2 z-20">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => toggleMenu(item._id, e)}
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 pt-6 flex flex-col items-center">
              <div className="mb-3 flex items-center justify-center">
                {getItemIcon(item)}
              </div>
              
              <div className="mt-2 text-center">
                <h3 className="text-sm font-medium truncate w-full max-w-[160px]">{item.encryptedMetadata.name}</h3>
                
                {item.type === ItemType.PASSWORD && item.encryptedMetadata.username && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                    {item.encryptedMetadata.username}
                  </div>
                )}
                
                {item.type === ItemType.PASSWORD && item.encryptedMetadata.password && (
                  <div className="mt-2 flex justify-center items-center">
                    <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded max-w-[120px] truncate">
                      {visiblePasswords[item._id] 
                        ? item.encryptedMetadata.password 
                        : "••••••••••"}
                    </div>
                    <button 
                      className="ml-1 p-1"
                      onClick={(e) => togglePasswordVisibility(item._id, e)}
                    >
                      {visiblePasswords[item._id] ? (
                        <EyeOff className="h-3.5 w-3.5 text-gray-500" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-gray-500" />
                      )}
                    </button>
                  </div>
                )}
                
                {item.sharedWith && item.sharedWith.length > 0 && (
                  <div className="flex items-center justify-center mt-2">
                    <Share className="h-3 w-3 text-primary-500 mr-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Shared
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Context Menu - positioned absolutely */}
      <RightClickElementModal
        isOpen={openMenuId !== null}
        position={menuPosition}
        item={currentItem}
        onClose={handleCloseMenu}
        contextType="password"
        onShare={handleShare}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCopyUsername={handleCopyUsername}
        onCopyPassword={handleCopyPassword}
        onVisitWebsite={handleVisitWebsite}
      />

      {/* <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        items={itemsToShare}
        onShare={(_users) => {
          setShowShareModal(false);
        }}
      /> */}
    </>
  );
};

export default PasswordGrid;