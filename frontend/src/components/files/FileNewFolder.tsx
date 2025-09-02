import React, { useState, useRef, useEffect } from 'react';
import { ItemType } from '../../types';
import { FolderPlus, Users, X, Check, Loader2 } from 'lucide-react';

interface FileNewFolderProps {
  isOpen: boolean;
  itemType: ItemType.FOLDER | ItemType.GROUP;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

const FileNewFolder: React.FC<FileNewFolderProps> = ({
  isOpen,
  itemType,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isFolder = itemType === ItemType.FOLDER;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
      setIsLoading(false);
      // Focus input after a short delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(`${isFolder ? 'Folder' : 'Group'} name is required`);
      return;
    }

    if (name.length < 2) {
      setError(`${isFolder ? 'Folder' : 'Group'} name must be at least 2 characters`);
      return;
    }

    if (name.length > 50) {
      setError(`${isFolder ? 'Folder' : 'Group'} name must be less than 50 characters`);
      return;
    }

    // Validate name pattern (no special characters except spaces, hyphens, and underscores)
    const namePattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!namePattern.test(name.trim())) {
      setError('Name can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await onCreate(name.trim());
      onClose();
    } catch (err) {
      setError(`Failed to create ${isFolder ? 'folder' : 'group'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {isFolder ? (
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <FolderPlus className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              ) : (
                <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New {isFolder ? 'Folder' : 'Group'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isFolder 
                    ? 'Organize your files in a new folder'
                    : 'Create a group to organize your passwords'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="folderName" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {isFolder ? 'Folder' : 'Group'} Name
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    id="folderName"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={`Enter ${isFolder ? 'folder' : 'group'} name...`}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                      error 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : isFolder
                          ? 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-secondary-500 focus:border-secondary-500'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                    disabled={isLoading}
                    maxLength={50}
                  />
                  {name && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-gray-400">
                        {name.length}/50
                      </span>
                    </div>
                  )}
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {error}
                  </p>
                )}
              </div>

              {/* Tips */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  💡 Tips:
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Use descriptive names for better organization</li>
                  <li>• Names must be 2-50 characters long</li>
                  <li>• Only letters, numbers, spaces, hyphens, and underscores allowed</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                  isFolder
                    ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                    : 'bg-secondary-600 hover:bg-secondary-700 focus:ring-secondary-500'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Create {isFolder ? 'Folder' : 'Group'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FileNewFolder;
