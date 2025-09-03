import React, { useState, useEffect } from 'react';
import { Item, ItemType } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Lock, Key, Folder, MoreVertical, Share, Eye, EyeOff, Copy, ExternalLink as External } from 'lucide-react';

interface PasswordListProps {
  items: Item[];
  onPasswordSelect: (password: Item) => void;
  onShare: (item: Item | Item[]) => void;
  onCopyUsername: (item: Item | Item[]) => void;
  onCopyPassword: (item: Item | Item[]) => void;
  onVisitWebsite: (item: Item | Item[]) => void;
  onEdit: (item: Item | Item[]) => void;
  onDelete: (item: Item | Item[]) => void;
  onGetIcon: (extension: Item, isList: boolean) => React.ReactElement;
  onItemClick: (item: Item, event: React.MouseEvent) => void;
  onRightClick: (event: React.MouseEvent, itemId: string) => void;
}

const PasswordList: React.FC<PasswordListProps> = ({
  items,
  onPasswordSelect,
  onShare,
  onCopyUsername,
  onCopyPassword,
  onVisitWebsite,
  onEdit,
  onDelete,
  onGetIcon,
  onItemClick,
  onRightClick
}) => {
  const { selectedItems, setSelectedItems } = useAppContext();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [selectedPasswordId, setSelectedPasswordId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!hoveredItemId || !event.ctrlKey) return;
      
      const hoveredItem = items.find(item => item._id === hoveredItemId);
      if (!hoveredItem || hoveredItem.type !== ItemType.PASSWORD) return;

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

  // Keep the existing keyboard shortcut handler for selected items
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!selectedPasswordId) return;
      
      const item = items.find(i => i._id === selectedPasswordId);
      if (!item || item.type !== ItemType.PASSWORD) return;

      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        onCopyUsername(item);
      } else if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        onCopyPassword(item);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedPasswordId, items]);



  const toggleSelect = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
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
    
    // Calculate available space
    const spaceBelow = window.innerHeight - (rect.bottom + scrollTop);
    const menuHeight = 200; // Approximate height of menu
    
    // Position menu above or below based on available space
    const top = spaceBelow < menuHeight ? rect.top + scrollTop - menuHeight : rect.bottom + scrollTop;
    const left = rect.right - 180; // Menu width is approximately 180px
    
    setMenuPosition({ top, left });
    setOpenMenuId(id);
  };

  // Update the rightClickOnElement function to accept itemId parameter
  const rightClickOnElement = (event: React.MouseEvent, itemId: string) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuPosition({
      top: event.clientY,
      left: event.clientX
    });
    
    setOpenMenuId(itemId);
  };

  // Fix the handleItemClick function
  const handleItemClick = (item: Item, event: React.MouseEvent) => {
    // Delegate to parent
    onItemClick(item, event);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
            <th className="px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-400 w-6">
              <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600" />
            </th>
            <th className="px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-400">Name</th>
            <th className="px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-400">Username</th>
            <th className="px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">Password</th>
            <th className="px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">Modified</th>
            <th className="px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-400 w-20"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item._id}
              onContextMenu={(event) => {
                event.preventDefault();
                handleItemClick(item, event);
              }}
              onClick={(event) => {
                event.preventDefault();
                handleItemClick(item, event);
              }}
              onDoubleClick={() => handleDoubleClick(item)}
              onMouseEnter={() => setHoveredItemId(item._id)}
              onMouseLeave={() => setHoveredItemId(null)}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group ${
                selectedItems.includes(item._id)
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : ''
              } ${
                selectedPasswordId === item._id
                  ? 'bg-blue-50 dark:bg-blue-900/30'
                  : ''
              }`}
            >
              <td className="px-4 py-3">
                <div
                  className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center"
                  onClick={(e) => toggleSelect(item._id, e)}
                >
                  {selectedItems.includes(item._id) && (
                    <div className="w-3 h-3 bg-primary-500 rounded-sm" />
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  {onGetIcon(item, true)}
                  <span className="ml-3 font-medium">{item.itemName}</span>
                  {item.sharedWith && item.sharedWith.length > 0 && (
                    <div className="ml-2">
                      <Share className="h-3.5 w-3.5 text-primary-500" />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                {item.type === ItemType.PASSWORD && item.encryptedMetadata.username ? (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.encryptedMetadata.username}
                    </span>
                    <button
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyUsername(item);
                      }}
                    >
                      <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">—</span>
                )}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {item.type === ItemType.PASSWORD && item.encryptedMetadata.password ? (
                  <div className="flex items-center space-x-1">
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {visiblePasswords[item._id] 
                        ? item.encryptedMetadata.password 
                        : "•••••••"}
                    </span>
                    <button
                      className="p-1"
                      onClick={(e) => togglePasswordVisibility(item._id, e)}
                    >
                      {visiblePasswords[item._id] ? (
                        <EyeOff className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      )}
                    </button>
                    <button
                      className="p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyPassword(item);
                      }}
                    >
                      <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                { item.updatedAt && formatDate(item.updatedAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="relative">
                  <button
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={(e) => toggleMenu(item._id, e)}
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  {openMenuId === item._id && menuPosition && (
                    <div 
                      ref={menuRef}
                      style={{
                        position: 'fixed',
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                      }}
                      className="w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 menu-dropdown"
                    >
                      {item.type === ItemType.PASSWORD && (
                        <>
                          <button
                            className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCopyUsername(item);
                              setOpenMenuId(null);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            <span>Copy Username</span>
                          </button>
                          
                          <button
                            className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCopyPassword(item);
                              setOpenMenuId(null);
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
                                onVisitWebsite(item);
                                setOpenMenuId(null);
                              }}
                            >
                              <External className="h-4 w-4 mr-2" />
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
                          onShare(item);
                          setOpenMenuId(null);
                        }}
                      >
                        <Share className="h-4 w-4 mr-2" />
                        <span>Share</span>
                      </button>
                      
                      <button 
                        className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                          setOpenMenuId(null);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        <span>Edit</span>
                      </button>
                      
                      <button 
                        className="w-full flex items-center px-4 py-2 text-sm text-left text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                          setOpenMenuId(null);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PasswordList;