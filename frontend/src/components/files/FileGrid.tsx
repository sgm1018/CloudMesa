import React from 'react';
import { Item } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { formatFileSize } from '../../data/mockData';
import { File, FileImage, FileText, FileSpreadsheet, Presentation as FilePresentation, FileArchive, Folder, MoreVertical, Share, Download, Trash, Edit } from 'lucide-react';
import ShareModal from '../shared/ShareModal';

interface FileGridProps {
  items: Item[];
}

const FileGrid: React.FC<FileGridProps> = ({ items }) => {
  const { selectedItems, setSelectedItems, setCurrentFolder } = useAppContext();
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<'left' | 'right'>('right');
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [itemsToShare, setItemsToShare] = React.useState<Item[]>([]);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const getFileIcon = (item: Item) => {
    if (item.type === 'folder') return <Folder className="h-12 w-12 text-yellow-500" />;

    const extension = item.name.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return <File className="h-12 w-12 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-12 w-12 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="h-12 w-12 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FilePresentation className="h-12 w-12 text-orange-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-12 w-12 text-purple-500" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="h-12 w-12 text-gray-500" />;
      default:
        return <File className="h-12 w-12 text-gray-400" />;
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
    if (item.type === 'folder') {
      setCurrentFolder(item._id);
    }
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
                  className={`fixed mt-1 w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 menu-dropdown flex flex-col justify-start items-center`}
                >
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
                  
                  {item.type === 'file' && (
                    <button className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      <span>Download</span>
                    </button>
                  )}
                  
                  <button className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Edit className="h-4 w-4 mr-2" />
                    <span>Rename</span>
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
                {getFileIcon(item)}
              </div>
              
              <div className="mt-2 text-center">
                <h3 className="text-sm font-medium truncate w-full max-w-[160px]">{item.name}</h3>
                
                {item.type === 'file' && item.size && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                    {formatFileSize(item.size)}
                  </span>
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

export default FileGrid;