import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Item, ItemType } from '../../types';
import FileGrid from './FileGrid';
import FileList from './FileList';
import Breadcrumb from './Breadcrumb';
import { useDropzone } from 'react-dropzone';
import { Folder, File, Upload, Plus, FolderPlus, Loader2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { PaginationParams } from '../../services/BaseService';
import { itemService } from '../../services/ItemService';
import { useEncryption } from '../../context/EncryptionContext';
import { log } from 'console';

const FilesView: React.FC = () => {
  const { privateKey } = useEncryption();
  const { currentFileFolder: currentFolder, viewMode, searchQuery, getItemsByParentId, countItems } = useAppContext();
  const { showToast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'files' | 'folders'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items4Page, setItems4Page] = useState(20);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    const contItems : number = await countItems([ItemType.FILE, ItemType.FOLDER], currentFolder || '');
    setTotalPages(Math.ceil(contItems / items4Page));

    const params : PaginationParams = {
      parentId: currentFolder || '',
      itemTypes: [ItemType.FILE, ItemType.FOLDER],
      page: currentPage,
      limit: items4Page,
    }
    let fetchedItems = await getItemsByParentId(params);

    let listOfDecryptedMetadataFiles : Item[] = [];
    for (const item of fetchedItems) {
      const decryptedItem = await itemService.getDecryptMetadata(item, privateKey);
      if (decryptedItem == null) continue;
      listOfDecryptedMetadataFiles.push(decryptedItem);
    }
    if (listOfDecryptedMetadataFiles == null) return
    listOfDecryptedMetadataFiles.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
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
            return sortOrder === 'asc' ? comparison : -comparison;
          });
    setItems(listOfDecryptedMetadataFiles);
    console.log(listOfDecryptedMetadataFiles);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [currentFolder, sortBy, sortOrder, filterType, currentPage, privateKey]);


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
    showToast('Share functionality not implemented yet', 'error');
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
    <div {...getRootProps()} className="min-h-screen relative">
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
            allItems={items}
            onDownload={handleDownload}
            onDelete={handleBulkDelete}
            onShare={handleBulkShare}
          />
          
          <div className="flex items-center ">
            <div className="relative flex items-center justify-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg space-x-1"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filters</span>
              </button>
              
              {showFilters && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Sort by</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                        className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <option value="name">Name</option>
                        <option value="date">Date modified</option>
                        <option value="size">Size</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Order</label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as 'all' | 'files' | 'folders')}
                        className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <option value="all">All items</option>
                        <option value="files">Files only</option>
                        <option value="folders">Folders only</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
              <button className="btn btn-secondary">
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
              items={items}
              onShare={handleShare}
              onDownload={handleDownload}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ) : (
            <FileList
              items={items}
              onShare={handleShare}
              onDownload={handleDownload}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          )}
          
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default FilesView;