import React from 'react';
import { Item } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { File, FileImage, FileText, FileSpreadsheet, Presentation as FilePresentation, FileArchive, Folder, MoreVertical, Share } from 'lucide-react';
// import ShareModal from '../shared/ShareModal';
import RightClickElementModal from '../shared/RightClickElementModal';
import { itemService } from '../../services/ItemService';
import { useEncryption } from '../../context/EncryptionContext';
import { useToast } from '../../context/ToastContext';

interface FileGridProps {
  items: Item[];
}

const FileGrid: React.FC<FileGridProps> = ({ items }) => {
  const { selectedItems, setSelectedItems, navigateToFolder } = useAppContext();
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [currentItem, setCurrentItem] = React.useState<Item | null>(null);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [itemsToShare, setItemsToShare] = React.useState<Item[]>([]);
  const { privateKey } = useEncryption();
  const { showToast } = useToast();

  const getFileIcon = (item: Item) => {
    if (item.type === 'folder') return <Folder className="h-12 w-12 text-yellow-500" />;

    const extension = item.encryptedMetadata.name!.split('.').pop()?.toLowerCase();
    
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
    const itemsArray = Array.isArray(item) ? item : [item];
    setItemsToShare(itemsArray);
    setShowShareModal(true);
  };

  const handleDownload = async (item: Item | Item[]) => {
    // Implementar lógica de descarga
    if (privateKey == null || privateKey == '') {
      showToast('Error: Private key is required to download files.', 'error');
      return;
    }
    
    const itemsArray = Array.isArray(item) ? item : [item];
    for (const singleItem of itemsArray) {
      await itemService.downloadItem(singleItem, privateKey);
    }
    showToast(`Download completed for ${itemsArray.length} item(s).`, 'success');
  };

  const handleRename = (item: Item | Item[]) => {
    // Para renombrar, solo trabajamos con un elemento
    const singleItem = Array.isArray(item) ? item[0] : item;
    console.log('Rename:', singleItem.encryptedMetadata.name);
  };

  const handleDelete = (item: Item | Item[]) => {
    // Implementar lógica de eliminación
    const itemsArray = Array.isArray(item) ? item : [item];
    console.log('Delete:', itemsArray.map(i => i.encryptedMetadata.name));
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
    setMenuPosition(null);
    setCurrentItem(null);
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
            }`}
            onClick={(event) => handleItemClick(item, event)}
            onContextMenu={(event) => rightClickOnElement(event, item._id)}
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
                onClick={(e) => rightClickOnElement(e, item._id)}
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 pt-6 flex flex-col items-center">
              <div className="mb-3 flex items-center justify-center">
                {getFileIcon(item)}
              </div>
              
              <div className="mt-2 text-center">
                <h3 className="text-sm font-medium truncate w-full max-w-[160px]">{item.encryptedMetadata.name}</h3>
                
                {item.type === 'file' && item.size && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                    {/* {formatFileSize(item.size)} */}
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

      {openMenuId && menuPosition && (
        <RightClickElementModal
          isOpen={openMenuId !== null}
          position={menuPosition}
          item={currentItem}
          onClose={handleCloseMenu}
          contextType={currentItem?.type === 'folder' ? 'folder' : 'file'}
          allItems={items}
          onShare={handleShare}
          onDownload={handleDownload}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      )}

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

export default FileGrid;