import React from 'react';
import { Item } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { 
  FileText, Sheet, Presentation, Image, Archive, 
  Music, Video, Code, Database, FileType,
  Folder, Lock, Download, Globe, Settings,Share,
  Zap, Cpu, HardDrive, Terminal, Palette, MoreVertical
} from 'lucide-react';// import ShareModal from '../shared/ShareModal';
import RightClickElementModal from '../shared/RightClickElementModal';

interface FileListProps {
  items: Item[];
  onShare: (item: Item | Item[]) => void;
  onDownload: (item: Item | Item[]) => Promise<void>;
  onRename: (item: Item | Item[]) => void;
  onDelete: (item: Item | Item[]) => void;
  onGetIcon: (extension: Item, isList: boolean) => React.ReactElement;
}

const FileList: React.FC<FileListProps> = ({ items, onShare, onDownload, onRename, onDelete, onGetIcon }) => {
  const { selectedItems, setSelectedItems, navigateToFolder } = useAppContext();
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [currentItem, setCurrentItem] = React.useState<Item | null>(null);
    
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

  // Update handleItemClick to handle both left and right clicks
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
    if (item.type === 'folder') {
      navigateToFolder(item._id);
    }
  };



  const handleShare = (item: Item | Item[]) => {
    onShare(item);
  };

  const handleDownload = (item: Item | Item[]) => {
    // Implementar lógica de descarga
    onDownload(item);
  };

  const handleRename = (item: Item | Item[]) => {
    onRename(item);
  };

  const handleDelete = (item: Item | Item[]) => {
    onDelete(item);
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
    setMenuPosition(null);
    setCurrentItem(null);
  };

  // El componente RightClickElementModal maneja su propio cierre

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
                    {onGetIcon(item, true)}
                    <span className="ml-3 font-medium">{item.itemName}</span>
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
                  {item.type === 'file' && item.size ? 'SizeHere' : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative">
                    <button
                      className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={(e) => rightClickOnElement(e, item._id)}
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

      {/* Context Menu */}
      <RightClickElementModal
        isOpen={openMenuId !== null}
        position={menuPosition}
        item={currentItem}
        onClose={handleCloseMenu}
        contextType={currentItem?.type === 'folder' ? 'folder' : 'file'}
        onShare={handleShare}
        onDownload={handleDownload}
        onRename={handleRename}
        onDelete={handleDelete}
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

export default FileList;
