import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Item, ItemType } from '../../types';
import FileGrid from './FileGrid';
import FileList from './FileList';
import Breadcrumb from './Breadcrumb';
import { useDropzone } from 'react-dropzone';
import { Folder, File, Upload, Plus, FolderPlus, Image, Loader2, ChevronLeft, ChevronRight, Archive, Code, Database, Download, FileText, FileType, Globe, HardDrive, Music, Palette, Presentation, Settings, Sheet, Terminal, Video, Zap } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { PaginationParams } from '../../services/BaseService';
import { itemService } from '../../services/ItemService';
import { useEncryption } from '../../context/EncryptionContext';
import { log } from 'console';
import FileNewFolder from './FileNewFolder';
import RightClickElementModal from '../shared/RightClickElementModal';
import { mediaService } from '../../services/MediaService';
import { MediaViewer } from '../media/MediaViewerManager';
import AdvancedFilters, { FilterConfig } from '../shared/AdvancedFilters';
import ShareModal from '../shared/ShareModal';

const FilesView: React.FC = () => {
  const { privateKey } = useEncryption();
  const { 
    currentFileFolder: currentFolder, 
    setCurrentFolder, 
    viewMode, 
    searchQuery, 
    searchMode,
    isDirectSearchActive,
    getItemsByParentId, 
    countItems, 
    currentPage, 
    setCurrentPage, 
    selectedItems, 
    setSelectedItems, 
    navigateToFolder 
  } = useAppContext();
  const { showToast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
    itemType: 'all',
  });
  const [totalPages, setTotalPages] = useState(1);
  const [items4Page, setItems4Page] = useState(20);
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [currentItem, setCurrentItem] = React.useState<Item | null>(null);
  const [previousFolder, setPreviousFolder] = React.useState<string | null>(null);
  const [showShareModal, setShowShareModal] = React.useState<boolean>(false);
  const [shareItems, setShareItems] = React.useState<Item[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  

  const fileIconsMap : Record<string, React.ReactElement> = {
      // PDFs y documentos
      'pdf': <FileText className="insertSizehere text-red-500" />,
      
      // Documentos de texto
      'doc': <FileText className="insertSizehere text-blue-500" />,
      'docx': <FileText className="insertSizehere text-blue-500" />,
      'txt': <FileText className="insertSizehere text-gray-600" />,
      'rtf': <FileText className="insertSizehere text-blue-400" />,
      'odt': <FileText className="insertSizehere text-blue-600" />,
      
      // Hojas de cálculo
      'xls': <Sheet className="insertSizehere text-green-500" />,
      'xlsx': <Sheet className="insertSizehere text-green-500" />,
      'csv': <Sheet className="insertSizehere text-green-400" />,
      'ods': <Sheet className="insertSizehere text-green-600" />,
      
      // Presentaciones
      'ppt': <Presentation className="insertSizehere text-orange-500" />,
      'pptx': <Presentation className="insertSizehere text-orange-500" />,
      'odp': <Presentation className="insertSizehere text-orange-600" />,
      
      // Imágenes
      'jpg': <Image className="insertSizehere text-purple-500" />,
      'jpeg': <Image className="insertSizehere text-purple-500" />,
      'png': <Image className="insertSizehere text-purple-400" />,
      'gif': <Image className="insertSizehere text-purple-600" />,
      'bmp': <Image className="insertSizehere text-purple-300" />,
      'svg': <Palette className="insertSizehere text-pink-500" />,
      'webp': <Image className="insertSizehere text-purple-400" />,
      'ico': <Image className="insertSizehere text-yellow-500" />,
      'tiff': <Image className="insertSizehere text-purple-700" />,
      'psd': <Palette className="insertSizehere text-blue-500" />,
      
      // Audio
      'mp3': <Music className="insertSizehere text-green-600" />,
      'wav': <Music className="insertSizehere text-green-500" />,
      'flac': <Music className="insertSizehere text-green-700" />,
      'aac': <Music className="insertSizehere text-green-400" />,
      'ogg': <Music className="insertSizehere text-green-600" />,
      'wma': <Music className="insertSizehere text-green-500" />,
      'm4a': <Music className="insertSizehere text-green-600" />,
      
      // Video
      'mp4': <Video className="insertSizehere text-red-600" />,
      'avi': <Video className="insertSizehere text-red-500" />,
      'mkv': <Video className="insertSizehere text-red-700" />,
      'mov': <Video className="insertSizehere text-red-400" />,
      'wmv': <Video className="insertSizehere text-red-500" />,
      'flv': <Video className="insertSizehere text-red-600" />,
      'webm': <Video className="insertSizehere text-red-500" />,
      '3gp': <Video className="insertSizehere text-red-400" />,
      
      // Archivos comprimidos
      'zip': <Archive className="insertSizehere text-yellow-600" />,
      'rar': <Archive className="insertSizehere text-yellow-500" />,
      '7z': <Archive className="insertSizehere text-yellow-700" />,
      'tar': <Archive className="insertSizehere text-yellow-500" />,
      'gz': <Archive className="insertSizehere text-yellow-600" />,
      'bz2': <Archive className="insertSizehere text-yellow-500" />,
      
      // Código y desarrollo
      'js': <Code className="insertSizehere text-yellow-500" />,
      'jsx': <Code className="insertSizehere text-blue-400" />,
      'ts': <Code className="insertSizehere text-blue-600" />,
      'tsx': <Code className="insertSizehere text-blue-500" />,
      'html': <Globe className="insertSizehere text-orange-500" />,
      'css': <Palette className="insertSizehere text-blue-500" />,
      'scss': <Palette className="insertSizehere text-pink-500" />,
      'sass': <Palette className="insertSizehere text-pink-600" />,
      'less': <Palette className="insertSizehere text-blue-600" />,
      'php': <Code className="insertSizehere text-purple-600" />,
      'py': <Code className="insertSizehere text-yellow-600" />,
      'java': <Code className="insertSizehere text-red-600" />,
      'cpp': <Code className="insertSizehere text-blue-700" />,
      'c': <Code className="insertSizehere text-blue-600" />,
      'cs': <Code className="insertSizehere text-purple-500" />,
      'rb': <Code className="insertSizehere text-red-500" />,
      'go': <Code className="insertSizehere text-cyan-500" />,
      'rs': <Code className="insertSizehere text-orange-600" />,
      'swift': <Code className="insertSizehere text-orange-500" />,
      'kt': <Code className="insertSizehere text-purple-600" />,
      'dart': <Code className="insertSizehere text-blue-500" />,
      
      // Web y datos
      'json': <Code className="insertSizehere text-green-600" />,
      'xml': <Code className="insertSizehere text-orange-400" />,
      'yaml': <Code className="insertSizehere text-purple-400" />,
      'yml': <Code className="insertSizehere text-purple-400" />,
      'toml': <Code className="insertSizehere text-gray-600" />,
      'ini': <Settings className="insertSizehere text-gray-500" />,
      'env': <Settings className="insertSizehere text-green-500" />,
      
      // Bases de datos
      'sql': <Database className="insertSizehere text-blue-600" />,
      'db': <Database className="insertSizehere text-green-600" />,
      'sqlite': <Database className="insertSizehere text-blue-500" />,
      'mdb': <Database className="insertSizehere text-red-600" />,
      
      // Ejecutables y sistema
      'exe': <Zap className="insertSizehere text-red-600" />,
      'msi': <Download className="insertSizehere text-blue-600" />,
      'deb': <Download className="insertSizehere text-orange-600" />,
      'rpm': <Download className="insertSizehere text-red-500" />,
      'dmg': <HardDrive className="insertSizehere text-gray-600" />,
      'iso': <HardDrive className="insertSizehere text-yellow-600" />,
      'img': <HardDrive className="insertSizehere text-blue-500" />,
      
      // Scripts y terminal
      'sh': <Terminal className="insertSizehere text-green-600" />,
      'bash': <Terminal className="insertSizehere text-green-700" />,
      'zsh': <Terminal className="insertSizehere text-blue-600" />,
      'bat': <Terminal className="insertSizehere text-yellow-600" />,
      'cmd': <Terminal className="insertSizehere text-gray-600" />,
      'ps1': <Terminal className="insertSizehere text-blue-500" />,
      
      // Fuentes
      'ttf': <FileType className="insertSizehere text-purple-500" />,
      'otf': <FileType className="insertSizehere text-purple-600" />,
      'woff': <FileType className="insertSizehere text-purple-400" />,
      'woff2': <FileType className="insertSizehere text-purple-400" />,
      'eot': <FileType className="insertSizehere text-purple-700" />,
      
      // Otros formatos comunes
      'log': <FileText className="insertSizehere text-gray-500" />,
      'md': <FileText className="insertSizehere text-blue-600" />,
      'readme': <FileText className="insertSizehere text-green-600" />,
      'license': <FileText className="insertSizehere text-yellow-600" />,
      'gitignore': <Settings className="insertSizehere text-orange-500" />
    };

  // Función para obtener el icono
  const getIconExtension = (extension: string, sizeClass: string) => {
    const element = fileIconsMap[extension] || <FileType className="insertSizehere text-gray-400" />;
    const newClassName  = element.props.className.replace('insertSizehere', sizeClass)
    const cloneElement = React.cloneElement(element, { className: newClassName });

    return cloneElement;
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
    } else {
      // For files, use MediaService to show content
      mediaService.showContent(item);
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


  const handleNewFolder = () => {
    setIsNewFolder(true);
  }


  const createNewFolder = async (folderName: string) => {
    setIsNewFolder(false);
    try {
      const item = await itemService.createItemStorage(ItemType.FOLDER, folderName, currentFolder || '');
      await itemService.uploadWithoutFile(item);
      showToast('Folder created successfully!', 'success');
      setCurrentPage(1);
      await fetchItems(); // Refresh the items list
    } catch (error) {
      console.error('Error creating folder:', error);
      showToast('Failed to create folder. Please try again.', 'error');
    }
  }

  const handleExtensionIcon = (item: Item, isList: boolean) => {
    const sizeClass = isList ? 'h-5 w-5' : 'h-5 w-5 md:h-7 md:w-7 lg:h-10 lg:w-10';
    if (item.type === 'folder') return <Folder className={`${sizeClass} text-yellow-500`} />;

    const extension : string = item.encryptedMetadata.extension
    return getIconExtension(extension, sizeClass);
  }

  



  const handlePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    handleFileUpload(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  const handleFileUpload = async (files: File[]) => {
    setIsLoading(true);
    try {
      if (files.length >= 1) {
        // Handle multiple file uploads
        const uploadPromises = files.map(file => itemService.uploadFile(file, currentFolder || '', (progress) => {
          console.log(`Upload progress for ${file.name}: ${progress}%`);
        }, (chunkNumber, totalChunks) => {
          console.log(`Chunk ${chunkNumber} of ${totalChunks} uploaded for ${file.name}`);
        }));
        await Promise.all(uploadPromises);
        await fetchItems();
      }
    } catch (error) {
      showToast('Failed to upload files', 'error');
    } finally {
      setIsLoading(false);
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
          [ItemType.FILE, ItemType.FOLDER]
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
      const contItems: number = await countItems([ItemType.FILE, ItemType.FOLDER], currentFolder || '');
      setTotalPages(Math.ceil(contItems / items4Page));

      const params: PaginationParams = {
        parentId: currentFolder || '',
        itemTypes: [ItemType.FILE, ItemType.FOLDER],
        page: currentPage,
        limit: items4Page,
      };
      fetchedItems = await getItemsByParentId(params);
    }

    let listOfDecryptedMetadataFiles : Item[] = [];
    for (const item of fetchedItems) {
      const decryptedItem = await itemService.getDecryptMetadata(item, privateKey);
      if (decryptedItem == null) continue;
      listOfDecryptedMetadataFiles.push(decryptedItem);
    }
    if (listOfDecryptedMetadataFiles == null) return;
    
    setItems(listOfDecryptedMetadataFiles);
    console.log(listOfDecryptedMetadataFiles);
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
        item.encryptedMetadata?.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply item type filter
    if (filterConfig.itemType !== 'all') {
      if (filterConfig.itemType === 'files') {
        result = result.filter(item => item.type === ItemType.FILE);
      } else if (filterConfig.itemType === 'folders') {
        result = result.filter(item => item.type === ItemType.FOLDER);
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

    // Apply size range filter
    if (filterConfig.sizeMin !== undefined) {
      const minBytes = filterConfig.sizeMin * 1024 * 1024; // Convert MB to bytes
      result = result.filter(item => (item.size || 0) >= minBytes);
    }
    if (filterConfig.sizeMax !== undefined) {
      const maxBytes = filterConfig.sizeMax * 1024 * 1024; // Convert MB to bytes
      result = result.filter(item => (item.size || 0) <= maxBytes);
    }

    // Apply extension filter
    if (filterConfig.extension) {
      result = result.filter(item => 
        item.encryptedMetadata?.extension === filterConfig.extension
      );
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
        case 'size':
          comparison = (b.size || 0) - (a.size || 0);
          break;
      }
      return filterConfig.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredItems(result);
  }, [items, filterConfig]);

  useEffect(() => {
    if (previousFolder != currentFolder){
      setCurrentPage(1);
      setPreviousFolder(currentFolder);
    }
    fetchItems();
  }, [currentFolder, currentPage, privateKey, searchQuery, searchMode, isDirectSearchActive]);


  const handleBulkDelete = async (items: Item[]) => {
    try {
      if (confirm(`Are you sure you want to delete ${items.length} items?`)) {
        await Promise.all(items.map(item => itemService.remove(item._id)));
        showToast(`${items.length} items deleted successfully!`, 'success');
        await fetchItems();
      }
    } catch (error) {
      console.error('Error deleting items:', error);
      showToast('Error deleting items. Please try again.', 'error');
    }
  };

  const handleBulkShare = async (items: Item[]) => {
    try {
      showToast(`Sharing ${items.length} items...`, 'success');
      // TODO: Implement bulk share logic
      console.log('Sharing items:', items.map(item => item.itemName));
      showToast('Items shared successfully!', 'success');
    } catch (error) {
      console.error('Error sharing items:', error);
      showToast('Error sharing items. Please try again.', 'error');
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

  // Shared handlers for both grid and list views
  const handleShare = (item: Item | Item[]) => {
    const itemsArray = Array.isArray(item) ? item : [item];
    console.log('Share:', itemsArray.map(i => i.itemName));
    setShareItems(itemsArray);
    setShowShareModal(true);
  };

  const handleDownload = async (item: Item | Item[]) => {
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
    const singleItem = Array.isArray(item) ? item[0] : item;
    console.log('Rename:', singleItem.itemName);
    showToast('Rename functionality not implemented yet', 'error');
  };

  const handleDelete = (item: Item | Item[]) => {
    const itemsArray = Array.isArray(item) ? item : [item];
    console.log('Delete:', itemsArray.map(i => i.itemName));
    showToast('Delete functionality not implemented yet', 'error');
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
          <p className="text-gray-500 dark:text-gray-400">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div {...getRootProps()} className="relative">
      <input {...getInputProps()} />
      
      {/* Drag overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-primary-500/10 backdrop-blur-sm border-2 border-dashed border-primary-500 z-50 flex items-center justify-center">
          <div className="text-center">
            <Upload className="h-16 w-16 text-primary-500 mx-auto mb-4" />
            <h3 className="text-2xl font-medium text-primary-600">Drop files here</h3>
            <p className="text-lg text-gray-500">Upload files to this folder</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Breadcrumb 
            allItems={filteredItems}
            onDownload={handleDownload}
            onDelete={handleBulkDelete}
            onShare={handleBulkShare}
          />
          
          <AdvancedFilters
            items={items}
            onFilterChange={setFilterConfig}
            viewType="files"
          />
        </div>
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
          />
          <button 
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </button>
          <button 
            className="btn btn-secondary ml-2"
            onClick={handleNewFolder}
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Folder</span>
          </button>
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="py-10">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-4">
              {currentFolder ? (
                <Folder className="h-16 w-16 text-gray-300 dark:text-gray-600" />
              ) : (
                <File className="h-16 w-16 text-gray-300 dark:text-gray-600" />
              )}
            </div>
            <h3 className="text-lg font-medium mb-2">
              {currentFolder
                ? 'This folder is empty'
                : 'You don\'t have any files yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {currentFolder
                ? 'Upload files or create folders to populate this directory'
                : 'Upload files to get started with CloudMesa'}
            </p>
            <div className="flex gap-2 justify-center">
              <button 
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                <span>Upload Files</span>
              </button>
              <button className="btn btn-secondary" onClick={handleNewFolder}>
                <FolderPlus className="h-4 w-4" />
                <span>New Folder</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          {viewMode === 'grid' ? (
            <FileGrid
              items={filteredItems}
              onShare={handleShare}
              onDownload={handleDownload}
              onRename={handleRename}
              onDelete={handleDelete}
              onGetIcon={handleExtensionIcon}
              onItemClick={handleItemClick}
              onRightClick={rightClickOnElement}
            />
          ) : (
            <FileList
              items={filteredItems}
              onShare={handleShare}
              onDownload={handleDownload}
              onRename={handleRename}
              onDelete={handleDelete}
              onGetIcon={handleExtensionIcon}
              onItemClick={handleItemClick}
              onRightClick={rightClickOnElement}
            />
          )}
          
          {renderPagination()}
        </div>
      )}
      
      {/* FileNewFolder Modal */}
      <FileNewFolder
        isOpen={isNewFolder}
        itemType={ItemType.FOLDER}
        onClose={() => setIsNewFolder(false)}
        onCreate={createNewFolder}
      />

      {/* Right Click Context Menu */}
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

      {/* Media Viewer Manager */}
      <MediaViewer />
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

export default FilesView;