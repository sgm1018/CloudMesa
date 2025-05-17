import React, { useState, useEffect } from 'react';
import { Item } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Key, Folder, MoreVertical, Share, Eye, EyeOff, Copy, ExternalLink as External } from 'lucide-react';

interface PasswordListProps {
  items: Item[];
  onPasswordSelect: (password: Item) => void;
}

const PasswordList: React.FC<PasswordListProps> = ({ items, onPasswordSelect }) => {
  const { selectedItems, setSelectedItems, setCurrentFolder } = useAppContext();
  const { showToast } = useToast();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [selectedPasswordId, setSelectedPasswordId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!selectedPasswordId) return;
      
      const item = items.find(i => i._id === selectedPasswordId);
      if (!item || item.type !== 'password') return;

      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        if (item.encryptedMetadata.username) {
          await copyToClipboard(item.encryptedMetadata.username, 'username');
        }
      } else if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        if (item.encryptedMetadata.password) {
          await copyToClipboard(item.encryptedMetadata.password, 'password');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedPasswordId, items]);

  const copyToClipboard = async (text: string, type: 'username' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${type === 'username' ? 'Username' : 'Password'} copied to clipboard`);
    } catch (error) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        showToast(`${type === 'username' ? 'Username' : 'Password'} copied to clipboard`);
      } catch (err) {
        console.error('Fallback clipboard copy failed:', err);
        showToast('Failed to copy to clipboard', 'error');
      }
      document.body.removeChild(textarea);
    }
  };

  const getItemIcon = (item: Item) => {
    if (item.type === 'group') return <Folder className="h-5 w-5 text-primary-500" />;
    
    const icon = item.encryptedMetadata.icon;
    switch(icon) {
      case 'mail':
        return <Key className="h-5 w-5 text-red-500" />;
      case 'shopping-cart':
        return <Key className="h-5 w-5 text-orange-500" />;
      case 'building':
        return <Key className="h-5 w-5 text-blue-500" />;
      case 'trello':
        return <Key className="h-5 w-5 text-indigo-500" />;
      default:
        return <Lock className="h-5 w-5 text-gray-500" />;
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
    } else {
      setSelectedPasswordId(prevId => prevId === item._id ? null : item._id);
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

  const handleCopyClick = async (text: string, type: 'username' | 'password', event: React.MouseEvent) => {
    event.stopPropagation();
    await copyToClipboard(text, type);
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
              onClick={() => handleItemClick(item)}
              onDoubleClick={() => handleDoubleClick(item)}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group ${
                selectedItems.includes(item._id)
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : ''
              } ${
                selectedPasswordId === item._id
                  ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500 dark:ring-blue-400'
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
                  {getItemIcon(item)}
                  <span className="ml-3 font-medium">{item.name}</span>
                  {item.sharedWith && item.sharedWith.length > 0 && (
                    <div className="ml-2">
                      <Share className="h-3.5 w-3.5 text-primary-500" />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                {item.type === 'password' && item.encryptedMetadata.username ? (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.encryptedMetadata.username}
                    </span>
                    <button
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleCopyClick(item.encryptedMetadata.username || '', 'username', e)}
                    >
                      <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">—</span>
                )}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {item.type === 'password' && item.encryptedMetadata.password ? (
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
                      onClick={(e) => handleCopyClick(item.encryptedMetadata.password || '', 'password', e)}
                    >
                      <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                {formatDate(item.updatedAt)}
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
                      {item.type === 'password' && (
                        <>
                          <button
                            className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.encryptedMetadata.username) {
                                copyToClipboard(item.encryptedMetadata.username, 'username');
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
                                copyToClipboard(item.encryptedMetadata.password, 'password');
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
                              <External className="h-4 w-4 mr-2" />
                              <span>Visit Website</span>
                            </button>
                          )}
                          
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        </>
                      )}
                      
                      <button className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700">
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
                        <Eye className="h-4 w-4 mr-2" />
                        <span>Edit</span>
                      </button>
                      
                      <button className="w-full flex items-center px-4 py-2 text-sm text-left text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700">
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