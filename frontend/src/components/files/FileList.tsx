import React, { useState, useEffect } from 'react';
import { Item } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { formatFileSize } from '../../data/mockData';
import { Lock, Key, Folder, MoreVertical, Share, Eye, EyeOff, Copy, ExternalLink as External, X, Download } from 'lucide-react';
import ShareModal from '../shared/ShareModal';

interface FileListProps {
  items: Item[];
}

const FileList: React.FC<FileListProps> = ({ items }) => {
  const { selectedItems, setSelectedItems, navigateToFolder } = useAppContext();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [itemsToShare, setItemsToShare] = React.useState<Item[]>([]);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const getFileIcon = (item: Item) => {
    if (item.type === 'folder') return <Folder className="h-5 w-5 text-yellow-500" />;

    const extension = item.name.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return <Lock className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <Key className="h-5 w-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <Lock className="h-5 w-5 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <Key className="h-5 w-5 text-orange-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Lock className="h-5 w-5 text-purple-500" />;
      case 'zip':
      case 'rar':
        return <Key className="h-5 w-5 text-gray-500" />;
      default:
        return <Lock className="h-5 w-5 text-gray-400" />;
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

  const toggleSelectAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
  };

  // Add right-click handler function
  const rightClickOnElement = (event: React.MouseEvent, itemId: string) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuPosition({
      top: event.clientY,
      left: event.clientX
    });
    
    setOpenMenuId(itemId);
  };

  // Update handleItemClick to handle both left and right clicks
  const handleItemClick = (item: Item, event: React.MouseEvent) => {
    // Handle right click to show context menu
    if (event.button === 2) {
      rightClickOnElement(event, item._id);
      return;
    }
    
    // Handle normal left click
    if (item.type === 'folder') {
      navigateToFolder(item._id);
    }
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

  const handleShare = (item: Item) => {
    setItemsToShare([item]);
    setShowShareModal(true);
    setOpenMenuId(null);
    setMenuPosition(null);
  };

  const handleShareSelected = () => {
    const itemsToShare = items.filter(item => selectedItems.includes(item._id));
    setItemsToShare(itemsToShare);
    setShowShareModal(true);
    setOpenMenuId(null);
    setMenuPosition(null);
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
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
              <th className="px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-400 w-6">
                <div
                  className="w-5 h-5 rounded z-0 border border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer"
                  onClick={toggleSelectAll}
                >
                  {selectedItems.length > 0 && selectedItems.length === items.length && (
                    <div className="w-3 h-3 bg-primary-500 rounded-sm" />
                  )}
                  {selectedItems.length > 0 && selectedItems.length < items.length && (
                    <div className="w-3 h-3 bg-primary-500 rounded-sm opacity-50" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-400">Name</th>
              <th className="px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">Modified</th>
              <th className="px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">Size</th>
              <th className="px-4 py-3 font-medium text-sm text-gray-500 dark:text-gray-400 w-20"></th>
            </tr>
          </thead>
          
          <tbody>
            {items.map((item) => (
              <tr
                key={item._id}
                onClick={(event) => handleItemClick(item, event)}
                onContextMenu={(event) => rightClickOnElement(event, item._id)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group ${
                  selectedItems.includes(item._id)
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div
                    className="w-5 h-5 rounded z-0 border border-gray-300 dark:border-gray-600 flex items-center justify-center"
                    onClick={(e) => toggleSelect(item._id, e)}
                  >
                    {selectedItems.includes(item._id) && (
                      <div className="w-3 h-3 bg-primary-500 rounded-sm" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    {getFileIcon(item)}
                    <span className="ml-3 font-medium">{item.name}</span>
                    {item.sharedWith && item.sharedWith.length > 0 && (
                      <div className="ml-2">
                        <Share className="h-3.5 w-3.5 text-primary-500" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                  {item.updatedAt && formatDate(item.updatedAt)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                  {item.type === 'file' && item.size ? formatFileSize(item.size) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative">
                    <button
                      className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={(e) => toggleMenu(item._id, e)}
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openMenuId && menuPosition && (
        <div 
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
          className="w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 menu-dropdown"
        >
          <button
            className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              const item = items.find(item => item._id === openMenuId);
              if (item) handleShare(item);
            }}
          >
            <Share className="h-4 w-4 mr-2" />
            <span>Share</span>
          </button>
          <button className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700">
            <Copy className="h-4 w-4 mr-2" />
            <span>Copy Link</span>
          </button>
          <button className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700">
            <External className="h-4 w-4 mr-2" />
            <span>Open</span>
          </button>
          <button className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700">
            <Download className="h-4 w-4 mr-2" />
            <span>Download</span>
          </button>
          <button className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-4 w-4 mr-2" />
            <span>Delete</span>
          </button>

        </div>
      )}

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

export default FileList;
