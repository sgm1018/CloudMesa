import React, { useState, useEffect } from 'react';
import { Item } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Key, Folder, MoreVertical, Share, Trash, Edit, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import ShareModal from '../shared/ShareModal';

interface PasswordGridProps {
  items: Item[];
  onPasswordSelect: (password: Item) => void;
}

const PasswordGrid: React.FC<PasswordGridProps> = ({ items, onPasswordSelect }) => {
  const { selectedItems, setSelectedItems, setCurrentFolder } = useAppContext();
  const { showToast } = useToast();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<'left' | 'right'>('right');
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [itemsToShare, setItemsToShare] = React.useState<Item[]>([]);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const getItemIcon = (item: Item) => {
    if (item.type === 'group') return <Folder className="h-12 w-12 text-primary-500" />;
    
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

  const handleItemClick = (item: Item) => {
    if (item.type === 'group') {
      setCurrentFolder(item._id);
    }
  };

  const handleDoubleClick = (item: Item) => {
    if (item.type === 'password') {
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

  const copyToClipboard = async (text: string, type: 'username' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${type === 'username' ? 'Username' : 'Password'} copied to clipboard`);
    } catch (error) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleCopyClick = (text: string, type: 'username' | 'password', event: React.MouseEvent) => {
    event.stopPropagation();
    copyToClipboard(text, type);
  };

  const handleShare = (item: Item) => {
    setItemsToShare([item]);
    setShowShareModal(true);
    setOpenMenuId(null);
  };

  const handleShareSelected = () => {
    const itemsToShare = items.filter(item => selectedItems.includes(item._id));
    setItemsToShare(itemsToShare);
    setShowShareModal(true);
    setOpenMenuId(null);
  };

  const toggleMenu = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }

    const button = event.currentTarget as HTMLElement;
    const buttonRect = button.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - buttonRect.right;
    const spaceOnLeft = buttonRect.left;
    
    setMenuPosition(spaceOnRight > 200 ? 'right' : 'left');
    setOpenMenuId(id);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.menu-dropdown')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item._id}
            className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden cursor-pointer border border-transparent hover:border-primary-300 dark:hover:border-primary-700 transition-all ${
              selectedItems.includes(item._id) ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => handleItemClick(item)}
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
              
              {openMenuId === item._id && (
                <div 
                  ref={menuRef}
                  className={`fixed mt-1 w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 menu-dropdown ${
                    menuPosition === 'left' ? '-translate-x-full' : ''
                  }`}
                >
                  {item.type === 'password' && (
                    <>
                      <button
                        className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.encryptedMetadata.username) {
                            handleCopyClick(item.encryptedMetadata.username, 'username', e);
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        <span>Copy Username</span>
                      </button>
                      
                      <button
                        className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.encryptedMetadata.password) {
                            handleCopyClick(item.encryptedMetadata.password, 'password', e);
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        <span>Copy Password</span>
                      </button>
                      
                      {item.encryptedMetadata.url && (
                        <button
                          className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.encryptedMetadata.url, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          <span>Visit Website</span>
                        </button>
                      )}
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    </>
                  )}
                  
                  <button 
                    className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(item);
                    }}
                  >
                    <Share className="h-4 w-4 mr-2" />
                    <span>Share</span>
                  </button>
                  
                  <button 
                    className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.type === 'password') {
                        onPasswordSelect(item);
                      }
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>Edit</span>
                  </button>
                  
                  <button className="w-full flex items-center px-4 py-2 text-sm text-left text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Trash className="h-4 w-4 mr-2" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4 pt-6 flex flex-col items-center">
              <div className="mb-3 flex items-center justify-center">
                {getItemIcon(item)}
              </div>
              
              <div className="mt-2 text-center">
                <h3 className="text-sm font-medium truncate w-full max-w-[160px]">{item.name}</h3>
                
                {item.type === 'password' && item.encryptedMetadata.username && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                    {item.encryptedMetadata.username}
                  </div>
                )}
                
                {item.type === 'password' && item.encryptedMetadata.password && (
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

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        items={itemsToShare}
        onShare={(users) => {
          setShowShareModal(false);
        }}
      />
    </>
  );
};

export default PasswordGrid;