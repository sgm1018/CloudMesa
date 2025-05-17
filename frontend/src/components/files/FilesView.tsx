import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getItemsByParentId } from '../../data/mockData';
import { Item } from '../../types';
import FileGrid from './FileGrid';
import FileList from './FileList';
import Breadcrumb from './Breadcrumb';
import { useDropzone } from 'react-dropzone';
import { Folder, File, Upload, Plus, FolderPlus, Loader2, Filter } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const FilesView: React.FC = () => {
  const { currentFileFolder: currentFolder, viewMode, searchQuery } = useAppContext();
  const { showToast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'files' | 'folders'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast(`Successfully uploaded ${files.length} file(s)`);
      
      const newItems = files.map(file => ({
        _id: `file-${Date.now()}-${file.name}`,
        name: file.name,
        userId: 'user-1',
        type: 'file' as const,
        parentId: currentFolder || undefined,
        encryptedMetadata: {
          name: file.name,
          mimeType: file.type,
        },
        encryption: {
          iv: 'mock_iv',
          algorithm: 'AES-GCM',
          encryptedKey: 'mock_encrypted_key'
        },
        size: file.size,
        extension: file.name.split('.').pop(),
        createdAt: new Date(),
        updatedAt: new Date(),
        path: currentFolder ? ['Documents'] : []
      }));

      setItems(prev => [...prev, ...newItems]);
    } catch (error) {
      showToast('Failed to upload files', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      let fetchedItems = getItemsByParentId(currentFolder);
      
      if (filterType !== 'all') {
        fetchedItems = fetchedItems.filter(item => 
          filterType === 'files' ? item.type === 'file' : item.type === 'folder'
        );
      }
      
      fetchedItems.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'date':
            comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            break;
          case 'size':
            comparison = (b.size || 0) - (a.size || 0);
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
      
      setItems(fetchedItems);
      setIsLoading(false);
    };
    
    fetchItems();
  }, [currentFolder, searchQuery, sortBy, sortOrder, filterType]);

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
          <Breadcrumb />
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center space-x-1"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filters</span>
              </button>
              
              {showFilters && (
                <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
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
            <FileGrid items={items} />
          ) : (
            <FileList items={items} />
          )}
        </div>
      )}
    </div>
  );
};

export default FilesView;